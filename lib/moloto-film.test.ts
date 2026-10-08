import test from "node:test";
import assert from "node:assert/strict";
import { footballComposition } from "./films/football-composition";
import { footballFilmSchema, type FootballScene } from "./films/mbappe";
test("Moloto motion scenes compile and preserve editable text safely", () => {
  const scenes = Array.from({ length: 24 }, (_, i) => ({
    id: `legacy-${String(i + 1).padStart(2, "0")}`,
    title: "Titre <script>",
    narration: "Une vision se transmet.",
    intent: "Transmission",
    labels: ["Former", "Transmettre", "Continuer"],
    duration: 10,
  })) as FootballScene[];
  const film = footballFilmSchema.parse({
    name: "Héritage",
    accent: "#d4b579",
    captions: true,
    scenes,
  });
  const result = footballComposition(film);
  assert.equal(result.duration, 240);
  assert.ok(result.html.includes("Titre &lt;script&gt;"));
  assert.ok(!result.html.includes("Titre <script>"));
  const scripts = [...result.html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (const script of scripts)
    assert.doesNotThrow(() => new Function(script[1]));
  assert.ok(result.html.includes("foundation"));
  assert.ok(result.html.includes("microphone"));
  assert.ok(result.html.includes("flame"));
});

test("Moloto direction exposes editable copy and independent audio tracks", () => {
  const film = footballFilmSchema.parse({
    name: "Mix",
    accent: "#d4b579",
    captions: true,
    soundtrack: { music: 0.22, effects: 0.18 },
    scenes: [
      {
        id: "legacy-01",
        title: "Intro",
        intent: "Transmission",
        statement: "Une vision demeure.",
        kicker: "TRANSMISSION",
        support: "Le récit continue.",
        transitionStyle: "wipe",
        narration: "Une vision demeure.",
        duration: 10,
        labels: [],
      },
    ],
  });
  const preview = footballComposition(film, true).html;
  const render = footballComposition(film).html;
  assert.ok(preview.includes("/api/films/moloto/sound?track=music"));
  assert.ok(render.includes('src="music.wav"'));
  assert.ok(render.includes('data-volume="0.22"'));
  assert.ok(render.includes('data-volume="0.18"'));
  assert.ok(preview.includes("beds.forEach(a=>a.pause())"));
  for (const script of [...preview.matchAll(/<script>([\s\S]*?)<\/script>/g)])
    assert.doesNotThrow(() => new Function(script[1]));
  assert.throws(() =>
    footballFilmSchema.parse({
      ...film,
      soundtrack: { music: 10, effects: 0 },
    }),
  );
});

test("Illustrated film keeps unique portrait definitions and the supplied timeline", () => {
  const scenes = Array.from({ length: 24 }, (_, i) => ({
    id: `legacy-${String(i + 1).padStart(2, "0")}`,
    title: "Transmission",
    statement: "Une vision se transmet.",
    narration: "Une vision se transmet.",
    intent: "Transmission",
    labels: ["Un mentor", "Un héritage"],
    duration: 10,
  })) as FootballScene[];
  const film = footballFilmSchema.parse({
    name: "Héritage illustré",
    accent: "#d4b579",
    captions: true,
    scenes,
  });
  const html = footballComposition(film).html;
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(
    new Set(ids).size,
    ids.length,
    "SVG gradients and clips must be unique across scenes",
  );
  assert.equal(
    (html.match(/data-direction="illustrated-heritage-v5"/g) || []).length,
    24,
  );
  assert.ok(html.includes("character-alain"));
  assert.ok(html.includes("character-athoms"));
  assert.equal(footballComposition(film).duration, 240);
});

test("Narrative cuts follow absolute word timecodes and remain inside the scene", async () => {
  const { molotoShots } = await import("./films/moloto-shots");
  const scene: FootballScene = {
    id: "legacy-09",
    title: "Formation",
    narration: "Observer apprendre chanter servir",
    intent: "Formation",
    duration: 20,
    labels: [],
    words: [
      { text: "Observer.", start: 104, end: 105 },
      { text: "Apprendre.", start: 108, end: 109 },
      { text: "Chanter.", start: 112, end: 113 },
      { text: "Servir.", start: 116, end: 117 },
    ],
  };
  assert.deepEqual(
    molotoShots(scene, 100).map((s) => s.at),
    [4, 8, 12, 16],
  );
  assert.deepEqual(
    molotoShots(scene, 100).map((s) => s.label),
    ["mentor", "carnet", "micro", "collectif"],
  );
  const short = { ...scene, duration: 1, words: [] };
  assert.deepEqual(molotoShots(short, 100), []);
});
