import { assertLocalRequest } from "@/lib/server/heygen-http";
import {
  importSourceVideo,
  importSourceAudio,
} from "@/lib/services/motion-media";
import { audioDemuxer } from "@/lib/video-formats";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const contentType =
      request.headers.get("content-type")?.split(";")[0] || "";
    assertLocalRequest(request, contentType);
    if (
      !contentType.startsWith("video/") &&
      !contentType.startsWith("audio/") &&
      contentType !== "application/octet-stream"
    )
      throw new ServiceError(
        "invalid_content_type",
        "Envoyez un fichier audio ou vidéo.",
        415,
      );
    let name = "";
    try {
      name = decodeURIComponent(request.headers.get("x-file-name") || "");
    } catch {}
    return Response.json(
      await (audioDemuxer(name)
        ? importSourceAudio(request)
        : importSourceVideo(request)),
    );
  } catch (e) {
    return Response.json(
      {
        error: {
          message:
            e instanceof ServiceError
              ? e.message
              : "Import impossible. Vérifiez le fichier et FFprobe.",
        },
      },
      { status: e instanceof ServiceError ? e.status : 500 },
    );
  }
}
