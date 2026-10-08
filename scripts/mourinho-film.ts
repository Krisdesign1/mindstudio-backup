import { readFile, writeFile } from "node:fs/promises";
import { mourinhoParts } from "../lib/films/mourinho";
import { footballFilmSchema } from "../lib/films/mbappe";
import { alignTranscript } from "../lib/films/align-transcript";
import {
  prepareFootballFilm,
  saveFootballFilm,
} from "../lib/services/football-film";
import { toSrt } from "../lib/hyperframes/captions";
async function main() {
  const source = JSON.parse(
      await readFile(".mindstudio/mourinho-source.json", "utf8"),
    ),
    speech = JSON.parse(
      await readFile(
        `.mindstudio/media/${source.id}/transcription.json`,
        "utf8",
      ),
    );
  if (speech.status !== "completed") throw new Error("Analyse non terminée");
  const aligned = alignTranscript(mourinhoParts, speech.words, source.duration);
  const film = footballFilmSchema.parse({
    name: "Mourinho — Les images sur la table",
    accent: "#e9bb72",
    source,
    captions: true,
    scenes: aligned.scenes,
  });
  await saveFootballFilm(film, "mourinho");
  const job = await prepareFootballFilm(film, "mourinho");
  await writeFile(
    ".mindstudio/films/mourinho.srt",
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
