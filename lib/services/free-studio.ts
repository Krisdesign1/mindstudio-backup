import "server-only";
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
export const freeStudioId = z
  .string()
  .regex(
    /^free-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
const root = () => path.join(process.cwd(), ".mindstudio/studio");
const metadata = z.object({
  id: freeStudioId,
  name: z.string(),
  createdAt: z.string(),
});
export async function createFreeStudio(name: string) {
  const project = {
    id: `free-${crypto.randomUUID()}`,
    name: name.trim() || "Projet libre",
    createdAt: new Date().toISOString(),
  };
  const dir = path.join(root(), project.id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(dir, "index.html"),
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{margin:0;background:#101114}#composition{position:relative;width:1920px;height:1080px;overflow:hidden;background:#101114}</style></head><body><main id="composition" data-composition-id="main" data-no-timeline data-start="0" data-duration="10" data-width="1920" data-height="1080"></main></body></html>`,
  );
  await writeFile(
    path.join(dir, "mindstudio-project.json"),
    JSON.stringify(project),
  );
  return project;
}
export async function getFreeStudio(id: string) {
  freeStudioId.parse(id);
  return metadata.parse(
    JSON.parse(
      await readFile(path.join(root(), id, "mindstudio-project.json"), "utf8"),
    ),
  );
}
export async function listFreeStudios() {
  const entries = await readdir(root()).catch(() => [] as string[]);
  const projects = await Promise.all(
    entries
      .filter((id) => freeStudioId.safeParse(id).success)
      .map((id) => getFreeStudio(id).catch(() => null)),
  );
  return projects
    .filter((p) => p !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
