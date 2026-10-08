import { z } from "zod";
export const voiceTitleSchema = z
  .string()
  .trim()
  .min(1, "Ajoute un titre.")
  .max(120, "Le titre est limité à 120 caractères.");
export function voiceFilename(title: string) {
  return (
    (title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "ma-narration") + ".wav"
  );
}
