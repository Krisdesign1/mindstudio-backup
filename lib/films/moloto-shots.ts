import type { FootballScene } from "./mbappe";
import { molotoVisual } from "./moloto-art";
// Each cue is a narrative edit, not a fixed interval. Coordinates describe the
// camera window inside the vector set; text and captions remain outside it.
type Cue = [string, number, string, string];
const plans: Cue[][] = [
  [
    ["visages", 7, "700 155 470 405", "portrait"],
    ["voix", 2, "560 80 680 510", "ensemble"],
    ["génération", 21, "620 160 580 430", "relève"],
  ],
  [
    ["chants", 2, "740 150 390 340", "chant"],
    ["derrière", 12, "670 150 570 420", "travail"],
    ["carrière", 16, "570 130 670 450", "transmission"],
  ],
  [
    ["kinshasa", 3, "580 100 640 490", "itinéraire"],
    ["écrit", 12, "720 370 450 220", "écriture"],
  ],
  [
    ["musique", 4, "720 170 470 380", "chant"],
    ["grand", 6, "550 100 680 470", "adoration"],
  ],
  [
    ["groupe", 5, "560 150 650 430", "chorale"],
    ["chansons", 8, "600 155 610 430", "formation"],
  ],
  [
    ["former", 8, "570 100 650 470", "formation"],
    ["transmettre", 23, "600 130 630 450", "transmission"],
  ],
  [
    ["époque", 8, "630 220 500 340", "apprentissage"],
    ["progresser", 12, "740 350 440 220", "travail"],
  ],
  [
    ["chorale", 5, "570 140 650 440", "chorale"],
    ["formé", 8, "720 350 450 230", "carnet"],
    ["autres", 9, "620 180 580 390", "transmettre"],
  ],
  [
    ["observer", 9, "970 190 230 265", "mentor"],
    ["apprendre", 9, "720 370 400 190", "carnet"],
    ["chanter", 7, "755 150 380 370", "micro"],
    ["servir", 8, "560 150 650 430", "collectif"],
  ],
  [
    ["leçon", 11, "600 150 600 420", "formation"],
    ["concerts", 10, "560 80 670 510", "scène"],
  ],
  [
    ["ombre", 11, "625 190 565 370", "apprentissage"],
    ["porter", 15, "730 160 420 390", "relève"],
  ],
  [
    ["mots", 12, "740 365 420 215", "écriture"],
    ["excellence", 12, "955 170 260 300", "mentor"],
    ["moitié", 12, "610 200 600 380", "travail"],
    ["sérieux", 12, "755 375 390 180", "correction"],
  ],
  [["disparaît", 13, "650 150 510 430", "souvenir"]],
  [
    ["question", 14, "610 120 600 450", "absence"],
    ["construit", 5, "550 100 680 490", "œuvre"],
  ],
  [
    ["athom", 15, "755 170 390 360", "relève"],
    ["vision", 16, "580 130 630 450", "transmission"],
  ],
  [
    ["protéger", 16, "640 170 570 420", "héritage"],
    ["premiers", 2, "740 150 380 365", "fondateur"],
    ["visible", 15, "755 150 400 380", "continuateur"],
  ],
  [
    ["mission", 17, "650 110 540 470", "passage"],
    ["mourir", 21, "600 130 630 450", "continuité"],
  ],
  [
    ["fondation", 18, "615 385 595 235", "fondation"],
    ["terminée", 18, "670 140 490 385", "maison"],
    ["retire", 18, "615 385 595 235", "socle"],
  ],
  [
    ["enseigné", 9, "950 175 265 330", "mentor"],
    ["devenu", 15, "740 160 430 400", "relève"],
    ["conseils", 12, "630 180 580 400", "conseils"],
    ["corrections", 12, "755 375 390 180", "correction"],
    ["paroles", 23, "590 155 620 420", "transmission"],
  ],
  [
    ["albums", 2, "715 145 445 400", "chant"],
    ["personnes", 5, "550 120 680 450", "communauté"],
    ["flambeau", 20, "640 180 570 400", "relève"],
  ],
  [
    ["mentor", 9, "950 180 260 310", "mentor"],
    ["personnes", 8, "590 160 620 410", "formation"],
    ["mains", 12, "745 370 425 210", "travail"],
    ["après", 17, "610 100 610 490", "avenir"],
  ],
  [
    ["chanson", 2, "735 170 420 370", "chant"],
    ["ministère", 5, "550 110 680 470", "communauté"],
    ["personne", 8, "620 180 580 390", "formation"],
  ],
  [
    ["vision", 23, "640 170 565 400", "transmission"],
    ["loin", 17, "610 110 610 470", "avenir"],
  ],
  [
    ["influence", 20, "580 135 640 435", "héritage"],
    ["construire", 18, "610 150 610 440", "fondation"],
    ["voix", 13, "650 155 500 420", "mémoire"],
    ["commentaire", 21, "580 150 640 420", "question"],
  ],
];
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
export function molotoShots(scene: FootballScene, start: number) {
  const cues = plans[Number(scene.id.slice(-2)) - 1] || [];
  const result: {
    at: number;
    visual: number;
    viewBox: string;
    label: string;
  }[] = [];
  cues.forEach(([word, visual, viewBox, label], i) => {
    const found = scene.words?.find(
      (w) =>
        normalize(w.text).startsWith(normalize(word)) && w.start - start >= 2.2,
    );
    const at = found
      ? found.start - start
      : (scene.duration * (i + 1)) / (cues.length + 1);
    if (at >= 2.2 && at <= scene.duration - 1.8)
      result.push({ at, visual, viewBox, label });
  });
  return result
    .sort((a, b) => a.at - b.at)
    .filter((s, i, a) => !i || s.at - a[i - 1].at >= 1.3);
}
export function molotoShotFrames(scene: FootballScene, start: number) {
  return molotoShots(scene, start)
    .map((shot, i) => {
      // Namespace all definitions because a set can recur several times in a film.
      const prefix = `${scene.id}-shot-${i}-`;
      const art = molotoVisual({
        ...scene,
        id: `legacy-${String(shot.visual).padStart(2, "0")}` as FootballScene["id"],
      })
        .replace(/id="([^"]+)"/g, `id="${prefix}$1"`)
        .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);
      return `<div class="narrative-shot shot-${i}" data-shot="${shot.label}" data-shot-at="${shot.at}"><svg viewBox="${shot.viewBox}" preserveAspectRatio="xMidYMid meet" aria-label="Plan illustré : ${shot.label}">${art}</svg></div>`;
    })
    .join("");
}
export function molotoShotMotion(
  scene: FootballScene,
  start: number,
  end: number,
) {
  const q = `#scene-${scene.id}`,
    shots = molotoShots(scene, start);
  return shots.flatMap((shot, i) => {
    const at = start + shot.at,
      until = i + 1 < shots.length ? start + shots[i + 1].at : end;
    return [
      `tl.set('${q} .shot-${i}',{autoAlpha:1},${at});tl.set('${q} .shot-${i}',{autoAlpha:0},${until});`,
      `tl.fromTo('${q} .shot-${i} svg',{scale:1},{scale:1.025,duration:${until - at},ease:'none',immediateRender:false},${at});`,
    ];
  });
}
