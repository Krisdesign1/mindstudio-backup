import {
  heygen,
  isHeyGenConfigured,
  buildVideoPrompt,
} from "@/lib/services/heygen";
import { route, readBody } from "@/lib/server/heygen-http";
import { videoInput } from "@/lib/schemas/heygen";
import { createRenderOnce } from "@/lib/server/render-requests";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return route(request, async () => {
    const input = await readBody(request, videoInput);
    if (!isHeyGenConfigured())
      throw new ServiceError(
        "not_configured",
        "Configurez la clé HeyGen dans .env.local.",
        503,
      );
    buildVideoPrompt(input);
    return createRenderOnce(input, () => heygen.createVideo(input));
  });
}
