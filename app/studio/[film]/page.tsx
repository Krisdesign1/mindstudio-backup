import { access } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { NativeStudio } from "@/components/native-studio";
import { loadFootballFilm, type FilmKey } from "@/lib/services/football-film";
import { freeStudioId, getFreeStudio } from "@/lib/services/free-studio";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ film: string }>;
}) {
  const { film } = await params;
  if (freeStudioId.safeParse(film).success) {
    const project = await getFreeStudio(film).catch(() => null);
    if (!project) notFound();
    const delivered = await access(
      path.join(process.cwd(), ".mindstudio/studio", film, "delivery.mp4"),
    )
      .then(() => true)
      .catch(() => false);
    return (
      <NativeStudio
        key={film}
        film={film}
        name={project.name}
        delivered={delivered}
      />
    );
  }
  if (!["mbappe", "mourinho", "reviens", "moloto"].includes(film)) notFound();
  const project = await loadFootballFilm(film as FilmKey);
  return <NativeStudio key={film} film={film} name={project.name} />;
}
