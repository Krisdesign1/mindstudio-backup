import { test } from "node:test";
import assert from "node:assert/strict";
import { moveBoundary } from "./hyperframes/timeline";
import { newOverlay } from "./schemas/motion-edit";
import { overlayComposition } from "./hyperframes/overlay-composition";
import { Script } from "node:vm";
test("shared boundary preserves coverage and clamps to minimum scene durations", () => {
  const a = { ...newOverlay(), duration: 4 },
    b = { ...newOverlay(), start: 4, duration: 6 };
  const moved = moveBoundary([a, b], a.id, 7);
  assert.equal(moved[0].duration, 7);
  assert.equal(moved[1].start, 7);
  assert.equal(moved[1].start + moved[1].duration, 10);
  assert.equal(a.duration, 4);
  const clamp = moveBoundary([a, b], a.id, 20);
  assert.ok(clamp[1].duration >= 0.1999);
  assert.equal(clamp[0].duration, 9.8);
  const gap = { ...b, start: 5 };
  assert.deepEqual(moveBoundary([a, gap], a.id, 3), [a, gap]);
});
test("preview transport and visual transitions compile without affecting audio duration", () => {
  const source = {
    id: crypto.randomUUID(),
    name: "audio",
    kind: "audio" as const,
    hasAudio: true,
    duration: 10,
    width: 1920,
    height: 1080,
  };
  const layer = {
    ...newOverlay(),
    transition: "fade" as const,
    transitionDuration: 0.5,
  };
  const result = overlayComposition(
    { layers: [layer], keepAudio: true, quality: "720p" },
    source,
    { preview: true },
  );
  assert.equal(result.duration, 10);
  assert.match(result.html, /motion-transport/);
  assert.match(result.html, /loopRange/);
  assert.match(result.html, /opacity:0,duration:0.5/);
  for (const m of result.html.matchAll(/<script>([\s\S]*?)<\/script>/g))
    assert.doesNotThrow(() => new Script(m[1]));
});
