import type { FootballScene } from "./mbappe";
export const mourinhoParts: Omit<FootballScene, "duration">[] = [
  {
    id: "press-arrival",
    title: "IL EST VENU AVEC LES IMAGES.",
    narration:
      "José Mourinho est arrivé en conférence de presse avec quelque chose qu’on ne voit presque jamais…\n\nDes captures d’écran imprimées des actions du match.",
    intent:
      "Une silhouette d’entraîneur pose un dossier sur la table de conférence. Deux feuilles en sortent.",
    labels: ["CONFÉRENCE DE PRESSE", "LES IMAGES DU MATCH"],
  },
  {
    id: "derby-defeat",
    title: "APRÈS LE DERBY",
    narration:
      "Après la défaite du Real Madrid face à l’Atlético, Mourinho n’a pas seulement critiqué l’arbitrage.",
    intent:
      "Deux camps se font face. La défaite laisse place à une table de presse et aux images contestées.",
    labels: ["REAL MADRID", "ATLÉTICO", "DÉFAITE DU REAL"],
  },
  {
    id: "two-incidents",
    title: "DEUX ACTIONS CONTESTÉES",
    narration:
      "Il a littéralement sorti les images de deux grosses fautes qu’il estime avoir été oubliées par l’arbitre.",
    intent:
      "Deux feuilles sont présentées comme des schémas explicatifs, sans fabriquer de photographie du match.",
    labels: ["ACTION 01", "ACTION 02", "SELON MOURINHO"],
  },
  {
    id: "red-card",
    title: "LE REAL À DIX",
    narration:
      "Et pour lui, le problème est encore plus grave à cause d’une chose :\n\nle Real Madrid, lui, a terminé le match avec un joueur expulsé.",
    intent:
      "Onze positions sont visibles sur le terrain. Le carton rouge s’élève et une position quitte le collectif.",
    labels: ["REAL MADRID", "UN JOUEUR EXPULSÉ"],
  },
  {
    id: "same-rule",
    title: "LA MÊME SANCTION ?",
    narration:
      "Alors Mourinho a voulu poser une question très simple :\n\nsi certaines interventions du Real méritent un carton rouge, pourquoi des actions similaires du côté de l’Atlético n’ont-elles pas été sanctionnées de la même manière ?",
    intent:
      "Deux dossiers sont placés côte à côte : un carton rouge d’un côté, un point d’interrogation de l’autre. La comparaison représente sa contestation.",
    labels: ["REAL MADRID", "ATLÉTICO", "ROUGE", "?"],
  },
  {
    id: "show-sheets",
    title: "UNE IMAGE. PUIS UNE AUTRE.",
    narration:
      "Et au lieu de rester dans les paroles, il a montré les captures directement devant les journalistes.\n\nUne image.\n\nPuis une deuxième.\n\nComme pour dire :\n\n« Voilà exactement ce que je vous explique. »",
    intent:
      "La première feuille se lève, puis la deuxième. La caméra se rapproche des feuilles face aux micros.",
    labels: ["01", "02", "MONTRER POUR EXPLIQUER"],
  },
  {
    id: "reaction-wave",
    title: "LA SÉQUENCE CIRCULE",
    narration:
      "Évidemment, cette séquence a immédiatement commencé à faire parler.\n\nParce qu’on connaît Mourinho.",
    intent:
      "Le cadre de la conférence se propage dans plusieurs écrans reliés. Aucun chiffre ni commentaire inventé.",
    labels: ["CONFÉRENCE", "RÉACTIONS", "DÉBAT"],
  },
  {
    id: "referee-dispute",
    title: "CONTESTER LA DÉCISION",
    narration:
      "Quand il pense qu’une décision arbitrale a influencé un match, il ne garde généralement pas ça pour lui.",
    intent:
      "Le sifflet et la décision sont mis en regard du micro : la contestation passe du terrain à la conférence.",
    labels: ["DÉCISION ARBITRALE", "PRISE DE PAROLE"],
  },
  {
    id: "printed-proof",
    title: "CETTE FOIS, C’EST IMPRIMÉ.",
    narration:
      "Mais cette fois, arriver avec les images déjà imprimées, c’était encore un niveau au-dessus.",
    intent:
      "Une imprimante fait sortir les deux feuilles qui se retrouvent au premier plan sur la table.",
    labels: ["DEUX IMAGES", "UN MESSAGE"],
  },
  {
    id: "atletico-response",
    title: "L’ATLÉTICO RÉAGIT",
    narration:
      "De son côté, l’Atlético n’a pas vraiment apprécié ces accusations et a également réagi.",
    intent:
      "Le cadre passe du camp du Real au camp de l’Atlético. Une réponse visuelle rejoint le débat, sans fausse citation.",
    labels: ["ACCUSATIONS", "RÉACTION", "ATLÉTICO"],
  },
  {
    id: "final-question",
    title: "DÉNONCER OU DÉTOURNER ?",
    narration:
      "Alors maintenant, la vraie question est simple :\n\nMourinho avait-il raison de venir avec les captures pour dénoncer l’arbitrage ?\n\nOu est-ce simplement une manière de détourner l’attention après la défaite du Real Madrid ?",
    intent:
      "Les deux feuilles restent au centre. Deux interprétations apparaissent de part et d’autre, sans trancher.",
    labels: ["DÉNONCER L’ARBITRAGE ?", "DÉTOURNER L’ATTENTION ?"],
  },
  {
    id: "your-opinion",
    title: "À VOUS DE TRANCHER.",
    narration: "Dites-moi ce que vous en pensez.",
    intent:
      "Le dossier reste ouvert entre les deux positions. Le mouvement ralentit pour laisser la question au spectateur.",
    labels: ["A • DÉNONCER", "B • DÉTOURNER", "VOTRE AVIS EN COMMENTAIRE"],
  },
];
