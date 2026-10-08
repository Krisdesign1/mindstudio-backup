import { footballComposition } from "./football-composition";
import type { FootballFilm } from "./mbappe";

/** Publish timeline metadata without rebuilding a saved Studio project. */
export function nativeComposition(film: FootballFilm) {
  let html = footballComposition(film).html;
  let start = 0;
  for (const scene of film.scenes) {
    const id = `id="scene-${scene.id}"`;
    html = html.replace(
      id,
      `${id} data-start="${start}" data-duration="${scene.duration}" data-track-index="3"`,
    );
    start += scene.duration;
  }
  html = html.replace(/<section class="scene/g, '<section class="clip scene');
  html = html.replace(
    /<audio class="film-bed" src="(music|effects)\.wav"/g,
    '<audio class="clip film-bed" id="film-$1" src="$1.wav"',
  );
  html = html.replace(
    '<audio id="film-audio"',
    '<audio class="clip" id="film-audio"',
  );
  // Preserve the exact existing subtitle timing when exposing each cue to Studio.
  const timings = new Map<string, { start: string; end: string }>();
  for (const m of html.matchAll(
    /tl\.set\('#caption-(\d+)',\{autoAlpha:1\},([\d.]+)\);tl\.set\('#caption-\d+',\{autoAlpha:0\},([\d.]+)\);/g,
  ))
    timings.set(m[1], { start: m[2], end: m[3] });
  html = html.replace(/class="caption" id="caption-(\d+)"/g, (match, id) => {
    const cue = timings.get(id);
    return cue
      ? `class="clip caption" id="caption-${id}" data-start="${cue.start}" data-duration="${Number(cue.end) - Number(cue.start)}" data-track-index="4"`
      : match;
  });
  // Native runtime owns clip visibility; GSAP still animates their contents.
  html = html.replace(
    /tl\.set\('#(?:scene-[^']+|caption-\d+)',\{autoAlpha:[01]\},[\d.]+\);/g,
    "",
  );
  html = html.replace(
    ".scene{position:absolute;inset:0;visibility:hidden}",
    ".scene{position:absolute;inset:0}",
  );
  html = html.replace("visibility:hidden;z-index:5", "z-index:5");
  return html;
}
