import test from "node:test";
import assert from "node:assert/strict";
import { applyCodexProposal } from "./codex-proposal";
import { projectSchema } from "./schemas/project";
const project = projectSchema.parse({
  id: "test",
  name: "Avant",
  idea: "Idée",
  format: "16:9",
  mode: "manual",
  template: "test",
  script: "Bonjour",
  status: "Brouillon",
  image: "",
  updatedAt: "",
  scenes: [
    {
      id: "one",
      text: "Bonjour",
      prompt: "Image",
      duration: 5,
      image: "asset",
      transition: "Fondu",
    },
  ],
  voice: "ma voix",
  speed: 1,
  subtitle: "test",
});
test("Codex edits only editorial fields without changing source or timing", () => {
  const result = applyCodexProposal(project, {
    message: "Voici",
    edits: [
      { path: "name", value: "Après", reason: "Clarté" },
      {
        path: "scenes.0.prompt",
        value: "Un stade au lever du soleil",
        reason: "Contexte",
      },
    ],
  });
  assert.equal(result.name, "Après");
  assert.equal(result.scenes[0].duration, 5);
  assert.equal(result.scenes[0].image, "asset");
  assert.equal(project.name, "Avant");
  assert.equal(result.voice, project.voice);
});
test("Codex rejects unsafe paths and out-of-bounds scenes", () => {
  for (const path of [
    "__proto__.polluted",
    "constructor",
    "id",
    "scenes.999.text",
    "scenes.0.duration",
    "motionEdit.source",
  ])
    assert.throws(() =>
      applyCodexProposal(project, {
        message: "",
        edits: [{ path, value: "unsafe", reason: "" }],
      }),
    );
});
test("Codex validates resulting project", () => {
  for (const edit of [
    { path: "motionAccent", value: "red" },
    { path: "name", value: "" },
    { path: "motionLogo", value: "too long" },
  ])
    assert.throws(() =>
      applyCodexProposal(project, {
        message: "",
        edits: [{ ...edit, reason: "" }],
      }),
    );
});
