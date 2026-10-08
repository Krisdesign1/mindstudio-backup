import { z } from "zod";
import { sourceVideoSchema, captionWordSchema } from "../schemas/motion-edit";
export const footballVisuals = [
  "legacy-01",
  "legacy-02",
  "legacy-03",
  "legacy-04",
  "legacy-05",
  "legacy-06",
  "legacy-07",
  "legacy-08",
  "legacy-09",
  "legacy-10",
  "legacy-11",
  "legacy-12",
  "legacy-13",
  "legacy-14",
  "legacy-15",
  "legacy-16",
  "legacy-17",
  "legacy-18",
  "legacy-19",
  "legacy-20",
  "legacy-21",
  "legacy-22",
  "legacy-23",
  "legacy-24",

  "faith-shame",
  "faith-promise",
  "faith-repeat",
  "faith-question",
  "faith-alone",
  "faith-departure",
  "faith-loss",
  "faith-father",
  "faith-presence",
  "faith-regrets",
  "faith-why",
  "faith-return",
  "faith-now",
  "faith-end",
  "press-arrival",
  "derby-defeat",
  "two-incidents",
  "red-card",
  "same-rule",
  "show-sheets",
  "reaction-wave",
  "referee-dispute",
  "printed-proof",
  "atletico-response",
  "final-question",
  "your-opinion",
  "tunnel",
  "age",
  "shield",
  "entry",
  "tactics",
  "equal",
  "monaco",
  "pressure",
  "clock",
  "level",
  "focus",
  "player",
  "results",
  "progress",
  "debate",
] as const;
export const footballSceneSchema = z.object({
  id: z.enum(footballVisuals),
  words: z.array(captionWordSchema).max(1000).optional(),
  title: z.string().max(100),
  kicker: z.string().max(70).optional(),
  statement: z.string().max(100).optional(),
  support: z.string().max(150).optional(),
  transitionStyle: z.enum(["fade", "wipe"]).optional(),
  narration: z.string().min(1).max(4000),
  intent: z.string().max(500),
  duration: z.number().min(0.2).max(120),
  labels: z.array(z.string().max(65)).max(8),
});
export const footballFilmSchema = z
  .object({
    name: z.string().min(1).max(120),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    scenes: z.array(footballSceneSchema).min(1).max(30),
    source: sourceVideoSchema.optional(),
    captions: z.boolean(),
    soundtrack: z
      .object({
        music: z.number().min(0).max(0.5),
        effects: z.number().min(0).max(0.5),
      })
      .optional(),
  })
  .superRefine((f, c) => {
    if (new Set(f.scenes.map((s) => s.id)).size !== f.scenes.length)
      c.addIssue({ code: "custom", message: "Chaque scène doit être unique." });
    const total = f.scenes.reduce((n, s) => n + s.duration, 0);
    if (f.source && Math.abs(total - f.source.duration) > 0.05)
      c.addIssue({
        code: "custom",
        message: "Les scènes doivent couvrir le son intégral.",
      });
    if (
      f.scenes.flatMap((s) => s.words || []).some((w) => w.end > total + 0.01)
    )
      c.addIssue({ code: "custom", message: "Sous-titre hors durée." });
    if (total > 600)
      c.addIssue({ code: "custom", message: "Durée maximale : dix minutes." });
  });
