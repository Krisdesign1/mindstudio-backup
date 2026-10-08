import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { assertLocalRequest } from "@/lib/server/heygen-http";
import { jobDirectory, getHyperframesJob } from "@/lib/services/hyperframes";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; name: string }> },
) {
  try {
    assertLocalRequest(request);
    const { id, name } = await context.params;
    const valid =
      /^(index\.html|preview\.html|gsap\.min\.js|source\.(mp4|wav)|edit\.json|scene-\d{1,2}\.jpg|asset-[0-9a-f-]{36}\.(png|mp4)|narration\.mp3|output\.mp4)$/;
    if (!valid.test(name)) return new Response("Introuvable", { status: 404 });
    const file = path.join(jobDirectory(id), name);
    const types: Record<string, string> = {
      json: "application/json",
      html: "text/html; charset=utf-8",
      js: "application/javascript",
      jpg: "image/jpeg",
      png: "image/png",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      mp4: "video/mp4",
    };
    const headers: Record<string, string> = {
      "Content-Type": types[name.split(".").at(-1)!],
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    };
    if (name.endsWith(".html"))
      headers["Content-Security-Policy"] =
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self'; media-src 'self'; frame-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'";
    if (name === "edit.json")
      headers["Content-Disposition"] =
        'attachment; filename="motion-project.json"';
    if (
      name === "output.mp4" ||
      name === "source.mp4" ||
      name === "source.wav" ||
      (name.startsWith("asset-") && name.endsWith(".mp4"))
    ) {
      if (
        name === "output.mp4" &&
        (await getHyperframesJob(id)).status !== "completed"
      )
        return new Response("Rendu non terminé", { status: 409 });
      const size = (await stat(file)).size;
      const range = request.headers.get("range");
      let start = 0,
        end = size - 1;
      if (range) {
        const match = /^bytes=(\d+)-(\d*)$/.exec(range);
        if (!match)
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${size}` },
          });
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
        if (start > end || start >= size)
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${size}` },
          });
        headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
      }
      headers["Accept-Ranges"] = "bytes";
      headers["Content-Length"] = String(end - start + 1);
      if (new URL(request.url).searchParams.has("download"))
        headers["Content-Disposition"] =
          'attachment; filename="mindstudio-video.mp4"';
      return new Response(
        Readable.toWeb(
          createReadStream(file, { start, end }),
        ) as ReadableStream,
        { status: range ? 206 : 200, headers },
      );
    }
    return new Response(await readFile(file), { headers });
  } catch (error) {
    return Response.json(
      {
        error: {
          message:
            error instanceof ServiceError
              ? error.message
              : "Fichier local introuvable.",
        },
      },
      { status: error instanceof ServiceError ? error.status : 404 },
    );
  }
}
