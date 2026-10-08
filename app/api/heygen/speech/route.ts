import { heygen } from "@/lib/services/heygen";
import { route, readBody } from "@/lib/server/heygen-http";
import { speechInput } from "@/lib/schemas/heygen";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return route(request, async () =>
    heygen.generateSpeech(await readBody(request, speechInput)),
  );
}
