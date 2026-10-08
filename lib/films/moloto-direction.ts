import { molotoShotFrames, molotoShotMotion } from "./moloto-shots";
import type { FootballScene } from "./mbappe";
import { escapeHtml as esc } from "../hyperframes/composition";
export const molotoCss = `
#composition{background:#101d27!important;color:#f1e5cc}
.legacy{background:radial-gradient(ellipse at 76% 36%,#29434a 0,transparent 61%),#101d27}
.legacy.warm{background:radial-gradient(ellipse at 78% 45%,#665340 0,transparent 62%),#242823}
.legacy.memorial{background:#141c24}
.legacy .illustration{position:absolute;inset:0}.legacy.reverse .illustration{transform:translateX(-490px)}.legacy.reverse .headline,.legacy.reverse .eyebrow,.legacy.reverse .statement,.legacy.reverse .support,.legacy.reverse .chapter-line{left:760px;width:450px}.legacy.reverse .chapter-line{width:52px}
.legacy .art{inset:0;width:1280px;height:720px;transform-origin:75% 50%}
.legacy .headline{top:110px;left:64px;right:auto;width:436px;height:64px;font:500 22px/1.25 Arial;letter-spacing:0;border:0;padding:0;color:#b7c4bf;z-index:3;overflow-wrap:anywhere}
.legacy .eyebrow{position:absolute;top:63px;left:64px;width:440px;height:30px;font:600 12px/1.4 Arial;letter-spacing:3px;color:var(--accent);z-index:3}
.legacy .statement{position:absolute;left:60px;top:204px;width:447px;height:235px;font:normal 59px/1.06 Georgia,serif;letter-spacing:-1.8px;z-index:3;overflow-wrap:anywhere}
.legacy .statement span{display:inline-block;max-width:100%;vertical-align:top}
.legacy .support{position:absolute;left:64px;top:467px;width:430px;height:92px;font:18px/1.45 Arial;color:#b7c4bf;z-index:3;overflow-wrap:anywhere}
.legacy.reverse .scene-tags{left:760px}.legacy .scene-tags{position:absolute;left:64px;top:578px;width:440px;display:flex;gap:24px;height:27px;z-index:3}
.legacy .scene-tag{font:11px/1.3 Arial;letter-spacing:1.2px;color:#d5bd93;max-width:140px;overflow-wrap:anywhere}
.legacy .chapter-line{position:absolute;left:64px;top:182px;width:52px;height:2px;background:var(--accent);transform-origin:left}
.legacy .seam{position:absolute;inset:0;background:#c5ad80;z-index:8;transform-origin:right}
.legacy.memorial .statement{font-size:114px;color:#d6bd91}
.legacy.memorial .remembrance{filter:saturate(.25)}
.legacy .narrative-shot{position:absolute;inset:40px 48px 116px;background:#152730;z-index:4;visibility:hidden;overflow:hidden;border-radius:4px}.legacy .narrative-shot svg{width:100%;height:100%;display:block;transform-origin:center}.legacy.warm .narrative-shot{background:#423e32}
.caption{bottom:30px!important;max-width:1080px!important;background:#0b131de8!important;border:0!important;border-radius:5px;font-size:26px!important;line-height:1.3!important;padding:10px 22px!important}
`;
export const molotoFitScript = `
document.querySelectorAll('.legacy').forEach(scene=>{
 scene.querySelectorAll('.headline,.eyebrow,.statement,.support,.scene-tag').forEach(el=>{
  let size=parseFloat(getComputedStyle(el).fontSize);
  while((el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)&&size>10){size-=.5;el.style.fontSize=size+'px';}
 });
});`;
export function molotoFrame(scene: FootballScene, art: string, start = 0) {
  const n = Number(scene.id.slice(-2));
  return `<section class="scene legacy ${[8, 12, 19, 23].includes(n) ? "reverse" : ""} ${[3, 8, 9, 11, 12, 18, 19].includes(n) ? "warm" : ""} ${[13, 14].includes(n) ? "memorial" : ""}" id="scene-${scene.id}" data-direction="illustrated-heritage-v5"><div class="illustration"><svg class="art" viewBox="0 0 1280 720" role="img" aria-label="Illustration stylisée du récit">${art}</svg></div><div class="eyebrow">${esc(scene.kicker || "")}</div><div class="headline">${esc(scene.title)}</div><div class="chapter-line"></div><div class="statement">${(
    scene.statement || scene.title
  )
    .split(/\s+/)
    .map((w) => `<span>${esc(w)}</span>`)
    .join(
      " ",
    )}</div><div class="support">${esc(scene.support || "")}</div><div class="scene-tags">${scene.labels
    .slice(0, 3)
    .map((l) => `<div class="scene-tag">${esc(l)}</div>`)
    .join(
      "",
    )}</div>${molotoShotFrames(scene, start)}<div class="seam"></div></section>`;
}
export function molotoMotion(scene: FootballScene, start: number, end: number) {
  const q = `#scene-${scene.id}`,
    n = Number(scene.id.slice(-2)),
    d = end - start;
  const at = (text: string, fallback: number) => {
    const w = scene.words?.find(
      (w) => w.text.toLowerCase().replace(/[.,!?]/g, "") === text,
    );
    return w ? Math.max(0.5, w.start - start) : fallback;
  };
  const lines = [
    `tl.fromTo('${q} .statement span',{opacity:0,y:16},{opacity:1,y:0,duration:.8,stagger:.065,ease:'power3.out',immediateRender:false},${start + 0.6});`,
    `tl.fromTo('${q} .support',{opacity:0},{opacity:1,duration:1.2,immediateRender:false},${start + Math.min(3, d * 0.25)});`,
    `tl.fromTo('${q} .eyebrow,${q} .scene-tag',{opacity:0},{opacity:1,duration:.8,stagger:.2,immediateRender:false},${start + 0.3});`,
    `tl.fromTo('${q} .chapter-line',{scaleX:0},{scaleX:1,duration:1,immediateRender:false},${start + 0.3});`,
    `tl.fromTo('${q} .art',{scale:1,x:0},{scale:1.02,x:${n % 2 ? 4 : -4},duration:${d},ease:'none',immediateRender:false},${start});`,
  ];
  if (scene.transitionStyle === "wipe")
    lines.push(
      `tl.fromTo('${q} .seam',{scaleX:1},{scaleX:0,duration:.8,ease:'power3.inOut',immediateRender:false},${start});`,
    );
  else
    lines.push(
      `tl.set('${q} .seam',{opacity:0},${start});tl.fromTo('${q}',{opacity:0},{opacity:1,duration:${n === 13 ? 1.5 : 0.75},immediateRender:false},${start});`,
    );
  if ([2, 4, 5, 6, 7, 10, 15].includes(n))
    lines.push(
      `tl.fromTo('${q} .score',{x:0},{x:-16,duration:${d},ease:'none',immediateRender:false},${start});`,
    );
  if ([13, 14].includes(n))
    lines.push(
      `tl.to('${q} .remembrance',{opacity:.45,duration:3},${start + d * 0.6});`,
    );
  if (n === 18 || n === 19)
    lines.push(
      `tl.to('${q} .house',{y:-20,opacity:.22,duration:2.5},${start + at(n === 18 ? "fondation" : "conseils", d * 0.5)});`,
    );
  if ([1, 16, 20, 21, 23, 24].includes(n))
    lines.push(
      `tl.fromTo('${q} .flame',{opacity:0,x:-40},{opacity:1,x:38,duration:${Math.min(8, d * 0.5)},ease:'sine.inOut',immediateRender:false},${start + 2});`,
    );
  lines.push(...molotoShotMotion(scene, start, end));
  return lines;
}
