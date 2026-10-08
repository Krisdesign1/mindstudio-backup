import { z } from "zod";
import { readBody, route } from "@/lib/server/heygen-http";
import { openNativeStudio } from "@/lib/services/native-studio";
import { freeStudioId } from "@/lib/services/free-studio";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return route(request, async () => {
    const { film } = await readBody(
      request,
      z.object({
        film: z.union([
          z.enum(["mbappe", "mourinho", "reviens", "moloto"]),
          freeStudioId,
        ]),
      }),
    );
    return openNativeStudio(film);
  });
}
