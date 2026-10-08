import type { Project, Scene } from "../schemas/project";
export const images = [
  "/images/mountains.jpg",
  "/images/forest.jpg",
  "/images/desert.jpg",
  "/images/ocean.jpg",
];
export const templates = [
  {
    name: "MindShift Cinematic",
    description: "Des histoires qui font ressentir.",
    tag: "Cinématique",
    image: images[0],
  },
  {
    name: "Christian Documentary",
    description: "Donnez de la profondeur au récit.",
    tag: "Documentaire",
    image: images[1],
  },
  {
    name: "Viral Story",
    description: "Captez l’attention dès la première seconde.",
    tag: "Dynamique",
    image: images[2],
  },
  {
    name: "Gospel Inspiration",
    description: "Une lumière sur vos inspirations.",
    tag: "Contemplatif",
    image: images[3],
  },
];
export const words = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;
export const duration = (scenes: Scene[]) =>
  scenes.reduce((sum, scene) => sum + scene.duration, 0);
export const time = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
export function splitIntoScenes(text: string): Scene[] {
  return (text.match(/[^.!?]+[.!?]*/g) || [])
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: crypto.randomUUID(),
      text,
      prompt: `Plan cinématique, lumière naturelle. ${text}`,
      duration: Math.max(3, Math.min(120, Math.ceil(words(text) / 2.5))),
      image: images[index % images.length],
      transition: "Fondu",
    }));
}
export function generateScript(idea: string) {
  return `${idea.trim().replace(/[.!?]+$/, "")}.\n\nEt si tu prenais un instant pour regarder les choses autrement ? Chaque chemin commence par un premier pas.\n\nDans les moments de doute, rappelle-toi ce qui t’a donné envie de commencer. Les petits gestes d’aujourd’hui construisent les changements de demain.\n\nAvance à ton rythme, mais continue d’avancer. Partage cette pensée avec quelqu’un qui en a besoin.`;
}
export function newProject(
  name: string,
  idea: string,
  format: Project["format"],
  mode: Project["mode"],
  template: string,
): Project {
  const script = mode === "automatic" ? generateScript(idea) : "";
  return {
    id: crypto.randomUUID(),
    name,
    idea,
    format,
    mode,
    template,
    script,
    status: "Brouillon",
    image: templates.find((t) => t.name === template)?.image || images[0],
    updatedAt: new Date().toISOString(),
    scenes: splitIntoScenes(script),
    voice: "Christenvie Voice",
    speed: 1,
    subtitle: "Minimal",
    renders: 0,
  };
}
export function demoProjects(): Project[] {
  return [
    "Tu penses que Dieu t’a abandonné ?",
    "Le pouvoir des petits pas",
    "Une minute pour retrouver la paix",
    "Et si tout commençait aujourd’hui ?",
  ].map((name, i) => ({
    ...newProject(
      name,
      name,
      i === 1 ? "9:16" : "16:9",
      "automatic",
      templates[i].name,
    ),
    image: images[i],
    status: i === 0 ? "Terminé" : i === 2 ? "Préparation" : "Brouillon",
  }));
}
