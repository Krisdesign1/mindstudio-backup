import { route } from "@/lib/server/heygen-http";
import {
  getTranscription,
  startTranscription,
} from "@/lib/services/transcription";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(request, async () =>
    getTranscription((await context.params).id),
  );
}
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(request, async () =>
    startTranscription((await context.params).id),
  );
}
