import { z } from "zod";
import { captionWordSchema } from "./motion-edit";
export const speechSegmentSchema = z.object({
  start: z.number().min(0).max(600),
  end: z.number().min(0).max(600),
  text: z.string().max(4000),
});
export const transcriptionSchema = z.object({
  sourceId: z.string().uuid(),
  status: z.enum(["idle", "loading", "transcribing", "completed", "failed"]),
  progress: z.number().min(0).max(100).default(0),
  updatedAt: z.string(),
  language: z.string().optional(),
  segments: z.array(speechSegmentSchema).max(2000).default([]),
  words: z.array(captionWordSchema).max(4000).default([]),
  error: z.string().optional(),
});
export type Transcription = z.infer<typeof transcriptionSchema>;
export type SpeechSegment = z.infer<typeof speechSegmentSchema>;
