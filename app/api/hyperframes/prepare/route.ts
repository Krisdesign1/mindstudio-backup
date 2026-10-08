import { route, readBody } from "@/lib/server/heygen-http";
import { hyperframesInput } from "@/lib/schemas/hyperframes";
import { prepareComposition } from "@/lib/services/hyperframes";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return route(request, async () =>
    prepareComposition(await readBody(request, hyperframesInput)),
  );
}
