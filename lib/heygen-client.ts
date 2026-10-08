import { z } from "zod";
export class HeyGenClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function heygenRequest<T>(
  url: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new HeyGenClientError(
      options.method === "POST"
        ? "La connexion a été interrompue. Vérifiez HeyGen avant de relancer : une génération peut être en cours."
        : "Le serveur local est indisponible.",
      "network_error",
      0,
    );
  }
  const raw: unknown = await response.json();
  if (!response.ok) {
    const error = z
      .object({ error: z.object({ message: z.string(), code: z.string() }) })
      .safeParse(raw);
    throw new HeyGenClientError(
      error.success ? error.data.error.message : "La requête HeyGen a échoué.",
      error.success ? error.data.error.code : "invalid_response",
      response.status,
    );
  }
  const result = schema.safeParse(raw);
  if (!result.success)
    throw new HeyGenClientError(
      "Réponse inattendue du serveur. Vérifiez HeyGen avant de relancer.",
      "invalid_response",
      502,
    );
  return result.data;
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Une erreur empêche cette opération.";
}
