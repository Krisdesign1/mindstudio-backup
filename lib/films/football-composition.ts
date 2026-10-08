import {
  molotoFrame,
  molotoMotion,
  molotoCss,
  molotoFitScript,
} from "./moloto-direction";
import { molotoVisual, animateMoloto } from "./moloto-art";
import { reviensVisual, animateReviens } from "./reviens-art";
import { mourinhoVisual, animateMourinho } from "./mourinho-art";
import type { FootballFilm, FootballScene } from "./mbappe";
import { footballWords } from "./mbappe";
import { subtitleCues } from "../hyperframes/captions";
import { escapeHtml as esc } from "../hyperframes/composition";
const player = (
  x: number,
  y: number,
  scale = 1,
  color = "var(--accent)",
  extra = "",
) =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><g class="athlete ${extra}"><ellipse cy="145" rx="58" ry="12" fill="#000" opacity=".5"/><path d="M-22 46 L-28 97 -48 137 -24 144 0 98 9 70 20 100 35 143 60 138 42 87 24 43" fill="#e1e7df"/><path d="M-28 -28 L-57 18 -44 32 -24 6 -24 56 25 56 26 5 48 27 63 11 30 -29 14 -37 -14 -37Z" fill="${color}"/><path d="M-16 -34 Q0 -18 16 -34" fill="none" stroke="#081511" stroke-width="5"/><circle cy="-65" r="24" fill="#be9476"/><path d="M-24 -70 Q-20 -100 10 -88 Q27 -85 25 -65 L14 -73 -13 -72Z" fill="#111b19"/><path d="M-24 53 H25 V77 H-26Z" fill="#162823"/><path d="M-49 138 l-10 10 38 0 -3 -11 M35 138 l-1 10 38 0 -13 -11" fill="#fafaf0"/><path d="M-10 -10 L11 -10 0 18" fill="none" stroke="#0d2419" stroke-width="5"/></g></g>`;
const ball = (x: number, y: number, extra = "") =>
  `<g transform="translate(${x} ${y})"><g class="ball ${extra}"><circle r="19" fill="#f3f5e9" stroke="#10201c" stroke-width="2"/><path d="M0 -9 L9 -3 6 8 -6 8 -10 -3Z M-16 -8 L-11 -14 M16 -8 L12 -14 M-14 12 L-10 16 M14 12 L10 16" fill="#13231e" stroke="#13231e" stroke-width="3"/></g></g>`;
const txt = (
  x: number,
  y: number,
  text: string,
  size = 24,
  color = "var(--paper)",
  cls = "",
) =>
  `<text class="${cls}" x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="800" font-family="Arial,sans-serif">${esc(text)}</text>`;
const pitch = `<g class="pitch" fill="none" stroke="#d8f0df" stroke-opacity=".24" stroke-width="2"><rect x="130" y="200" width="1020" height="355" rx="2"/><path d="M640 200V555 M130 270H280V480H130 M1150 270H1000V480H1150"/><circle cx="640" cy="377" r="90"/><circle cx="640" cy="377" r="4" fill="#d8f0df"/></g>`;
const goal = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})" fill="none" stroke="#dce7dc" stroke-width="3"><path d="M0 100V0H180V100 M0 0L25 -30H205V70L180 100 M180 0L205 -30"/><path d="M30 0V100 M60 0V100 M90 0V100 M120 0V100 M150 0V100 M0 25H180 M0 50H180 M0 75H180" opacity=".25"/></g>`;
const spot = (x: number, color = "var(--accent)") =>
  `<path d="M${x - 35} 0L${x - 165} 520Q${x} 585 ${x + 165} 520L${x + 35} 0Z" fill="${color}" opacity=".07"/>`;
