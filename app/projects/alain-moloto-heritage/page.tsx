import { FootballEditor } from "@/components/football-editor";
import {
  loadFootballFilm,
  latestFootballRender,
} from "@/lib/services/football-film";
export const dynamic = "force-dynamic";
export default async function Page() {
  const film = await loadFootballFilm("moloto");
  return (
    <FootballEditor
      initial={film}
      initialJob={await latestFootballRender(film, "moloto")}
      filmKey="moloto"
    />
  );
}
