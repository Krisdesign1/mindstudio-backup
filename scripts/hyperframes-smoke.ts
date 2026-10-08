import { findMotionTemplate } from "../lib/hyperframes/templates";
import { prepareComposition } from "../lib/services/hyperframes";
import { newProject, images } from "../lib/services/mock";
import { writeFile } from "node:fs/promises";
async function main() {
  const project = newProject(
    "Chaque histoire commence ici",
    "Une nouvelle perspective",
    "16:9",
    "manual",
    "MindShift Cinematic",
  );
  project.scenes = [
    {
      id: "1",
      text: "Prenez de la hauteur.",
      prompt: "Montagnes",
      image: images[0],
      duration: 2,
      transition: "Fondu",
    },
    {
      id: "2",
      text: "Trouvez votre lumière.",
      prompt: "Forêt",
      image: images[1],
      duration: 2,
      transition: "Zoom",
    },
    {
      id: "3",
      text: "Donnez vie à votre histoire.",
      prompt: "Océan",
      image: images[3],
      duration: 3,
      transition: "Fondu",
    },
  ];
  const job = await prepareComposition({
    project,
    templateId: findMotionTemplate(process.argv[2] || "cinematic").id,
    logoText: "MS",
    brand: "MINDSTUDIO",
    accent: "#b69aff",
    includeAudio: false,
    quality: "720p",
  });
  await writeFile(".mindstudio/hyperframes-smoke.json", JSON.stringify(job));
  console.log(JSON.stringify(job));
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
