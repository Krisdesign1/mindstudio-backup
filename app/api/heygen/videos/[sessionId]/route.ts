import { heygen } from "@/lib/services/heygen";
import { route } from "@/lib/server/heygen-http";
import { providerId } from "@/lib/schemas/heygen";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  return route(request, async () => {
    const { sessionId } = await context.params;
    if (!providerId.safeParse(sessionId).success)
      throw new ServiceError(
        "invalid_input",
        "Identifiant HeyGen invalide.",
        400,
      );
    return heygen.getRender(sessionId);
  });
}
