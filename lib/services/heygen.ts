import "server-only";
import { z } from "zod";
import { ServiceError } from "../server/errors";
import {
  voicePageSchema,
  speechOutput,
  renderSchema,
  httpsUrl,
  providerId,
  type VideoInput,
  type HeyGenRender,
} from "../schemas/heygen";
const API = "https://api.heygen.com";
export function isHeyGenConfigured() {
  return Boolean(process.env.HEYGEN_API_KEY?.trim());
}
export function buildVideoPrompt(input: VideoInput) {
  const scenes = input.scenes
    .map(
      (s, i) =>
        `Scene ${i + 1} (~${s.duration}s): narration ${JSON.stringify(s.text)}. Visual direction: ${s.prompt}. Transition: ${s.transition}.`,
    )
    .join("\n");
  const prompt = `Create a video in French titled ${JSON.stringify(input.name)}. Use a voice-over with cinematic B-roll, no talking avatar unless requested in the script. Visual style: ${input.template}. Subtitle treatment: ${input.subtitle}. Narration pace: ${input.speed}x. Respect the exact French narration below; do not invent additional spoken text.\nNARRATION:\n${input.script}\nSTORYBOARD (creative directions, use the scene narration in this order when provided):\n${scenes || "Choose relevant visuals for the narration."}\nThe local preview images are placeholders and are not supplied. Generate suitable visuals. Target ${input.format} composition.`;
  if (prompt.length > 10000)
    throw new ServiceError(
      "prompt_too_long",
      "Le scénario dépasse la limite HeyGen de 10 000 caractères. Raccourcissez le script ou les prompts de scènes.",
      400,
    );
  return prompt;
}
export class HeyGenService {
  constructor(private readonly transport: typeof fetch = fetch) {}
  private async request(
    path: string,
    options: { method?: "GET" | "POST"; body?: unknown; timeout?: number } = {},
  ) {
    const key = process.env.HEYGEN_API_KEY?.trim();
    if (!key)
      throw new ServiceError(
        "not_configured",
        "Ajoutez HEYGEN_API_KEY dans .env.local puis redémarrez le serveur.",
        503,
      );
    let response: Response;
    try {
      response = await this.transport(`${API}${path}`, {
        method: options.method || "GET",
        headers: {
          "X-Api-Key": key,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(options.timeout || 25000),
      });
    } catch {
      throw new ServiceError(
        "connection_uncertain",
        options.method === "POST"
          ? "La réponse HeyGen n’a pas été reçue. La demande a peut-être été acceptée : vérifiez votre compte HeyGen avant de relancer."
          : "HeyGen ne répond pas. Réessayez le suivi dans quelques instants.",
        504,
      );
    }
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: "HeyGen a refusé les paramètres. Vérifiez le texte, le format et la voix.",
        401: "La clé API HeyGen est invalide ou expirée.",
        402: "Le compte HeyGen ne dispose pas des crédits requis.",
        403: "Votre clé ou votre offre HeyGen n’autorise pas cette opération.",
        404: "Cette ressource HeyGen est introuvable.",
        429: "La limite HeyGen est atteinte. Patientez avant de réessayer.",
      };
      throw new ServiceError(
        response.status >= 500 && options.method === "POST"
          ? "connection_uncertain"
          : `heygen_${response.status}`,
        messages[response.status] ||
          (options.method === "POST"
            ? "HeyGen a rencontré une erreur. Vérifiez votre compte avant de relancer la génération."
            : "HeyGen est temporairement indisponible."),
        response.status >= 500 ? 502 : response.status,
      );
    }
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new ServiceError(
        options.method === "POST" ? "connection_uncertain" : "invalid_response",
        "HeyGen a renvoyé une réponse illisible. Vérifiez votre compte avant toute nouvelle génération.",
        502,
      );
    }
  }
  private parse<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success)
      throw new ServiceError(
        "invalid_response",
        "La réponse HeyGen ne correspond pas au format attendu. Vérifiez le suivi dans votre compte.",
        502,
      );
    return result.data;
  }
  async verifyConnection() {
    await this.request("/v3/users/me");
    return { configured: true, verified: true };
  }
  async listVoices(type: "public" | "private", token?: string) {
    const query = new URLSearchParams({
      type,
      engine: "starfish",
      limit: "50",
    });
    if (type === "public") query.set("language", "French");
    if (token) query.set("token", token);
    return this.parse(
      voicePageSchema,
      await this.request(`/v3/voices?${query}`),
    );
  }
  async generateSpeech(input: {
    text: string;
    voiceId: string;
    speed: number;
  }) {
    const schema = z.object({
      data: z.object({
        audio_url: httpsUrl,
        duration: z.number().nonnegative(),
        request_id: z.string().optional(),
      }),
    });
    const { data } = this.parse(
      schema,
      await this.request("/v3/voices/speech", {
        method: "POST",
        body: {
          text: input.text,
          voice_id: input.voiceId,
          speed: input.speed,
          language: "fr",
        },
        timeout: 60000,
      }),
    );
    return speechOutput.parse({
      audioUrl: data.audio_url,
      duration: data.duration,
      requestId: data.request_id,
    });
  }
  async createVideo(input: VideoInput) {
    const body = {
      prompt: buildVideoPrompt(input),
      mode: "generate",
      orientation: input.format === "9:16" ? "portrait" : "landscape",
      ...(input.voiceId ? { voice_id: input.voiceId } : {}),
      incognito_mode: true,
    };
    const { data } = this.parse(
      z.object({ data: z.object({ session_id: providerId }) }),
      await this.request("/v3/video-agents", {
        method: "POST",
        body,
        timeout: 60000,
      }),
    );
    return renderSchema.parse({
      sessionId: data.session_id,
      status: "pending",
    });
  }
  async getRender(sessionId: string): Promise<HeyGenRender> {
    providerId.parse(sessionId);
    const { data: session } = this.parse(
      z.object({
        data: z.object({
          session_id: providerId,
          status: z.string(),
          video_id: providerId.nullish(),
          error: z
            .object({
              code: z.string().optional(),
              message: z.string().optional(),
            })
            .nullish(),
        }),
      }),
      await this.request(`/v3/video-agents/${encodeURIComponent(sessionId)}`),
    );
    if (["failed", "stopped", "cancelled"].includes(session.status))
      return {
        sessionId,
        status: "failed",
        error:
          "HeyGen n’a pas terminé cette génération. Consultez les détails dans votre compte.",
      };
    if (!session.video_id)
      return {
        sessionId,
        status: session.status === "thinking" ? "processing" : "pending",
      };
    const { data: video } = this.parse(
      z.object({
        data: z.object({
          status: z.enum(["pending", "processing", "completed", "failed"]),
          video_url: httpsUrl.nullish(),
          captioned_video_url: httpsUrl.nullish(),
          duration: z.number().nonnegative().nullish(),
        }),
      }),
      await this.request(`/v3/videos/${encodeURIComponent(session.video_id)}`),
    );
    if (
      video.status === "completed" &&
      !video.video_url &&
      !video.captioned_video_url
    )
      throw new ServiceError(
        "missing_result",
        "La vidéo est terminée mais le lien n’est pas encore disponible. Actualisez le suivi.",
        502,
      );
    return renderSchema.parse({
      sessionId,
      videoId: session.video_id,
      status: video.status,
      videoUrl: video.captioned_video_url || video.video_url || undefined,
      duration: video.duration ?? undefined,
      error:
        video.status === "failed"
          ? "Le rendu HeyGen a échoué. Consultez votre compte pour le motif et les crédits."
          : undefined,
    });
  }
}
export const heygen = new HeyGenService();
