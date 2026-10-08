import "server-only";
import {
  mkdir,
  open,
  readFile,
  writeFile,
  rm,
  copyFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { z } from "zod";
import { sourceVideoSchema, type SourceVideo } from "../schemas/motion-edit";
import { ServiceError } from "../server/errors";
import {
  videoDemuxer,
  videoFormatLabel,
  audioDemuxer,
  audioFormatLabel,
} from "../video-formats";
const run = promisify(execFile);
export function mediaDirectory(id: string) {
  if (!z.string().uuid().safeParse(id).success)
    throw new ServiceError("invalid_id", "Identifiant vidéo invalide.", 400);
  return path.join(process.cwd(), ".mindstudio", "media", id);
}
export async function getSourceVideo(id: string) {
  try {
    return sourceVideoSchema.parse(
      JSON.parse(
        await readFile(path.join(mediaDirectory(id), "metadata.json"), "utf8"),
      ),
    );
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(
      "source_missing",
      "Vidéo source introuvable sur cet ordinateur. Importez-la à nouveau.",
      404,
    );
  }
}
export async function importSourceVideo(
  request: Request,
): Promise<SourceVideo> {
  let name = "";
  try {
    name = decodeURIComponent(request.headers.get("x-file-name") || "").slice(
      0,
      180,
    );
  } catch {}
  const format = videoDemuxer(name);
  if (!format)
    throw new ServiceError(
      "unsupported_format",
      `Formats acceptés : ${videoFormatLabel}.`,
      400,
    );
  const id = crypto.randomUUID(),
    dir = mediaDirectory(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new ServiceError("empty", "Vidéo vide.", 400);
    const original = path.join(dir, `original.${format.ext}`);
    const file = await open(original, "wx", 0o600);
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 500 * 1024 * 1024) {
          await reader.cancel();
          throw new ServiceError(
            "too_large",
            "Limite : 500 Mo par vidéo.",
            413,
          );
        }
        await file.writeFile(value);
      }
    } finally {
      await file.close();
    }
    let metadata;
    try {
      const { stdout } = await run(
        "ffprobe",
        [
          "-v",
          "error",
          "-protocol_whitelist",
          "file",
          "-f",
          format.demuxer,
          "-show_streams",
          "-show_format",
          "-of",
          "json",
          original,
        ],
        { timeout: 20000, maxBuffer: 1024 * 1024 },
      );
      metadata = JSON.parse(stdout);
    } catch {
      throw new ServiceError(
        "invalid_video",
        "Fichier vidéo illisible ou incompatible avec son extension.",
        400,
      );
    }
    const videos = metadata.streams.filter(
      (s: { codec_type: string }) => s.codec_type === "video",
    );
    const audio = metadata.streams.filter(
      (s: { codec_type: string }) => s.codec_type === "audio",
    );
    const video = videos[0];
    if (videos.length !== 1 || audio.length > 1)
      throw new ServiceError(
        "unsupported_video",
        "Choisissez une vidéo avec une seule piste vidéo et au plus une piste audio.",
        400,
      );
    const result = sourceVideoSchema.safeParse({
      id,
      name,
      duration: Number(metadata.format.duration),
      width: video.width,
      height: video.height,
      hasAudio: audio.length > 0,
    });
    if (!result.success || result.data.duration < 0.2)
      throw new ServiceError(
        "video_limits",
        "Vidéo limitée à dix minutes, 4096 pixels par dimension et 500 Mo.",
        400,
      );
    const compatible =
      format.demuxer === "mov" &&
      video.codec_name === "h264" &&
      video.pix_fmt === "yuv420p" &&
      audio.every((s: { codec_name: string }) => s.codec_name === "aac") &&
      ["1:1", "N/A", undefined].includes(video.sample_aspect_ratio) &&
      !video.tags?.rotate &&
      !video.side_data_list?.some((s: { rotation?: number }) => s.rotation);
    const output = path.join(dir, "source.mp4");
    if (compatible) await copyFile(original, output);
    else {
      try {
        await run(
          "ffmpeg",
          [
            "-v",
            "error",
            "-nostdin",
            "-protocol_whitelist",
            "file",
            "-f",
            format.demuxer,
            "-i",
            original,
            "-map",
            "0:v:0",
            "-map",
            "0:a:0?",
            "-map_metadata",
            "-1",
            "-sn",
            "-dn",
            "-vf",
            "scale=w='min(4096,2*ceil(iw*sar/2))':h='2*ceil(ih/2)',setsar=1",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            "-threads",
            "2",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            output,
          ],
          { timeout: 30 * 60 * 1000, maxBuffer: 1024 * 1024 },
        );
      } catch {
        throw new ServiceError(
          "conversion_failed",
          "Conversion locale impossible. Vérifiez le fichier vidéo et FFmpeg, puis réessayez.",
          422,
        );
      }
    }
    const { stdout } = await run(
      "ffprobe",
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", output],
      { timeout: 20000, maxBuffer: 1024 * 1024 },
    );
    const normalized = JSON.parse(stdout);
    const outputVideo = normalized.streams.find(
      (s: { codec_type: string }) => s.codec_type === "video",
    );
    const finalSource = sourceVideoSchema.parse({
      ...result.data,
      width: outputVideo.width,
      height: outputVideo.height,
      duration: Number(normalized.format.duration),
    });
    await writeFile(
      path.join(dir, "metadata.json"),
      JSON.stringify(finalSource),
    );
    return finalSource;
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    throw error;
  }
}

