import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { VoiceLibrary } from "./server/voice-library";
import { defaultVoiceSettings } from "./voice-settings";
test("saved voice is durable, independently copied and renameable", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "voice-library-"));
  try {
    const id = randomUUID(),
      dir = path.join(root, "voice", id);
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, "status.json"),
      JSON.stringify({ status: "completed", kind: "prepare", duration: 12 }),
    );
    await writeFile(path.join(dir, "reference.wav"), "fixture");
    const library = new VoiceLibrary(root),
      record = await library.save(id, "Ma voix");
    await rm(dir, { recursive: true });
    assert.equal(
      await readFile(await library.audio(record.id), "utf8"),
      "fixture",
    );
    await library.rename(record.id, "Récits");
    assert.equal((await new VoiceLibrary(root).voices())[0].name, "Récits");
    await assert.rejects(() => library.audio("../../private"));
    await assert.rejects(() => library.rename(record.id, " "));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("history recovers old scripts, uses renamed titles and skips corrupt entries", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "voice-history-"));
  try {
    const id = randomUUID(),
      dir = path.join(root, "voice", id);
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, "status.json"),
      JSON.stringify({
        status: "completed",
        title: "Titre renommé",
        kind: "generate",
        duration: 15,
        startedAt: 123,
      }),
    );
    await writeFile(
      path.join(dir, "request.json"),
      JSON.stringify({
        title: "Ancien",
        text: "Mon récit.",
        settings: defaultVoiceSettings,
        action: "generate",
      }),
    );
    const library = new VoiceLibrary(root),
      history = await library.history();
    assert.equal(history[0].text, "Mon récit.");
    assert.equal(history[0].title, "Titre renommé");
    assert.deepEqual(history[0].settings, defaultVoiceSettings);
    assert.equal(history[0].hasReference, false);
    await assert.rejects(() => library.save(id, "Mauvaise source"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
