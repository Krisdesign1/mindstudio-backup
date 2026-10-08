import { z } from "zod";
import { codex } from "@/lib/server/codex";
import { assertLocalRequest, readBody } from "@/lib/server/heygen-http";
import { projectSchema } from "@/lib/schemas/project";
export const runtime = "nodejs";
const body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("login") }),
  z.object({
    action: z.literal("ask"),
    text: z.string().trim().min(1).max(20000),
    id: z.string().uuid().optional(),
    project: projectSchema.optional(),
  }),
  z.object({ action: z.literal("stop"), id: z.string().uuid() }),
]);
async function handle(request: Request, action: () => Promise<unknown>) {
  try {
    assertLocalRequest(request);
    return Response.json(await action(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return Response.json(
      {
        error: e instanceof Error ? e.message : "Connexion Codex indisponible.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export async function GET(request: Request) {
  return handle(request, async () => {
    const id = new URL(request.url).searchParams.get("id");
    return id ? codex.get(z.string().uuid().parse(id)) : codex.status();
  });
}
export async function POST(request: Request) {
  return handle(request, async () => {
    const input = await readBody(request, body, 300000);
    if (input.action === "login") return codex.login();
    if (input.action === "stop") return codex.stop(input.id);
    return codex.ask(input.text, input.id, input.project);
  });
}
