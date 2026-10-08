import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import {
  importSourceAudio,
  mediaDirectory,
} from "../lib/services/motion-media";
import { importVisualAsset } from "../lib/services/visual-assets";
import { transcriptionSchema } from "../lib/schemas/transcription";
import { planFromSpeech } from "../lib/hyperframes/speech-plan";
import { prepareOverlay } from "../lib/services/motion-overlay";
import { overlayRequestSchema } from "../lib/schemas/motion-edit";
async function main() {
  const body = await readFile(".mindstudio/fixtures/narration.aiff");
  const source = await importSourceAudio(
    new Request("http://localhost", {
      method: "POST",
      headers: { "x-file-name": "narration.aiff" },
      body,
    }),
  );
  assert.equal(source.kind, "audio");
  assert.equal(source.hasAudio, true);
  assert.deepEqual(
    await readFile(`${mediaDirectory(source.id)}/original.aiff`),
    body,
  );
  execFileSync(
    process.env.MOTION_PYTHON || "python3",
    ["scripts/transcribe-video.py", source.id],
    { env: { ...process.env, HF_HUB_OFFLINE: "1" }, timeout: 120000 },
  );
  const speech = transcriptionSchema.parse(
    JSON.parse(
      await readFile(`${mediaDirectory(source.id)}/transcription.json`, "utf8"),
    ),
  );
  assert.equal(speech.status, "completed", speech.error);
  assert.ok(speech.words.length > 15);
  const layers = planFromSpeech(speech.segments, source.duration);
  const image = await importVisualAsset(
    new Request("http://localhost", {
      method: "POST",
      headers: { "x-file-name": "illustration.png" },
      body: await readFile(".mindstudio/fixtures/motion-final.png"),
    }),
  );
  const clip = await importVisualAsset(
    new Request("http://localhost", {
      method: "POST",
      headers: { "x-file-name": "clip.mov" },
      body: await readFile(".mindstudio/fixtures/import-test.mov"),
    }),
  );
  if (layers.length > 1) layers[1].media = clip;
  if (layers.length > 2) layers[2].media = image;
  const edit = {
    source,
    layers,
    canvas: "16:9",
    captions: { enabled: true, words: speech.words },
    keepAudio: true,
    quality: "720p",
  };
  const input = overlayRequestSchema.parse({
    projectId: crypto.randomUUID(),
    name: "Audio master, captions et médias",
    edit,
  });
  const job = await prepareOverlay(input);
  await writeFile(
    ".mindstudio/audio-first-smoke.json",
    JSON.stringify({ job, edit, speech }),
  );
  console.log(
    JSON.stringify({ job, words: speech.words.length, scenes: layers.length }),
  );
}
void main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
