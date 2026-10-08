import { writeFile } from "node:fs/promises";
import {
  defaultFootballFilm,
  footballFilmSchema,
  footballWords,
} from "../lib/films/mbappe";
import {
  saveFootballFilm,
  prepareFootballFilm,
} from "../lib/services/football-film";
import { toSrt } from "../lib/hyperframes/captions";
async function main() {
  const film = footballFilmSchema.parse(defaultFootballFilm());
  await saveFootballFilm(film);
  const job = await prepareFootballFilm(film);
  await writeFile(
    ".mindstudio/films/mbappe-timing-indicatif.srt",
    toSrt(
      {
        enabled: true,
        words: footballWords(film),
        maxChars: 48,
        maxLines: 2,
        maxWords: 12,
      },
      job.duration,
    ),
  );
  console.log(JSON.stringify(job));
}
void main();
