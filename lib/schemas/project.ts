import { motionEditSchema } from "./motion-edit";
import { z } from "zod";
import { renderSchema, speechRecord } from "./heygen";
export const sceneSchema = z.object({
  id: z.string(),
  text: z.string(),
  prompt: z.string(),
  duration: z.number().min(1).max(120),
  image: z.string(),
  transition: z.enum(["Fondu", "Coupe", "Zoom"]),
});
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  idea: z.string(),
  format: z.enum(["16:9", "9:16", "1:1", "4:5"]),
  mode: z.enum(["automatic", "manual"]),
  template: z.string(),
  script: z.string(),
  status: z.enum([
    "Brouillon",
    "Préparation",
    "Génération",
    "Terminé",
    "Erreur",
  ]),
  image: z.string(),
  updatedAt: z.string(),
  scenes: z.array(sceneSchema),
  voice: z.string(),
  speed: z.number().min(0.5).max(2),
  subtitle: z.string(),
  renders: z.number().default(0),
  motionExportFingerprint: z.string().max(2000000).optional(),
  motionEdit: motionEditSchema.optional(),
  motionTemplate: z.string().optional(),
  motionBrand: z.string().max(40).optional(),
  motionAccent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  motionLogo: z.string().max(4).optional(),
  hyperframesJobId: z.string().uuid().optional(),
  heygenVoiceId: z.string().optional(),
  heygenVoiceName: z.string().optional(),
  heygenRender: renderSchema.optional(),
  heygenSpeech: speechRecord.optional(),
});
export const projectsSchema = z.array(projectSchema);
export type Project = z.infer<typeof projectSchema>;
export type Scene = z.infer<typeof sceneSchema>;
