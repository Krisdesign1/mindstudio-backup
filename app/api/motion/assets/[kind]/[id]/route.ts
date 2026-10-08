import { assertLocalRequest } from "@/lib/server/heygen-http";
import { getVisualAsset, visualAssetFile } from "@/lib/services/visual-assets";
import { videoResponse } from "@/lib/server/video-response";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  ctx: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    assertLocalRequest(request);
    const { kind, id } = await ctx.params;
    if (kind !== "image" && kind !== "video")
      return new Response(null, { status: 404 });
    const asset = await getVisualAsset(id, kind);
    return videoResponse(
      request,
      visualAssetFile(asset),
      kind === "image" ? "image/png" : "video/mp4",
    );
  } catch {
    return new Response(null, { status: 404 });
  }
}
