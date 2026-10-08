import { test } from "node:test";
import assert from "node:assert/strict";
import {
  demoProjects,
  duration,
  newProject,
  splitIntoScenes,
  time,
} from "./services/mock";
import { projectsSchema } from "./schemas/project";
test("demo projects and both creation modes respect the persisted schema", () => {
  assert.equal(projectsSchema.parse(demoProjects()).length, 4);
  const manual = newProject(
    "Test",
    "Une idée",
    "9:16",
    "manual",
    "Viral Story",
  );
  assert.equal(manual.script, "");
  assert.deepEqual(manual.scenes, []);
  assert.ok(
    newProject("Test", "Une idée", "16:9", "automatic", "MindShift Cinematic")
      .scenes.length > 0,
  );
});
test("scene splitting preserves the narration and handles an empty script", () => {
  assert.deepEqual(splitIntoScenes("  "), []);
  const scenes = splitIntoScenes(
    "Bonjour ! Une nouvelle histoire. Et maintenant ?",
  );
  assert.equal(scenes.length, 3);
  assert.equal(
    scenes.map((s) => s.text).join(" "),
    "Bonjour ! Une nouvelle histoire. Et maintenant ?",
  );
  assert.equal(new Set(scenes.map((s) => s.id)).size, 3);
  assert.ok(duration(scenes) > 0);
  assert.equal(time(163), "02:43");
});
test("corrupt saved projects and invalid durations are rejected", () => {
  assert.equal(projectsSchema.safeParse([{ name: "broken" }]).success, false);
  const demo = demoProjects();
  demo[0].scenes[0].duration = -2;
  assert.equal(projectsSchema.safeParse(demo).success, false);
});
