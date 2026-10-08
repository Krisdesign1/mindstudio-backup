import { route } from "@/lib/server/heygen-http";
import { getHyperframesJob } from "@/lib/services/hyperframes";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(request, async () =>
    getHyperframesJob((await context.params).id),
  );
}
