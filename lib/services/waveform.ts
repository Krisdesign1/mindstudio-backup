import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { getSourceVideo, mediaDirectory } from "./motion-media";
const run = promisify(execFile);
const pending = new Map<
  string,
  Promise<{ duration: number; peaks: number[] }>
>();
export async function getWaveform(id: string) {
  const source = await getSourceVideo(id);
  if (!source.hasAudio) return { duration: source.duration, peaks: [] };
  const existing = pending.get(id);
  if (existing) return existing;
  const work = (async () => {
    const { stdout } = await run(
      "ffmpeg",
      [
        "-v",
        "error",
        "-nostdin",
        "-i",
        path.join(
          mediaDirectory(id),
          source.kind === "audio" ? "source.wav" : "source.mp4",
        ),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "4000",
        "-f",
        "s16le",
        "pipe:1",
      ],
      { encoding: "buffer", timeout: 120000, maxBuffer: 6 * 1024 * 1024 },
    );
    const count = Math.floor(stdout.length / 2),
      bins = Math.min(6000, Math.ceil(source.duration * 20)),
      peaks: number[] = [];
    for (let i = 0; i < bins; i++) {
      let peak = 0;
      for (
        let j = Math.floor((i * count) / bins);
        j < Math.floor(((i + 1) * count) / bins);
        j++
      )
        peak = Math.max(peak, Math.abs(stdout.readInt16LE(j * 2)) / 32768);
      peaks.push(Math.round(peak * 1000) / 1000);
    }
    return { duration: source.duration, peaks };
  })();
  pending.set(id, work);
  try {
    return await work;
  } finally {
    pending.delete(id);
  }
}
