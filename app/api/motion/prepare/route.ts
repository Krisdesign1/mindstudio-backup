import { route, readBody } from "@/lib/server/heygen-http";
import { overlayRequestSchema } from "@/lib/schemas/motion-edit";
import { prepareOverlay } from "@/lib/services/motion-overlay";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return route(request, async () =>
    prepareOverlay(await readBody(request, overlayRequestSchema, 2000000)),
  );
}
