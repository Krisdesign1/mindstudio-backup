import { readFile, writeFile } from "node:fs/promises";
import { prepareOverlay } from "../lib/services/motion-overlay";
import { overlayRequestSchema } from "../lib/schemas/motion-edit";
async function main() {
  const data = JSON.parse(
    await readFile(".mindstudio/audio-first-smoke.json", "utf8"),
  );
  data.edit.layers = data.edit.layers.map((l: object, i: number) => ({
    ...l,
    layout: ["split", "typography", "cinema"][i % 3],
    artVariant: ["minimal", "orbit", "cards"][i % 3],
    motion: ["slide", "zoom", "orbit"][i % 3],
  }));
  const job = await prepareOverlay(
    overlayRequestSchema.parse({
      projectId: crypto.randomUUID(),
      name: "Variations sans marques imposées",
      edit: data.edit,
    }),
  );
  await writeFile(".mindstudio/variation-smoke.json", JSON.stringify(job));
  console.log(job.id);
}
void main();
