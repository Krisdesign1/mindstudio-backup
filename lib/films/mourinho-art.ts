import { escapeHtml as e } from "../hyperframes/composition";
import type { FootballScene } from "./mbappe";
const t = (
  x: number,
  y: number,
  text: string,
  size = 24,
  color = "var(--paper)",
  cls = "",
) =>
  `<text class="${cls}" x="${x}" y="${y}" font-family="Arial,sans-serif" font-weight="800" font-size="${size}" fill="${color}">${e(text)}</text>`;
const microphone = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><path d="M0 0L30 -80" stroke="#788fa1" stroke-width="7"/><rect x="17" y="-112" width="28" height="52" rx="12" fill="#151f2d" stroke="#bcccd4" stroke-width="2" transform="rotate(20 30 -86)"/><ellipse cy="3" rx="40" ry="8" fill="#101b28"/></g>`;
const coach = `<g class="coach"><path d="M488 484L508 350Q525 325 577 320H704Q759 325 772 354L800 484" fill="#202f41" stroke="#6e8497" stroke-width="2"/><path d="M586 313L635 410 686 313" fill="#d6dfdf"/><path d="M620 365L640 350 657 367 647 439H628Z" fill="#9e4b42"/><rect x="610" y="284" width="61" height="56" rx="15" fill="#b98e75"/><ellipse cx="640" cy="251" rx="64" ry="76" fill="#c29b80"/><path d="M576 250Q564 166 641 170Q716 169 704 241L685 205 654 198 611 210 586 239Z" fill="#9fa6a8"/><path d="M590 220Q620 208 627 221 M653 219Q678 210 690 220" fill="none" stroke="#474c51" stroke-width="5"/><path d="M607 277Q640 290 676 276" fill="none" stroke="#916e5b" stroke-width="3"/><path d="M537 371L472 461 565 470 M744 372L807 461 716 470" fill="none" stroke="#32475b" stroke-width="43" stroke-linecap="round"/></g>`;
const table = `<path d="M75 490H1205L1270 580H10Z" fill="#30475b"/><path d="M10 580H1270V625H10Z" fill="#122333"/>${microphone(470, 490)}${microphone(840, 490)}`;
const room = `<path d="M65 155H1215V490H65Z" fill="#111f31"/><path d="M65 210H1215 M65 275H1215 M65 340H1215 M65 405H1215" stroke="#27394c" stroke-width="1"/><circle cx="170" cy="195" r="4" fill="var(--accent)"/><path d="M1080 183H1160" stroke="#c0cbd3" stroke-width="3"/>`;
const pitch = (x: number, y: number, w = 330, h = 215) =>
  `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" fill="#17372e"/><g stroke="#a2b3a1" stroke-width="1.7" fill="none" opacity=".65"><rect x="12" y="12" width="${w - 24}" height="${h - 24}"/><path d="M${w / 2} 12V${h - 12} M12 ${h * 0.28}H${w * 0.2}V${h * 0.72}H12 M${w - 12} ${h * 0.28}H${w * 0.8}V${h * 0.72}H${w - 12}"/><circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.22}"/></g></g>`;
