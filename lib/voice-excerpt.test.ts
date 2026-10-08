import test from "node:test";
import assert from "node:assert/strict";
import { voiceExcerpt } from "./voice-excerpt";
test("short voice test preserves words and prefers complete sentences", () => {
  assert.equal(
    voiceExcerpt("Bonjour. Une très longue phrase à suivre.", 20),
    "Bonjour.",
  );
  assert.equal(voiceExcerpt("Un jardin au soleil", 14), "Un jardin au");
});
test("voice test length is adjustable without changing source script", () => {
  const text = "Bonjour le monde. ".repeat(40);
  assert.ok(voiceExcerpt(text, 180).length <= 180);
  assert.ok(voiceExcerpt(text, 600).length > 180);
  assert.equal(text.length, 720);
  assert.equal(voiceExcerpt("  Bonjour !  ", 180), "Bonjour !");
});
