import { newOverlay, type Overlay } from "../schemas/motion-edit";
export const illustrationIds = [
  "growth",
  "journey",
  "learning",
  "technology",
  "community",
  "nature",
  "time",
  "idea",
  "faith",
  "health",
  "finance",
  "abstract",
] as const;
export type IllustrationId = (typeof illustrationIds)[number];
export const illustrationLabels: Record<IllustrationId, string> = {
  growth: "Croissance et progrès",
  journey: "Voyage et parcours",
  learning: "Apprentissage",
  technology: "Technologie",
  community: "Équipe et relations",
  nature: "Nature",
  time: "Temps et objectifs",
  idea: "Idée et créativité",
  faith: "Foi et espoir",
  health: "Santé et énergie",
  finance: "Finance",
  abstract: "Composition abstraite",
};
const themes: [IllustrationId, RegExp][] = [
  ["finance", /argent|financ|budget|revenu|invest|epargne|economie/],
  ["growth", /croissan|progre|augment|reuss|grandir|developp|evolu/],
  ["journey", /voyag|chemin|route|destination|parcours|etape|avanc/],
  ["learning", /appren|livre|ecole|etud|savoir|connaissan|educ/],
  [
    "technology",
    /techno|ordinateur|numerique|logiciel|intelligence artificielle|donnee|internet/,
  ],
  ["community", /equipe|ensemble|famille|ami|relation|communaut|partag/],
  ["nature", /nature|arbre|foret|environnement|planete|fleur|jardin/],
  ["time", /temps|minute|heure|jour|objectif|planifi|patien/],
  ["faith", /dieu|foi|prier|espoir|jesus|spirit|confiance/],
  ["health", /sante|energie|corps|sport|respir|coeur|bien.etre/],
  ["idea", /idee|creativ|imagin|inspir|invent|solution/],
];
export function inferIllustration(text: string): IllustrationId {
  const plain = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return themes.find(([, pattern]) => pattern.test(plain))?.[0] || "abstract";
}
export function planContextual(text: string, duration: number): Overlay[] {
  if (!text.trim())
    throw new Error("Ajoutez le script ou la transcription de la vidéo.");
  if (!Number.isFinite(duration) || duration < 0.2 || duration > 600)
    throw new Error("Durée de vidéo invalide.");
  const words = text.trim().split(/\s+/);
  if (text.length > 20000)
    throw new Error("Limitez le texte à 20 000 caractères.");
  const maxCount = Math.min(30, Math.max(1, Math.floor(duration / 0.2)));
  const chunks: string[][] = [];
  for (const sentence of text.trim().split(/(?<=[.!?])\s+|\n+/)) {
    const tokens = sentence.trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i += 24)
      chunks.push(tokens.slice(i, i + 24));
  }
  while (chunks.length > maxCount) {
    const tail = chunks.pop()!;
    chunks[chunks.length - 1].push(...tail);
  }
  const target = Math.min(maxCount, Math.ceil(duration / 12), words.length);
  while (chunks.length < target) {
    const index = chunks.reduce(
      (best, c, i) => (c.length > chunks[best].length ? i : best),
      0,
    );
    const chunk = chunks[index];
    if (chunk.length < 2) break;
    chunks.splice(
      index,
      1,
      chunk.slice(0, Math.ceil(chunk.length / 2)),
      chunk.slice(Math.ceil(chunk.length / 2)),
    );
  }
  const count = chunks.length;
  const colors = ["#bca0ff", "#83e4d5", "#ffc184", "#92bbff"];
  let cursor = 0;
  return chunks.map((chunk, i) => {
    const narration = chunk.join(" ");
    const end =
      i === count - 1
        ? duration
        : cursor +
          0.2 +
          ((duration - 0.2 * count) * chunk.length) / words.length;
    const layer = {
      ...newOverlay("kinetic"),
      text: chunk.slice(0, 12).join(" ").slice(0, 240),
      start: cursor,
      duration: end - cursor,
      x: 50,
      y: 50,
      color: colors[i % colors.length],
      size: 56,
      illustration: inferIllustration(narration),
      narration,
      contextual: true,
    };
    cursor = end;
    return layer;
  });
}
// Fixed vector drawings, never user-provided SVG/code.
export function illustrationSvg(kind: IllustrationId) {
  const art: Record<IllustrationId, string> = {
    growth:
      '<path d="M70 265H440M85 265V65"/><rect class="piece" x="125" y="190" width="60" height="75" rx="10"/><rect class="piece" x="220" y="140" width="60" height="125" rx="10"/><rect class="piece" x="315" y="85" width="60" height="180" rx="10"/><path class="trace" d="M115 150L220 90L320 65L415 25M375 25H415V65"/>',
    journey:
      '<path class="trace" d="M70 240C110 70 190 285 235 140S350 60 420 105" stroke-dasharray="12 12"/><circle class="piece" cx="70" cy="240" r="22"/><circle class="piece" cx="235" cy="140" r="22"/><path d="M420 140V45M420 45H470L452 68H420"/>',
    learning:
      '<path class="piece" d="M250 95Q150 45 75 85V255Q160 220 250 270ZM250 95Q350 45 425 85V255Q340 220 250 270Z"/><path class="trace" d="M110 120L215 140M110 160L215 180M285 140L390 120M285 180L390 160"/>',
    technology:
      '<rect class="piece" x="160" y="75" width="180" height="180" rx="24"/><rect x="205" y="120" width="90" height="90" rx="12"/><path class="trace" d="M190 40V75M250 40V75M310 40V75M190 255V290M250 255V290M310 255V290M120 105H160M120 165H160M120 225H160M340 105H380M340 165H380M340 225H380"/>',
    community:
      '<circle class="piece" cx="250" cy="95" r="40"/><circle class="piece" cx="120" cy="145" r="30"/><circle class="piece" cx="380" cy="145" r="30"/><path class="piece" d="M170 270V235a80 80 0 0 1 160 0V270ZM55 270V245a65 65 0 0 1 110-45M445 270V245a65 65 0 0 0-110-45"/>',
    nature:
      '<path class="trace" d="M250 290V140"/><path class="piece" d="M250 190Q110 185 110 60Q250 60 250 190ZM250 150Q250 35 390 40Q390 155 250 150Z"/><path d="M100 290H400"/>',
    time: '<circle class="piece" cx="250" cy="165" r="115"/><path class="trace" d="M250 80V165L320 200M250 50V65M250 265V280M135 165H150M350 165H365"/><circle cx="250" cy="165" r="10"/>',
    idea: '<path class="piece" d="M205 235V215a90 90 0 1 1 90 0V235ZM205 260H295M225 285H275"/><path class="trace" d="M250 5V30M90 125H120M380 125H410M130 35L155 60M345 60L370 35M250 235V170L220 140M250 170L280 140"/>',
    faith:
      '<path class="piece" d="M65 255Q250 100 435 255"/><circle class="piece" cx="250" cy="100" r="45"/><path class="trace" d="M250 20V40M165 45L180 60M320 60L335 45M130 100H150M350 100H370M100 280H400"/>',
    health:
      '<path class="piece" d="M250 275L110 145C30 55 155-15 250 85C345-15 470 55 390 145Z"/><path class="trace" d="M115 170H190L215 120L250 215L280 150L300 170H385"/>',
    finance:
      '<rect class="piece" x="80" y="100" width="330" height="175" rx="24"/><path d="M80 135H410"/><circle class="piece" cx="330" cy="205" r="30"/><circle class="piece" cx="180" cy="75" r="40"/><path class="trace" d="M180 45V105M195 55H175a12 12 0 0 0 0 24h10a12 12 0 0 1 0 24H165"/>',
    abstract:
      '<circle class="piece" cx="180" cy="155" r="80"/><rect class="piece" x="245" y="100" width="125" height="125" rx="25"/><path class="trace" d="M95 265L250 40L415 265Z"/>',
  };
  return `<svg viewBox="0 0 500 330" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${art[kind]}</svg>`;
}
