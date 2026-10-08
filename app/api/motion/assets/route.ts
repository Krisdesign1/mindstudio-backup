import { assertLocalRequest } from "@/lib/server/heygen-http";
import { importVisualAsset } from "@/lib/services/visual-assets";
import { ServiceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertLocalRequest(request, "application/octet-stream");
    return Response.json(await importVisualAsset(request));
  } catch (error) {
    return Response.json(
      {
        error: {
          message:
            error instanceof ServiceError
              ? error.message
              : "Import du média impossible.",
        },
      },
      { status: error instanceof ServiceError ? error.status : 500 },
    );
  }
}
