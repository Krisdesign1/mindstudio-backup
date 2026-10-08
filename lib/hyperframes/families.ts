import type { Overlay } from "../schemas/motion-edit";
export const families = [
  {
    id: "kinetic",
    name: "Typographie manifeste",
    description:
      "Les mots occupent l’écran, avec une entrée rythmée et une couleur franche.",
    color: "#dcff74",
    layout: "typography",
    motion: "still",
    templateId: "kinetic",
  },
  {
    id: "collage",
    name: "Collage éditorial",
    description:
      "Papier clair, image inclinée, cadre découpé et titre contrasté.",
    color: "#ff8059",
    layout: "editorial",
    motion: "slide",
    templateId: "split",
  },
  {
    id: "cinematic",
    name: "Cinéma immersif",
    description:
      "Média plein cadre, rapprochement lent et titre en premier plan.",
    color: "#e6cc9d",
    layout: "cinema",
    motion: "zoom",
    templateId: "cinematic",
  },
  {
    id: "blueprint",
    name: "Schéma technique",
    description:
      "Grille, illustration au trait et apparition progressive des formes.",
    color: "#65e8ff",
    layout: "split",
    motion: "orbit",
    templateId: "typewriter",
  },
  {
    id: "poster",
    name: "Affiche graphique",
    description:
      "Aplat de couleur, formes géométriques et composition verticale.",
    color: "#c7a5ff",
    layout: "poster",
    motion: "zoom",
    templateId: "bounce",
  },
  {
    id: "quote",
    name: "Citation minimaliste",
    description: "Texte centré, espace généreux et apparition calme.",
    color: "#eadcc4",
    layout: "typography",
    motion: "still",
    templateId: "cinematic",
  },
] as const;
export type FamilyId = (typeof families)[number]["id"];
export function applyFamily(layer: Overlay, id: FamilyId): Overlay {
  const f = families.find((f) => f.id === id)!;
  return {
    ...layer,
    family: id,
    contextual: true,
    layout: f.layout,
    motion: f.motion,
    templateId: f.templateId,
    color: f.color,
    artVariant: id === "blueprint" ? "minimal" : "cards",
  };
}
export function sceneVariants(layer: Overlay, round = 0): Overlay[] {
  const preferred = layer.media
    ? ["cinematic", "collage", "poster"]
    : layer.illustration === "technology"
      ? ["blueprint", "kinetic", "quote"]
      : ["kinetic", "collage", "quote"];
  const ids = round % 2 ? ["blueprint", "poster", "cinematic"] : preferred;
  return ids.map((id) => applyFamily(layer, id as FamilyId));
}
export const familyCss = `
.family-kinetic .context-backdrop{background:var(--accent)}.family-kinetic .context-copy .content{color:#152016;text-shadow:none;letter-spacing:-.065em}.family-kinetic .context-layout:before{content:'';position:absolute;left:-5%;top:-15%;width:18%;aspect-ratio:1;border:3px solid #152016;border-radius:50%;opacity:.2}.family-kinetic .context-brand,.family-kinetic .context-index{color:#152016}
.family-collage .context-backdrop{background:repeating-linear-gradient(0deg,#00000003 0,#00000003 1px,transparent 1px,transparent 5px),#ece7dc}.family-collage .context-copy .content{color:#201d1b;font-family:Georgia,serif;letter-spacing:-.045em}.family-collage .context-copy{border-left:0!important}.family-collage .illustration{transform:rotate(-5deg);background:#fff;padding:2%;box-shadow:12px 18px 0 #1a1a1a18}.family-collage .scene-media{border-radius:0}.family-collage .art-world{color:#20221d;--accent:#252a25}.family-collage .context-copy small{background:var(--accent);padding:.5em;color:#171714;display:inline-block}.family-collage .context-brand,.family-collage .context-index{color:#282521}
.family-cinematic .context-backdrop{background:#060a10}.family-cinematic .illustration{opacity:.8!important}.family-cinematic .context-layout:after{content:'';position:absolute;inset:0;background:linear-gradient(transparent 25%,#030609dd);pointer-events:none}.family-cinematic .context-copy{z-index:2;bottom:22%;max-width:72%}.family-cinematic .context-copy .content{background:none;letter-spacing:-.02em;font-weight:500}.family-cinematic .scene-media{background:#0c1821}.family-cinematic .art-world{opacity:.6}
.family-blueprint .context-backdrop{background:linear-gradient(#65e8ff12 1px,transparent 1px),linear-gradient(90deg,#65e8ff12 1px,transparent 1px),#071e35;background-size:5% 5%}.family-blueprint .context-copy .content{font-family:monospace;letter-spacing:-.05em;color:#d8f6ff}.family-blueprint .illustration{border:1px solid #65e8ff55;padding:3%;background:#061c3290}.family-blueprint .piece{fill:none!important}.family-blueprint .context-copy{border-top:1px solid var(--accent);padding-top:4%}
.family-poster .context-backdrop{background:var(--accent)}.family-poster .context-layout{flex-direction:column-reverse;gap:20px;text-align:center}.family-poster .context-copy{border:0;padding:0;width:90%;flex:initial}.family-poster .context-copy .content{color:#20172a;text-transform:uppercase;font-weight:900;letter-spacing:-.055em}.family-poster .illustration{width:32%;font-size:80px}.family-poster .scene-media{border-radius:50%;border:5px solid #20172a}.family-poster .context-brand,.family-poster .context-index{color:#20172a}.family-poster .context-layout:before{content:'';position:absolute;inset:-5%;border:2px solid #20172a;pointer-events:none}
.family-quote .context-backdrop{background:#f2ede2}.family-quote .context-copy .content{font-family:Georgia,serif;font-weight:400;font-style:italic;color:#262822;letter-spacing:-.035em}.family-quote .context-copy:before{content:'“';display:block;color:#938363;font:100px Georgia;line-height:.7}.family-quote .context-copy{max-width:85%;margin:auto}.family-quote .context-brand,.family-quote .context-index{color:#6c6558}
`;
