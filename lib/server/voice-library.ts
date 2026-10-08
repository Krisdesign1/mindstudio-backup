import "server-only";
import {
  readdir,
  readFile,
  mkdir,
  copyFile,
  writeFile,
  stat,
  access,
  rename,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { savedVoiceSchema, type NarrationRecord } from "../voice-library";
import { voiceSettingsSchema } from "../voice-settings";
export class VoiceLibrary {
  constructor(readonly root: string) {}
  async voices() {
    const dir = path.join(this.root, "saved-voices");
    const records = await Promise.all(
      (await readdir(dir).catch(() => []))
        .filter((id) => z.string().uuid().safeParse(id).success)
        .map(async (id) => {
          try {
            return savedVoiceSchema.parse(
              JSON.parse(
                await readFile(path.join(dir, id, "voice.json"), "utf8"),
              ),
            );
          } catch {
            return null;
          }
        }),
    );
    return records
      .filter((r) => r !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  async audio(id: string) {
    return path.join(
      this.root,
      "saved-voices",
      z.string().uuid().parse(id),
      "reference.wav",
    );
  }
  async save(jobId: string, name: string) {
    z.string().uuid().parse(jobId);
    const dir = path.join(this.root, "voice", jobId);
    const state = JSON.parse(
      await readFile(path.join(dir, "status.json"), "utf8"),
    );
    if (state.status !== "completed" || state.kind !== "prepare")
      throw new Error(
        "Prépare d’abord ta voix, puis enregistre-la dans la bibliothèque.",
      );
    const record = savedVoiceSchema.parse({
      id: randomUUID(),
      name,
      jobId,
      duration: state.duration,
      createdAt: Date.now() / 1000,
    });
    const target = path.join(this.root, "saved-voices", record.id);
    await mkdir(target, { recursive: true, mode: 0o700 });
    await copyFile(
      path.join(dir, "reference.wav"),
      path.join(target, "reference.wav"),
    );
    await writeFile(path.join(target, "voice.json"), JSON.stringify(record), {
      mode: 0o600,
    });
    return record;
  }
  async rename(id: string, name: string) {
    const dir = path.join(
      this.root,
      "saved-voices",
      z.string().uuid().parse(id),
    );
    const record = savedVoiceSchema.parse({
      ...JSON.parse(await readFile(path.join(dir, "voice.json"), "utf8")),
      name,
    });
    const temp = path.join(dir, randomUUID() + ".tmp");
    await writeFile(temp, JSON.stringify(record), { mode: 0o600 });
    await rename(temp, path.join(dir, "voice.json"));
    return record;
  }
  async history(): Promise<NarrationRecord[]> {
    const root = path.join(this.root, "voice");
    const records = await Promise.all(
      (await readdir(root).catch(() => []))
        .filter((id) => z.string().uuid().safeParse(id).success)
        .map(async (id) => {
          try {
            const dir = path.join(root, id);
            const state = JSON.parse(
              await readFile(path.join(dir, "status.json"), "utf8"),
            );
            const request = await readFile(
              path.join(dir, "request.json"),
              "utf8",
            )
              .then(JSON.parse)
              .catch(() => null);
            const kind =
              state.kind ||
              request?.action ||
              (typeof request?.text === "string" ? "generate" : null);
            if (kind !== "generate" && kind !== "test") return null;
            const settings = voiceSettingsSchema.safeParse(request?.settings);
            return {
              id,
              title: state.title || request?.title || "Ma narration",
              status: state.status,
              kind,
              startedAt:
                state.startedAt ||
                request?.startedAt ||
                (await stat(dir)).mtimeMs / 1000,
              ...(typeof state.duration === "number"
                ? { duration: state.duration }
                : {}),
              text: typeof request?.text === "string" ? request.text : null,
              settings:
                request?.settings && settings.success ? settings.data : null,
              voiceName: request?.voiceName || null,
              hasReference: await access(path.join(dir, "reference.wav"))
                .then(() => true)
                .catch(() => false),
            } satisfies NarrationRecord;
          } catch {
            return null;
          }
        }),
    );
    return records
      .filter((r) => r !== null)
      .sort((a, b) => b.startedAt - a.startedAt);
  }
}
// Keep the runtime data directory opaque to the bundler. It contains a local
// Python environment whose symlinks are valid at runtime but are not app assets.
function localDataRoot() {
  const configured = process.env.MINDSTUDIO_DATA_DIRECTORY;
  return path.join(process.cwd(), configured || [".mind", "studio"].join(""));
}
export const voiceLibrary = new VoiceLibrary(localDataRoot());
