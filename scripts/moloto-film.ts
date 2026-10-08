import { readFile, writeFile } from "node:fs/promises";
import { footballFilmSchema, type FootballScene } from "../lib/films/mbappe";
import { alignTranscript } from "../lib/films/align-transcript";
import {
  prepareFootballFilm,
  saveFootballFilm,
} from "../lib/services/football-film";
import { toSrt } from "../lib/hyperframes/captions";
async function main() {
  const transcript = await readFile(
    "/Users/user/.codex/attachments/aab4bd23-7984-4e5c-b822-e573edc61e26/Texte collé.txt",
    "utf8",
  );
  const plan = [
    ["Avant qu’Athom", "Une voix. Une vision.", "LA VOIX", "LA VISION"],
    ["Cet homme", "Alain Moloto", "ALAIN MOLOTO", "Transmettre"],
    ["Né à Kisangani", "Les origines", "KISANGANI", "KINSHASA", "1961"],
    ["Avec le temps", "Une conviction", "LA MUSIQUE", "PLUS GRAND"],
    ["C’est dans cet esprit", "GAËL", "GAËL", "Groupe Adorons", "l’Éternel"],
    [
      "La vision était",
      "Former des adorateurs",
      "FORMER",
      "Transmettre",
      "Adorer",
    ],
    [
      "C’est dans cet environnement",
      "Un jeune homme apprend",
      "ATHOM’S",
      "Apprendre",
      "Progresser",
    ],
    [
      "Il expliquera plus tard",
      "Se former pour transmettre",
      "APPRENDRE",
      "Une chorale",
      "Les autres",
    ],
    [
      "Cette étape",
      "Une école de vie",
      "SERVIR",
      "Observer · apprendre",
      "Chanter · évoluer",
    ],
    [
      "Il dira plus tard",
      "Une influence profonde",
      "LE CULTE",
      "Une manière de voir",
    ],
    [
      "Mais nous oublions",
      "Les années dans l’ombre",
      "L’APPRENTISSAGE",
      "Avant la lumière",
    ],
    [
      "Alain Moloto était",
      "L’exigence du travail",
      "L’EXCELLENCE",
      "Les mots · le soin",
    ],
    [
      "Mais en 2013",
      "Le départ du mentor",
      "2013",
      "Alain Moloto",
      "L’absence",
    ],
    [
      "Et soudain",
      "Que devient la vision ?",
      "LA VISION",
      "Que reste-t-il ?",
      "Que continue-t-on ?",
    ],
    [
      "Quelques semaines",
      "La responsabilité de continuer",
      "ALAIN MOLOTO",
      "ATHOM’S MBUMA",
    ],
    [
      "Autrement dit",
      "Protéger ce qui a été transmis",
      "TRANSMETTRE",
      "PRÉSERVER",
    ],
    [
      "Mais l’héritage spirituel",
      "Continuer ce qui a commencé",
      "RECEVOIR",
      "FAIRE VIVRE",
    ],
    [
      "Athom’s utilisera",
      "La fondation invisible",
      "LA FONDATION",
      "Visible",
      "Invisible",
    ],
    [
      "C’est ce qu’un mentor",
      "Ce qui nous tient debout",
      "LES CONSEILS",
      "Corrections",
      "Apprentissage",
    ],
    ["Et c’est pour cela", "Au-delà des albums", "UNE VOIX", "DES VIES"],
    [
      "Le parcours d’Athom",
      "Préparer ceux qui continueront",
      "FORMER",
      "Continuer",
    ],
    [
      "Alors pose-toi",
      "Qu’est-ce qui continuerait ?",
      "UNE IDÉE",
      "UNE PERSONNE",
    ],
    ["Parce qu’au fond", "Déposer une vision", "TRANSMETTRE", "Plus loin"],
    [
      "Alain Moloto est parti",
      "Ce qui continue à parler",
      "L’HÉRITAGE",
      "Qui t’a transmis ?",
    ],
  ];
  const starts = plan.map((p) => transcript.indexOf(p[0]));
  if (starts.some((v, i) => v < 0 || (i > 0 && v <= starts[i - 1])))
    throw new Error("Découpage invalide");
  const parts = plan.map((p, i) => ({
    id: `legacy-${String(i + 1).padStart(2, "0")}`,
    title: p[1],
    labels: p.slice(2),
    narration: transcript
      .slice(starts[i], starts[i + 1] ?? transcript.length)
      .trim(),
    intent: `Illustrer ${p[1].toLowerCase()} avec une composition narrative animée, sans image d’archive ni portrait inventé.`,
    duration: 1,
  })) as FootballScene[];
  const source = JSON.parse(
    await readFile(".mindstudio/moloto-source.json", "utf8"),
  );
  const speech = JSON.parse(
    await readFile(`.mindstudio/media/${source.id}/transcription.json`, "utf8"),
  );
  if (speech.status !== "completed") throw new Error("Analyse non terminée");
  const aligned = alignTranscript(parts, speech.words, source.duration);
  const film = footballFilmSchema.parse({
    name: "Avant Athom’s Mbuma, il y avait Alain Moloto",
    accent: "#d4b579",
    source,
    captions: true,
    scenes: aligned.scenes,
  });
  await saveFootballFilm(film, "moloto");
  const job = await prepareFootballFilm(film, "moloto");
  await writeFile(
    ".mindstudio/films/moloto.srt",
    toSrt(
      {
        enabled: true,
        words: aligned.words,
        maxChars: 48,
        maxLines: 2,
        maxWords: 12,
      },
      source.duration,
    ),
  );
  console.log(
    JSON.stringify({
      job,
      alignment: aligned.exactRatio,
      scenes: film.scenes.length,
    }),
  );
}
void main();
