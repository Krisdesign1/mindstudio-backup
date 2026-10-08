import { z } from "zod";
export const providerId = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const httpsUrl = z
  .string()
  .url()
  .refine(
    (value) => new URL(value).protocol === "https:",
    "URL HTTPS attendue",
  );
export const voiceSchema = z.object({
  voice_id: providerId,
  name: z.string(),
  language: z.string().nullish(),
  type: z.string().nullish(),
  preview_audio_url: httpsUrl.nullish(),
});
export const voicePageSchema = z.object({
  data: z.array(voiceSchema),
  has_more: z.boolean().optional(),
  next_token: z.string().nullish(),
});
export type HeyGenVoice = z.infer<typeof voiceSchema>;
export const speechInput = z.object({
  text: z.string().trim().min(1).max(5000),
  voiceId: providerId,
  speed: z.number().min(0.5).max(2),
});
export const speechOutput = z.object({
  audioUrl: httpsUrl,
  duration: z.number().nonnegative(),
  requestId: z.string().optional(),
});
export const videoInput = z.object({
  requestId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  script: z.string().trim().min(1).max(8000),
  format: z.enum(["16:9", "9:16"]),
  template: z.string().max(120),
  subtitle: z.string().max(60),
  speed: z.number().min(0.5).max(2),
  voiceId: providerId.optional(),
  scenes: z
    .array(
      z.object({
        text: z.string().max(2000),
        prompt: z.string().max(1500),
        duration: z.number().min(1).max(120),
        transition: z.enum(["Fondu", "Coupe", "Zoom"]),
      }),
    )
    .max(50),
});
export type VideoInput = z.infer<typeof videoInput>;
export const renderSchema = z.object({
  sessionId: providerId,
  videoId: providerId.optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  videoUrl: httpsUrl.optional(),
  duration: z.number().nonnegative().optional(),
  error: z.string().optional(),
});
export type HeyGenRender = z.infer<typeof renderSchema>;
export const connectionSchema = z.object({
  configured: z.boolean(),
  verified: z.boolean().optional(),
});
export type HeyGenConnection = z.infer<typeof connectionSchema>;
export const speechRecord = speechOutput.extend({
  text: z.string(),
  voiceId: providerId,
  speed: z.number(),
  createdAt: z.string(),
});
