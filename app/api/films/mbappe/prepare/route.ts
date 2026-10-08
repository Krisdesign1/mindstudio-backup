import { route, readBody } from "@/lib/server/heygen-http";
import { footballFilmSchema } from "@/lib/films/mbappe";
import { prepareFootballFilm } from "@/lib/services/football-film";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return route(request, async () =>
    prepareFootballFilm(await readBody(request, footballFilmSchema)),
  );
}
