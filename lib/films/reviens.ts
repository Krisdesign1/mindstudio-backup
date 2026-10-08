import type { FootballScene } from "./mbappe";
export const reviensParts: Omit<FootballScene, "duration">[] = [
  {
    id: "faith-shame",
    title: "PARFOIS, C’EST LA HONTE.",
    narration:
      "Tu sais ce qui éloigne beaucoup de personnes de Dieu ?\n\nCe n’est pas toujours le péché.\n\nParfois, c’est la honte.",
    intent:
      "Une silhouette recule devant une porte éclairée. Une ombre grandit entre elle et la maison, tandis que la lumière reste présente.",
    labels: ["LA HONTE"],
  },
  {
    id: "faith-promise",
    title: "TU DEMANDES PARDON.",
    narration:
      "Tu fais une erreur une première fois.\n\nTu demandes pardon à Dieu.\n\nTu lui promets que tu ne recommenceras plus.",
    intent:
      "Un vase se fissure. La personne s’agenouille près de la fenêtre et relève les mains vers la lumière.",
    labels: ["PARDON", "JE NE RECOMMENCERAI PLUS"],
  },
  {
    id: "faith-repeat",
    title: "ET TU RETOMBES.",
    narration:
      "Puis quelque temps après, tu retombes exactement dans la même chose.\n\nEt là, quelque chose change.\n\nTu n’oses même plus prier comme avant.",
    intent:
      "Les pas dessinent une boucle et reviennent vers la même fissure. La personne se replie, la fenêtre reste lumineuse.",
    labels: ["ENCORE…"],
  },
  {
    id: "faith-question",
    title: "COMMENT REVENIR ?",
    narration:
      "Parce que dans ta tête, tu te dis :\n\n« Dieu m’avait déjà pardonné. Comment est-ce que je peux encore revenir vers lui avec la même erreur ? »",
    intent:
      "La question occupe une pièce vide. Le personnage baisse la tête, tourné à l’opposé d’une porte toujours ouverte.",
    labels: ["DÉJÀ PARDONNÉ…", "ET LA MÊME ERREUR."],
  },
  {
    id: "faith-alone",
    title: "TU ESSAYES TOUT SEUL.",
    narration:
      "Alors tu commences à t’éloigner.\n\nTu essayes de régler le problème tout seul.\n\nTu essayes de devenir meilleur avant de revenir vers Dieu.",
    intent:
      "La maison s’éloigne dans le paysage. Seul au premier plan, le personnage essaie de réunir les morceaux d’un vase.",
    labels: ["RÉPARER", "AVANT DE REVENIR ?"],
  },
  {
    id: "faith-departure",
    title: "LE FILS PRODIGUE",
    narration:
      "Mais regarde le fils prodigue.\n\nIl avait quitté son père.\n\nIl avait gaspillé son héritage.",
    intent:
      "La scène devient une parabole illustrée : un fils quitte une maison avec son sac, tandis que son père reste au seuil.",
    labels: ["LE DÉPART"],
  },
  {
    id: "faith-loss",
    title: "IL AVAIT PRESQUE TOUT PERDU.",
    narration:
      "Il avait perdu son argent.\n\nIl avait perdu sa position.\n\nIl avait presque tout perdu.",
    intent:
      "Des pièces roulent hors du sac. Un manteau glisse d’une chaise, laissant le fils assis seul dans un paysage dépouillé.",
    labels: ["L’ARGENT", "LA POSITION"],
  },
  {
    id: "faith-father",
    title: "MAIS PAS SON PÈRE.",
    narration:
      "Mais il y avait une chose qu’il n’avait pas perdue.\n\nSon père.",
    intent:
      "Le cadre revient à la maison. Le père se tient toujours dans l’ouverture lumineuse ; la route entre les deux demeure visible.",
    labels: ["SON PÈRE"],
  },
  {
    id: "faith-presence",
    title: "SANS PERDRE DIEU.",
    narration:
      "Et ça, quelqu’un doit l’entendre aujourd’hui.\n\nTu peux perdre ce que Dieu t’a donné sans perdre Dieu.",
    intent:
      "Les objets offerts disparaissent progressivement du premier plan, mais la lumière de la porte reste intacte.",
    labels: ["CE QUI A ÉTÉ DONNÉ", "CELUI QUI DEMEURE"],
  },
  {
    id: "faith-regrets",
    title: "TES CHOIX N’ONT PAS TOUT EFFACÉ.",
    narration:
      "Tu peux avoir perdu du temps.\n\nTu peux avoir raté une opportunité.\n\nTu peux avoir fait les mauvais choix.\n\nTu peux même être retombé dans quelque chose que tu avais juré de ne plus jamais refaire.",
    intent:
      "Un sablier, une bifurcation et des pas qui reviennent sur eux-mêmes montrent les regrets. Une route éclairée traverse néanmoins le paysage.",
    labels: ["LE TEMPS", "LES CHOIX", "LES RECHUTES"],
  },
  {
    id: "faith-why",
    title: "ALORS, POURQUOI RESTER LOIN ?",
    narration:
      "Mais ton erreur n’a pas fait disparaître Dieu.\n\nAlors pourquoi restes-tu loin de lui ?\n\nPourquoi essayes-tu encore de réparer seul ce que tu peux apporter à ton Père ?",
    intent:
      "La personne cesse d’assembler les morceaux. Elle les prend dans ses mains et se tourne vers la maison.",
    labels: ["APPORTER", "AU LIEU DE PORTER SEUL"],
  },
  {
    id: "faith-return",
    title: "REVENIR POUR REVIVRE.",
    narration:
      "Le fils prodigue n’a pas attendu d’avoir une nouvelle vie pour retourner chez son père.\n\nIl est retourné chez son père pour retrouver une nouvelle vie.",
    intent:
      "La route se dessine vers la maison. Le fils avance avec son sac usé et le père sort à sa rencontre.",
    labels: ["RETOURNER", "RETROUVER LA VIE"],
  },
  {
    id: "faith-now",
    title: "REVIENS. MAINTENANT.",
    narration:
      "Et peut-être que c’est exactement ce que tu dois faire aujourd’hui.\n\nReviens.\n\nPas quand tu seras parfait.\n\nPas quand tu auras tout réglé.\n\nReviens maintenant.",
    intent:
      "Les conditions disparaissent une à une. Deux personnages se rapprochent puis se retrouvent dans une étreinte au seuil de la maison.",
    labels: ["QUAND JE SERAI PARFAIT", "QUAND TOUT SERA RÉGLÉ", "MAINTENANT"],
  },
  {
    id: "faith-end",
    title: "TU N’AS PAS PERDU CELUI QUI DONNE.",
    narration:
      "Parce que tu as peut-être perdu ce qu’il t’avait donné.\n\nMais tu n’as pas perdu Celui qui te l’avait donné.",
    intent:
      "Le père et le fils restent réunis dans la lumière. Le paysage s’ouvre, le mouvement ralentit, et la dernière phrase demeure à l’écran.",
    labels: ["TU PEUX REVENIR"],
  },
];