function visual(s: FootballScene) {
  if (s.id.startsWith("legacy-")) return molotoVisual(s);
  if (s.id.startsWith("faith-")) return reviensVisual(s);
  const label = (i: number) => s.labels[i] || "";
  if (
    s.id.startsWith("press-") ||
    ![
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
    ].includes(s.id)
  )
    return mourinhoVisual(s);
  switch (s.id) {
    case "tunnel":
      return `<g class="stadium"><path d="M-50 100Q640 -120 1330 100L1190 290H90Z" fill="#1a3028"/><path d="M100 135Q640 -30 1180 135 M130 160Q640 15 1150 160 M150 185Q640 60 1130 185" fill="none" stroke="#395445" stroke-width="7"/><path d="M370 570L550 220H730L910 570Z" fill="#070e0d"/>${spot(640)}${pitch}</g>${player(640, 355, 1.5)}<g class="press">${[180, 330, 950, 1100].map((x, i) => `<g transform="translate(${x} ${440 + (i % 2) * 35}) rotate(${x < 640 ? -20 : 20})"><rect x="-10" y="0" width="20" height="120" fill="#617068"/><rect x="-25" y="-40" width="50" height="60" rx="18" fill="#263c33" stroke="#a5b5a4"/></g>`).join("")}</g>${txt(70, 273, label(0), 31, "var(--paper)", "side-label")}${txt(73, 305, label(1), 12, "var(--accent)")}`;
    case "age":
      return `${pitch}<g class="age-type">${txt(120, 475, "ÂGE", 300, "var(--accent)")}</g>${player(960, 385, 1.15)}<g class="tag"><rect x="820" y="450" width="310" height="65" rx="2" fill="var(--paper)"/>${txt(845, 492, label(0), 29, "#112019")}</g>`;
    case "shield":
      return `${pitch}${player(640, 365, 1.15)}${player(240, 390, 0.65, "#5d7667")}${player(1040, 390, 0.65, "#5d7667")}<g class="shield"><path d="M490 240Q640 180 790 240V380Q770 490 640 530Q510 490 490 380Z" fill="var(--accent)" fill-opacity=".08" stroke="var(--accent)" stroke-width="3"/>${txt(593, 275, label(0), 22, "var(--accent)")}</g>${txt(75, 240, label(1), 18, "var(--paper)", "side-label")}<path class="boundary" d="M80 540H1200" stroke="var(--accent)" stroke-width="4"/>`;
    case "entry":
      return `${pitch}<path d="M450 190V570" stroke="var(--paper)" stroke-width="6" stroke-dasharray="14 8"/>${txt(145, 270, label(0), 22)}${txt(540, 270, label(1), 22)}${txt(885, 270, label(2), 22, "var(--accent)")}<g class="run">${player(320, 355, 0.85)}</g>${ball(650, 475, "pass")}<path class="route" d="M355 520Q530 360 900 460" fill="none" stroke="var(--accent)" stroke-width="5" stroke-dasharray="900"/>`;
    case "tactics":
      return `${pitch}${[
        [300, 420],
        [530, 310],
        [760, 440],
        [980, 300],
      ]
        .map(
          ([x, y], i) =>
            `<g class="token t${i}"><circle cx="${x}" cy="${y}" r="26" fill="var(--accent)"/>${txt(x - 7, y + 8, String(i + 1), 22, "#102118")}</g>`,
        )
        .join(
          "",
        )}<path class="route" d="M300 420L530 310 760 440 980 300" stroke="var(--accent)" stroke-width="4" fill="none" stroke-dasharray="1100"/><path class="error-route" d="M760 440L935 505" stroke="#ff785e" stroke-width="4" fill="none" stroke-dasharray="220"/>${ball(300, 420, "pass")}${txt(150, 245, label(0), 21, "var(--accent)")}${txt(830, 535, label(1), 21, "#ff785e")}${txt(470, 580, label(2), 19)}`;
    case "equal":
      return `${spot(350)}${spot(930)}${pitch}${player(350, 350, 1.1)}${player(930, 335, 1.2, "#c4cdc0")}<g class="equal-sign">${txt(574, 412, "=", 110, "var(--accent)")}</g>${txt(220, 550, label(0), 23)}${txt(775, 550, label(1), 23)}${txt(467, 240, label(2), 24, "var(--accent)")}`;
    case "monaco":
      return `<g class="memory"><path d="M60 460V280L160 205 260 280V460 M270 460V260L370 185 470 260V460 M820 460V270L920 195 1020 270V460 M1030 460V285L1130 210 1230 285V460" fill="#273d32" stroke="#42604c" stroke-width="3"/><path d="M0 520Q640 340 1280 520L1280 610H0Z" fill="#143c29"/><path d="M0 540Q640 360 1280 540" fill="none" stroke="#8caa88" stroke-width="3"/>${txt(75, 290, label(0), 90, "#ececdc")}${txt(78, 328, label(1), 16, "var(--accent)")}</g>${player(740, 360, 1.15, "#ee4b4b")}${ball(845, 525)}<path d="M708 326L763 382" stroke="#fff" stroke-width="19"/>`;
    case "pressure":
      return `${pitch}<g class="pressure">${[
        [-1, 230, 280],
        [1, 970, 280],
        [-1, 180, 470],
        [1, 1020, 470],
      ]
        .map(
          ([dir, x, y]) =>
            `<g transform="translate(${x} ${y})"><rect x="-80" y="-35" width="160" height="70" fill="#26352d" stroke="#728071"/><circle cx="${dir * 35}" r="25" fill="#080e0a" stroke="#d0d9c6" stroke-width="4"/></g>`,
        )
        .join(
          "",
        )}${txt(470, 230, label(0), 34, "#ff785e")}${txt(120, 380, label(1), 25)}${txt(935, 380, label(2), 25)}</g><g class="run">${player(640, 350, 1.1)}</g>${ball(900, 520)}`;
    case "clock":
      return `${pitch}<g class="clock"><circle cx="430" cy="380" r="145" fill="#14231b" stroke="var(--accent)" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => `<path d="M430 250V265" transform="rotate(${i * 30} 430 380)" stroke="#a4bb9b" stroke-width="3"/>`).join("")}<path class="hand" d="M430 380V280" stroke="var(--paper)" stroke-width="6"/><path d="M430 380L480 415" stroke="var(--accent)" stroke-width="8"/></g>${txt(665, 350, label(0), 25)}${txt(665, 398, label(1), 25, "var(--accent)")}${ball(180, 520, "pass")}`;
    case "level":
      return `${pitch}<g class="age-row"><rect x="100" y="245" width="330" height="70" fill="#263b2d"/>${txt(135, 291, label(0), 30)}<path d="M110 280H420" stroke="#ff785e" stroke-width="4"/></g><g class="skills">${[1, 2, 3].map((i) => `${txt(145, 300 + i * 70, label(i), 26, "var(--accent)")}<circle cx="${600 + i * 135}" cy="${280 + (i % 2) * 150}" r="23" fill="var(--accent)"/>`).join("")}<path class="route" d="M735 430L870 280 1005 430" stroke="var(--paper)" stroke-width="4" stroke-dasharray="500" fill="none"/></g>${ball(735, 430, "pass")}`;
    case "focus":
      return `${pitch}<g class="old-word">${txt(110, 410, label(0), 135, "#5b6a5b")}</g><g class="football-word">${txt(95, 370, label(1), 120, "var(--paper)")}</g><g class="level-word">${txt(110, 510, label(2), 120, "var(--accent)")}</g>${ball(1120, 320, "pass")}`;
    case "player":
      return `${pitch}<g class="card"><rect x="450" y="215" width="380" height="335" rx="3" fill="#223a2b" stroke="#6f896c" stroke-width="2"/></g><g class="run">${player(640, 355, 1)}</g><g class="tag"><rect x="425" y="250" width="430" height="70" fill="var(--accent)"/>${txt(454, 295, label(0), 37, "#112019")}</g><g class="new-label">${txt(80, 550, label(1), 65, "var(--paper)")}</g>${player(1050, 400, 0.6, "#6b8268")}${player(970, 320, 0.5, "#6b8268")}`;
    case "results":
      return `<path d="M640 200V565" stroke="#778975" stroke-width="2"/>${goal(280, 280)}${goal(830, 280)}${txt(165, 240, label(0), 35, "var(--accent)")}${txt(755, 240, label(1), 35, "#ff785e")}${ball(190, 480, "success-ball")}${ball(735, 480, "miss-ball")}<path class="route" d="M190 480Q250 300 370 340" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="400"/><path class="error-route" d="M735 480Q1000 400 1100 300" fill="none" stroke="#ff785e" stroke-width="3" stroke-dasharray="500"/>${txt(510, 560, label(2), 35)}`;
    case "progress":
      return `${pitch}<path class="route" d="M200 490Q400 280 590 475T1060 350" fill="none" stroke="var(--accent)" stroke-width="4" stroke-dasharray="1500"/>${[350, 550, 750, 950].map((x, i) => `<path d="M${x - 15} ${400 + (i % 2) * 65}l15 -40 15 40Z" fill="#ff9961"/>`).join("")}<g class="run">${player(230, 355, 0.65)}</g><g class="loop"><path d="M155 320a65 65 0 1 1 95 10" fill="none" stroke="#ff785e" stroke-width="3" stroke-dasharray="8 6"/>${txt(95, 235, label(2), 14, "#ff785e")}</g>${txt(430, 260, label(0), 25)}${txt(820, 260, label(1), 25, "var(--accent)")}`;
    case "debate":
      return `${pitch}<path d="M640 200V565" stroke="var(--paper)" stroke-width="3"/><path d="M130 200H640V555H130Z" fill="var(--accent)" opacity=".07"/><path d="M640 200H1150V555H640Z" fill="#acbaff" opacity=".07"/>${txt(210, 350, label(0), 29, "var(--accent)")}${txt(750, 350, label(1), 29, "#bdc7ff")}${ball(640, 480, "final-ball")}${txt(475, 575, label(2), 24)}<g class="choice"><circle cx="365" cy="445" r="35" fill="none" stroke="var(--accent)" stroke-width="2"/><circle cx="900" cy="445" r="35" fill="none" stroke="#bdc7ff" stroke-width="2"/>${txt(354, 455, "A", 28, "var(--accent)")}${txt(890, 455, "B", 28, "#bdc7ff")}</g>`;
  }
}
export function footballComposition(
  film: FootballFilm,
  preview = false,
  initialTime = 0,
) {
  const legacy = film.scenes.some((s) => s.id.startsWith("legacy-"));
  const faith = film.scenes.some((s) => s.id.startsWith("faith-"));
  let time = 0;
  const animation: string[] = [];
  const scenes = film.scenes
    .map((s) => {
      const start = time,
        d = s.duration;
      time += d;
      const id = `scene-${s.id}`,
        q = `#${id}`;
      animation.push(
        `tl.set('${q}',{autoAlpha:1},${start});tl.set('${q}',{autoAlpha:0},${time});tl.fromTo('${q} .headline',{y:30,opacity:0},{y:0,opacity:1,duration:.5},${start});${s.id.startsWith("legacy-") ? "" : `tl.fromTo('${q} .art',{scale:1.025},{scale:1,duration:${d},ease:'none'},${start});`}`,
      );
      const initialized = new Set<string>();
      const tween = (selector: string, from: object, to: object, at = 0) => {
        if (!initialized.has(selector)) {
          animation.push(
            `gsap.set('${q} ${selector}',${JSON.stringify(from)});`,
          );
          initialized.add(selector);
        }
        animation.push(
          `tl.fromTo('${q} ${selector}',${JSON.stringify(from)},${JSON.stringify({ ...to, immediateRender: false })},${start + at});`,
        );
      };
      animateMourinho(s, tween);
      animateReviens(s, tween);
      animateMoloto(s, tween);
      const action = Math.min(d * 0.6, 7);
      switch (s.id) {
        case "tunnel":
          tween(
            ".athlete",
            { y: 50, opacity: 0.2 },
            { y: 0, opacity: 1, duration: action },
          );
          tween(".press", { y: 150 }, { y: 0, duration: 1, stagger: 0.1 }, 1);
          break;
        case "age":
          tween(
            ".age-type",
            { x: -500, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.65 },
          );
          tween(
            ".tag",
            { rotation: -12, scale: 1.4, opacity: 0 },
            {
              rotation: 0,
              scale: 1,
              opacity: 1,
              transformOrigin: "50% 50%",
              duration: 0.5,
            },
            d * 0.45,
          );
          break;
        case "shield":
          tween(
            ".shield",
            { opacity: 1, scale: 1 },
            {
              opacity: 0,
              scale: 1.4,
              transformOrigin: "50% 50%",
              duration: 1.5,
            },
            d * 0.55,
          );
          tween(".athlete", { y: 30 }, { y: 0, duration: action });
          break;
        case "entry":
          tween(
            ".run",
            { x: 0 },
            { x: 540, duration: action, ease: "power1.inOut" },
            0.5,
          );
          tween(".pass", { x: 230 }, { x: -120, duration: 1.4 }, d * 0.35);
          break;
        case "tactics":
          tween(
            ".pass",
            { x: 0, y: 0 },
            { x: 230, y: -110, duration: 1.1 },
            0.8,
          );
          tween(
            ".pass",
            { x: 230, y: -110 },
            { x: 460, y: 20, duration: 1.1 },
            2,
          );
          tween(
            ".pass",
            { x: 460, y: 20 },
            { x: 635, y: 85, duration: 1 },
            d * 0.6,
          );
          tween(
            ".error-route",
            { strokeDashoffset: 220 },
            { strokeDashoffset: 0, duration: 1 },
            d * 0.6,
          );
          break;
        case "equal":
          tween(
            ".equal-sign",
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, transformOrigin: "50% 50%", duration: 0.6 },
            d * 0.35,
          );
          break;
        case "monaco":
          tween(
            ".memory",
            { x: -70, opacity: 0.2 },
            { x: 0, opacity: 1, duration: 2 },
          );
          tween(
            ".athlete",
            { scale: 0.85 },
            { scale: 1, transformOrigin: "50% 100%", duration: action },
          );
          break;
        case "pressure":
          tween(
            ".pressure",
            { scale: 1.4, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              transformOrigin: "50% 50%",
              duration: action * 0.65,
            },
          );
          tween(
            ".pressure",
            { opacity: 1 },
            { opacity: 0.1, duration: 1 },
            d * 0.72,
          );
          tween(".run", { x: 0 }, { x: 160, duration: 1.7 }, d * 0.72);
          break;
        case "clock":
          tween(
            ".hand",
            { rotation: 0 },
            { rotation: 300, svgOrigin: "430 380", duration: action },
          );
          tween(
            ".pass",
            { x: 0 },
            { x: 930, rotation: 540, duration: 1.8 },
            d * 0.65,
          );
          break;
        case "level":
          tween(
            ".age-row",
            { opacity: 1, x: 0 },
            { opacity: 0, x: -70, duration: 1 },
            d * 0.3,
          );
          tween(
            ".skills",
            { opacity: 0 },
            { opacity: 1, duration: 1 },
            d * 0.38,
          );
          tween(
            ".pass",
            { x: 0, y: 0 },
            { x: 135, y: -150, duration: 1.2 },
            d * 0.65,
          );
          break;
        case "focus":
          tween(
            ".old-word",
            { opacity: 1 },
            { opacity: 0, duration: 0.5 },
            d * 0.2,
          );
          tween(
            ".football-word",
            { opacity: 0, x: 90 },
            { opacity: 1, x: 0, duration: 0.65 },
            d * 0.3,
          );
          tween(
            ".level-word",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.65 },
            d * 0.6,
          );
          break;
        case "player":
          tween(
            ".tag",
            { rotation: 0, x: 0, opacity: 1 },
            {
              rotation: -12,
              x: -550,
              opacity: 0,
              duration: 1.1,
              transformOrigin: "0% 50%",
            },
            d * 0.4,
          );
          tween(
            ".new-label",
            { opacity: 0 },
            { opacity: 1, duration: 0.6 },
            d * 0.5,
          );
          tween(".run", { x: 0 }, { x: 190, duration: 2 }, d * 0.65);
          break;
        case "results":
          tween(
            ".success-ball",
            { x: 0, y: 0 },
            { x: 180, y: -140, duration: 1.3 },
            0.7,
          );
          tween(
            ".miss-ball",
            { x: 0, y: 0 },
            { x: 365, y: -180, duration: 1.3 },
            d * 0.45,
          );
          tween(
            ".error-route",
            { strokeDashoffset: 500 },
            { strokeDashoffset: 0, duration: 1.3 },
            d * 0.45,
          );
          break;
        case "progress":
          tween(
            ".run",
            { x: 0 },
            { x: 760, duration: action, ease: "none" },
            1,
          );
          tween(
            ".loop",
            { opacity: 1 },
            { opacity: 0.2, duration: 1.5 },
            d * 0.6,
          );
          break;
        case "debate":
          tween(
            ".final-ball",
            { y: -170, rotation: -90 },
            { y: 0, rotation: 0, duration: 1.7, ease: "bounce.out" },
          );
          tween(
            ".choice",
            { opacity: 0 },
            { opacity: 1, duration: 1 },
            d * 0.3,
          );
          break;
      }
      if (["entry", "tactics", "level", "results", "progress"].includes(s.id))
        tween(
          ".route",
          { strokeDasharray: 1500, strokeDashoffset: 1500 },
          { strokeDashoffset: 0, duration: action, ease: "power1.inOut" },
          0.4,
        );
      if (s.id.startsWith("legacy-")) {
        animation.push(...molotoMotion(s, start, time));
        return molotoFrame(s, visual(s) || "", start);
      }
      return `<section class="scene" id="${id}"><div class="headline">${esc(s.title)}</div><svg class="art" viewBox="0 0 1280 720" aria-hidden="true">${visual(s)}</svg></section>`;
    })
    .join("");
  const cues = film.captions
    ? subtitleCues(
        {
          enabled: true,
          words: footballWords(film),
          maxChars: 48,
          maxLines: 2,
          maxWords: 12,
        },
        time,
      )
    : [];
  const captions = cues
    .map((cue, i) => {
      animation.push(
        `tl.set('#caption-${i}',{autoAlpha:1},${cue.start});tl.set('#caption-${i}',{autoAlpha:0},${cue.end});`,
      );
      return `<div class="caption" id="caption-${i}">${cue.lines.map((line) => `<div>${line.map((w) => esc(w.text)).join(" ")}</div>`).join("")}</div>`;
    })
    .join("");
  const script = preview
    ? `const hostOrigin=parent.location.origin;const audio=document.querySelector('#film-audio');const beds=[...document.querySelectorAll('.film-bed')];beds.forEach(a=>a.volume=Number(a.dataset.volume));let position=${Math.max(0, Math.min(initialTime, time))},playing=false,last=0;function fit(){document.querySelector('#composition').style.transform='translate(-50%,-50%) scale('+Math.min(innerWidth/1280,innerHeight/720)+')'}addEventListener('resize',fit);fit();tl.seek(position);if(audio){audio.currentTime=position;audio.addEventListener('ended',()=>{playing=false;beds.forEach(a=>a.pause());position=${time};tl.seek(position)});}addEventListener('message',e=>{if(e.source!==parent||e.origin!==hostOrigin||e.data?.type!=='football-transport')return;if(e.data.action==='seek'&&Number.isFinite(e.data.time)){position=Math.max(0,Math.min(${time},e.data.time));tl.seek(position);if(audio)audio.currentTime=position;beds.forEach(a=>a.currentTime=position);}if(e.data.action==='play'){if(position>=${time})position=0;playing=true;last=performance.now();beds.forEach(a=>{a.currentTime=position;a.play().catch(()=>{})});if(audio){audio.currentTime=position;audio.play().catch(()=>{playing=false});}}if(e.data.action==='pause'){playing=false;if(audio)audio.pause();beds.forEach(a=>a.pause());}});let reported=0;function tick(now){if(playing){position=audio?audio.currentTime:Math.min(${time},position+(now-last)/1000);tl.seek(position);if(position>=${time})playing=false;}last=now;if(now-reported>120){parent.postMessage({type:'football-position',time:position,playing},hostOrigin);reported=now;}requestAnimationFrame(tick)}requestAnimationFrame(tick);`
    : "";
  return {
    duration: time,
    width: 1280,
    height: 720,
    html: `<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="${preview ? "/api/motion/runtime" : "gsap.min.js"}"></script><style>*{box-sizing:border-box}html,body{margin:0;background:#08120e;overflow:hidden}#composition{--accent:${film.accent};--paper:#f0f2e5;position:relative;width:1280px;height:720px;background:radial-gradient(ellipse at 55% 35%,#234b32 0%,#0c1b13 50%,#070f0b 100%);color:var(--paper);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.scene{position:absolute;inset:0;visibility:hidden}.art{position:absolute;inset:0;width:100%;height:100%}.headline{position:absolute;top:62px;left:72px;right:72px;font-size:44px;line-height:1.05;letter-spacing:-1.6px;font-weight:900;z-index:2;border-top:1px solid #b7c9a633;padding-top:22px}.caption{position:absolute;bottom:35px;left:50%;transform:translateX(-50%);width:max-content;max-width:1100px;font-size:27px;line-height:1.4;text-align:center;background:#060e0de8;padding:8px 22px;color:#fff;border-left:3px solid var(--accent);visibility:hidden;z-index:5;overflow-wrap:anywhere}${film.source ? "#composition{background:radial-gradient(ellipse at 55% 35%,#263e58 0%,#111f31 50%,#080f1c 100%)}" : ""}${faith ? "#composition{background:radial-gradient(ellipse at 75% 30%,#7a725c 0%,#434b46 45%,#273b3b 100%)}.headline{font-family:Georgia,serif;font-weight:400;font-size:38px;letter-spacing:.5px;border:0;top:50px;color:#f2dfbf}.caption{background:#253331ee;border-left-color:#edc68b;font-size:28px}" : ""}${legacy ? molotoCss : ""}${preview ? "#composition{position:absolute;left:50%;top:50%;transform-origin:center}" : ""}</style></head><body><main id="composition" data-composition-id="editorial-film" data-start="0" data-duration="${time}" data-width="1280" data-height="720" data-fps="24">${scenes}${captions}${legacy && film.soundtrack ? ["music", "effects"].map((track) => `<audio class="film-bed" src="${preview ? `/api/films/moloto/sound?track=${track}` : `${track}.wav`}" data-start="0" data-duration="${time}" data-track-index="${track === "music" ? 1 : 2}" data-volume="${film.soundtrack![track as "music" | "effects"]}" preload="auto"></audio>`).join("") : ""}${film.source ? `<audio id="film-audio" src="${preview ? `/api/motion/media/${film.source.id}` : "source.wav"}" data-start="0" data-duration="${time}" data-track-index="0" data-volume="1" preload="auto"></audio>` : ""}</main><script>${legacy ? molotoFitScript : ""}const tl=gsap.timeline({paused:true});${animation.join("\n")}tl.to({},{duration:${time}},0);window.__timelines={'editorial-film':tl};${script}</script></body></html>`,
  };
}
