import { voiceExcerpt } from "@/lib/voice-excerpt";
import {
  readFile,
  writeFile,
  mkdir,
  open,
  access,
  readdir,
  stat,
} from "node:fs/promises";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { voiceTitleSchema, voiceFilename } from "@/lib/voice-title";
import { videoResponse } from "@/lib/server/video-response";
import { voiceSettingsSchema } from "@/lib/voice-settings";
import { assertLocalRequest, readBody } from "@/lib/server/heygen-http";
const root = path.join(
  process.cwd(),
  process.env.MINDSTUDIO_DATA_DIRECTORY || [".mind", "studio"].join(""),
);
const run = promisify(execFile);
let busy = false;
const activeStatuses = new Set(["loading", "generating"]);
const maximumJobSeconds = 65 * 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function processIsAlive(pid: unknown) {
  if (!Number.isInteger(pid) || Number(pid) <= 0) return false;
  try {
    process.kill(Number(pid), 0);
    return true;
  } catch {
    return false;
  }
}

async function readVoiceState(id: string) {
  const file = path.join(root, "voice", id, "status.json");
  const state = JSON.parse(await readFile(file, "utf8"));
  if (!activeStatuses.has(state.status)) return state;

  const now = Date.now() / 1000;
  const startedAt = Number(state.startedAt || now);
  const updatedAt = Number(state.updatedAt || startedAt);
  const expired = now - startedAt > maximumJobSeconds;
  const legacyJobIsStale = !state.pid && now - updatedAt > 15 * 60;
  const workerStopped = state.pid && !processIsAlive(state.pid);
  if (!expired && !legacyJobIsStale && !workerStopped) return state;

  const failed = {
    ...state,
    status: "failed",
    stage: "failed",
    elapsedSeconds: Math.max(0, Number(state.elapsedSeconds || 0)),
    error:
      "Ce traitement local s’est interrompu. Relance la génération : le script sera regroupé en passages plus longs.",
  };
  await writeFile(file, JSON.stringify(failed), { mode: 0o600 });
  return failed;
}

