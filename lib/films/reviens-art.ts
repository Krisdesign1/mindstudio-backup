import type { FootballScene } from "./mbappe";
import { escapeHtml as esc } from "../hyperframes/composition";
const text = (
  x: number,
  y: number,
  value: string,
  size = 26,
  color = "#eee0c7",
  cls = "",
) =>
  `<text class="${cls}" x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="Georgia,serif">${esc(value)}</text>`;
const landscape = `<g class="landscape"><circle cx="1030" cy="265" r="142" fill="#d3a46d" opacity=".045"/><circle cx="1030" cy="265" r="112" fill="#d3a46d" opacity=".06"/><circle cx="1030" cy="265" r="78" fill="#e5ba81" opacity=".17"/><path d="M0 421Q220 236 496 396T1010 368T1280 360V720H0Z" fill="#57554d"/><path d="M0 473Q250 369 540 478T1070 444T1280 413V720H0Z" fill="#81705a"/><path d="M0 573Q270 454 555 561T1110 533T1280 494V720H0Z" fill="#ad8862"/><path d="M0 652Q280 566 655 618T1280 585V720H0Z" fill="#c09c70"/></g>`;
const tree = (x: number, y: number, scale = 1) =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0Q-12 -97 10 -185 M0 -82L-60 -128 M6 -116L66 -169" stroke="#313e37" stroke-width="10" fill="none"/><path d="M-95 -110Q-124 -170 -55 -194Q-65 -248 17 -230Q66 -243 105 -184Q143 -131 64 -121Q9 -78 -95 -110Z" fill="#405349"/><path d="M-50 -165Q-17 -197 64 -170" stroke="#849073" stroke-width="2" fill="none"/></g>`;
const house = (x: number, y: number, scale = 1, cls = "home") =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><g class="${cls}"><path d="M-157 0V-181L0 -260 157 -181V0Z" fill="#b69370"/><path d="M-175 -172L0 -266 175 -172" fill="none" stroke="#765444" stroke-width="18"/><path d="M-76 0V-108Q-76 -186 0 -186Q76 -186 76 -108V0Z" fill="#efc78f"/><path d="M-55 0V-110Q-55 -164 0 -164Q55 -164 55 -110V0Z" fill="#ffe8b4"/><path class="door-light" d="M-55 0L-235 210Q0 245 235 210L55 0Z" fill="#f2cc8c" opacity=".14"/><path d="M-124 -116H-97V-74H-124 M97 -116H124V-74H97" fill="#685a48"/><path d="M-141 -24H-89 M83 -34H138" stroke="#9a795a" stroke-width="4"/></g></g>`;
function person(
  x: number,
  y: number,
  scale = 1,
  cls = "son",
  robe = "#566e6c",
  pose = "stand",
) {
  const kneel = pose === "kneel",
    arms =
      pose === "open"
        ? '<path d="M-25 -106Q-62 -91 -101 -123 M24 -106Q62 -91 102 -123"/>'
        : pose === "carry"
          ? '<path d="M-27 -105Q-52 -63 -2 -63 M26 -104Q52 -66 -2 -63"/>'
          : pose === "kneel"
            ? '<path d="M-23 -90Q-42 -58 4 -79L13 -96 M18 -86L13 -96"/>'
            : '<path d="M-27 -110L-43 -50 M27 -110L40 -56"/>';
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="${cls}"><ellipse cy="6" rx="54" ry="10" fill="#382c28" opacity=".18"/><path d="${kneel ? "M-28 -105Q-42 -40 -48 -13L20 0 56 -12 16 -45 27 -97Z" : "M-29 -113Q-38 -65 -50 -8Q0 11 47 -8L27 -114Z"}" fill="${robe}"/><g fill="none" stroke="${robe}" stroke-width="20" stroke-linecap="round">${arms}</g><path d="M-15 -124V-105Q0 -91 14 -106V-127" fill="#c59876"/><ellipse cx="0" cy="-151" rx="25" ry="31" fill="#cda280"/><path d="M-25 -147Q-33 -190 5 -183Q30 -183 27 -151L13 -162 -19 -159Z" fill="${robe === "#b59168" ? "#ddd0b5" : "#393b35"}"/>${kneel ? "" : '<path d="M-29 -6L-37 8H-8 M15 -6L16 8H42" stroke="#454037" stroke-width="9" stroke-linecap="round"/>'}</g></g>`;
}
const vase = (x: number, y: number, scale = 1, broken = false, cls = "vase") =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><g class="${cls}">${broken ? '<path d="M-48 0L-70 -41 -21 -60 0 -13Z M14 -5L28 -52 70 -40 49 8Z M-8 -64L-28 -91 19 -89 13 -65Z" fill="#c47c54" stroke="#e5aa75" stroke-width="2"/>' : '<path d="M-20 -116H20L16 -89Q62 -77 51 -24Q43 9 0 12Q-43 9 -51 -24Q-62 -77 -16 -89Z" fill="#bf805b"/><path d="M-14 -108H14 M-41 -52Q0 -38 41 -52" fill="none" stroke="#e3b080" stroke-width="5"/><path class="crack" d="M4 -87L-14 -63 8 -44 -7 -18 6 6" fill="none" stroke="#644b3e" stroke-width="3"/>'}</g></g>`;
const road = `<path class="road" d="M560 706Q435 576 673 495Q816 450 983 441" fill="none" stroke="#e7bf89" stroke-width="35" opacity=".7"/>`;
const room = `<path d="M0 0H1280V720H0Z" fill="#343d3b"/><path d="M0 523H1280V720H0Z" fill="#786750"/><path d="M0 522H1280" stroke="#b59973" stroke-width="2"/><path d="M860 145H1070V455H860Z" fill="#b8a077"/><path d="M877 163H1053V439H877Z" fill="#f4d59c"/><path d="M965 160V440 M876 294H1054" stroke="#a28a68" stroke-width="9"/><path d="M877 439L389 690H1081L1053 439" fill="#edc68b" opacity=".15"/>`;
export function reviensVisual(s: FootballScene) {
  const l = (i: number) => s.labels[i] || "";
  switch (s.id) {
    case "faith-shame":
      return `${landscape}${house(1000, 440, 0.7)}${road}<g class="shadow"><path d="M280 566Q560 310 670 589L710 684H151Z" fill="#272f32" opacity=".65"/></g>${person(390, 576, 1.1)}${text(120, 340, l(0), 60, "#f0d5b0", "shame-word")}${tree(90, 580, 0.65)}`;
    case "faith-promise":
      return `${room}${person(585, 550, 1.25, "son", "#647c77", "kneel")}${vase(320, 576, 0.8)}${text(120, 286, l(0), 74)}${text(120, 336, l(1), 23, "#c6b596")}`;
    case "faith-repeat":
      return `${room}<path class="repeat-path" d="M238 570C-5 369 398 258 500 398S819 654 719 382" fill="none" stroke="#bf9f73" stroke-width="3" stroke-dasharray="10 13"/>${person(650, 561, 1.3, "son", "#647c77", "kneel")}${vase(295, 577, 0.7, true)}${text(150, 287, l(0), 72, "#d3bd99")}`;
    case "faith-question":
      return `${room}${house(1045, 475, 0.55)}${person(430, 570, 1.3, "son", "#647c77", "kneel")}${text(100, 240, l(0), 39, "#edd6b2", "question-one")}${text(100, 303, l(1), 39, "#edd6b2", "question-two")}<path class="distance-line" d="M570 564H940" stroke="#bc9d74" stroke-width="2" stroke-dasharray="3 16"/>`;
    case "faith-alone":
      return `${landscape}${house(1040, 385, 0.37)}${tree(1140, 480, 0.5)}${person(550, 594, 1.1, "son", "#647c77", "kneel")}${vase(688, 605, 0.75, true)}${text(120, 279, l(0), 70)}${text(120, 330, l(1), 27)}<path d="M837 520Q719 523 759 554" fill="none" stroke="#d9b887" stroke-width="3"/>`;
    case "faith-departure":
      return `${landscape}${house(270, 445, 0.8)}${person(270, 455, 0.58, "father", "#b59168")}<g class="traveler">${person(620, 546, 1)}<path d="M660 465Q714 453 712 502L691 529 655 513Z" fill="#9d7652"/></g><path d="M428 527Q719 552 1140 612" stroke="#d5b185" stroke-width="40" fill="none" opacity=".35"/>${text(915, 255, l(0), 29)}${tree(80, 480, 0.5)}`;
    case "faith-loss":
      return `${landscape}<g class="coins">${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${230 + i * 70}" cy="${485 + (i % 2) * 38}" rx="18" ry="7" fill="#e9bf6e"/>`).join("")}</g><g class="coat"><path d="M835 280L803 420H974L932 280 890 319Z" fill="#b77754"/><path d="M825 432V547 M958 432V547 M810 432H975 M833 280V432 M951 280V432" stroke="#605440" stroke-width="10" fill="none"/></g>${person(635, 560, 1.1, "son", "#647c77", "kneel")}${text(170, 286, l(0), 29)}${text(855, 245, l(1), 29)}`;
    case "faith-father":
      return `${landscape}${house(690, 518, 1.15)}${person(690, 529, 0.9, "father", "#b59168", "open")}${tree(180, 586, 0.85)}${text(900, 304, l(0), 38)}<path d="M620 720Q608 603 690 530" stroke="#e5ba81" stroke-width="53" opacity=".35" fill="none"/>`;
    case "faith-presence":
      return `${landscape}${house(970, 480, 0.95)}${person(970, 490, 0.66, "father", "#b59168")}<g class="possessions">${vase(270, 555, 0.85)}<path d="M420 493L485 466 550 493V564H420Z" fill="#a68565"/><path d="M485 466V565 M420 493L485 520 550 493" stroke="#e3c292" stroke-width="3"/></g>${text(100, 270, l(0), 28)}${text(805, 245, l(1), 28, "#efd4a8", "presence-label")}`;
    case "faith-regrets":
      return `${landscape}<g class="hourglass"><path d="M171 258H295 M171 434H295" stroke="#dfbf8b" stroke-width="9"/><path d="M188 267Q187 317 233 346Q278 374 277 425 M277 267Q278 317 233 346Q188 374 188 425" fill="none" stroke="#bfaa8b" stroke-width="3"/><path class="sand" d="M198 294H267L233 331Z M200 417L232 383 265 417Z" fill="#e6bd78"/></g><path class="fork" d="M623 570V382Q623 345 537 282 M623 382Q623 345 712 282" stroke="#c8b18b" stroke-width="14" fill="none"/><path class="cycle" d="M967 410a73 73 0 1 1 78 -106" fill="none" stroke="#cfab79" stroke-width="5" stroke-dasharray="9 12"/>${text(162, 480, l(0), 25)}${text(542, 480, l(1), 25)}${text(922, 480, l(2), 25)}${road}`;
    case "faith-why":
      return `${landscape}${house(1030, 448, 0.68)}${road}${person(410, 574, 1.2, "son", "#647c77", "carry")}${vase(410, 491, 0.4, true, "carried-pieces")}${text(80, 266, l(0), 69)}${text(80, 312, l(1), 25)}${tree(1150, 480, 0.6)}`;
    case "faith-return":
      return `${landscape}${house(990, 440, 0.85)}<path class="return-road" d="M245 570Q635 620 970 466" fill="none" stroke="#f1cc95" stroke-width="33"/><g class="returning">${person(300, 573, 1.15)}</g><g class="welcoming">${person(990, 474, 0.85, "father", "#b59168", "open")}</g>${text(110, 268, l(0), 40)}${text(760, 250, l(1), 31, "#f0d6ac")}${tree(1130, 490, 0.6)}`;
    case "faith-now":
      return `${landscape}${house(800, 468, 1)}<g class="embrace-son">${person(570, 553, 1.03, "son", "#647c77", "open")}</g><g class="embrace-father">${person(760, 550, 1.08, "father", "#b59168", "open")}</g>${text(85, 248, l(0), 23, "#d9c6a6", "condition-one")}${text(85, 290, l(1), 23, "#d9c6a6", "condition-two")}${text(80, 382, l(2), 62, "#ffe1ae", "now-label")}`;
    case "faith-end":
      return `${landscape}${house(800, 488, 1.15)}${person(750, 559, 1.08, "father", "#b59168", "open")}${person(699, 562, 1.02, "son", "#647c77", "carry")}${tree(170, 590, 0.9)}${text(120, 294, l(0), 47, "#f4d9ae")}<g class="glow"><circle cx="800" cy="400" r="185" fill="#f4ca85" opacity=".035"/><circle cx="800" cy="400" r="225" fill="#f4ca85" opacity=".025"/></g>`;
    default:
      return "";
  }
}
type Tween = (selector: string, from: object, to: object, at?: number) => void;
export function animateReviens(s: FootballScene, tween: Tween) {
  const d = s.duration,
    slow = Math.min(d * 0.75, 7);
  switch (s.id) {
    case "faith-shame":
      tween(".son", { x: 60 }, { x: 0, duration: slow, ease: "power1.inOut" });
      tween(
        ".shadow",
        { scaleX: 0.45, opacity: 0.3 },
        { scaleX: 1, opacity: 1, duration: slow, transformOrigin: "0% 100%" },
      );
      tween(
        ".shame-word",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1 },
        d * 0.6,
      );
      break;
    case "faith-promise":
      tween(".crack", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.4);
      tween(
        ".son",
        { y: 18, opacity: 0.4 },
        { y: 0, opacity: 1, duration: 2 },
        d * 0.25,
      );
      break;
    case "faith-repeat":
      tween(
        ".repeat-path",
        { strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: slow, ease: "none" },
      );
      tween(".son", { y: -10 }, { y: 0, duration: 2 }, d * 0.5);
      break;
    case "faith-question":
      tween(".question-one", { opacity: 0 }, { opacity: 1, duration: 1 }, 0.7);
      tween(
        ".question-two",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        d * 0.5,
      );
      tween(
        ".distance-line",
        { opacity: 0 },
        { opacity: 0.8, duration: 3 },
        d * 0.2,
      );
      break;
    case "faith-alone":
      tween(
        ".home",
        { scale: 1.15 },
        { scale: 1, duration: slow, transformOrigin: "50% 100%" },
      );
      tween(".vase", { x: 15 }, { x: 0, duration: 2 }, d * 0.4);
      break;
    case "faith-departure":
      tween(
        ".traveler",
        { x: -100 },
        { x: 260, duration: slow, ease: "power1.inOut" },
      );
      break;
    case "faith-loss":
      tween(
        ".coins",
        { x: 0, opacity: 1 },
        { x: -150, opacity: 0, duration: 2.2 },
        0.6,
      );
      tween(
        ".coat",
        { y: 0, opacity: 1 },
        { y: 35, opacity: 0.1, duration: 2.2 },
        d * 0.4,
      );
      break;
    case "faith-father":
      tween(".father", { opacity: 0.4 }, { opacity: 1, duration: 2 });
      tween(".door-light", { opacity: 0.06 }, { opacity: 0.3, duration: slow });
      break;
    case "faith-presence":
      tween(
        ".possessions",
        { opacity: 1 },
        { opacity: 0, duration: slow },
        0.5,
      );
      tween(
        ".presence-label",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        d * 0.6,
      );
      break;
    case "faith-regrets":
      tween(
        ".hourglass",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
      );
      tween(".fork", { opacity: 0 }, { opacity: 1, duration: 0.8 }, d * 0.22);
      tween(
        ".cycle",
        { opacity: 0, strokeDashoffset: 80 },
        { opacity: 1, strokeDashoffset: 0, duration: 3 },
        d * 0.52,
      );
      break;
    case "faith-why":
      tween(".son", { x: 0 }, { x: 100, duration: slow }, 0.8);
      tween(".carried-pieces", { x: 0 }, { x: 100, duration: slow }, 0.8);
      break;
    case "faith-return":
      tween(
        ".returning",
        { x: 0 },
        { x: 450, y: -48, duration: slow, ease: "power1.inOut" },
      );
      tween(
        ".welcoming",
        { x: 0 },
        { x: -120, y: 36, duration: slow, ease: "power1.inOut" },
        0.5,
      );
      tween(".return-road", { opacity: 0.15 }, { opacity: 0.85, duration: 2 });
      break;
    case "faith-now":
      tween(
        ".condition-one",
        { opacity: 1 },
        { opacity: 0, duration: 0.6 },
        d * 0.34,
      );
      tween(
        ".condition-two",
        { opacity: 1 },
        { opacity: 0, duration: 0.6 },
        d * 0.53,
      );
      tween(
        ".now-label",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        d * 0.7,
      );
      tween(
        ".embrace-son",
        { x: 0 },
        { x: 130, duration: slow, ease: "power1.inOut" },
        0.5,
      );
      tween(
        ".embrace-father",
        { x: 0 },
        { x: -10, duration: slow, ease: "power1.inOut" },
        0.5,
      );
      break;
    case "faith-end":
      tween(".glow", { opacity: 0.2 }, { opacity: 1, duration: slow });
      break;
  }
}
