import { route, readBody } from "@/lib/server/heygen-http";
import { footballFilmSchema } from "@/lib/films/mbappe";
import {
  loadFootballFilm,
  saveFootballFilm,
} from "@/lib/services/football-film";
export const runtime = "nodejs";
export async function GET(r: Request) {
  return route(r, () => loadFootballFilm("moloto"));
}
export async function POST(r: Request) {
  return route(r, async () =>
    saveFootballFilm(await readBody(r, footballFilmSchema), "moloto"),
  );
}
