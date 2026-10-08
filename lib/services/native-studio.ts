import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  access,
  mkdir,
  copyFile,
  writeFile,
  rename,
  rm,
} from "node:fs/promises";
import path from "node:path";
import { loadFootballFilm, type FilmKey } from "./football-film";
import { nativeComposition } from "../films/native-composition";
import { mediaDirectory } from "./motion-media";
import { ServiceError } from "../server/errors";
const exec = promisify(execFile);
const pending = new Map<string, Promise<{ url: string }>>();

async function open(key: string) {
  const root = path.join(process.cwd(), ".mindstudio", "studio");
  const dir = path.join(root, key);
  await mkdir(root, { recursive: true, mode: 0o700 });
  try {
    await access(path.join(dir, "index.html"));
  } catch {
    if (key.startsWith("free-"))
      throw new ServiceError("not_found", "Projet introuvable.", 404);
    const film = await loadFootballFilm(key as FilmKey);
    const staging = path.join(root, `${key}-${crypto.randomUUID()}`);
    await mkdir(staging, { mode: 0o700 });
    try {
      await copyFile(
        path.join(process.cwd(), "node_modules/gsap/dist/gsap.min.js"),
        path.join(staging, "gsap.min.js"),
      );
      if (film.source)
        await copyFile(
          path.join(mediaDirectory(film.source.id), "source.wav"),
          path.join(staging, "source.wav"),
        );
      if (key === "moloto" && film.soundtrack)
        for (const track of ["music", "effects"]) {
          await copyFile(
            path.join(
              process.cwd(),
              ".mindstudio/films",
              `moloto-${track}.wav`,
            ),
            path.join(staging, `${track}.wav`),
          );
        }
      await writeFile(
        path.join(staging, "index.html"),
        nativeComposition(film),
      );
      await writeFile(
        path.join(staging, "mindstudio-source.json"),
        JSON.stringify(film, null, 2),
      );
      await rename(staging, dir);
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
  }
  try {
    const { stdout } = await exec(
      process.execPath,
      [
        path.join(
          process.cwd(),
          "node_modules/hyperframes/bin/hyperframes.mjs",
        ),
        "preview",
        dir,
        "--background",
        "--no-open",
        "--json",
        "--port",
        "3102",
      ],
      {
        cwd: process.cwd(),
        timeout: 90000,
        maxBuffer: 1024 * 1024,
        env: {
          ...process.env,
          XDG_STATE_HOME: path.join(process.cwd(), ".mindstudio/runtime"),
        },
      },
    );
    const response = stdout
      .trim()
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .find((value) => value?.operation === "start");
    const result = response?.result;
    if (!response?.ok || !result?.ready || result.projectDir !== dir)
      throw new Error("Studio indisponible");
    const url = new URL(result.studioUrl);
    if (
      url.protocol !== "http:" ||
      !["127.0.0.1", "localhost"].includes(url.hostname)
    )
      throw new Error("Adresse invalide");
    return { url: url.href };
  } catch {
    throw new ServiceError(
      "studio_start",
      "Le Studio n’a pas pu démarrer. Réessaie ; les fichiers de ton montage sont conservés.",
      503,
    );
  }
}
export function openNativeStudio(key: string) {
  const existing = pending.get(key);
  if (existing) return existing;
  const operation = open(key).finally(() => pending.delete(key));
  pending.set(key, operation);
  return operation;
}