/** Audio remains the master clock; no synthetic video or voice is created. */
export async function importSourceAudio(
  request: Request,
): Promise<SourceVideo> {
  let name = "";
  try {
    name = decodeURIComponent(request.headers.get("x-file-name") || "").slice(
      0,
      180,
    );
  } catch {}
  const format = audioDemuxer(name);
  if (!format)
    throw new ServiceError(
      "unsupported_audio",
      `Formats audio acceptés : ${audioFormatLabel}.`,
      400,
    );
  const id = crypto.randomUUID(),
    dir = mediaDirectory(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  try {
    const original = path.join(dir, `original.${format.ext}`);
    const reader = request.body?.getReader();
    if (!reader) throw new ServiceError("empty", "Fichier audio vide.", 400);
    const file = await open(original, "wx", 0o600);
    try {
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 500 * 1024 * 1024) {
          await reader.cancel();
          throw new ServiceError("too_large", "Limite : 500 Mo.", 413);
        }
        await file.writeFile(value);
      }
    } finally {
      await file.close();
    }
    let metadata;
    try {
      const { stdout } = await run(
        "ffprobe",
        [
          "-v",
          "error",
          "-protocol_whitelist",
          "file",
          "-f",
          format.demuxer,
          "-show_streams",
          "-show_format",
          "-of",
          "json",
          original,
        ],
        { timeout: 20000, maxBuffer: 1024 * 1024 },
      );
      metadata = JSON.parse(stdout);
    } catch {
      throw new ServiceError(
        "invalid_audio",
        "Ce fichier audio est illisible ou ne correspond pas à son extension.",
        400,
      );
    }
    const tracks = metadata.streams.filter(
      (s: { codec_type: string }) => s.codec_type === "audio",
    );
    const duration = Number(metadata.format.duration);
    if (
      tracks.length !== 1 ||
      !Number.isFinite(duration) ||
      duration < 0.2 ||
      duration > 600
    )
      throw new ServiceError(
        "audio_limits",
        "Choisissez un son de 0,2 seconde à 10 minutes, avec une seule piste audio.",
        400,
      );
    try {
      await run(
        "ffmpeg",
        [
          "-v",
          "error",
          "-nostdin",
          "-protocol_whitelist",
          "file",
          "-f",
          format.demuxer,
          "-i",
          original,
          "-map",
          "0:a:0",
          "-vn",
          "-map_metadata",
          "-1",
          "-c:a",
          "pcm_s16le",
          "-ar",
          "48000",
          path.join(dir, "source.wav"),
        ],
        { timeout: 120000, maxBuffer: 1024 * 1024 },
      );
    } catch {
      throw new ServiceError(
        "conversion_failed",
        "Préparation audio impossible. Vérifiez le fichier et FFmpeg.",
        422,
      );
    }
    const { stdout } = await run(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_format",
        "-of",
        "json",
        path.join(dir, "source.wav"),
      ],
      { timeout: 20000 },
    );
    const source = sourceVideoSchema.parse({
      id,
      name,
      kind: "audio",
      duration: Number(JSON.parse(stdout).format.duration),
      width: 1920,
      height: 1080,
      hasAudio: true,
    });
    await writeFile(path.join(dir, "metadata.json"), JSON.stringify(source));
    return source;
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    throw error;
  }
}
