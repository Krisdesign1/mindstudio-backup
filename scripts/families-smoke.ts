import { readFile, writeFile } from "node:fs/promises";
import { prepareOverlay } from "../lib/services/motion-overlay";
import { overlayRequestSchema, newOverlay } from "../lib/schemas/motion-edit";
import { families, applyFamily } from "../lib/hyperframes/families";
async function main() {
  const old = JSON.parse(
    await readFile(".mindstudio/audio-first-smoke.json", "utf8"),
  );
  const source = old.edit.source;
  const span = source.duration / 6;
  const layers = families.map((f, i) =>
    applyFamily(
      {
        ...newOverlay(),
        id: crypto.randomUUID(),
        text: "Une idée prend vie",
        illustration: "idea",
        start: i * span,
        duration: span,
      },
      f.id,
    ),
  );
  const job = await prepareOverlay(
    overlayRequestSchema.parse({
      projectId: crypto.randomUUID(),
      name: "Six directions artistiques",
      edit: { source, layers, keepAudio: true, quality: "720p" },
    }),
  );
  await writeFile(".mindstudio/families-smoke.json", JSON.stringify(job));
  console.log(job.id);
}
void main();
