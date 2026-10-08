import "server-only";
import { z } from "zod";
import { ServiceError } from "./errors";
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
export function assertLocalRequest(
  request: Request,
  contentType = "application/json",
) {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  let publicUrl: URL;
  try {
    publicUrl = new URL(`${url.protocol}//${host || "invalid"}`);
  } catch {
    throw new ServiceError("local_only", "Hôte local invalide.", 403);
  }
  if (
    !localHosts.has(url.hostname) ||
    !host ||
    !localHosts.has(publicUrl.hostname) ||
    publicUrl.host !== host
  )
    throw new ServiceError(
      "local_only",
      "La connexion HeyGen est réservée au studio local. Une authentification est nécessaire avant un déploiement public.",
      403,
    );
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== publicUrl.origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new ServiceError("invalid_origin", "Requête externe refusée.", 403);
  if (
    request.method === "POST" &&
    (!request.headers.get("content-type")?.startsWith(contentType) || !origin)
  )
    throw new ServiceError(
      "invalid_origin",
      "Requête JSON depuis le studio requise.",
      403,
    );
}
export async function readBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  limit = 100000,
): Promise<T> {
  const reader = request.body?.getReader();
  if (!reader) throw new ServiceError("invalid_body", "Requête vide.", 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new ServiceError(
        "too_large",
        "Le projet est trop volumineux pour cette requête.",
        413,
      );
    }
    chunks.push(value);
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch {
    throw new ServiceError(
      "invalid_input",
      "Paramètres invalides. Vérifiez le script, la voix et le format (16:9 ou 9:16 pour HeyGen).",
      400,
    );
  }
}
export async function route(request: Request, action: () => Promise<unknown>) {
  try {
    assertLocalRequest(request);
    return Response.json(await action(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const known = error instanceof ServiceError;
    return Response.json(
      {
        error: {
          code: known ? error.code : "internal_error",
          message: known
            ? error.message
            : "Une erreur interne empêche cette opération.",
        },
      },
      {
        status: known ? error.status : 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
