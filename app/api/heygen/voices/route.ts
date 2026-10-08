import { heygen } from "@/lib/services/heygen";
import { route } from "@/lib/server/heygen-http";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return route(request, async () => {
    const query = new URL(request.url).searchParams;
    const type = query.get("type") || "public";
    const token = query.get("token") || undefined;
    if (!["public", "private"].includes(type) || (token && token.length > 4000))
      throw new ServiceError("invalid_input", "Filtre de voix invalide.", 400);
    return heygen.listVoices(type as "public" | "private", token);
  });
}
