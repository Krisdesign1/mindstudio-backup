import { readFile, writeFile } from "node:fs/promises";
import { planFromSpeech } from "../lib/hyperframes/speech-plan";
import { prepareOverlay } from "../lib/services/motion-overlay";
import { overlayRequestSchema } from "../lib/schemas/motion-edit";
async function main() {
  const source = JSON.parse(
    await readFile(".mindstudio/speech-source.json", "utf8"),
  );
  const speech = JSON.parse(
    await readFile(`.mindstudio/media/${source.id}/transcription.json`, "utf8"),
  );
  if (speech.status !== "completed")
    throw new Error("Recognition not completed");
  const edit = {
    source,
    layers: planFromSpeech(speech.segments, source.duration),
    keepAudio: true,
    quality: "720p",
  };
  const job = await prepareOverlay(
    overlayRequestSchema.parse({
      projectId: crypto.randomUUID(),
      name: "Test voix et motion",
      edit,
    }),
  );
  await writeFile(
    ".mindstudio/speech-smoke.json",
    JSON.stringify({ job, edit }),
  );
  console.log(job.id);
}
void main();
