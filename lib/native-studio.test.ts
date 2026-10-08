import test from "node:test";
import assert from "node:assert/strict";
import { nativeComposition } from "./films/native-composition";
import { defaultFootballFilm } from "./films/mbappe";
test("Studio scene clips preserve the contiguous narration timeline", () => {
  const film = defaultFootballFilm();
  const html = nativeComposition(film);
  const clips = [
    ...html.matchAll(
      /<section[^>]*data-start="([\d.]+)" data-duration="([\d.]+)" data-track-index="3"/g,
    ),
  ];
  assert.equal(clips.length, film.scenes.length);
  let at = 0;
  clips.forEach((clip, i) => {
    assert.equal(Number(clip[1]), at);
    assert.equal(Number(clip[2]), film.scenes[i].duration);
    at += film.scenes[i].duration;
  });
  assert.ok(html.includes('class="clip caption"'));
  for (const cue of html.matchAll(
    /class="clip caption"[^>]*data-duration="([\d.]+)"/g,
  ))
    assert.ok(Number(cue[1]) > 0);
});
