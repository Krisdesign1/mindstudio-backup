import { escapeHtml } from "./composition";
import { illustrationSvg, type IllustrationId } from "./contextual";
const symbols: Record<IllustrationId, string> = {
  growth: "↗",
  journey: "↗",
  learning: "Aa",
  technology: "⌘",
  community: "✳",
  nature: "✳",
  time: "◷",
  idea: "✦",
  faith: "✦",
  health: "+",
  finance: "↗",
  abstract: "✳",
};
const labels: Record<IllustrationId, [string, string]> = {
  growth: ["PROGRESSION", "NOUVELLE PERSPECTIVE"],
  journey: ["LE PARCOURS", "PROCHAINE ÉTAPE"],
  learning: ["EXPLORER", "COMPRENDRE"],
  technology: ["CONNEXIONS", "SYSTÈME EN MOUVEMENT"],
  community: ["ENSEMBLE", "CRÉER DES LIENS"],
  nature: ["VIVANT", "L’ÉQUILIBRE"],
  time: ["LE BON MOMENT", "CHAQUE INSTANT COMPTE"],
  idea: ["UNE IDÉE", "OUVRIR LES POSSIBLES"],
  faith: ["L’HORIZON", "GARDER CONFIANCE"],
  health: ["L’ÉNERGIE", "TROUVER SON ÉQUILIBRE"],
  finance: ["LA PERSPECTIVE", "CONSTRUIRE LA SUITE"],
  abstract: ["EN MOUVEMENT", "CHANGER DE REGARD"],
};
export function sceneArtwork(
  kind: IllustrationId,
  options?: {
    title?: string;
    tagline?: string;
    symbol?: string;
    variant?: string;
  },
) {
  const title = escapeHtml(options ? options.title || "" : labels[kind][0]);
  const tagline = escapeHtml(options ? options.tagline || "" : labels[kind][1]);
  const symbol = escapeHtml(options ? options.symbol || "" : symbols[kind]);
  return `<div class="art-world art-${options?.variant || "cards"}"><div class="art-grid"></div><div class="art-orbit"></div><div class="art-orbit second"></div><div class="art-sphere"></div><div class="art-main">${title ? `<div class="art-heading"><i></i>${title}<span>↗</span></div>` : ""}<div class="art-drawing">${illustrationSvg(kind)}</div><div class="art-baseline"><span></span><span></span><span></span></div></div>${symbol || tagline ? `<div class="art-chip"><b>${symbol}</b><span>${tagline}</span></div>` : ""}${title ? `<div class="art-tag"><span>●</span> ${title}</div>` : ""}<div class="art-spark">✳</div></div>`;
}
export const sceneArtCss = `.art-world{position:relative;aspect-ratio:1;isolation:isolate;color:var(--accent)}.art-grid{position:absolute;inset:3%;background-image:linear-gradient(#ffffff07 1px,transparent 1px),linear-gradient(90deg,#ffffff07 1px,transparent 1px);background-size:9% 9%;mask-image:radial-gradient(black,transparent 70%)}.art-orbit{position:absolute;inset:3%;border:1px solid color-mix(in srgb,var(--accent) 25%,transparent);border-radius:50%;transform:rotate(-20deg) scaleY(.7)}.art-orbit.second{inset:9%;transform:rotate(40deg) scaleY(.75)}.art-sphere{position:absolute;width:32%;height:32%;right:3%;top:3%;border-radius:50%;background:radial-gradient(circle at 25% 25%,#fff,var(--accent) 28%,#15201c 80%);box-shadow:0 20px 80px color-mix(in srgb,var(--accent) 20%,transparent)}.art-main{position:absolute;inset:17% 13% 15% 8%;background:linear-gradient(135deg,#343d37,#151d1c 80%);border:1px solid #ffffff30;border-radius:6%;transform:rotate(-7deg);box-shadow:12px 25px 50px #0008;overflow:hidden}.art-heading{padding:6% 8%;border-bottom:1px solid #ffffff14;font-size:.16em;letter-spacing:.15em;color:#e4eadd;display:flex;align-items:center;gap:8px}.art-heading i{width:5px;height:5px;background:var(--accent);border-radius:50%}.art-heading span{margin-left:auto;font-size:1.8em}.art-drawing{padding:5% 13% 0}.art-drawing svg{width:100%;overflow:visible}.art-drawing .piece{fill:color-mix(in srgb,var(--accent) 12%,transparent)}.art-baseline{display:flex;gap:6%;padding:0 15%}.art-baseline span{height:3px;width:25%;background:#ffffff22;border-radius:5px}.art-baseline span:first-child{background:var(--accent);width:40%}.art-chip{position:absolute;bottom:5%;right:0;width:60%;background:var(--accent);color:#152010;border-radius:10px;box-shadow:0 15px 40px #0006;padding:5%;transform:rotate(6deg);display:flex;align-items:center;gap:.08em}.art-chip b{font-size:.55em;line-height:1;white-space:nowrap;flex-shrink:0;letter-spacing:-.05em}.art-chip>span{font-size:.12em;overflow-wrap:normal;word-break:normal;font-weight:800;line-height:1.6;letter-spacing:.08em}.art-tag{position:absolute;left:1%;top:5%;background:#222c28;border:1px solid #ffffff24;color:#fff;border-radius:50px;font-size:.13em;padding:3% 5%;letter-spacing:.1em;transform:rotate(-6deg)}.art-tag>span{color:var(--accent);margin-right:8px}.art-spark{position:absolute;right:0;bottom:40%;font-size:.8em;color:var(--accent)}
`;

export const artVariantCss = `.art-minimal .art-orbit,.art-minimal .art-sphere,.art-minimal .art-chip,.art-minimal .art-tag,.art-minimal .art-spark,.art-minimal .art-heading,.art-minimal .art-baseline{display:none}.art-minimal .art-main{inset:5%;background:none;border:0;box-shadow:none;transform:none}.art-minimal .art-drawing{padding:0}.art-orbit .art-main{border-radius:50%;inset:15%;transform:none;background:radial-gradient(circle,#ffffff12,transparent);box-shadow:none}.art-orbit .art-heading,.art-orbit .art-baseline,.art-orbit .art-chip,.art-orbit .art-tag{display:none}.art-orbit .art-drawing{padding:15%}.art-orbit .art-orbit{border-style:dashed}.art-heading:has(i:only-child){display:none}`;
