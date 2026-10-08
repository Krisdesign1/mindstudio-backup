import { motionDesign } from "./motion";
import type { HyperframesInput } from "../schemas/hyperframes";
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function dimensions(format: string, quality: string) {
  const scale = quality === "720p" ? 2 / 3 : 1;
  const sizes: Record<string, [number, number]> = {
    "16:9": [1920, 1080],
    "9:16": [1080, 1920],
    "1:1": [1080, 1080],
    "4:5": [1080, 1350],
  };
  return (sizes[format] || sizes["16:9"]).map(
    (n) => Math.round((n * scale) / 2) * 2,
  ) as [number, number];
}
export function createComposition(
  input: HyperframesInput,
  audioDuration?: number,
) {
  const { project, brand, accent } = input;
  const [width, height] = dimensions(project.format, input.quality);
  const intro = 3;
  const rawTotal = project.scenes.reduce((sum, s) => sum + s.duration, 0);
  const narrationDuration = audioDuration || rawTotal;
  const factor = narrationDuration / rawTotal;
  const duration = intro + narrationDuration;
  const unit = Math.min(width, height) / 1080;
  const portrait = height > width;
  const templateId = input.templateId || "cinematic";
  const motion = motionDesign(templateId, accent, unit, portrait);
  const titleText = motion.logo ? brand : project.name;
  const titleHtml = motion.wordTitle
    ? titleText
        .split(/\s+/)
        .map((word) => `<span class="title-word">${escapeHtml(word)}</span>`)
        .join(" ")
    : escapeHtml(titleText);
  let cursor = intro;
  const animations: string[] = [];
  const scenes = project.scenes
    .map((scene, index) => {
      const start = cursor;
      const length = scene.duration * factor;
      cursor += length;
      const fade = Math.min(0.55, length / 5);
      const sceneId = `scene-${index}`;
      animations.push(
        `tl.fromTo('#${sceneId} .visual',{scale:1.03},{scale:${scene.transition === "Zoom" ? 1.16 : 1.09},duration:${length},ease:'none'},${start});`,
      );
      if (scene.transition !== "Coupe")
        animations.push(
          `tl.fromTo('#${sceneId}',{opacity:0},{opacity:1,duration:${fade},ease:'none'},${start});`,
        );
      const tokens = scene.text.trim().split(/\s+/).filter(Boolean);
      const groups: Array<string> = [];
      for (let i = 0; i < tokens.length; i += portrait ? 7 : 10)
        groups.push(tokens.slice(i, i + (portrait ? 7 : 10)).join(" "));
      const captions = groups
        .map((text, j) => {
          const at = start + (j * length) / groups.length;
          const span = length / groups.length;
          const captionId = `#caption-${index}-${j}`;
          let captionHtml = escapeHtml(text);
          if (templateId === "kinetic" || templateId === "bounce") {
            captionHtml = text
              .split(/\s+/)
              .map(
                (word) =>
                  `<span class="caption-word">${escapeHtml(word)}</span>`,
              )
              .join(" ");
            const count = text.split(/\s+/).length;
            animations.push(
              `tl.fromTo('${captionId} .caption-word',{y:35,scale:${templateId === "bounce" ? 0 : 1},opacity:0},{y:0,scale:1,opacity:1,duration:${Math.min(0.5, span / 3)},stagger:${Math.min(0.08, span / (count * 3))},ease:'back.out(1.6)'},${at});`,
            );
          } else if (templateId === "typewriter" || templateId === "split") {
            animations.push(
              `tl.fromTo('${captionId}',{clipPath:'${templateId === "split" ? "inset(50% 0 50% 0)" : "inset(0 100% 0 0)"}'},{clipPath:'inset(0% 0% 0% 0%)',duration:${Math.min(1, span * 0.6)},ease:'${templateId === "typewriter" ? "steps(20)" : "power3.out"}'},${at});`,
            );
          } else {
            animations.push(
              `tl.fromTo('${captionId}',{y:22,opacity:0},{y:0,opacity:1,duration:${Math.min(0.25, span / 4)},ease:'power2.out'},${at});`,
            );
          }
          return `<div id="caption-${index}-${j}" class="caption clip" data-start="${at}" data-duration="${span}" data-track-index="3"><span>${captionHtml}</span></div>`;
        })
        .join("");
      return `<section id="${sceneId}" class="scene clip" data-start="${start}" data-duration="${length}" data-track-index="1"><img class="visual" src="scene-${index}.jpg" alt=""/><div class="shade"></div><div class="scene-number">${String(index + 1).padStart(2, "0")} <span>/ ${String(project.scenes.length).padStart(2, "0")}</span></div></section>${captions}`;
    })
    .join("");
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(project.name)}</title><script src="gsap.min.js"></script><style>
*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;background:#0b0d13;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:white}#composition{position:relative;width:${width}px;height:${height}px;overflow:hidden;background:#0b0d13}.clip{position:absolute}.scene,.intro{inset:0;width:100%;height:100%;overflow:hidden}.visual{position:absolute;width:100%;height:100%;object-fit:cover}.shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(5,8,17,.86),rgba(8,12,22,.1) 70%)}.intro .shade{background:linear-gradient(90deg,rgba(7,11,23,.95),rgba(7,11,23,.35))}.brand{position:absolute;z-index:20;left:${width * 0.065}px;top:${height * 0.055}px;font-size:${20 * unit}px;letter-spacing:${5 * unit}px;color:#eee5ff;font-weight:700}.brand b{color:${accent};font-size:${32 * unit}px;margin-right:${12 * unit}px}.intro-copy{position:absolute;left:8%;right:8%;top:29%;z-index:2}.eyebrow{font-size:${19 * unit}px;letter-spacing:${6 * unit}px;color:${accent};margin-bottom:${28 * unit}px}.title{font-size:${(portrait ? 72 : 84) * unit}px;line-height:1.07;letter-spacing:${-3 * unit}px;max-width:95%;font-weight:700;overflow-wrap:anywhere}.line{margin-top:${40 * unit}px;width:${130 * unit}px;height:${5 * unit}px;background:${accent};transform-origin:left}.intro-note{color:#b9beca;font-size:${23 * unit}px;margin-top:${25 * unit}px;letter-spacing:${2 * unit}px}.caption{z-index:12;bottom:14%;left:9%;right:9%;text-align:center;font-size:${(project.subtitle === "Bold" ? 55 : 45) * unit}px;line-height:1.35;font-weight:650;text-shadow:0 3px 20px #000}.caption span{background:rgba(8,10,17,.7);box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:${8 * unit}px ${17 * unit}px;border-radius:${8 * unit}px}.subtitle-viral .caption{color:${accent};text-transform:uppercase;font-weight:800}.subtitle-documentary .caption{font-family:Georgia,serif}.subtitle-clean .caption{font-size:${38 * unit}px}.scene-number{position:absolute;top:6%;right:7%;font-size:${22 * unit}px;color:#fff}.scene-number span{color:#ffffff70}.progress{position:absolute;bottom:0;left:0;width:100%;height:${5 * unit}px;background:${accent};z-index:25;transform-origin:left}.footer{position:absolute;bottom:5%;left:7%;font-size:${16 * unit}px;letter-spacing:${4 * unit}px;color:#ffffff80;z-index:20}
${motion.css}</style></head><body><main id="composition" class="motion-${templateId} subtitle-${escapeHtml(project.subtitle.toLowerCase())}" data-composition-id="mindstudio-cinematic" data-start="0" data-duration="${duration}" data-width="${width}" data-height="${height}" data-fps="24"><section id="intro" class="intro clip" data-start="0" data-duration="3" data-track-index="0"><img class="visual" src="scene-0.jpg" alt=""/><div class="shade"></div>${motion.artwork}<div class="intro-copy"><div class="logo-symbol">${escapeHtml(input.logoText || "MS")}</div><div class="eyebrow">UNE NOUVELLE PERSPECTIVE</div><div class="title">${titleHtml}</div><div class="line"></div><div class="intro-note">Une histoire. Une voix. Une vision.</div></div></section>${scenes}<div class="brand"><b>◉</b>${escapeHtml(brand)}</div><div class="footer">CRÉEZ AVEC INTENTION</div><div class="progress"></div>${audioDuration ? `<audio id="narration" src="narration.mp3" data-start="3" data-duration="${audioDuration}" data-track-index="4" data-volume="1"></audio>` : ""}</main><script>
const tl=gsap.timeline({paused:true});
tl.fromTo('#intro .visual',{scale:1},{scale:1.09,duration:3,ease:'none'},0);
tl.fromTo('.eyebrow',{opacity:0,y:14},{opacity:1,y:0,duration:.5},.1);
${motion.animation}
tl.fromTo('.line',{scaleX:0},{scaleX:1,duration:.7,ease:'power2.out'},.6);
tl.fromTo('.intro-note',{opacity:0},{opacity:1,duration:.5},.85);
${animations.join("\n")}
tl.fromTo('.progress',{scaleX:0},{scaleX:1,duration:${duration},ease:'none'},0);
window.__timelines={'mindstudio-cinematic':tl};
</script></body></html>`;
  return { html, duration, width, height };
}
export function previewDocument(
  width: number,
  height: number,
  duration: number,
) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>*{box-sizing:border-box}body{margin:0;background:#090a10;color:#d7d2e0;font:12px Arial}#stage{height:calc(100vh - 50px);display:flex;align-items:center;justify-content:center;overflow:hidden}#frame{border:0;flex-shrink:0;transform-origin:center}#controls{height:50px;display:flex;align-items:center;gap:12px;padding:0 14px;background:#1d1926}button{background:#8b72d8;color:white;border:0;border-radius:5px;padding:7px 12px;cursor:pointer}input{flex:1;accent-color:#b39bed;min-width:20px}span{white-space:nowrap;font-variant-numeric:tabular-nums}</style></head><body><div id="stage"><iframe id="frame" title="Composition MindStudio" src="index.html" width="${width}" height="${height}"></iframe></div><div id="controls"><button id="play">Lire</button><input id="seek" aria-label="Position de lecture" type="range" min="0" max="${duration}" step="0.04" value="0"><span id="time">0:00</span><span>/${Math.ceil(duration)} s</span></div><script>
const frame=document.getElementById('frame'),stage=document.getElementById('stage'),button=document.getElementById('play'),seek=document.getElementById('seek');let time=0,playing=false,last=0,ready=false;
function resize(){frame.style.transform='scale('+Math.min(stage.clientWidth/${width},stage.clientHeight/${height})+')';}window.addEventListener('resize',resize);resize();
function paint(){if(!ready)return;const doc=frame.contentDocument;frame.contentWindow.__timelines['mindstudio-cinematic'].seek(time,false);doc.querySelectorAll('[data-start]').forEach(el=>{if(el.id==='composition'||el.tagName==='AUDIO')return;const start=Number(el.dataset.start),end=start+Number(el.dataset.duration);el.style.visibility=time>=start&&time<end?'visible':'hidden';});seek.value=time;document.getElementById('time').textContent=Math.floor(time/60)+':'+String(Math.floor(time%60)).padStart(2,'0');}
function audioSync(){const audio=frame.contentDocument?.querySelector('audio');if(!audio)return;const inside=time>=3&&time<${duration};if(inside){audio.currentTime=time-3;if(playing)audio.play().catch(()=>{button.textContent='Audio indisponible';});else audio.pause();}else audio.pause();}
frame.onload=()=>{ready=true;paint();};button.onclick=()=>{if(!ready)return;if(time>=${duration})time=0;playing=!playing;last=performance.now();button.textContent=playing?'Pause':'Lire';paint();audioSync();};seek.oninput=()=>{time=Number(seek.value);paint();audioSync();};
function tick(now){if(playing){time=Math.min(${duration},time+(now-last)/1000);if(time>=${duration}){playing=false;button.textContent='Relire';audioSync();}paint();}last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);
</script></body></html>`;
}
