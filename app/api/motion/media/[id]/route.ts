import path from "node:path";
import { assertLocalRequest } from "@/lib/server/heygen-http";
import { mediaDirectory, getSourceVideo } from "@/lib/services/motion-media";
import { videoResponse } from "@/lib/server/video-response";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    assertLocalRequest(request);
    const { id } = await ctx.params;
    const source = await getSourceVideo(id);
    return videoResponse(
      request,
      path.join(
        mediaDirectory(id),
        source.kind === "audio" ? "source.wav" : "source.mp4",
      ),
      source.kind === "audio" ? "audio/wav" : "video/mp4",
    );
  } catch (e) {
    return Response.json(
      {
        error: {
          message:
            e instanceof ServiceError ? e.message : "Vidéo inaccessible.",
        },
      },
      { status: e instanceof ServiceError ? e.status : 404 },
    );
  }
}
