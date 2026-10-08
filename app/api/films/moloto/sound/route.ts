import { assertLocalRequest } from "@/lib/server/heygen-http";
import { videoResponse } from "@/lib/server/video-response";
import path from "node:path";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    assertLocalRequest(request);
    const track = new URL(request.url).searchParams.get("track");
    if (track !== "music" && track !== "effects") throw new Error();
    return await videoResponse(
      request,
      path.join(process.cwd(), `.mindstudio/films/moloto-${track}.wav`),
      "audio/wav",
    );
  } catch {
    return Response.json({ error: "Piste indisponible" }, { status: 404 });
  }
}
