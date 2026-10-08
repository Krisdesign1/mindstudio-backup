import { readFile, writeFile } from "node:fs/promises";
import { importSourceVideo } from "../lib/services/motion-media";
import { prepareOverlay } from "../lib/services/motion-overlay";
import { newOverlay, overlayRequestSchema } from "../lib/schemas/motion-edit";
async function main() {
  const bytes = await readFile(".mindstudio/fixtures/source-test.mp4");
  const source = await importSourceVideo(
    new Request("http://localhost/api/motion/media", {
      method: "POST",
      headers: { "x-file-name": "source-test.mp4" },
      body: bytes,
    }),
  );
  const layer = {
    ...newOverlay("kinetic"),
    text: "Votre vidéo, votre style",
    start: 1,
    duration: 3,
    y: 45,
  };
  const logo = {
    ...newOverlay("logo-orbit"),
    text: "MS",
    start: 2,
    duration: 3,
    x: 85,
    y: 75,
    size: 45,
  };
  const edit = {
    source,
    layers: [layer, logo],
    keepAudio: true,
    quality: "720p",
  };
  const job = await prepareOverlay(
    overlayRequestSchema.parse({
      projectId: crypto.randomUUID(),
      name: "Habillage modifiable",
      edit,
    }),
  );
  await writeFile(
    ".mindstudio/overlay-smoke.json",
    JSON.stringify({ job, edit }),
  );
  console.log(JSON.stringify(job));
}
void main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
