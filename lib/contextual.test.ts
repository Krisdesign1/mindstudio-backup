import { test } from "node:test";
import assert from "node:assert/strict";
import {
  planContextual,
  inferIllustration,
  illustrationIds,
} from "./hyperframes/contextual";
import { motionEditSchema } from "./schemas/motion-edit";
import { overlayComposition } from "./hyperframes/overlay-composition";
import { Script } from "node:vm";
test("contextual planning covers the full source with no gaps or overlaps", () => {
  for (const duration of [0.2, 1, 60, 600]) {
    const layers = planContextual(
      "La croissance demande de la patience. Apprendre ensemble nous permet de progresser dans notre voyage.",
      duration,
    );
    assert.equal(layers[0].start, 0);
    assert.equal(layers.at(-1)!.start + layers.at(-1)!.duration, duration);
    layers.forEach((l, i) => {
      if (i)
        assert.equal(l.start, layers[i - 1].start + layers[i - 1].duration);
    });
    assert.ok(
      motionEditSchema.safeParse({ layers, keepAudio: true, quality: "720p" })
        .success,
    );
    assert.ok(layers.length <= 30);
  }
});
test("themes match provided narration and unknown contexts remain abstract", () => {
  assert.equal(
    inferIllustration("Notre budget et nos investissements"),
    "finance",
  );
  assert.equal(inferIllustration("Une équipe qui partage"), "community");
  assert.equal(inferIllustration("Apprendre à lire des livres"), "learning");
  assert.equal(inferIllustration("xyz qqq"), "abstract");
  assert.throws(() => planContextual("", 10));
});
test("all contextual illustrations compile and preserve editable content", () => {
  const source = {
    id: crypto.randomUUID(),
    name: "source",
    duration: 6,
    width: 1280,
    height: 720,
    hasAudio: true,
  };
  for (const illustration of illustrationIds) {
    const layers = planContextual("Notre voyage commence ici.", 6).map((l) => ({
      ...l,
      illustration,
      text: "</script><img onerror=bad>",
    }));
    const { html, duration } = overlayComposition(
      { layers, source, keepAudio: true, quality: "720p" },
      source,
    );
    assert.equal(duration, 6);
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("&lt;/script&gt;"));
    assert.ok(html.includes("context-backdrop"));
    assert.doesNotThrow(
      () => new Script(html.match(/<script>([\s\S]*?)<\/script>/)![1]),
    );
  }
});
