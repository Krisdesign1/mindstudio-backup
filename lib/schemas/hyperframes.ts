import { z } from "zod";
import { motionTemplateIds } from "../hyperframes/templates";
import { projectSchema } from "./project";
export const hyperframesInput = z
  .object({
    project: projectSchema,
    templateId: z.enum(motionTemplateIds).default("cinematic"),
    logoText: z.string().trim().min(1).max(4).default("MS"),
    brand: z.string().trim().min(1).max(40).default("MINDSTUDIO"),
    accent: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .default("#b69aff"),
    includeAudio: z.boolean().default(false),
    quality: z.enum(["720p", "1080p"]).default("1080p"),
  })
  .superRefine(({ project }, ctx) => {
    if (!project.scenes.length || project.scenes.length > 30)
      ctx.addIssue({
        code: "custom",
        message: "Préparez entre 1 et 30 scènes.",
      });
    if (project.scenes.some((s) => s.text.length > 1500))
      ctx.addIssue({
        code: "custom",
        message: "Limitez chaque scène à 1 500 caractères.",
      });
    if (project.scenes.reduce((a, s) => a + s.duration, 0) > 300)
      ctx.addIssue({
        code: "custom",
        message: "La première version accepte cinq minutes maximum.",
      });
  });
export type HyperframesInput = Omit<
  z.infer<typeof hyperframesInput>,
  "templateId" | "logoText"
> & {
  templateId?: z.infer<typeof hyperframesInput>["templateId"];
  logoText?: string;
};
export const hyperframesJob = z.object({
  id: z.string().uuid(),
  projectId: z.string(),
  name: z.string(),
  kind: z.enum(["overlay", "legacy"]).optional(),
  templateId: z.enum(motionTemplateIds).optional(),
  status: z.enum(["ready", "rendering", "completed", "failed"]),
  duration: z.number(),
  width: z.number(),
  height: z.number(),
  hasAudio: z.boolean(),
  createdAt: z.string(),
  startedAt: z.string().optional(),
  error: z.string().optional(),
});
export type HyperframesJob = z.infer<typeof hyperframesJob>;
