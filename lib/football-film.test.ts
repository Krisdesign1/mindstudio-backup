import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultFootballFilm,
  footballFilmSchema,
  footballWords,
} from "./films/mbappe";
import { footballComposition } from "./films/football-composition";
import { subtitleCues } from "./hyperframes/captions";
test("football film preserves all narration and covers its full provisional timeline", () => {
  const film = footballFilmSchema.parse(defaultFootballFilm()),
    composition = footballComposition(film),
    words = footballWords(film);
  assert.equal(film.scenes.length, 15);
  assert.equal(
    words.map((w) => w.text).join(" "),
    film.scenes
      .map((s) => s.narration)
      .join(" ")
      .replace(/\s+/g, " "),
  );
  assert.equal(words[0].start, 0);
  assert.ok(Math.abs(words.at(-1)!.end - composition.duration) < 0.001);
  const cues = subtitleCues(
    { enabled: true, words, maxWords: 12, maxChars: 48, maxLines: 2 },
    composition.duration,
  );
  assert.equal(
    cues
      .flatMap((c) => c.lines.flat())
      .map((w) => w.text)
      .join(" "),
    words.map((w) => w.text).join(" "),
  );
  assert.ok(!composition.html.includes("<audio"));
  assert.ok(!composition.html.includes("<video"));
});
test("football preview scripts compile and editable copy cannot inject markup or scripts", () => {
  const film = defaultFootballFilm();
  film.scenes[0].title = "<script>alert(1)</script>";
  film.scenes[0].labels[0] = "</text><script>alert(2)</script>";
  film.scenes[0].narration = "</script><img src=x onerror=alert(3)>";
  for (const preview of [false, true]) {
    const html = footballComposition(film, preview).html;
    assert.ok(!html.includes("<script>alert"));
    assert.ok(!html.includes("<img src=x"));
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1);
    new Function(scripts[0][1]);
  }
  const broken = defaultFootballFilm();
  broken.scenes[1].id = broken.scenes[0].id;
  assert.equal(footballFilmSchema.safeParse(broken).success, false);
});
