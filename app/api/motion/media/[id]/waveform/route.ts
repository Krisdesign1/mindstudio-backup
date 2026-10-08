import { route } from "@/lib/server/heygen-http";
import { getWaveform } from "@/lib/services/waveform";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return route(request, async () => getWaveform((await ctx.params).id));
}