function sheet(x: number, y: number, number: string, cls: string, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="${cls}"><path d="M9 11H329V361H9Z" fill="#000" opacity=".3"/><rect width="320" height="350" fill="#f1eee5"/>${t(23, 37, number, 21, "#172333")}<path d="M23 55H295" stroke="#a3a9a6"/>${pitch(22, 75, 276, 184)}<circle cx="120" cy="153" r="15" fill="#eeeade"/><circle cx="179" cy="174" r="15" fill="#d65354"/><path d="M127 168L162 198 M170 187L142 201" stroke="#f4dfc0" stroke-width="9" stroke-linecap="round"/><circle class="incident-ring" cx="149" cy="196" r="40" stroke="#b64242" stroke-width="3" fill="none"/>${t(22, 293, "SCHÉMA EXPLICATIF", 15, "#283c43")}${t(22, 318, "PAS UNE CAPTURE DU MATCH", 10, "#5c6664")}</g></g>`;
}
const flash = `<g class="flashes"><path d="M130 445l8 -25 8 25 25 8 -25 8 -8 25 -8 -25 -25 -8Z" fill="#c9e5ff"/><path d="M1120 390l6 -18 6 18 18 6 -18 6 -6 18 -6 -18 -18 -6Z" fill="#c9e5ff"/></g>`;
const card = (x: number, y: number, cls = "card") =>
  `<g transform="translate(${x} ${y})"><rect class="${cls}" width="100" height="145" rx="9" fill="#ed514d" stroke="#ffaaa0" stroke-width="2"/></g>`;
export function mourinhoVisual(s: FootballScene) {
  const l = (i: number) => s.labels[i] || "";
  switch (s.id) {
    case "press-arrival":
      return `${room}${coach}${table}<g class="folder"><path d="M470 504L555 474H786L830 541H455Z" fill="#cfb38a"/><path d="M460 520H820" stroke="#eee0c5" stroke-width="3"/></g>${sheet(532, 424, "01", "paper-one", 0.27)}${sheet(650, 429, "02", "paper-two", 0.27)}${flash}${t(90, 240, l(0), 22, "var(--accent)")}${t(90, 275, l(1), 16)}`;
    case "derby-defeat":
      return `<path d="M60 180H630V550H60Z" fill="#dfe5e3"/><path d="M650 180H1220V550H650Z" fill="#752d3b"/>${t(100, 260, l(0), 42, "#172637")}${t(700, 260, l(1), 42)}${pitch(100, 300, 490, 190)}${pitch(695, 300, 490, 190)}<g class="defeat-tag"><rect x="430" y="465" width="420" height="74" fill="var(--accent)"/>${t(458, 511, l(2), 30, "#111c2d")}</g>`;
    case "two-incidents":
      return `${sheet(250, 200, l(0), "paper-one", 0.96)}${sheet(720, 200, l(1), "paper-two", 0.96)}${t(80, 560, l(2), 17, "var(--accent)")}`;
    case "red-card":
      return `${pitch(85, 220, 740, 345)}${[
        [160, 392],
        [295, 285],
        [295, 392],
        [295, 500],
        [450, 280],
        [450, 390],
        [450, 500],
        [600, 280],
        [600, 390],
        [600, 500],
        [735, 390],
      ]
        .map(
          ([x, y], i) =>
            `<g class="${i === 10 ? "sent-off" : "team-dot"}"><circle cx="${x}" cy="${y}" r="20" fill="#e5e8e2"/><circle cx="${x}" cy="${y}" r="5" fill="#314b60"/></g>`,
        )
        .join(
          "",
        )}${card(955, 275)}${t(890, 485, l(1), 22, "#ffb0a4")}${t(90, 200, l(0), 19)}`;
    case "same-rule":
      return `<g class="comparison-left"><rect x="95" y="200" width="480" height="350" rx="8" fill="#21354a"/>${t(135, 250, l(0), 32)}${card(285, 295)}${t(300, 495, l(2), 24, "#ffada5")}</g><g class="comparison-right"><rect x="705" y="200" width="480" height="350" rx="8" fill="#382937"/>${t(745, 250, l(1), 32)}${t(895, 420, l(3), 130, "var(--accent)")}</g><path class="compare-line" d="M575 380H705" stroke="var(--accent)" stroke-width="4"/>${t(600, 355, "=", 58, "var(--accent)")}`;
    case "show-sheets":
      return `${room}${coach}${table}${sheet(260, 255, l(0), "paper-one", 0.78)}${sheet(770, 255, l(1), "paper-two", 0.78)}${flash}${t(425, 595, l(2), 22, "var(--accent)")}`;
    case "reaction-wave":
      return `<path class="spread" d="M640 340L260 255 M640 340L1000 255 M640 340L260 495 M640 340L1000 495" stroke="#668ba6" stroke-width="3" stroke-dasharray="1100" fill="none"/><g class="central-screen"><rect x="470" y="215" width="340" height="270" rx="9" fill="#1e3348" stroke="#7d9db5"/>${sheet(498, 252, "01", "", 0.36)}${sheet(661, 252, "02", "", 0.36)}</g>${[
        [130, 190],
        [900, 190],
        [130, 430],
        [900, 430],
      ]
        .map(
          ([x, y], i) =>
            `<g class="reaction r${i}"><rect x="${x}" y="${y}" width="245" height="125" rx="6" fill="#253c50" stroke="#627f93"/><rect x="${x + 18}" y="${y + 20}" width="62" height="77" fill="#d6e0da"/><path d="M${x + 100} ${y + 35}h115 M${x + 100} ${y + 57}h90 M${x + 100} ${y + 79}h105" stroke="#98aebe" stroke-width="5"/></g>`,
        )
        .join(
          "",
        )}${t(535, 535, l(1), 23, "var(--accent)")}${t(535, 195, l(0), 21)}${t(570, 577, l(2), 22)}`;
    case "referee-dispute":
      return `<g class="whistle"><circle cx="330" cy="350" r="95" fill="#98adbd"/><circle cx="330" cy="350" r="55" fill="#172938"/><path d="M355 278H495V355H390" fill="#c7d4dc"/><rect x="420" y="287" width="50" height="21" fill="#172938"/></g><path class="spread" d="M535 350H740" stroke="var(--accent)" stroke-width="5" stroke-dasharray="300"/>${microphone(950, 440)}<circle class="speech-ring" cx="970" cy="350" r="125" fill="none" stroke="#779bb6" stroke-width="3"/>${t(160, 535, l(0), 27)}${t(790, 535, l(1), 27, "var(--accent)")}`;
    case "printed-proof":
      return `<g class="printer"><rect x="190" y="265" width="390" height="190" rx="15" fill="#91a5b4"/><rect x="235" y="200" width="300" height="155" fill="#dce3df"/><rect x="210" y="350" width="350" height="60" rx="4" fill="#15232f"/><circle cx="545" cy="300" r="8" fill="var(--accent)"/></g>${sheet(255, 365, "01", "paper-one", 0.7)}${sheet(815, 220, "02", "paper-two", 0.85)}${t(670, 535, l(0), 30)}${t(670, 577, l(1), 30, "var(--accent)")}`;
    case "atletico-response":
      return `<g class="accusation"><rect x="85" y="240" width="430" height="220" rx="8" fill="#d5ddda"/>${t(120, 290, l(0), 31, "#172938")}${sheet(120, 320, "01", "", 0.28)}${sheet(260, 320, "02", "", 0.28)}</g><path class="spread" d="M535 340H705" stroke="var(--accent)" stroke-width="5" stroke-dasharray="300"/><g class="response"><path d="M735 220H1200V495H820L735 555Z" fill="#783948"/>${t(775, 290, l(2), 33)}${t(775, 370, l(1), 42, "#f5d2c7")}<path d="M775 420H1135 M775 450H1065" stroke="#c3888b" stroke-width="7"/></g>`;
    case "final-question":
      return `${sheet(520, 230, "01 / 02", "paper-one", 0.75)}<g class="choice-a"><path d="M70 225H460V525H70Z" fill="#203c48"/>${t(105, 330, "A", 86, "var(--accent)")}${t(95, 420, l(0), 24)}</g><g class="choice-b"><path d="M820 225H1210V525H820Z" fill="#3a2d45"/>${t(855, 330, "B", 86, "#c7baff")}${t(835, 420, l(1), 23)}</g><path d="M460 390H510 M770 390H820" stroke="#8c9eac" stroke-width="3"/>`;
    case "your-opinion":
      return `<g class="open-folder"><path d="M215 250L625 210 1065 250V530L640 570 215 530Z" fill="#cdbd99"/><path d="M640 240V545" stroke="#806d50" stroke-width="3"/>${t(275, 370, l(0), 29, "#172938")}${t(700, 370, l(1), 29, "#172938")}<circle cx="405" cy="450" r="29" fill="none" stroke="#172938" stroke-width="3"/><circle cx="845" cy="450" r="29" fill="none" stroke="#172938" stroke-width="3"/></g>${t(360, 610, l(2), 25, "var(--accent)")}`;
    default:
      return "";
  }
}
type Tween = (selector: string, from: object, to: object, at?: number) => void;
export function animateMourinho(s: FootballScene, tween: Tween) {
  const d = s.duration,
    slow = Math.min(d * 0.65, 4);
  switch (s.id) {
    case "press-arrival":
      tween(".coach", { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 1 });
      tween(
        ".folder",
        { x: 180, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        1,
      );
      tween(
        ".paper-one",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        d * 0.5,
      );
      tween(
        ".paper-two",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        d * 0.65,
      );
      break;
    case "derby-defeat":
      tween(
        ".defeat-tag",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        d * 0.4,
      );
      break;
    case "two-incidents":
      tween(
        ".paper-one",
        { x: -150, rotation: -8, opacity: 0 },
        {
          x: 0,
          rotation: -3,
          opacity: 1,
          duration: 0.8,
          transformOrigin: "50% 50%",
        },
      );
      tween(
        ".paper-two",
        { x: 150, rotation: 10, opacity: 0 },
        {
          x: 0,
          rotation: 3,
          opacity: 1,
          duration: 0.8,
          transformOrigin: "50% 50%",
        },
        d * 0.35,
      );
      tween(
        ".incident-ring",
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        d * 0.5,
      );
      break;
    case "red-card":
      tween(
        ".card",
        { y: 140, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        d * 0.45,
      );
      tween(
        ".sent-off",
        { x: 0, opacity: 1 },
        { x: 140, opacity: 0, duration: 1 },
        d * 0.65,
      );
      break;
    case "same-rule":
      tween(
        ".comparison-left",
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1 },
      );
      tween(
        ".comparison-right",
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1 },
        d * 0.35,
      );
      tween(
        ".compare-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, transformOrigin: "50% 50%" },
        d * 0.55,
      );
      break;
    case "show-sheets":
      tween(
        ".paper-one",
        { y: 240, rotation: -12, opacity: 0 },
        {
          y: 0,
          rotation: -4,
          opacity: 1,
          duration: 1,
          transformOrigin: "50% 100%",
        },
        d * 0.37,
      );
      tween(
        ".paper-two",
        { y: 240, rotation: 12, opacity: 0 },
        {
          y: 0,
          rotation: 4,
          opacity: 1,
          duration: 1,
          transformOrigin: "50% 100%",
        },
        d * 0.52,
      );
      break;
    case "reaction-wave":
      tween(
        ".spread",
        { strokeDashoffset: 1100 },
        { strokeDashoffset: 0, duration: slow },
      );
      tween(
        ".reaction",
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.4,
          transformOrigin: "50% 50%",
        },
        0.8,
      );
      break;
    case "referee-dispute":
      tween(
        ".whistle",
        { x: -70, opacity: 0 },
        { x: 0, opacity: 1, duration: 1 },
      );
      tween(
        ".spread",
        { strokeDashoffset: 300 },
        { strokeDashoffset: 0, duration: 1 },
        d * 0.3,
      );
      tween(
        ".speech-ring",
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, transformOrigin: "50% 50%" },
        d * 0.5,
      );
      break;
    case "printed-proof":
      tween(
        ".paper-one",
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: slow },
      );
      tween(
        ".paper-two",
        { x: 130, opacity: 0 },
        { x: 0, opacity: 1, duration: 1 },
        d * 0.5,
      );
      break;
    case "atletico-response":
      tween(
        ".spread",
        { strokeDashoffset: 300 },
        { strokeDashoffset: 0, duration: 1 },
      );
      tween(
        ".response",
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        d * 0.4,
      );
      break;
    case "final-question":
      tween(
        ".choice-a",
        { x: -120, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        d * 0.2,
      );
      tween(
        ".choice-b",
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        d * 0.57,
      );
      break;
    case "your-opinion":
      tween(
        ".open-folder",
        { scale: 0.92, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: slow, transformOrigin: "50% 50%" },
      );
      break;
  }
  if (["press-arrival", "show-sheets"].includes(s.id))
    tween(
      ".flashes",
      { opacity: 0 },
      { opacity: 0.8, duration: 0.1, repeat: 3, yoyo: true },
      Math.min(1.8, d * 0.2),
    );
}
