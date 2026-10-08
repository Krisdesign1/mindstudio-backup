import { readFile } from "node:fs/promises";
import path from "node:path";
import { assertLocalRequest } from "@/lib/server/heygen-http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    assertLocalRequest(request);
    return new Response(
      await readFile(
        path.join(process.cwd(), "node_modules/gsap/dist/gsap.min.js"),
      ),
      {
        headers: {
          "Content-Type": "application/javascript",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return new Response("Indisponible", { status: 403 });
  }
}
