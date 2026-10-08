import { familyCss } from "./families";
import { captionGroups, captionLines } from "./captions";
import { sceneArtwork, sceneArtCss, artVariantCss } from "./scene-art";
import type { MotionEdit, SourceVideo } from "../schemas/motion-edit";
import { escapeHtml } from "./composition";
import { findMotionTemplate } from "./templates";
export function overlayDimensions(source: SourceVideo, quality: string) {
  const limit = quality === "720p" ? 720 : 1080;
  const scale = Math.min(1, limit / Math.min(source.width, source.height));
  return [
    Math.max(2, Math.round((source.width * scale) / 2) * 2),
    Math.max(2, Math.round((source.height * scale) / 2) * 2),
  ];
}
export function overlayComposition(
  edit: MotionEdit,
  source: SourceVideo,
  options: {
    preview?: boolean;
    initialTime?: number;
    silent?: boolean;
    editable?: boolean;
  } = {},
) {
  const audioOnly = source.kind === "audio";
  const canvasSource = audioOnly
    ? {
        ...source,
        width: edit.canvas === "9:16" ? 1080 : 1920,
        height: edit.canvas === "16:9" || !edit.canvas ? 1080 : 1920,
      }
    : source;
  const [width, height] = overlayDimensions(canvasSource, edit.quality);
  const unit = Math.min(width, height) / 1080;
  const duration = source.duration;
  const preview = Boolean(options.preview);
  const media = preview
    ? `/api/motion/media/${source.id}`
    : audioOnly
      ? "source.wav"
      : "source.mp4";
  const runtime = preview ? "/api/motion/runtime" : "gsap.min.js";
  const identity = edit.identity?.enabled ? edit.identity : undefined;
  const captionHighlight =
    !edit.captions?.style && identity?.captionStyle === "highlight";
  const fonts = {
    sans: "Arial,Helvetica,sans-serif",
    serif: "Georgia,serif",
    mono: "monospace",
  };
  const identityCss = identity
    ? `.overlay{--accent:${identity.accent}!important}.context-backdrop{background:${identity.background}!important}.context-copy .content,.context-copy small,.context-brand,.context-index{color:${identity.text}!important;font-family:${fonts[identity.font]}!important}.caption{font-family:${fonts[identity.font]};${!edit.captions?.style && identity.captionStyle === "plain" ? "background:transparent;text-shadow:0 2px 8px #000;" : captionHighlight ? `background:${identity.accent};color:${identity.background};` : ""}}`
    : "";
  const anim: string[] = [];
  const layers = edit.layers
    .filter((l) => l.enabled)
    .map((original, i) => {
      const l = identity
        ? {
            ...original,
            color: identity.accent,
            brand: identity.signature || original.brand,
          }
        : original;
      const id = `overlay-${l.id}`,
        selector = `#${id} .content`,
        d = Math.min(0.8, l.duration * 0.3),
        t = l.start;
      const template = findMotionTemplate(l.templateId);
      const logo = template.category === "Logo";
      const words = l.templateId === "kinetic" || l.templateId === "bounce";
      const content = words
        ? l.text
            .trim()
            .split(/\s+/)
            .map((w) => `<span class="word">${escapeHtml(w)}</span>`)
            .join(" ")
        : escapeHtml(l.text);
      if (l.contextual) {
        const target = `#${id} .illustration`,
          motion = l.motion || ["slide", "zoom", "orbit", "float"][i % 4];
        if (motion === "slide")
          anim.push(
            `tl.fromTo('${target}',{x:-90,opacity:0},{x:0,opacity:1,duration:${d},ease:'power3.out'},${t});`,
          );
        if (motion === "zoom")
          anim.push(
            `tl.fromTo('${target}',{scale:.55,rotation:-8,opacity:0},{scale:1,rotation:0,opacity:1,duration:${d},ease:'back.out(1.2)'},${t});`,
          );
        if (motion === "orbit")
          anim.push(
            `tl.fromTo('${target}',{rotation:-12,scale:.8,opacity:0},{rotation:0,scale:1,opacity:1,duration:${d},ease:'power2.out'},${t});tl.to('#${id} .art-orbit',{rotation:180,duration:${l.duration},ease:'none'},${t});`,
          );
        if (motion === "float")
          anim.push(
            `tl.fromTo('${target}',{y:14},{y:-14,duration:${l.duration / 2},repeat:1,yoyo:true,ease:'sine.inOut'},${t});`,
          );
      }
      if (l.family === "blueprint")
        anim.push(
          `tl.fromTo('#${id} .piece',{opacity:0},{opacity:1,duration:${d},stagger:${Math.min(0.08, l.duration / 20)},ease:'none'},${t});`,
        );
      if (l.family === "cinematic" && l.media?.kind === "image")
        anim.push(
          `tl.fromTo('#${id} .scene-media',{scale:1},{scale:1.12,duration:${l.duration},ease:'none'},${t});`,
        );
      if (l.transition === "fade") {
        const fade = Math.min(l.transitionDuration ?? 0.35, l.duration / 2);
        anim.push(
          `tl.fromTo('#${id}',{opacity:0},{opacity:${l.opacity},duration:${fade},ease:'none'},${t});tl.to('#${id}',{opacity:0,duration:${fade},ease:'none'},${t + l.duration - fade});`,
        );
      }
      const base = `duration:${d},ease:'power3.out'`;
      switch (l.templateId) {
        case "kinetic":
        case "bounce":
          anim.push(
            `tl.fromTo('${selector} .word',{opacity:0,y:35,scale:${l.templateId === "bounce" ? 0.1 : 1}},{opacity:1,y:0,scale:1,duration:${d},stagger:${Math.min(0.07, (l.duration * 0.25) / Math.max(1, l.text.split(/\s+/).length))},ease:'back.out(1.6)'},${t});`,
          );
          break;
        case "typewriter":
          anim.push(
            `tl.fromTo('${selector}',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:${l.duration * 0.55},ease:'steps(24)'},${t});`,
          );
          break;
        case "split":
        case "logo-minimal":
          anim.push(
            `tl.fromTo('${selector}',{clipPath:'inset(50% 0 50% 0)'},{clipPath:'inset(0% 0 0% 0)',${base}},${t});`,
          );
          break;
        case "logo-stamp":
          anim.push(
            `tl.fromTo('${selector}',{scale:2.5,rotation:20,opacity:0},{scale:1,rotation:0,opacity:1,${base}},${t});`,
          );
          break;
        case "logo-orbit":
          anim.push(
            `tl.fromTo('${selector}',{scale:.2,opacity:0},{scale:1,opacity:1,${base}},${t});tl.fromTo('#${id} .ring',{rotation:0},{rotation:180,duration:${l.duration},ease:'none'},${t});`,
          );
          break;
        case "outline":
          anim.push(
            `tl.fromTo('${selector}',{scale:1.4,opacity:0},{scale:1,opacity:1,${base}},${t});`,
          );
          break;
        case "neon":
          anim.push(
            `tl.fromTo('${selector}',{opacity:.1},{opacity:1,duration:${d / 5},repeat:4,yoyo:true},${t});`,
          );
          break;
        case "call-to-action":
          anim.push(
            `tl.fromTo('${selector}',{scale:.4,opacity:0},{scale:1,opacity:1,duration:${d},ease:'back.out(2)'},${t});`,
          );
          break;
        default:
          anim.push(
            `tl.fromTo('${selector}',{x:${l.templateId === "lower-third" ? -80 : 0},y:20,opacity:0},{x:0,y:0,opacity:1,${base}},${t});`,
          );
      }
      anim.push(
        `tl.to('${selector}',{opacity:0,duration:${Math.min(0.2, l.duration * 0.15)},ease:'none'},${l.start + l.duration - Math.min(0.2, l.duration * 0.15)});`,
      );
      let artwork = sceneArtwork(l.illustration || "abstract", {
        title: l.artTitle,
        tagline: l.artTagline,
        symbol: l.artSymbol,
        variant: l.artVariant || ["minimal", "orbit", "cards"][i % 3],
      });
      if (l.media) {
        const asset = l.media;
        const url = preview
          ? `/api/motion/assets/${asset.kind}/${asset.id}`
          : `asset-${asset.id}.${asset.kind === "image" ? "png" : "mp4"}`;
        const fit = l.mediaFit || "contain";
        artwork =
          asset.kind === "image"
            ? `<div class="scene-media"><img src="${url}" style="object-fit:${fit}" alt=""></div>`
            : `<div class="scene-media">${Array.from(
                {
                  length: Math.min(60, Math.ceil(l.duration / asset.duration)),
                },
                (_, n) => {
                  const begin = l.start + n * asset.duration,
                    span = Math.min(
                      asset.duration,
                      l.start + l.duration - begin,
                    );
                  return `<video class="asset-clip" src="${url}" style="object-fit:${fit}" muted playsinline preload="auto" data-start="${begin}" data-duration="${span}" data-track-index="${i + 40}" data-volume="0"></video>`;
                },
              ).join("")}</div>`;
        if (asset.kind === "image")
          anim.push(
            `tl.fromTo('#${id} .scene-media img',{scale:1},{scale:1.05,duration:${l.duration},ease:'none'},${t});`,
          );
      }
      if (l.contextual)
        return `<section id="${id}" class="overlay contextual layout-${l.layout || "split"} family-${l.family || "default"} clip" data-start="${l.start}" data-duration="${l.duration}" data-track-index="${i + 1}" style="--accent:${l.color};color:${l.color};opacity:${l.opacity};z-index:${i + 10}"><div class="context-backdrop"></div>${l.brand ? `<div class="context-brand">${escapeHtml(l.brand)}</div>` : ""}${l.counter ? `<div class="context-index">${escapeHtml(l.counter)}</div>` : ""}<div class="context-layout" style="left:${l.x}%;top:${l.y}%"><div class="illustration">${artwork}</div><div class="context-copy">${l.chapter ? `<small>${escapeHtml(l.chapter)}</small>` : ""}<div class="content" style="font-size:${l.size * unit}px"><span class="label">${content}</span></div></div></div></section>`;
      return `<div id="${id}" class="overlay clip style-${l.templateId} ${logo ? "logo" : ""}" data-start="${l.start}" data-duration="${l.duration}" data-track-index="${i + 1}" style="left:${l.x}%;top:${l.y}%;font-size:${l.size * unit}px;color:${l.color};--accent:${l.color};opacity:${l.opacity};z-index:${i + 10}"><div class="content">${l.templateId === "logo-orbit" ? '<i class="ring"></i>' : ""}<span class="label">${content || "&nbsp;"}</span></div></div>`;
    })
    .join("");
  const captions = edit.captions?.enabled
    ? captionGroups(edit.captions.words, duration, edit.captions)
        .map((group, i) => {
          const id = `caption-${i}`,
            start = group[0].start,
            end = group.at(-1)!.end;
          anim.push(
            `tl.set('#${id}',{autoAlpha:0},0);tl.set('#${id}',{autoAlpha:1},${start});tl.set('#${id}',{autoAlpha:0},${end});`,
          );
          if (edit.captions?.activeWord !== false)
            group.forEach((word, j) =>
              anim.push(
                `tl.set('#${id}-w${j}',{color:'${captionHighlight ? identity!.text : identity?.accent || "#c8f36b"}'},${word.start});tl.set('#${id}-w${j}',{color:'${captionHighlight ? identity!.background : "#fff"}'},${word.end});`,
              ),
            );
          const keys = (edit.captions?.keywords || []).map((k) =>
            k.toLocaleLowerCase(),
          );
          let index = 0;
          return `<div class="caption caption-${edit.captions?.style || "box"}" id="${id}">${captionLines(
            group,
            edit.captions?.maxChars ?? 32,
          )
            .map(
              (line) =>
                `<div>${line
                  .map((w) => {
                    const emphasis = keys.includes(
                      w.text.toLocaleLowerCase().replace(/[.,!?;:…]/g, ""),
                    );
                    return `<span class="${emphasis ? "caption-keyword" : ""}" id="${id}-w${index++}">${escapeHtml(w.text)}</span>`;
                  })
                  .join(" ")}</div>`,
            )
            .join("")}</div>`;
        })
        .join("")
    : "";
  const sourceElement = audioOnly
    ? `<audio id="source-video" src="${media}" data-start="0" data-duration="${duration}" data-track-index="0" data-volume="${options.silent ? 0 : 1}" ${options.silent ? "muted" : ""} preload="auto"></audio>`
    : `<video id="source-video" src="${media}" data-start="0" data-duration="${duration}" data-track-index="0" data-volume="0" muted playsinline preload="auto"></video>`;
  const controls = preview
    ? '<div id="controls"><button id="play">Lire</button><input id="seek" aria-label="Position de lecture" type="range" min="0" step="0.01" max="' +
      duration +
      '" value="0"><span id="time">0:00</span></div>'
    : "";
  const previewScript = preview
    ? `const video=document.getElementById('source-video'),audio=document.getElementById('source-audio'),button=document.getElementById('play'),seek=document.getElementById('seek'),stage=document.getElementById('stage'),composition=document.getElementById('composition');let playing=false;let loopRange=null;let lastReport=0;
function resize(){composition.style.transform='translate(-50%,-50%) scale('+Math.min(stage.clientWidth/${width},stage.clientHeight/${height})+')';}window.addEventListener('resize',resize);resize();
function paint(){const t=video.currentTime;tl.seek(t,false);document.querySelectorAll('.overlay').forEach(el=>el.style.visibility=t>=Number(el.dataset.start)&&t<Number(el.dataset.start)+Number(el.dataset.duration)?'visible':'hidden');document.querySelectorAll('.asset-clip').forEach(v=>{const start=Number(v.dataset.start),end=start+Number(v.dataset.duration),active=t>=start&&t<end;v.style.visibility=active?'visible':'hidden';if(active){const desired=Math.min(Math.max(0,t-start),Math.max(0,(v.duration||600)-.02));if(Math.abs(v.currentTime-desired)>.15)v.currentTime=desired;if(playing&&v.paused)v.play().catch(()=>{});else if(!playing)v.pause();}else v.pause();});seek.value=t;document.getElementById('time').textContent=t.toFixed(1)+' / ${duration.toFixed(1)} s';}
video.addEventListener('loadedmetadata',()=>{video.currentTime=${Math.min(duration - 0.01, Math.max(0, options.initialTime || 0))};paint();});video.addEventListener('seeked',paint);video.addEventListener('error',()=>{button.textContent='Source indisponible — réimportez la vidéo';});video.addEventListener('ended',()=>{playing=false;button.textContent='Relire';audio?.pause();if(loopRange){video.currentTime=loopRange.start;button.click();}paint();});
button.onclick=async()=>{if(playing){video.pause();audio?.pause();playing=false;}else{if(video.currentTime>=${duration}-.05)video.currentTime=0;try{if(audio){audio.currentTime=video.currentTime;await audio.play();}await video.play();playing=true;}catch{audio?.pause();playing=false;button.textContent='Lecture indisponible';return;}}button.textContent=playing?'Pause':'Lire';};
seek.oninput=()=>{video.currentTime=Number(seek.value);if(audio)audio.currentTime=video.currentTime;paint();};window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='motion-transport')return;const c=e.data;if(c.action==='seek'&&Number.isFinite(c.time)){video.currentTime=Math.max(0,Math.min(${duration},c.time));if(audio)audio.currentTime=video.currentTime;paint();}if(c.action==='play'&&!playing)button.click();if(c.action==='pause'&&playing)button.click();if(c.action==='loop'){loopRange=c.enabled&&Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.end>c.start?{start:Math.max(0,c.start),end:Math.min(${duration},c.end)}:null;}});
function tick(){if(playing){if(loopRange&&(video.currentTime>=loopRange.end||video.currentTime<loopRange.start)){video.currentTime=loopRange.start;if(audio)audio.currentTime=loopRange.start;}paint();if(audio&&Math.abs(audio.currentTime-video.currentTime)>.2)audio.currentTime=video.currentTime;}if(performance.now()-lastReport>80){parent.postMessage({type:'motion-position',time:video.currentTime},location.origin);lastReport=performance.now();}requestAnimationFrame(tick);}paint();requestAnimationFrame(tick);`
    : "";
  const editScript =
    preview && options.editable
      ? `document.querySelectorAll('.overlay .label').forEach(label=>{label.style.cursor='text';label.title='Double-cliquez pour modifier ce titre';label.ondblclick=()=>{video.pause();audio?.pause();playing=false;button.textContent='Lire';label.textContent=label.textContent;label.contentEditable='plaintext-only';label.focus();};label.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();label.blur();}};label.onblur=()=>{if(label.isContentEditable){label.contentEditable='false';parent.postMessage({type:'motion-title',id:label.closest('.overlay').id.slice(8),text:label.textContent.slice(0,240)},location.origin);}};});`
      : "";
  return {
    width,
    height,
    duration,
    html: `<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="${runtime}"></script><style>*{box-sizing:border-box}html,body{margin:0;background:#08090e;color:white;font-family:Arial,sans-serif;overflow:hidden}#composition{position:relative;width:${width}px;height:${height}px;overflow:hidden}#source-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.overlay{position:absolute;transform:translate(-50%,-50%);width:80%;text-align:center;line-height:1.15;font-weight:800;overflow-wrap:anywhere}.content{position:relative;display:inline-block;max-width:100%;white-space:pre-wrap;text-shadow:0 2px 12px #000b}.scene-media{position:relative;aspect-ratio:1;overflow:hidden;border-radius:5%;background:#ffffff05}.scene-media img,.scene-media video{position:absolute;inset:0;width:100%;height:100%}.word{display:inline-block}.caption{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);width:max-content;max-width:85%;padding:.35em .6em;background:#08110ee6;color:#fff;font-size:${36 * unit}px;line-height:1.4;text-align:center;font-weight:600;border-radius:.3em;z-index:1000;visibility:hidden}.caption span{display:inline-block}.overlay.contextual{inset:0;transform:none;width:100%;height:100%;text-align:left;font-weight:800}.context-backdrop{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 40%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 70%),#10121bf2}.context-layout{position:absolute;transform:translate(-50%,-50%);width:86%;display:flex;align-items:center;gap:6%}.illustration{width:48%;flex-shrink:0}.illustration svg{width:100%;overflow:visible}.illustration .piece{fill:color-mix(in srgb,var(--accent) 14%,transparent)}.context-copy{flex:1;min-width:0}.context-copy small{display:block;letter-spacing:.22em;font-size:${18 * unit}px;margin-bottom:${25 * unit}px;opacity:.7}.context-copy .content{color:white;text-shadow:none;line-height:1.2}.contextual .label{overflow-wrap:anywhere}${height > width ? ".context-layout{flex-direction:column;gap:30px;text-align:center}.illustration{width:85%}.context-copy{width:100%}" : ""}.style-lower-third .content{border-left:.12em solid var(--accent);background:#10131de6;padding:.3em .5em;text-align:left}.style-call-to-action .content{background:var(--accent);color:#111;text-shadow:none;padding:.3em .6em;border-radius:2em}.style-outline .content{color:transparent;-webkit-text-stroke:2px var(--accent);text-shadow:none}.style-neon .content{text-shadow:0 0 .25em var(--accent),0 2px 10px #000}.logo .content{min-width:2.4em;min-height:2.4em;padding:.5em;border:.035em solid var(--accent);border-radius:.3em;background:#111a;display:inline-flex;align-items:center;justify-content:center}.style-logo-stamp .content{border-radius:50%}.ring{position:absolute;inset:-.3em;border:1px dashed var(--accent);border-radius:50%}.label{position:relative}.style-cinematic .content{letter-spacing:.03em}.context-backdrop{background:radial-gradient(ellipse at 25% 35%,color-mix(in srgb,var(--accent) 9%,transparent),transparent 65%),#101714}.context-layout{width:86%;gap:7%}.illustration{width:49%;font-size:${180 * unit}px}.context-copy small{font-size:${15 * unit}px;letter-spacing:.24em;margin-bottom:${26 * unit}px;color:var(--accent);opacity:1}.context-copy .content{font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:-.04em;line-height:1.04;color:#f4f5ea;font-size:1.4em}.context-brand{position:absolute;top:6%;left:7%;font-size:${14 * unit}px;letter-spacing:.24em;color:#e2e8d8;opacity:.65}.context-index{position:absolute;bottom:6%;right:7%;font-size:${22 * unit}px;color:var(--accent)}.context-index span{color:#819084}.layout-editorial .context-layout{flex-direction:row-reverse}.layout-editorial .context-copy{border-left:3px solid var(--accent);padding-left:3%}.layout-poster .context-layout{gap:2%;}.layout-poster .illustration{width:42%;transform:rotate(5deg)}.layout-poster .context-copy{border-top:2px solid var(--accent);padding-top:4%}.layout-poster .context-copy small{color:#d8dfd1}${height > width ? ".context-layout,.layout-editorial .context-layout{flex-direction:column;gap:24px}.illustration,.layout-poster .illustration{width:75%}.context-copy{width:100%}.layout-editorial .context-copy{border-left:0}.context-copy .content{line-height:1.1}" : ""}${sceneArtCss}${artVariantCss}.layout-typography .illustration{display:none}.layout-typography .context-copy{width:100%;text-align:center}.layout-typography .context-copy .content{font-size:${100 * unit}px!important;max-width:90%;line-height:1.1}.layout-cinema .context-layout{width:100%;height:100%}.layout-cinema .illustration{position:absolute;inset:0;width:100%;opacity:.5}.layout-cinema .scene-media{height:100%;aspect-ratio:auto;border-radius:0}.layout-cinema .art-world{width:70%;margin:auto}.layout-cinema .context-copy{position:absolute;left:8%;bottom:20%;width:75%;text-shadow:0 3px 25px #000}.layout-cinema .context-copy .content{background:#08110eb0;padding:.25em}.art-heading:empty{display:none}${familyCss}${identityCss}.caption-outline{background:transparent;text-shadow:-1px -1px 2px #000,1px 1px 2px #000,0 3px 8px #000}.caption-editorial{border-left:4px solid ${identity?.accent || "#c8f36b"};border-radius:0;text-align:left;background:#101714e8}.caption-pill{border-radius:2em;background:#080e16f2;padding:.45em 1em}.caption-keyword{font-weight:900;text-decoration:underline;text-decoration-color:${identity?.accent || "#c8f36b"};text-underline-offset:.18em}.caption>div{white-space:normal;overflow-wrap:anywhere}.caption span{max-width:100%;overflow-wrap:anywhere}${preview ? "html,body{width:100%;height:100%}#stage{height:calc(100vh - 46px);position:relative}#composition{position:absolute;left:50%;top:50%;transform-origin:center}#controls{height:46px;display:flex;gap:12px;align-items:center;padding:8px 12px;background:#211c2c;font-size:11px}#controls button{background:#b99bea;border:0;border-radius:5px;padding:6px 12px;color:#21152e;cursor:pointer}#seek{flex:1;min-width:25px;accent-color:#b99bea}" : ""}</style></head><body>${preview ? '<div id="stage">' : ""}<main id="composition" data-composition-id="mindstudio-overlay" data-start="0" data-duration="${duration}" data-width="${width}" data-height="${height}" data-fps="24">${sourceElement}${layers}${captions}${!audioOnly && source.hasAudio && edit.keepAudio ? `<audio id="source-audio" src="${media}" data-start="0" data-duration="${duration}" data-track-index="31" data-volume="1" preload="auto"></audio>` : ""}</main>${preview ? "</div>" : ""}${controls}<script>const tl=gsap.timeline({paused:true});${anim.join("\n")}tl.to({}, {duration:${duration}},0);window.__timelines={'mindstudio-overlay':tl};${previewScript}${editScript}</script></body></html>`,
  };
}
