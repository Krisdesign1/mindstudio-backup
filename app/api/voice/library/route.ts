import { z } from "zod";
import { voiceLibrary } from "@/lib/server/voice-library";
import { assertLocalRequest, readBody } from "@/lib/server/heygen-http";
import { videoResponse } from "@/lib/server/video-response";
import path from "node:path";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    assertLocalRequest(request);
    const q = new URL(request.url).searchParams;
    if (q.has("audio"))
      return videoResponse(
        request,
        await voiceLibrary.audio(z.string().uuid().parse(q.get("audio"))),
        "audio/wav",
      );
    if (q.has("reference"))
      return videoResponse(
        request,
        path.join(
          process.cwd(),
          ".mindstudio/voice",
          z.string().uuid().parse(q.get("reference")),
          "reference.wav",
        ),
        "audio/wav",
      );
    return Response.json(
      q.get("view") === "history"
        ? await voiceLibrary.history()
        : await voiceLibrary.voices(),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Bibliothèque indisponible." },
      { status: 400 },
    );
  }
}
export async function POST(request: Request) {
  try {
    assertLocalRequest(request);
    const input = await readBody(
      request,
      z.discriminatedUnion("action", [
        z.object({
          action: z.literal("save"),
          jobId: z.string().uuid(),
          name: z.string().trim().min(1).max(80),
        }),
        z.object({
          action: z.literal("rename"),
          id: z.string().uuid(),
          name: z.string().trim().min(1).max(80),
        }),
      ]),
    );
    return Response.json(
      input.action === "save"
        ? await voiceLibrary.save(input.jobId, input.name)
        : await voiceLibrary.rename(input.id, input.name),
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Enregistrement impossible." },
      { status: 400 },
    );
  }
}
