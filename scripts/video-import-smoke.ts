import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import {
  importSourceVideo,
  mediaDirectory,
} from "../lib/services/motion-media";
const cases = [
  ["mov", "mpeg4", "pcm_s16le"],
  ["webm", "libvpx-vp9", "libopus"],
  ["mkv", "mpeg4", "mp3"],
  ["avi", "mpeg4", "pcm_s16le"],
  ["mpg", "mpeg2video", "mp2"],
  ["wmv", "wmv2", "wmav2"],
  ["mp4", "libx264", "aac"],
  ["m4v", "libx264", "aac"],
];
async function main() {
  for (const [ext, video, audio] of cases) {
    const file = `.mindstudio/fixtures/import-test.${ext}`;
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=320x240:rate=25",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000",
      "-t",
      "0.6",
      "-c:v",
      video,
      "-threads",
      "2",
      "-c:a",
      audio,
      ...(ext === "m4v" ? ["-f", "mp4"] : []),
      file,
    ]);
    const body = await readFile(file);
    const result = await importSourceVideo(
      new Request("http://localhost/api/motion/media", {
        method: "POST",
        headers: { "x-file-name": `test.${ext}` },
        body,
      }),
    );
    assert.equal(result.hasAudio, true);
    assert.equal(result.width, 320);
    assert.equal(result.height, 240);
    assert.ok(result.duration >= 0.5 && result.duration < 1);
    const dir = mediaDirectory(result.id);
    assert.deepEqual(await readFile(`${dir}/original.${ext}`), body);
    const output = JSON.parse(
      execFileSync(
        "ffprobe",
        ["-v", "error", "-show_streams", "-of", "json", `${dir}/source.mp4`],
        { encoding: "utf8" },
      ),
    );
    assert.equal(output.streams[0].codec_name, "h264");
    assert.equal(output.streams[1].codec_name, "aac");
    console.log(`${ext}: original conserved, H264/AAC ready`);
  }
  await assert.rejects(
    () =>
      importSourceVideo(
        new Request("http://localhost", {
          method: "POST",
          headers: { "x-file-name": "bad.m3u8" },
          body: "bad",
        }),
      ),
    /Formats acceptés/,
  );
  await assert.rejects(
    () =>
      importSourceVideo(
        new Request("http://localhost", {
          method: "POST",
          headers: { "x-file-name": "bad.mp4" },
          body: "not a video",
        }),
      ),
    /illisible/,
  );
}
void main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
