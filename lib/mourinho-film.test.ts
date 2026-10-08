import test from "node:test";
import assert from "node:assert/strict";
import { alignTranscript } from "./films/align-transcript";
import { mourinhoParts } from "./films/mourinho";
import { footballFilmSchema, footballWords } from "./films/mbappe";
import { footballComposition } from "./films/football-composition";
test("audio editorial aligns corrected spelling, preserves pauses and covers the master duration", () => {
  const parts = mourinhoParts.slice(0, 2);
  let time = 0;
  const recognized = parts.flatMap((p) =>
    p.narration
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => {
        const word = {
          text: text.replace("Mourinho", "Murino"),
          start: time,
          end: time + 0.2,
        };
        time += 0.25;
        return word;
      }),
  );
  const aligned = alignTranscript(parts, recognized, time + 1);
  assert.ok(aligned.exactRatio > 0.8);
  assert.equal(
    aligned.scenes.reduce((n, s) => n + s.duration, 0),
    time + 1,
  );
  assert.ok(aligned.words.every((w) => w.end > w.start));
  assert.ok(aligned.words.some((w) => w.text === "Mourinho"));
  assert.ok(!aligned.words.some((w) => w.text === "Murino"));
  for (let i = 1; i < aligned.words.length; i++)
    assert.ok(aligned.words[i].start >= aligned.words[i - 1].end);
  const film = footballFilmSchema.parse({
    name: "Test Mourinho",
    accent: "#e9bb72",
    captions: true,
    scenes: aligned.scenes,
    source: {
      id: "db5ab94b-130d-4a37-ba56-f662d2d12b4c",
      kind: "audio",
      name: "voice.wav",
      duration: time + 1,
      width: 1920,
      height: 1080,
      hasAudio: true,
    },
  });
  assert.deepEqual(footballWords(film), aligned.words);
  for (const preview of [false, true]) {
    const html = footballComposition(film, preview).html;
    assert.ok(html.includes('id="film-audio"'));
    assert.ok(html.includes('data-volume="1"'));
    for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
      new Function(script[1]);
  }
  assert.throws(() =>
    alignTranscript(parts, [{ text: "irrelevant", start: 0, end: 1 }], 2),
  );
});
test("every Mourinho scene has artwork and compiles its animations", () => {
  const film = footballFilmSchema.parse({
    name: "Twelve scenes",
    accent: "#e9bb72",
    captions: true,
    scenes: mourinhoParts.map((s) => ({ ...s, duration: 8 })),
  });
  const html = footballComposition(film).html;
  for (const scene of film.scenes)
    assert.ok(html.includes(`id="scene-${scene.id}"`));
  assert.ok(html.includes("SCHÉMA EXPLICATIF"));
  assert.ok(!html.includes("undefined"));
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
    new Function(script[1]);
});
