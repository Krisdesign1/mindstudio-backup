import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { importSourceAudio } from "../lib/services/motion-media";
async function main() {
  for (const [ext, codec] of [
    ["mp3", "libmp3lame"],
    ["wav", "pcm_s16le"],
    ["m4a", "aac"],
    ["aac", "aac"],
    ["flac", "flac"],
    ["ogg", "libvorbis"],
    ["opus", "libopus"],
    ["aiff", "pcm_s16be"],
  ]) {
    const file = `.mindstudio/fixtures/audio-import.${ext}`;
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000",
      "-t",
      "0.5",
      "-c:a",
      codec,
      file,
    ]);
    const result = await importSourceAudio(
      new Request("http://localhost", {
        method: "POST",
        headers: { "x-file-name": `source.${ext}` },
        body: await readFile(file),
      }),
    );
    assert.equal(result.kind, "audio");
    assert.ok(result.duration >= 0.49 && result.duration < 0.8);
    console.log(`${ext}: ready`);
  }
  await assert.rejects(
    () =>
      importSourceAudio(
        new Request("http://localhost", {
          method: "POST",
          headers: { "x-file-name": "bad.mp3" },
          body: "not audio",
        }),
      ),
    /illisible/,
  );
}
void main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
