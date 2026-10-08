import test from "node:test";
import assert from "node:assert/strict";
import { reviensParts } from "./films/reviens";
import { transcriptTokens, alignTranscript } from "./films/align-transcript";
import { footballComposition } from "./films/football-composition";
import { footballFilmSchema } from "./films/mbappe";
test("provided French punctuation survives audio alignment and separates questions", () => {
  const part = {
    ...reviensParts[0],
    narration: "Revenir vers Dieu ? « Oui, maintenant ! »",
  };
  const tokens = transcriptTokens(part.narration);
  assert.deepEqual(tokens, [
    "Revenir",
    "vers",
    "Dieu?",
    "«Oui,",
    "maintenant!»",
  ]);
  const recognized = ["Revenir", "vers", "Dieu", "Oui", "maintenant"].map(
    (text, i) => ({ text, start: i, end: i + 0.7 }),
  );
  const result = alignTranscript([part], recognized, 5);
  assert.deepEqual(
    result.words.map((w) => w.text),
    tokens,
  );
});
test("fourteen spiritual scenes retain the text and compile distinct artwork", () => {
  const film = footballFilmSchema.parse({
    name: "Reviens",
    accent: "#edc68b",
    captions: true,
    scenes: reviensParts.map((s) => ({ ...s, duration: 7 })),
  });
  const html = footballComposition(film, true).html;
  assert.equal(film.scenes.length, 14);
  assert.ok(html.includes('class="embrace-son"'));
  assert.ok(html.includes('class="return-road"'));
  assert.ok(!html.includes("undefined"));
  for (const s of reviensParts) assert.ok(html.includes(`id="scene-${s.id}"`));
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
    new Function(script[1]);
});
