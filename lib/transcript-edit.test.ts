import { test } from "node:test";
import assert from "node:assert/strict";
import { replaceSceneTranscript } from "./hyperframes/transcript-edit";
import { newOverlay, type MotionEdit } from "./schemas/motion-edit";
import { overlayComposition } from "./hyperframes/overlay-composition";
test("transcription corrections preserve timing when word count matches and do not alter scene title", () => {
  const l = { ...newOverlay(), narration: "Bonjour monde", text: "Mon titre" };
  const edit: MotionEdit = {
    layers: [l],
    keepAudio: true,
    quality: "720p",
    captions: {
      enabled: true,
      words: [
        { text: "Bonjour", start: 1, end: 2 },
        { text: "monde", start: 2.2, end: 3 },
      ],
    },
  };
  const next = replaceSceneTranscript(edit, l.id, "Salut monde");
  assert.equal(next.layers[0].text, "Mon titre");
  assert.deepEqual(
    next.captions!.words.map((w) => [w.start, w.end]),
    [
      [1, 2],
      [2.2, 3],
    ],
  );
  const expanded = replaceSceneTranscript(edit, l.id, "Bonjour à tous");
  assert.equal(expanded.captions!.words.length, 3);
  assert.equal(expanded.captions!.words.at(-1)!.end, 3);
});
test("template labels are optional, editable and escaped in export", () => {
  const source = {
    id: crypto.randomUUID(),
    name: "test",
    duration: 5,
    width: 1280,
    height: 720,
    hasAudio: false,
  };
  const layer = { ...newOverlay(), contextual: true };
  const edit: MotionEdit = {
    source,
    layers: [layer],
    keepAudio: true,
    quality: "720p",
  };
  const html = overlayComposition(edit, source).html;
  assert.doesNotMatch(html, /MOTION \/ STORY|CHAPITRE 01|CHANGER DE REGARD/);
  const custom = overlayComposition(
    {
      ...edit,
      layers: [
        {
          ...layer,
          brand: "Ma chaîne <test>",
          counter: "05 / 05",
          chapter: "Mon chapitre",
          artTitle: "Ma carte",
        },
      ],
    },
    source,
  ).html;
  assert.match(custom, /Ma chaîne &lt;test&gt;/);
  assert.match(custom, /05 \/ 05/);
  assert.match(custom, /Ma carte/);
});
