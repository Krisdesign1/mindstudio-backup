import { route, readBody } from "@/lib/server/heygen-http";
import { footballFilmSchema } from "@/lib/films/mbappe";
import {
  loadFootballFilm,
  saveFootballFilm,
} from "@/lib/services/football-film";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return route(request, loadFootballFilm);
}
export async function POST(request: Request) {
  return route(request, async () =>
    saveFootballFilm(await readBody(request, footballFilmSchema)),
  );
}
