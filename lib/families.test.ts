import { test } from "node:test";
import assert from "node:assert/strict";
import { families, applyFamily, sceneVariants } from "./hyperframes/families";
import { newOverlay, overlaySchema } from "./schemas/motion-edit";
import { overlayComposition } from "./hyperframes/overlay-composition";
import { Script } from "node:vm";
test("six art directions preserve content, timings and media, and export valid timelines", () => {
  const layer = {
    ...newOverlay(),
    text: "Mon texte <test>",
    narration: "Mes paroles",
    brand: "Ma marque",
    media: {
      id: crypto.randomUUID(),
      kind: "image" as const,
      name: "logo.png",
      duration: 1,
      width: 320,
      height: 240,
    },
  };
  const source = {
    id: crypto.randomUUID(),
    name: "source",
    duration: 5,
    width: 1280,
    height: 720,
    hasAudio: false,
  };
  for (const family of families) {
    const candidate = applyFamily(layer, family.id);
    assert.ok(overlaySchema.safeParse(candidate).success);
    for (const key of [
      "id",
      "text",
      "narration",
      "brand",
      "start",
      "duration",
      "media",
    ] as const)
      assert.deepEqual(candidate[key], layer[key]);
    const html = overlayComposition(
      { layers: [candidate], keepAudio: true, quality: "720p" },
      source,
    ).html;
    assert.match(html, new RegExp(`family-${family.id}`));
    for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
      assert.doesNotThrow(() => new Script(m[1]));
  }
});
test("variant rounds offer different styles without changing scene identity", () => {
  const l = newOverlay();
  const a = sceneVariants(l),
    b = sceneVariants(l, 1);
  assert.equal(new Set([...a, ...b].map((v) => v.family)).size, 6);
  assert.ok([...a, ...b].every((v) => v.id === l.id));
});
