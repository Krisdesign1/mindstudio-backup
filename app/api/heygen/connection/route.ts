import { heygen, isHeyGenConfigured } from "@/lib/services/heygen";
import { route } from "@/lib/server/heygen-http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return route(request, async () =>
    new URL(request.url).searchParams.get("verify") === "1"
      ? heygen.verifyConnection()
      : { configured: isHeyGenConfigured() },
  );
}
