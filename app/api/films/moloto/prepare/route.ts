import { route, readBody } from "@/lib/server/heygen-http";
import { footballFilmSchema } from "@/lib/films/mbappe";
import { prepareFootballFilm } from "@/lib/services/football-film";
export const runtime = "nodejs";
export async function POST(r: Request) {
  return route(r, async () =>
    prepareFootballFilm(await readBody(r, footballFilmSchema), "moloto"),
  );
}
