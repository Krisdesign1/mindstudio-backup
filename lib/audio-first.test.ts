import { test } from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { overlayComposition } from "./hyperframes/overlay-composition";
import { planFromSpeech } from "./hyperframes/speech-plan";
import { captionGroups } from "./hyperframes/captions";
import { motionEditSchema, type SourceVideo } from "./schemas/motion-edit";
const source: SourceVideo = {
  id: crypto.randomUUID(),
  kind: "audio",
  name: "narration.wav",
  width: 1920,
  height: 1080,
  duration: 20,
  hasAudio: true,
};
const words = [
  { start: 1, end: 1.5, text: "Bonjour" },
  { start: 1.6, end: 2, text: "<script>" },
  { start: 8, end: 8.4, text: "suite." },
];
test("audio master sets duration and canvas, creates no synthetic video, keeps voice even if mute requested", () => {
  for (const [canvas, expected] of [
    ["16:9", [1280, 720]],
    ["9:16", [720, 1280]],
    ["1:1", [720, 720]],
  ] as const) {
    const edit = motionEditSchema.parse({
      source,
      layers: [],
      canvas,
      quality: "720p",
      keepAudio: false,
      captions: { enabled: true, words },
    });
    const result = overlayComposition(edit, source);
    assert.equal(result.duration, 20);
    assert.deepEqual([result.width, result.height], expected);
    assert.match(
      result.html,
      /<audio id="source-video" src="source.wav"[^>]*data-volume="1"/,
    );
    assert.doesNotMatch(result.html, /<video/);
    assert.match(result.html, /&lt;script&gt;/);
    for (const match of result.html.matchAll(/<script>([\s\S]*?)<\/script>/g))
      assert.doesNotThrow(() => new Script(match[1]));
  }
});
test("captions use word timings, keep pauses and remain independent from scene timing", () => {
  const groups = captionGroups(words, 20);
  assert.equal(groups.length, 2);
  assert.equal(groups[1][0].start, 8);
  const layers = planFromSpeech(
    [
      { start: 0, end: 10, text: "Une idée continue sans pause ni point" },
      { start: 10.1, end: 12, text: "et se termine ici." },
    ],
    20,
  );
  assert.equal(layers.length, 1);
  assert.equal(layers[0].duration, 20);
  const separated = planFromSpeech(
    [
      { start: 0, end: 2, text: "Une idée" },
      { start: 4, end: 6, text: "qui revient après une pause" },
    ],
    20,
  );
  assert.equal(separated.length, 2);
});
test("imported clips are explicitly silent and repeated within the master scene", () => {
  const layers = planFromSpeech([{ start: 0, end: 4, text: "Une idée." }], 20);
  layers[0].media = {
    id: crypto.randomUUID(),
    kind: "video",
    name: "clip",
    width: 320,
    height: 240,
    duration: 5,
  };
  const edit = motionEditSchema.parse({
    source,
    layers,
    quality: "720p",
    keepAudio: true,
  });
  const html = overlayComposition(edit, source).html;
  assert.equal((html.match(/class="asset-clip"/g) || []).length, 4);
  assert.match(html, /data-start="15" data-duration="5"[^>]*data-volume="0"/);
  const preview = overlayComposition(edit, source, { preview: true }).html;
  for (const match of preview.matchAll(/<script>([\s\S]*?)<\/script>/g))
    assert.doesNotThrow(() => new Script(match[1]));
});
