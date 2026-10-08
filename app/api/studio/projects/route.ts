import { z } from "zod";
import { route, readBody } from "@/lib/server/heygen-http";
import { createFreeStudio } from "@/lib/services/free-studio";
export async function POST(request: Request) {
  return route(request, async () => {
    const { name } = await readBody(
      request,
      z.object({ name: z.string().trim().max(120) }),
    );
    return createFreeStudio(name);
  });
}
