import { z } from "zod";
import { voiceSettingsSchema } from "./voice-settings";
export const savedVoiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  createdAt: z.number(),
  duration: z.number().positive(),
  jobId: z.string().uuid(),
});
export type SavedVoice = z.infer<typeof savedVoiceSchema>;
export const narrationRecordSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  kind: z.string(),
  startedAt: z.number(),
  duration: z.number().optional(),
  text: z.string().nullable(),
  settings: voiceSettingsSchema.nullable(),
  voiceName: z.string().nullable(),
  hasReference: z.boolean(),
});
export type NarrationRecord = z.infer<typeof narrationRecordSchema>;
