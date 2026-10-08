import { toSrt } from "../lib/hyperframes/captions";
import { readFile, writeFile } from "node:fs/promises";
import { prepareOverlay } from "../lib/services/motion-overlay";
import { overlayRequestSchema } from "../lib/schemas/motion-edit";
async function main() {
  const data = JSON.parse(
    await readFile(".mindstudio/audio-first-smoke.json", "utf8"),
  );
  data.edit.captions = { ...data.edit.captions, style: "editorial", maxChars: 24, maxWords: 8, maxLines: 2, activeWord: true, keywords: ["vidéo", "idée"] };
  await writeFile(".mindstudio/fixtures/sous-titres.srt", toSrt(data.edit.captions, data.edit.source.duration));
  const job = await prepareOverlay(
    overlayRequestSchema.parse({
      projectId: crypto.randomUUID(),
      name: "Sous-titres éditoriaux",
      edit: data.edit,
    }),
  );
  await writeFile(".mindstudio/subtitles-smoke.json", JSON.stringify(job));
  console.log(job.id);
}
void main();
