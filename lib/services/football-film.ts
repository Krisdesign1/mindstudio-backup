import "server-only";
import { mkdir, readFile, writeFile, rename, copyFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultFootballFilm,
  footballFilmSchema,
  type FootballFilm,
} from "../films/mbappe";
import { footballComposition } from "../films/football-composition";
import { jobDirectory, getHyperframesJob } from "./hyperframes";
import type { HyperframesJob } from "../schemas/hyperframes";
import { getSourceVideo, mediaDirectory } from "./motion-media";
import { ServiceError } from "../server/errors";
export type FilmKey = "mbappe" | "mourinho" | "reviens" | "moloto";
const directory = () => path.join(process.cwd(), ".mindstudio", "films");
export async function loadFootballFilm(key: FilmKey = "mbappe") {
  try {
    return footballFilmSchema.parse(
      JSON.parse(await readFile(path.join(directory(), `${key}.json`), "utf8")),
    );
  } catch (e) {
    if (key === "mbappe" && (e as NodeJS.ErrnoException).code === "ENOENT")
      return defaultFootballFilm();
    throw e;
  }
}
export async function saveFootballFilm(
  film: FootballFilm,
  key: FilmKey = "mbappe",
) {
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  const file = path.join(directory(), `${key}-${crypto.randomUUID()}.tmp`);
  await writeFile(file, JSON.stringify(film, null, 2), { mode: 0o600 });
  await rename(file, path.join(directory(), `${key}.json`));
  return film;
}
export async function prepareFootballFilm(
  film: FootballFilm,
  key: FilmKey = "mbappe",
) {
  if (film.source) {
    const source = await getSourceVideo(film.source.id);
    if (
      source.kind !== "audio" ||
      Math.abs(
        source.duration - film.scenes.reduce((n, s) => n + s.duration, 0),
      ) > 0.05
    )
      throw new ServiceError(
        "audio_timing",
        "Le montage doit conserver la durée du son.",
        400,
      );
    film = { ...film, source };
  }
  const composition = footballComposition(film),
    id = crypto.randomUUID(),
    dir = jobDirectory(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await copyFile(
    path.join(process.cwd(), "node_modules/gsap/dist/gsap.min.js"),
    path.join(dir, "gsap.min.js"),
  );
  if (film.source)
    await copyFile(
      path.join(mediaDirectory(film.source.id), "source.wav"),
      path.join(dir, "source.wav"),
    );
  if (key === "moloto" && film.soundtrack)
    for (const track of ["music", "effects"])
      await copyFile(
        path.join(directory(), `moloto-${track}.wav`),
        path.join(dir, `${track}.wav`),
      );
  await writeFile(path.join(dir, "index.html"), composition.html);
  await writeFile(path.join(dir, "edit.json"), JSON.stringify(film, null, 2));
  const job: HyperframesJob = {
    id,
    projectId:
      key === "mbappe"
        ? "mbappe-age-niveau"
        : key === "mourinho"
          ? "mourinho-arbitrage"
          : key === "moloto"
            ? "alain-moloto-heritage"
            : "reviens-au-pere",
    name: film.name,
    status: "ready",
    duration: composition.duration,
    width: 1280,
    height: 720,
    hasAudio: Boolean(film.source),
    createdAt: new Date().toISOString(),
  };
  await writeFile(path.join(dir, "job.json"), JSON.stringify(job));
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(directory(), `${key}-render.json`),
    JSON.stringify({
      id,
      fingerprint: JSON.stringify(film),
      layoutVersion: key === "moloto" ? 5 : 1,
    }),
  );
  return job;
}

export async function latestFootballRender(
  film: FootballFilm,
  key: FilmKey = "mbappe",
) {
  try {
    const record = JSON.parse(
      await readFile(path.join(directory(), `${key}-render.json`), "utf8"),
    );
    if (record.fingerprint !== JSON.stringify(film)) return undefined;
    if (key === "moloto" && record.layoutVersion !== 5) return undefined;
    return await getHyperframesJob(record.id);
  } catch {
    return undefined;
  }
}