async function hasRunningWorker() {
  for (const id of await readdir(path.join(root, "voice")).catch(() => [])) {
    if (!z.string().uuid().safeParse(id).success) continue;
    const state = await readVoiceState(id).catch(() => null);
    if (state && activeStatuses.has(state.status)) return true;
  }
  return false;
}
async function ready() {
  try {
    await access(path.join(root, "chatterbox-ready.json"));
    return true;
  } catch {
    return false;
  }
}
export async function GET(request: Request) {
  try {
    assertLocalRequest(request);
    const url = new URL(request.url),
      id = url.searchParams.get("id");
    if (!id) {
      let downloadedBytes = 0;
      for (const folder of [
        "chatterbox-model",
        "chatterbox-model/.cache/huggingface/download",
      ]) {
        const directory = path.join(root, folder);
        for (const name of await readdir(directory).catch(() => [])) {
          if (!/\.(pt|safetensors|incomplete)$/.test(name)) continue;
          downloadedBytes += (
            await stat(path.join(directory, name)).catch(() => ({ size: 0 }))
          ).size;
        }
      }
      return Response.json(
        {
          ready: await ready(),
          busy: busy || (await hasRunningWorker()),
          downloadedBytes,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (!z.string().uuid().safeParse(id).success)
      return Response.json({ error: "Identifiant invalide" }, { status: 400 });
    const dir = path.join(root, "voice", id);
    const state = await readVoiceState(id);
    if (url.searchParams.has("audio") && state.status === "completed") {
      const response = await videoResponse(
        request,
        path.join(dir, "narration.wav"),
        "audio/wav",
      );
      response.headers.set(
        "Content-Disposition",
        `inline; filename="${voiceFilename(state.title || "Ma narration")}"`,
      );
      return response;
    }
    return Response.json(state, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Résultat indisponible." }, { status: 404 });
  }
}
export async function POST(request: Request) {
  const startedAt = Date.now() / 1000;
  let dir = "";
  let ownsJob = false;
  try {
    assertLocalRequest(request, "multipart/form-data");
    if (!(await ready()))
      return Response.json(
        { error: "Chatterbox n’est pas encore installé et validé sur ce Mac." },
        { status: 503 },
      );
    if (busy || (await hasRunningWorker()))
      return Response.json(
        { error: "Une génération est déjà en cours." },
        { status: 409 },
      );
    busy = true;
    ownsJob = true;
    // Bound the complete multipart body before parsing it.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Requête vide.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.length;
      if (size > 100 * 1024 * 1024) {
        await reader.cancel();
        throw new Error("Limite : 100 Mo.");
      }
      chunks.push(item.value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
    const action = z
      .enum(["generate", "test", "prepare", "clean"])
      .parse(form.get("action") || "generate");
    const title = voiceTitleSchema.parse(form.get("title") || "Ma narration");
    const voiceName = z
      .string()
      .max(255)
      .parse(form.get("voiceName") || "");
    const settings = voiceSettingsSchema.parse(
      JSON.parse(String(form.get("settings") || "{}")),
    );
    let text =
      action === "generate" || action === "test"
        ? z.string().trim().min(1).max(6000).parse(form.get("text"))
        : "";
    if (action === "test") {
      const limit = z.coerce
        .number()
        .int()
        .min(80)
        .max(600)
        .parse(form.get("testLimit") || 180);
      text = voiceExcerpt(text, limit);
    }
    if (action !== "clean" && form.get("consent") !== "yes")
      throw new Error(
        "Confirmez que cette voix est la vôtre ou que vous avez son autorisation.",
      );
    const file = form.get("reference");
    if (!(file instanceof File))
      throw new Error("Ajoutez votre extrait vocal.");
    if (action !== "clean" && file.size > 25 * 1024 * 1024)
      throw new Error("L’extrait vocal est limité à 25 Mo.");
    const id = randomUUID();
    dir = path.join(root, "voice", id);
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await writeFile(
      path.join(dir, "reference.original"),
      Buffer.from(await file.arrayBuffer()),
      { mode: 0o600 },
    );
    const probe = await run(
      "ffprobe",
      [
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        path.join(dir, "reference.original"),
      ],
      { timeout: 15000 },
    );
    const duration = Number(JSON.parse(probe.stdout).format?.duration);
    if (action === "clean" && Number.isFinite(duration) && duration > 600)
      throw new Error("Le nettoyage accepte un audio de 10 minutes maximum.");
    const filters =
      settings.denoise && settings.strength > 0
        ? [
            `afftdn=nr=${Math.max(0.01, settings.strength * 24).toFixed(2)}:nf=-30:tn=1`,
          ]
        : [];
    await run(
      "ffmpeg",
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        path.join(dir, "reference.original"),
        "-t",
        action === "clean" ? "601" : "30",
        "-vn",
        "-ac",
        "1",
        "-ar",
        "24000",
        ...(filters.length ? ["-af", filters.join(",")] : []),
        "-c:a",
        "pcm_s24le",
        path.join(dir, "reference.wav"),
      ],
      { timeout: 60000 },
    );
    const converted = await run(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        path.join(dir, "reference.wav"),
      ],
      { timeout: 15000 },
    );
    const outputDuration = Number(
      JSON.parse(converted.stdout).format?.duration,
    );
    if (!Number.isFinite(outputDuration) || outputDuration < 0.5)
      throw new Error(
        "L’audio doit contenir au moins une demi-seconde de son.",
      );
    if (action === "clean" && outputDuration > 600)
      throw new Error("Le nettoyage accepte un audio de 10 minutes maximum.");
    if (action === "prepare" || action === "clean") {
      const audio = await readFile(path.join(dir, "reference.wav"));
      await writeFile(path.join(dir, "narration.wav"), audio, { mode: 0o600 });
      await writeFile(
        path.join(dir, "status.json"),
        JSON.stringify({
          status: "completed",
          kind: action,
          title,
          startedAt,
          elapsedSeconds: Date.now() / 1000 - startedAt,
          duration: outputDuration,
        }),
      );
      busy = false;
      return Response.json({ id, status: "completed" });
    }
    await writeFile(
      path.join(dir, "request.json"),
      JSON.stringify({ text, settings, action, startedAt, title, voiceName }),
      {
        mode: 0o600,
      },
    );
    await writeFile(
      path.join(dir, "status.json"),
      JSON.stringify({ status: "loading", startedAt, stage: "loading", title }),
    );
    const log = await open(path.join(dir, "worker.log"), "a", 0o600);
    const child = spawn(
      path.join(root, "chatterbox-venv/bin/python"),
      [path.join(process.cwd(), "scripts/chatterbox-worker.py"), id],
      {
        stdio: ["ignore", log.fd, log.fd],
        env: {
          ...process.env,
          HF_HUB_OFFLINE: "1",
          HF_HUB_DISABLE_TELEMETRY: "1",
        },
      },
    );
    const timer = setTimeout(() => child.kill("SIGTERM"), 60 * 60 * 1000);
    child.on("error", async () => {
      busy = false;
      clearTimeout(timer);
      await writeFile(
        path.join(dir, "status.json"),
        JSON.stringify({
          status: "failed",
          error: "Impossible de démarrer Chatterbox.",
        }),
      );
    });
    child.on("exit", async (code) => {
      busy = false;
      clearTimeout(timer);
      if (code !== 0) {
        const lastState = await readFile(path.join(dir, "status.json"), "utf8")
          .then((value) => JSON.parse(value))
          .catch(() => null);
        if (["failed", "canceled"].includes(lastState?.status)) return;
        await writeFile(
          path.join(dir, "status.json"),
          JSON.stringify({
            status: "failed",
            error:
              "La génération a été interrompue. Consultez le journal local.",
          }),
        );
      }
    });
    await log.close();
    return Response.json({ id });
  } catch (error) {
    if (ownsJob) busy = false;
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Génération impossible.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    assertLocalRequest(request);
    const { id, title } = await readBody(
      request,
      z.object({ id: z.string().uuid(), title: voiceTitleSchema }),
      2000,
    );
    const file = path.join(root, "voice", id, "status.json");
    const state = JSON.parse(await readFile(file, "utf8"));
    if (state.status !== "completed")
      return Response.json(
        { error: "Attends la fin du traitement pour renommer cet audio." },
        { status: 409 },
      );
    await writeFile(file, JSON.stringify({ ...state, title }), { mode: 0o600 });
    return Response.json({ ...state, title });
  } catch {
    return Response.json(
      {
        error:
          "Impossible d’enregistrer le titre. Utilise entre 1 et 120 caractères.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    assertLocalRequest(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !z.string().uuid().safeParse(id).success)
      return Response.json({ error: "Identifiant invalide" }, { status: 400 });

    const file = path.join(root, "voice", id, "status.json");
    const state = JSON.parse(await readFile(file, "utf8"));
    if (activeStatuses.has(state.status) && processIsAlive(state.pid))
      process.kill(Number(state.pid), "SIGTERM");

    const canceled = {
      ...state,
      status: "canceled",
      stage: "canceled",
      elapsedSeconds: Math.max(
        0,
        Number(
          state.elapsedSeconds || Date.now() / 1000 - state.startedAt || 0,
        ),
      ),
      error: "Traitement arrêté. Ton script et tes réglages sont conservés.",
    };
    await writeFile(file, JSON.stringify(canceled), { mode: 0o600 });
    busy = false;
    return Response.json(canceled);
  } catch {
    return Response.json(
      { error: "Impossible d’arrêter ce traitement." },
      { status: 400 },
    );
  }
}
