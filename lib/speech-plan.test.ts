import { test } from "node:test";
import assert from "node:assert/strict";
import { planFromSpeech } from "./hyperframes/speech-plan";
import { motionEditSchema } from "./schemas/motion-edit";
test("speech scenes follow actual timestamps and cover leading/trailing silence", () => {
  const layers = planFromSpeech(
    [
      { start: 2, end: 5, text: "Une idée pour demain." },
      { start: 12, end: 16, text: "Apprendre ensemble et progresser." },
      { start: 23, end: 25, text: "La nature nous inspire." },
    ],
    30,
  );
  assert.deepEqual(
    layers.map((l) => l.start),
    [0, 12, 23],
  );
  assert.equal(layers.at(-1)!.start + layers.at(-1)!.duration, 30);
  assert.equal(layers[0].illustration, "idea");
  assert.equal(layers[1].narration, "Apprendre ensemble et progresser.");
  layers.forEach((l, i) => {
    if (i) assert.equal(l.start, layers[i - 1].start + layers[i - 1].duration);
  });
  assert.ok(
    motionEditSchema.safeParse({ layers, keepAudio: true, quality: "720p" })
      .success,
  );
});
test("long speech preserves narration while limiting editable scenes", () => {
  const segments = Array.from({ length: 80 }, (_, i) => ({
    start: i * 7,
    end: i * 7 + 3,
    text: `Passage ${i}.`,
  }));
  const layers = planFromSpeech(segments, 600);
  assert.ok(layers.length <= 30);
  assert.equal(
    layers.map((l) => l.narration).join(" "),
    segments.map((s) => s.text).join(" "),
  );
  assert.ok(
    motionEditSchema.safeParse({ layers, keepAudio: true, quality: "1080p" })
      .success,
  );
});
test("no detected speech cannot create invented narration", () => {
  assert.throws(() => planFromSpeech([], 10), /Aucune parole/);
  assert.throws(() =>
    planFromSpeech([{ start: 12, end: 14, text: "hors durée" }], 10),
  );
});
