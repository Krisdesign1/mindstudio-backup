import { z } from "zod";
export const voiceSettingsSchema = z.object({
  denoise: z.boolean().default(true),
  strength: z.number().min(0).max(0.85).default(0.45),
  pause: z.number().min(0.15).max(0.7).default(0.25),
  naturalPauses: z.boolean().default(true),
  normalize: z.boolean().default(true),
  exaggeration: z.number().min(0).max(1).default(0.4),
  cfg: z.number().min(0.1).max(1).default(0.5),
  temperature: z.number().min(0.1).max(1.2).default(0.75),
  seed: z.number().int().min(0).max(2147483647).default(42),
});
export type VoiceSettings = z.infer<typeof voiceSettingsSchema>;
export const defaultVoiceSettings = voiceSettingsSchema.parse({});
