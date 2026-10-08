import { route } from "@/lib/server/heygen-http";
import { startHyperframesRender } from "@/lib/services/hyperframes";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(request, async () =>
    startHyperframesRender((await context.params).id),
  );
}
