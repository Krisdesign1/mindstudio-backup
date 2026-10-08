import { test } from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  newOverlay,
  overlayRequestSchema,
  motionEditSchema,
  type SourceVideo,
} from "./schemas/motion-edit";
import { overlayComposition } from "./hyperframes/overlay-composition";
import { motionTemplates } from "./hyperframes/templates";
import { assertLocalRequest } from "./server/heygen-http";
import { videoResponse } from "./server/video-response";
const source: SourceVideo = {
  id: crypto.randomUUID(),
  name: "Original.mp4",
  duration: 12,
  width: 1920,
  height: 1080,
  hasAudio: true,
};
function edit() {
  return {
    source,
    layers: [{ ...newOverlay(), start: 2, duration: 4 }],
    keepAudio: true,
    quality: "720p" as const,
  };
}
test("overlay export keeps source duration, framing and audio; hidden layers do not render", () => {
  const draft = edit();
  draft.layers.push({ ...newOverlay(), enabled: false, text: "HIDDEN" });
  const result = overlayComposition(draft, source);
  assert.equal(result.duration, 12);
  assert.equal(result.width, 1280);
  assert.equal(result.height, 720);
  assert.ok(result.html.includes('id="source-video"'));
  assert.ok(result.html.includes('id="source-audio"'));
  assert.ok(!result.html.includes("HIDDEN"));
  assert.ok(!result.html.includes('id="intro"'));
  assert.ok(
    !overlayComposition({ ...draft, keepAudio: false }, source).html.includes(
      'id="source-audio"',
    ),
  );
  assert.equal(
    overlayComposition(draft, { ...source, width: 640, height: 360 }).width,
    640,
  );
});
test("every overlay animation escapes text, compiles and supports overlapping timing", () => {
  for (const template of motionTemplates) {
    const draft = edit();
    draft.layers = [
      {
        ...newOverlay(template.id),
        text: '</script><img onerror="bad">',
        start: 2,
        duration: 4,
      },
      { ...newOverlay("logo-stamp"), start: 3, duration: 2 },
    ];
    const { html } = overlayComposition(draft, source);
    assert.ok(html.includes("&lt;/script&gt;"));
    assert.ok(!html.includes("<img onerror"));
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script);
    assert.doesNotThrow(() => new Script(script));
  }
});
test("editable settings round trip and reject invalid geometry, missing sources and overruns", () => {
  const draft = edit();
  assert.deepEqual(
    motionEditSchema.parse(JSON.parse(JSON.stringify(draft))),
    draft,
  );
  const input = { projectId: "test", name: "Test", edit: draft };
  assert.ok(overlayRequestSchema.safeParse(input).success);
  assert.equal(
    overlayRequestSchema.safeParse({
      ...input,
      edit: { ...draft, source: undefined },
    }).success,
    false,
  );
  assert.equal(
    overlayRequestSchema.safeParse({
      ...input,
      edit: { ...draft, layers: [{ ...draft.layers[0], duration: 20 }] },
    }).success,
    false,
  );
  assert.equal(
    motionEditSchema.safeParse({
      ...draft,
      layers: [{ ...draft.layers[0], x: 999 }],
    }).success,
    false,
  );
});
test("binary video upload requires a local same-origin request", () => {
  const request = (origin: string) =>
    new Request("http://localhost/api/motion/media", {
      method: "POST",
      headers: { host: "localhost", origin, "content-type": "video/mp4" },
    });
  assert.doesNotThrow(() =>
    assertLocalRequest(request("http://localhost"), "video/mp4"),
  );
  assert.throws(() =>
    assertLocalRequest(request("https://example.com"), "video/mp4"),
  );
  assert.throws(() => assertLocalRequest(request("http://localhost")));
});
test("source streaming supports seek and suffix ranges without reading the whole video", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "motion-range-"));
  const file = path.join(dir, "video.mp4");
  await writeFile(file, Buffer.from("0123456789"));
  try {
    for (const [range, expected] of [
      ["bytes=2-4", "234"],
      ["bytes=-3", "789"],
    ]) {
      const response = await videoResponse(
        new Request("http://localhost", { headers: { range } }),
        file,
      );
      assert.equal(response.status, 206);
      assert.equal(await response.text(), expected);
    }
    const invalid = await videoResponse(
      new Request("http://localhost", { headers: { range: "bytes=20-" } }),
      file,
    );
    assert.equal(invalid.status, 416);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
