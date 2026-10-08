import { z } from "zod";
import { visualAssetSchema } from "./visual-asset";
import {
  motionTemplateIds,
  findMotionTemplate,
  type MotionTemplateId,
} from "../hyperframes/templates";
export const sourceVideoSchema = z.object({
  kind: z.enum(["audio", "video"]).optional(),
  id: z.string().uuid(),
  name: z.string().max(180),
  duration: z.number().positive().max(600),
  width: z.number().int().positive().max(4096),
  height: z.number().int().positive().max(4096),
  hasAudio: z.boolean(),
});
export const overlaySchema = z.object({
  transition: z.enum(["cut", "fade"]).optional(),
  transitionDuration: z.number().min(0).max(2).optional(),
  family: z
    .enum(["kinetic", "collage", "cinematic", "blueprint", "poster", "quote"])
    .optional(),
  brand: z.string().max(100).optional(),
  chapter: z.string().max(100).optional(),
  counter: z.string().max(40).optional(),
  artTitle: z.string().max(100).optional(),
  artTagline: z.string().max(120).optional(),
  artSymbol: z.string().max(8).optional(),
  artVariant: z.enum(["cards", "minimal", "orbit"]).optional(),
  motion: z.enum(["float", "slide", "zoom", "orbit", "still"]).optional(),
  media: visualAssetSchema.optional(),
  mediaFit: z.enum(["cover", "contain"]).optional(),
  layout: z
    .enum(["split", "poster", "editorial", "typography", "cinema"])
    .optional(),
  contextual: z.boolean().optional(),
  illustration: z
    .enum([
      "growth",
      "journey",
      "learning",
      "technology",
      "community",
      "nature",
      "time",
      "idea",
      "faith",
      "health",
      "finance",
      "abstract",
    ])
    .optional(),
  intent: z.string().max(240).optional(),
  narration: z.string().max(20000).optional(),
  id: z.string().uuid(),
  templateId: z.enum(motionTemplateIds),
  text: z.string().max(240),
  start: z.number().min(0).max(600),
  duration: z.number().min(0.2).max(600),
  x: z.number().min(5).max(95),
  y: z.number().min(5).max(95),
  size: z.number().min(16).max(160),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  opacity: z.number().min(0.1).max(1),
  enabled: z.boolean(),
});
export const captionWordSchema = z
  .object({
    text: z.string().max(160),
    start: z.number().min(0).max(600),
    end: z.number().min(0).max(600),
  })
  .refine((w) => w.end > w.start, "Le mot doit avoir une durée positive.");
export const motionEditSchema = z.object({
  identity: z
    .object({
      enabled: z.boolean(),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      font: z.enum(["sans", "serif", "mono"]),
      signature: z.string().max(100),
      captionStyle: z.enum(["box", "plain", "highlight"]),
    })
    .optional(),
  canvas: z.enum(["16:9", "9:16", "1:1"]).optional(),
  captions: z
    .object({
      enabled: z.boolean(),
      style: z.enum(["box", "outline", "editorial", "pill"]).optional(),
      maxChars: z.number().int().min(20).max(48).optional(),
      maxWords: z.number().int().min(3).max(12).optional(),
      maxLines: z.union([z.literal(1), z.literal(2)]).optional(),
      activeWord: z.boolean().optional(),
      keywords: z.array(z.string().max(40)).max(40).optional(),
      words: z.array(captionWordSchema).max(4000),
    })
    .optional(),
  transcript: z.string().max(20000).optional(),
  source: sourceVideoSchema.optional(),
  layers: z.array(overlaySchema).max(30),
  keepAudio: z.boolean(),
  quality: z.enum(["720p", "1080p"]),
});
export type MotionEdit = z.infer<typeof motionEditSchema>;
export type Overlay = z.infer<typeof overlaySchema>;
export type SourceVideo = z.infer<typeof sourceVideoSchema>;
export const overlayRequestSchema = z
  .object({
    projectId: z.string().min(1).max(150),
    name: z.string().min(1).max(120),
    edit: motionEditSchema,
  })
  .superRefine(({ edit }, ctx) => {
    if (!edit.source)
      ctx.addIssue({
        code: "custom",
        message: "Importez un son ou une vidéo.",
      });
    if (
      edit.source &&
      edit.layers.some(
        (l) => l.enabled && l.start + l.duration > edit.source!.duration + 0.01,
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Un élément dépasse la fin du son ou de la vidéo.",
      });
  });
export function newOverlay(
  templateId: MotionTemplateId = "kinetic",
  duration = 5,
): Overlay {
  const t = findMotionTemplate(templateId);
  return {
    id: crypto.randomUUID(),
    templateId,
    text: t.category === "Logo" ? "MS" : t.label,
    start: 0,
    duration: Math.max(0.2, Math.min(5, duration)),
    x: 50,
    y: templateId === "lower-third" ? 80 : 50,
    size: t.category === "Logo" ? 80 : 56,
    color: t.color,
    opacity: 1,
    enabled: true,
  };
}
