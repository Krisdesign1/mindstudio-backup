import "server-only";
import {
  mkdir,
  readFile,
  writeFile,
  copyFile,
  open,
  access,
} from "node:fs/promises";
import { spawn } from "node:child_process";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import path from "node:path";
import { z } from "zod";
import {
  hyperframesJob,
  type HyperframesInput,
  type HyperframesJob,
} from "../schemas/hyperframes";
import { createComposition, previewDocument } from "../hyperframes/composition";
import { images } from "./mock";
import { ServiceError } from "../server/errors";
const run = promisify(execFile);
export const hyperframesRoot = () =>
  path.join(process.cwd(), ".mindstudio", "hyperframes");
export function jobDirectory(id: string) {
  if (!z.string().uuid().safeParse(id).success)
    throw new ServiceError(
      "invalid_id",
      "Identifiant de composition invalide.",
      400,
    );
  return path.join(hyperframesRoot(), id);
}
function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
async function fetchNarration(urlString: string, destination: string) {
  const url = new URL(urlString);
  if (
    url.protocol !== "https:" ||
    !["files.heygen.ai", "files2.heygen.ai", "resource.heygen.ai"].includes(
      url.hostname,
    ) ||
    url.port ||
    url.username ||
    url.password
  )
    throw new ServiceError(
      "audio_host",
      "L’hôte de cet audio n’est pas pris en charge. Régénérez la voix avec HeyGen.",
      400,
    );
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok || !response.body)
    throw new ServiceError(
      "audio_expired",
      "L’audio HeyGen est inaccessible ou expiré. Régénérez-le puis réessayez.",
      400,
    );
  const reader = response.body.getReader();
  let size = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 50 * 1024 * 1024) {
      await reader.cancel();
      throw new ServiceError("audio_size", "L’audio dépasse 50 Mo.", 400);
    }
    parts.push(value);
  }
  await writeFile(destination, Buffer.concat(parts), { mode: 0o600 });
  const { stdout } = await run(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=codec_type:format=duration",
      "-of",
      "json",
      destination,
    ],
    { timeout: 15000 },
  );
  const metadata = JSON.parse(stdout);
  const length = Number(metadata.format?.duration);
  if (
    !metadata.streams?.length ||
    !Number.isFinite(length) ||
    length <= 0 ||
    length > 300
  )
    throw new ServiceError(
      "audio_invalid",
      "Audio invalide ou durée supérieure à cinq minutes.",
      400,
    );
  return length;
}
export async function prepareComposition(
  input: HyperframesInput,
): Promise<HyperframesJob> {
  const { project, includeAudio } = input;
  if (project.scenes.some((s) => !images.includes(s.image)))
    throw new ServiceError(
      "media_not_supported",
      "Ce template utilise uniquement les images locales de la bibliothèque.",
      400,
    );
  if (includeAudio) {
    const speech = project.heygenSpeech;
    if (!speech)
      throw new ServiceError(
        "audio_missing",
        "Générez d’abord une voix HeyGen dans l’onglet Voix.",
        400,
      );
    if (
      normalize(speech.text) !==
        normalize(project.scenes.map((s) => s.text).join(" ")) ||
      speech.voiceId !== project.heygenVoiceId ||
      speech.speed !== project.speed
    )
      throw new ServiceError(
        "audio_stale",
        "Le texte des scènes, la voix ou la vitesse ne correspond plus à l’audio. Alignez le script et les scènes, puis régénérez la voix.",
        400,
      );
  }
  const id = crypto.randomUUID();
  const dir = jobDirectory(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await copyFile(
    path.join(process.cwd(), "node_modules", "gsap", "dist", "gsap.min.js"),
    path.join(dir, "gsap.min.js"),
  );
  await Promise.all(
    project.scenes.map((scene, i) =>
      copyFile(
        path.join(process.cwd(), "public", scene.image),
        path.join(dir, `scene-${i}.jpg`),
      ),
    ),
  );
  const audioDuration = includeAudio
    ? await fetchNarration(
        project.heygenSpeech!.audioUrl,
        path.join(dir, "narration.mp3"),
      )
    : undefined;
  const composition = createComposition(input, audioDuration);
  await writeFile(path.join(dir, "index.html"), composition.html);
  await writeFile(
    path.join(dir, "preview.html"),
    previewDocument(
      composition.width,
      composition.height,
      composition.duration,
    ),
  );
  const job: HyperframesJob = {
    id,
    projectId: project.id,
    name: project.name,
    templateId: input.templateId || "cinematic",
    status: "ready",
    duration: composition.duration,
    width: composition.width,
    height: composition.height,
    hasAudio: Boolean(audioDuration),
    createdAt: new Date().toISOString(),
  };
  await writeFile(path.join(dir, "job.json"), JSON.stringify(job), {
    mode: 0o600,
  });
  return job;
}
export async function getHyperframesJob(id: string) {
  try {
    const job = hyperframesJob.parse(
      JSON.parse(
        await readFile(path.join(jobDirectory(id), "job.json"), "utf8"),
      ),
    );
    // A stopped computer cannot finish a detached render. Expose a retry instead
    // of keeping the UI in a permanent loading state after a restart.
    if (
      job.status === "rendering" &&
      Date.now() - Date.parse(job.startedAt || job.createdAt) > 35 * 60 * 1000
    ) {
      return {
        ...job,
        status: "failed" as const,
        error: "Le rendu a été interrompu ou a dépassé sa durée maximale.",
      };
    }
    return job;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(
      "not_found",
      "Cette composition locale est introuvable. Préparez un nouvel aperçu.",
      404,
    );
  }
}
export async function startHyperframesRender(id: string) {
  const dir = jobDirectory(id);
  const job = await getHyperframesJob(id);
  if (job.status === "rendering" || job.status === "completed") return job;
  try {
    await access(path.join(dir, "render.lock"));
    throw new ServiceError(
      "render_exists",
      "Un rendu a déjà été lancé pour cet aperçu. Préparez un nouvel aperçu pour réessayer.",
      409,
    );
  } catch (error) {
    if (error instanceof ServiceError) throw error;
  }
  try {
    await run("ffmpeg", ["-version"], { timeout: 5000 });
  } catch {
    throw new ServiceError(
      "ffmpeg_missing",
      "FFmpeg est requis sur le serveur pour exporter le MP4.",
      503,
    );
  }
  const lock = await open(path.join(dir, "render.lock"), "wx", 0o600);
  await lock.close();
  const next = {
    ...job,
    status: "rendering" as const,
    startedAt: new Date().toISOString(),
  };
  await writeFile(path.join(dir, "job.json"), JSON.stringify(next));
  const log = await open(path.join(dir, "worker.log"), "a", 0o600);
  try {
    const worker = spawn(
      process.execPath,
      [path.join(process.cwd(), "scripts", "hyperframes-worker.mjs"), id],
      {
        cwd: process.cwd(),
        detached: true,
        stdio: ["ignore", log.fd, log.fd],
        env: {
          NODE_ENV: process.env.NODE_ENV,
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          TMPDIR: process.env.TMPDIR,
          HYPERFRAMES_NO_TELEMETRY: "1",
          HYPERFRAMES_NO_UPDATE_CHECK: "1",
          HYPERFRAMES_SKIP_SKILLS: "1",
          HYPERFRAMES_RENDER_DETACHED: "1",
          ...(process.env.HYPERFRAMES_BROWSER_PATH
            ? { HYPERFRAMES_BROWSER_PATH: process.env.HYPERFRAMES_BROWSER_PATH }
            : {}),
        },
      },
    );
    await new Promise<void>((resolve, reject) => {
      worker.once("spawn", resolve);
      worker.once("error", reject);
    });
    worker.unref();
  } catch {
    await writeFile(
      path.join(dir, "job.json"),
      JSON.stringify({
        ...job,
        status: "failed",
        error: "Impossible de démarrer le moteur local.",
      }),
    );
    throw new ServiceError(
      "render_start",
      "Impossible de démarrer le moteur local.",
      500,
    );
  } finally {
    await log.close();
  }
  return next;
}
