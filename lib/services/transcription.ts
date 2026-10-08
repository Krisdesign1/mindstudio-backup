import "server-only";
import { readFile, writeFile, open, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { getSourceVideo, mediaDirectory } from "./motion-media";
import {
  transcriptionSchema,
  type Transcription,
} from "../schemas/transcription";
import { ServiceError } from "../server/errors";
export async function getTranscription(id: string): Promise<Transcription> {
  await getSourceVideo(id);
  try {
    const result = transcriptionSchema.parse(
      JSON.parse(
        await readFile(
          path.join(mediaDirectory(id), "transcription.json"),
          "utf8",
        ),
      ),
    );
    if (
      ["loading", "transcribing"].includes(result.status) &&
      Date.now() - Date.parse(result.updatedAt) > 35 * 60 * 1000
    )
      return {
        ...result,
        status: "failed",
        error: "L’analyse a été interrompue. Relancez-la.",
      };
    return result;
  } catch {
    return {
      sourceId: id,
      status: "idle",
      progress: 0,
      updatedAt: new Date().toISOString(),
      segments: [],
      words: [],
    };
  }
}
export async function startTranscription(id: string) {
  const source = await getSourceVideo(id);
  if (!source.hasAudio)
    throw new ServiceError(
      "no_audio",
      "Cette vidéo ne contient pas de piste audio.",
      400,
    );
  const current = await getTranscription(id);
  if (
    ["loading", "transcribing"].includes(current.status) ||
    (current.status === "completed" && current.words.length > 0)
  )
    return current;
  const dir = mediaDirectory(id),
    lockPath = path.join(dir, "transcription.lock");
  try {
    const lock = await open(lockPath, "wx", 0o600);
    await lock.close();
  } catch {
    const old = await getTranscription(id);
    if (old.status !== "failed")
      throw new ServiceError(
        "busy",
        "Une analyse de cette vidéo est déjà en cours.",
        409,
      );
    await unlink(lockPath).catch(() => {});
    const lock = await open(lockPath, "wx", 0o600);
    await lock.close();
  }
  const next: Transcription = {
    sourceId: id,
    status: "loading",
    progress: 0,
    segments: [],
    words: [],
    updatedAt: new Date().toISOString(),
  };
  await writeFile(path.join(dir, "transcription.json"), JSON.stringify(next));
  const log = await open(path.join(dir, "transcription.log"), "a", 0o600);
  try {
    const worker = spawn(
      process.env.MOTION_PYTHON || "python3",
      [path.join(process.cwd(), "scripts/transcribe-video.py"), id],
      {
        cwd: process.cwd(),
        detached: true,
        stdio: ["ignore", log.fd, log.fd],
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          TMPDIR: process.env.TMPDIR,
          NODE_ENV: process.env.NODE_ENV,
          HF_HUB_OFFLINE: "1",
          HF_HUB_DISABLE_TELEMETRY: "1",
          MOTION_WHISPER_MODEL: process.env.MOTION_WHISPER_MODEL || "small",
        },
      },
    );
    await new Promise<void>((resolve, reject) => {
      worker.once("spawn", resolve);
      worker.once("error", reject);
    });
    worker.unref();
  } catch {
    await unlink(lockPath).catch(() => {});
    const failed = {
      ...next,
      status: "failed",
      error: "Impossible de démarrer le moteur local. Vérifiez MOTION_PYTHON.",
    };
    await writeFile(
      path.join(dir, "transcription.json"),
      JSON.stringify(failed),
    );
    throw new ServiceError("engine_missing", failed.error, 503);
  } finally {
    await log.close();
  }
  return next;
}