export type FootballFilm = z.infer<typeof footballFilmSchema>;
export type FootballScene = z.infer<typeof footballSceneSchema>;
const parts: [
  (typeof footballVisuals)[number],
  string,
  string,
  string,
  string[],
][] = [
  [
    "tunnel",
    "L’EXCUSE DE TROP",
    `Il y a une excuse que Kylian Mbappé ne supporte absolument pas dans le football.`,
    "Un joueur sort de l’ombre du tunnel sous le regard des médias.",
    ["KYLIAN MBAPPÉ", "FOOTBALL / MENTALITÉ"],
  ],
  [
    "age",
    "L’ÂGE.",
    `Et étonnamment…\n\nc’est l’âge.`,
    "Le mot âge envahit le terrain et devient une étiquette sur le joueur.",
    ["TROP JEUNE ?"],
  ],
  [
    "shield",
    "LA MÊME EXPOSITION",
    `Pour Mbappé, quand tu arrives au plus haut niveau, personne ne doit te protéger simplement parce que tu es jeune.`,
    "Une protection transparente entoure le jeune joueur puis s’ouvre à son entrée sur le terrain.",
    ["JEUNE", "HAUT NIVEAU"],
  ],
  [
    "entry",
    "JOUER. ASSUMER.",
    `Son raisonnement est très simple :\n\nsi tu es assez bon pour être sur le terrain…\n\nalors tu es aussi assez grand pour assumer ce qui se passe dessus.`,
    "Le joueur franchit la ligne de touche, reçoit le ballon et prend sa place dans le jeu.",
    ["ÊTRE CHOISI", "PRENDRE SA PLACE", "ASSUMER"],
  ],
  [
    "tactics",
    "LE JEU FAIT FOI",
    `Mbappé l’explique clairement :\n\nl’âge ne veut rien dire.\n\nSi tu es bon, tu joues.\n\nEt si tu n’es pas bon, tu dois accepter d’être jugé exactement comme les autres.`,
    "Une passe réussie puis une perte de balle sont dessinées sur le même terrain tactique.",
    ["PASSE RÉUSSIE", "BALLON PERDU", "MÊME ANALYSE"],
  ],
  [
    "equal",
    "LES MÊMES RÈGLES",
    `Pas d’excuse.\n\nPas de traitement spécial.`,
    "Deux joueurs d’expérience différente sont réunis dans le même cercle lumineux.",
    ["JEUNE JOUEUR", "JOUEUR CONFIRMÉ", "MÊMES EXIGENCES"],
  ],
  [
    "monaco",
    "LES DÉBUTS À MONACO",
    `Et cette manière de penser vient probablement aussi de sa propre histoire.\n\nParce que Mbappé lui-même a été exposé très jeune au plus haut niveau.\n\nÀ Monaco, il jouait déjà avec des professionnels alors qu’il était encore adolescent.`,
    "Retour en arrière : un adolescent en rouge et blanc face aux tribunes d’un grand stade. Illustration, sans fausse archive.",
    ["MONACO", "ADOLESCENT → PROFESSIONNEL"],
  ],
  [
    "pressure",
    "GAGNER SA PLACE",
    `Très rapidement, il a dû supporter la pression, les critiques, les attentes…\n\net surtout prouver qu’il méritait sa place.`,
    "Les micros et les attentes resserrent le cadre ; une course vers le ballon rouvre le terrain.",
    ["PRESSION", "CRITIQUES", "ATTENTES"],
  ],
  [
    "clock",
    "LAISSEZ-LUI DU TEMPS ?",
    `Alors forcément, lorsqu’il entend quelqu’un dire :\n\n« Il est encore jeune, laissez-lui du temps »…\n\nMbappé n’est pas forcément d’accord.`,
    "Une horloge masque l’action, avant que le ballon ne ramène l’attention vers le terrain.",
    ["IL EST ENCORE JEUNE", "LAISSEZ-LUI DU TEMPS"],
  ],
  [
    "level",
    "CE QUI COMPTE : LE NIVEAU",
    `Pour lui, à partir du moment où un joueur est choisi pour entrer sur le terrain, l’âge disparaît.\n\nCe qui compte, c’est le niveau.`,
    "La rubrique âge d’une fiche disparaît, laissant place à des déplacements tactiques sans statistiques inventées.",
    ["ÂGE", "PLACEMENT", "PASSE", "DÉCISION"],
  ],
  [
    "focus",
    "PARLE-MOI DE FOOTBALL",
    `Et il va même plus loin.\n\nIl explique que lorsque quelqu’un lui parlait de son âge dans un contexte footballistique, cela l’agaçait immédiatement.\n\nEn gros, son message était :\n\n« Ne me parle pas de mon âge. Parle-moi de football. Parle-moi de niveau. »`,
    "Trois mots se transforment : âge s’efface, football ouvre le terrain, niveau révèle une action collective.",
    ["ÂGE", "FOOTBALL", "NIVEAU"],
  ],
  [
    "player",
    "UN JOUEUR. TOUT COURT.",
    `Et cette phrase révèle beaucoup de choses sur sa mentalité.\n\nParce que Mbappé ne voulait pas être considéré comme un jeune joueur prometteur.\n\nIl voulait être considéré comme un joueur tout court.`,
    "Une étiquette jeune espoir se détache ; le joueur quitte sa fiche et rejoint le collectif.",
    ["JEUNE ESPOIR", "JOUEUR"],
  ],
  [
    "results",
    "ASSUMER LES DEUX",
    `S’il réussissait, très bien.\n\nS’il se trompait, il devait assumer.`,
    "Deux trajectoires : un ballon atteint le but, l’autre passe à côté. Le joueur reprend sa place dans les deux cas.",
    ["RÉUSSIR", "SE TROMPER", "ASSUMER"],
  ],
  [
    "progress",
    "EXPLIQUER ≠ EXCUSER",
    `Et aujourd’hui, cette manière de penser peut aussi expliquer pourquoi il peut être exigeant avec les jeunes joueurs qui arrivent au très haut niveau.\n\nParce que pour lui…\n\nêtre jeune peut expliquer certaines choses.\n\nMais ça ne doit jamais devenir une excuse permanente.`,
    "Un joueur progresse entre des plots tandis que son ancienne étiquette reste enfermée dans une boucle.",
    ["APPRENDRE", "PROGRESSER", "EXCUSE PERMANENTE"],
  ],
  [
    "debate",
    "ET VOUS ?",
    `Alors j’ai une question pour vous.\n\nEst-ce que Mbappé a raison ?\n\nÀ partir du moment où un jeune joueur entre sur le terrain avec les professionnels…\n\ndoit-il être jugé exactement comme les autres ?\n\nOu est-ce qu’on doit quand même lui laisser plus de temps à cause de son âge ?\n\nDites-moi ce que vous en pensez.`,
    "Le terrain se partage entre deux positions. Le ballon s’arrête au milieu : le spectateur choisit.",
    ["MÊMES EXIGENCES ?", "PLUS DE TEMPS ?", "À VOUS DE JOUER"],
  ],
];
export function defaultFootballFilm(): FootballFilm {
  return {
    name: "Mbappé — L’âge n’est pas une excuse",
    accent: "#c5f75f",
    captions: true,
    scenes: parts.map(([id, title, narration, intent, labels]) => ({
      id,
      title,
      narration,
      intent,
      labels,
      duration: Math.max(
        4,
        Math.round((narration.split(/\s+/).length / 2.5 + 1.5) * 10) / 10,
      ),
    })),
  };
}
export function footballWords(film: FootballFilm) {
  let start = 0;
  return film.scenes.flatMap((s) => {
    if (s.words?.length) {
      start += s.duration;
      return s.words;
    }
    const words = s.narration.trim().split(/\s+/),
      step = s.duration / words.length,
      base = start;
    start += s.duration;
    return words.map((text, i) => ({
      text,
      start: base + i * step,
      end: base + (i + 1) * step,
    }));
  });
}
