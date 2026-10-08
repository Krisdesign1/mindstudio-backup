import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { freeStudioId } from "@/lib/services/free-studio";
import { assertLocalRequest } from "@/lib/server/heygen-http";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertLocalRequest(request);
    const { id } = await params;
    if (!freeStudioId.safeParse(id).success)
      return new Response("Introuvable", { status: 404 });
    const file = path.join(
      process.cwd(),
      ".mindstudio/studio",
      id,
      "delivery.mp4",
    );
    const info = await stat(file);
    return new Response(
      Readable.toWeb(createReadStream(file)) as ReadableStream,
      {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(info.size),
          "Content-Disposition":
            'attachment; filename="mindstudio-montage.mp4"',
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (e) {
    return new Response("Rendu indisponible", {
      status: e instanceof ServiceError ? e.status : 404,
    });
  }
}
