import "server-only";
import { mkdir, open, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { ServiceError } from "../server/errors";
import { visualAssetSchema, type VisualAsset } from "../schemas/visual-asset";
import {
  getSourceVideo,
  importSourceVideo,
  mediaDirectory,
} from "./motion-media";
import { videoDemuxer } from "../video-formats";
const run = promisify(execFile);
function directory(id: string) {
  if (!z.string().uuid().safeParse(id).success)
    throw new ServiceError("invalid_id", "Identifiant invalide.", 400);
  return path.join(process.cwd(), ".mindstudio", "assets", id);
}
export function visualAssetFile(asset: VisualAsset) {
  return asset.kind === "video"
    ? path.join(mediaDirectory(asset.id), "source.mp4")
    : path.join(directory(asset.id), "image.png");
}
export async function getVisualAsset(
  id: string,
  kind: "image" | "video",
): Promise<VisualAsset> {
  if (kind === "video") {
    const source = await getSourceVideo(id);
    if (source.kind === "audio")
      throw new ServiceError(
        "invalid_asset",
        "Ce média n’est pas un clip vidéo.",
        400,
      );
    return visualAssetSchema.parse({ ...source, kind: "video" });
  }
  try {
    return visualAssetSchema.parse(
      JSON.parse(
        await readFile(path.join(directory(id), "metadata.json"), "utf8"),
      ),
    );
  } catch {
    throw new ServiceError(
      "asset_missing",
      "Image introuvable. Réimportez-la.",
      404,
    );
  }
}
export async function importVisualAsset(request: Request) {
  let name = "";
  try {
    name = decodeURIComponent(request.headers.get("x-file-name") || "").slice(
      0,
      180,
    );
  } catch {}
  if (videoDemuxer(name)) {
    const source = await importSourceVideo(request);
    return visualAssetSchema.parse({ ...source, kind: "video" });
  }
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext || !["png", "jpg", "jpeg", "webp"].includes(ext))
    throw new ServiceError(
      "asset_format",
      "Choisissez une image PNG, JPEG, WebP ou un clip vidéo compatible.",
      400,
    );
  const id = crypto.randomUUID(),
    dir = directory(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  try {
    const original = path.join(dir, `original.${ext}`),
      file = await open(original, "wx", 0o600),
      reader = request.body?.getReader();
    try {
      if (!reader) throw new Error("empty");
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 25 * 1024 * 1024) {
          await reader.cancel();
          throw new ServiceError("too_large", "Limite : 25 Mo par image.", 413);
        }
        await file.writeFile(value);
      }
    } finally {
      await file.close();
    }
    const { stdout } = await run(
      "ffprobe",
      [
        "-v",
        "error",
        "-protocol_whitelist",
        "file",
        "-f",
        "image2",
        "-show_streams",
        "-of",
        "json",
        original,
      ],
      { timeout: 20000, maxBuffer: 1024 * 1024 },
    );
    const v = JSON.parse(stdout).streams[0];
    const asset = visualAssetSchema.parse({
      id,
      kind: "image",
      name,
      width: v.width,
      height: v.height,
      duration: 1,
    });
    await run(
      "ffmpeg",
      [
        "-v",
        "error",
        "-nostdin",
        "-protocol_whitelist",
        "file",
        "-f",
        "image2",
        "-i",
        original,
        "-frames:v",
        "1",
        path.join(dir, "image.png"),
      ],
      { timeout: 30000, maxBuffer: 1024 * 1024 },
    );
    await writeFile(path.join(dir, "metadata.json"), JSON.stringify(asset));
    return asset;
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(
      "invalid_image",
      "Image illisible ou supérieure à 4096 pixels par dimension.",
      400,
    );
  }
}
