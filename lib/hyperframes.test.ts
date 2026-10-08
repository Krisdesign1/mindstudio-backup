import { test } from "node:test";
import assert from "node:assert/strict";
import { newProject } from "./services/mock";
import { createComposition, dimensions } from "./hyperframes/composition";
import { hyperframesInput } from "./schemas/hyperframes";
import { jobDirectory, prepareComposition } from "./services/hyperframes";
function input() {
  return hyperframesInput.parse({
    project: newProject(
      "Un récit",
      "Histoire",
      "16:9",
      "automatic",
      "MindShift Cinematic",
    ),
  });
}
test("composition escapes project text and rejects CSS injection", () => {
  const data = input();
  data.project.name = "</div><script>alert(1)</script>";
  data.project.scenes[0].text = "<img src=x onerror=alert(1)>";
  const { html } = createComposition(data);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>alert"));
  assert.ok(!html.includes("<img src=x"));
  assert.equal(
    hyperframesInput.safeParse({ ...data, accent: "red;}</style><script>" })
      .success,
    false,
  );
});
test("all export formats preserve aspect ratio and even H264 dimensions", () => {
  for (const [format, ratio] of Object.entries({
    "16:9": 16 / 9,
    "9:16": 9 / 16,
    "1:1": 1,
    "4:5": 4 / 5,
  }))
    for (const q of ["720p", "1080p"]) {
      const [w, h] = dimensions(format, q);
      assert.equal(w % 2, 0);
      assert.equal(h % 2, 0);
      assert.ok(Math.abs(w / h - ratio) < 0.002);
    }
  const data = input();
  const result = createComposition(data, 12);
  assert.equal(result.duration, 15);
  assert.ok(result.html.includes('data-start="3" data-duration="12"'));
  assert.ok(result.html.includes("window.__timelines"));
});
test("invalid render inputs and path traversal are rejected", async () => {
  const data = input();
  assert.throws(() => jobDirectory("../../private"));
  assert.equal(
    hyperframesInput.safeParse({
      ...data,
      project: { ...data.project, scenes: [] },
    }).success,
    false,
  );
  data.project.scenes[0].image = "https://example.com/private";
  await assert.rejects(prepareComposition(data), /images locales/);
  const missing = input();
  await assert.rejects(
    prepareComposition({ ...missing, includeAudio: true }),
    /Générez d’abord/,
  );
});

test("every motion template generates a distinct, valid timeline and rejects unknown styles", async () => {
  const { motionTemplates } = await import("./hyperframes/templates");
  const { Script } = await import("node:vm");
  const animations = new Set<string>();
  for (const template of motionTemplates) {
    const data = hyperframesInput.parse({
      ...input(),
      templateId: template.id,
      logoText: "<MS>",
    });
    const { html } = createComposition(data);
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script);
    assert.doesNotThrow(() => new Script(script));
    animations.add(script);
    assert.ok(html.includes(`motion-${template.id}`));
    assert.ok(html.includes("&lt;MS&gt;"));
    assert.ok(!html.includes("<MS>"));
  }
  assert.equal(animations.size, motionTemplates.length);
  assert.equal(
    hyperframesInput.safeParse({ ...input(), templateId: "unknown" }).success,
    false,
  );
});
