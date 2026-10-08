import { z } from "zod";
export const visualAssetSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["image", "video"]),
  name: z.string().max(180),
  width: z.number().int().positive().max(4096),
  height: z.number().int().positive().max(4096),
  duration: z.number().positive().max(600),
});
export type VisualAsset = z.infer<typeof visualAssetSchema>;
