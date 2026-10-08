import { readFile, writeFile } from "node:fs/promises";
import { reviensParts } from "../lib/films/reviens";
import { footballFilmSchema } from "../lib/films/mbappe";
import { alignTranscript } from "../lib/films/align-transcript";
import {
  prepareFootballFilm,
  saveFootballFilm,
} from "../lib/services/football-film";
import { toSrt } from "../lib/hyperframes/captions";
async function main() {
  const source = JSON.parse(
      await readFile(".mindstudio/reviens-source.json", "utf8"),
    ),
    speech = JSON.parse(
      await readFile(
        `.mindstudio/media/${source.id}/transcription.json`,
        "utf8",
      ),
    );
  if (speech.status !== "completed") throw new Error("Analyse non terminée");
  const aligned = alignTranscript(reviensParts, speech.words, source.duration);
  const film = footballFilmSchema.parse({
    name: "Reviens — Tu n’as pas perdu ton Père",
    accent: "#edc68b",
    source,
    captions: true,
    scenes: aligned.scenes,
  });
  await saveFootballFilm(film, "reviens");
  const job = await prepareFootballFilm(film, "reviens");
  await writeFile(
    ".mindstudio/films/reviens.srt",
    toSrt(
      {
        enabled: true,
        words: aligned.words,
        maxChars: 48,
        maxLines: 2,
        maxWords: 12,
      },
      source.duration,
    ),
  );
  console.log(
    JSON.stringify({
      job,
      exactRatio: aligned.exactRatio,
      scenes: film.scenes.map((s) => ({
        id: s.id,
        duration: s.duration,
        start: s.words?.[0].start,
        end: s.words?.at(-1)?.end,
      })),
    }),
  );
}
void main();
