import type { FootballScene } from "./mbappe";
import { portrait } from "./moloto-characters";
const p = (
  who: "alain" | "athoms",
  n: number,
  x: number,
  y: number,
  scale = 1,
  pose: "sing" | "teach" | "calm" = "calm",
) => portrait(who, `${n}-${who}-${x}`, x, y, scale, pose);
const score = `<g class="score" fill="none" stroke="#d5b77b" opacity=".45">${[0, 1, 2, 3, 4].map((i) => `<path d="M580 ${300 + i * 15}Q800 ${220 + i * 15} 1220 ${280 + i * 15}"/>`).join("")}<path d="M740 283V226M880 256V198M1060 268V210" stroke-width="3"/><g fill="#d5b77b"><ellipse cx="731" cy="285" rx="10" ry="6"/><ellipse cx="871" cy="258" rx="10" ry="6"/><ellipse cx="1051" cy="270" rx="10" ry="6"/></g></g>`;
function stage(n: number) {
  return `<g class="scenery"><path d="M530 70H1230V580H530Z" fill="#182c39"/><path d="M565 70V530M1170 70V530" stroke="#b89562" stroke-width="2"/><path class="light" d="M790 75L550 555H1110Z" fill="#f2d29c" opacity=".1"/><path class="light" d="M1090 75L830 555H1240Z" fill="#a4bec6" opacity=".12"/><ellipse cx="904" cy="570" rx="330" ry="27" fill="#a79065" opacity=".18"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${580 + i * 95} 576q-15 -32 0 -39q15 -7 19 10l12 29" fill="#0a1620"/>`).join("")}</g>${score}${p(n === 7 || n === 10 || n === 15 ? "athoms" : "alain", n, 925, 207, 1.02, "sing")}`;
}
function study(n: number) {
  return `<g class="scenery"><rect x="570" y="94" width="630" height="480" rx="2" fill="#dbc9a2"/><path d="M650 110H850V344H650Z" fill="#718987"/><path d="M750 110V344M650 222H850" stroke="#d9c6a0" stroke-width="8"/><path d="M620 401H1210V579H620Z" fill="#634e3d"/><path d="M630 421H1200M635 437H1195" stroke="#b09564" opacity=".4"/></g>${p("alain", n, 1072, 207, 0.8, "teach")}${p("athoms", n, 741, 263, 0.72, "calm")}<g class="book"><path d="M818 453L916 438 988 468 885 491Z" fill="#f0dec1"/><path d="M916 439L885 491M839 459L891 450M848 468L900 459M917 456L963 474" stroke="#79664a" stroke-width="2"/></g>`;
}
function house() {
  return `<g transform="translate(24 0) scale(.96)"><g class="scenery"><circle cx="920" cy="331" r="210" fill="#243b3d"/><path d="M583 490H1210" stroke="#bfa16e"/></g><g class="foundation"><path d="M640 478L929 414 1191 484 919 565Z" fill="#d5b477"/><path d="M640 478V520L918 603V565M918 565L1191 484V525L918 603" fill="#8b6c44"/><path d="M683 505L916 573 1153 509M744 524V548M1000 543V577M1090 522V550" fill="none" stroke="#d9bc86" stroke-width="2"/></g><g class="house"><path d="M714 453V280L925 210 1120 284V455L918 515Z" fill="#80948b"/><path d="M918 343V515L1120 455V284Z" fill="#496761"/><path d="M676 290L925 155 1158 297 919 365Z" fill="#d2c3a3"/><path d="M676 290L925 155 920 365Z" fill="#eadabc"/><path d="M785 475V365L854 389V493Z" fill="#233e3c"/><path d="M980 379L1065 352V419L980 445Z" fill="#ddc189"/><path d="M1022 365V432" stroke="#476660" stroke-width="5"/></g></g>`;
}
function journey(n: number) {
  return `<g class="scenery"><rect x="578" y="91" width="628" height="483" fill="#d9cba9"/><path d="M680 190L842 136 936 170 1058 154 1150 280 1070 351 1121 457 975 515 900 469 771 498 699 367 623 284Z" fill="#9baf9f" stroke="#607e73" stroke-width="2"/><path d="M1000 200Q870 285 890 367T735 447" fill="none" stroke="#fff0cb" stroke-width="19"/><path class="route" d="M1000 200Q870 285 890 367T735 447" fill="none" stroke="#4b7376" stroke-width="4" stroke-dasharray="600"/><circle cx="1000" cy="200" r="9" fill="#a25c3f"/><circle cx="735" cy="447" r="9" fill="#a25c3f"/></g><g class="map-caption" font-family="Arial" font-size="21" fill="#233e3c"><text x="960" y="170">Kisangani</text><text x="655" y="485">Kinshasa</text></g>${p("alain", n, 1110, 389, 0.46)}`;
}
export function molotoVisual(s: FootballScene) {
  const n = Number(s.id.slice(-2));
  let art = "";
  if (n === 3) art = journey(n);
  else if ([8, 9, 11, 12].includes(n)) art = study(n);
  else if ([18, 19].includes(n)) art = house();
  else if ([5, 6].includes(n))
    art = `<g class="scenery"><path d="M545 570V245L900 93 1220 245V570" fill="#354b50"/><path d="M900 130V248M857 180H942" stroke="#e1c48b" stroke-width="4"/><path d="M550 535H1215V580H550Z" fill="#a38a64"/></g>${p("athoms", n, 708, 347, 0.57, "sing")}${p("alain", n, 920, 243, 0.94, "sing")}<g class="chorister"><ellipse cx="1121" cy="369" rx="29" ry="38" fill="#9b7357"/><path d="M1070 549V439Q1121 396 1172 439V549Z" fill="#a38a6b"/><path d="M1090 367Q1082 324 1121 324Q1162 327 1150 377L1140 343H1103Z" fill="#222a2a"/></g>${score}`;
  else if ([1, 16, 20, 21, 23, 24].includes(n))
    art = `<g class="scenery"><path d="M554 101H1220V576H554Z" fill="#1d3740"/><circle cx="848" cy="305" r="192" fill="#ae8259" opacity=".24"/><path class="route" d="M647 498Q887 173 1185 448" fill="none" stroke="#d8b678" stroke-width="2" stroke-dasharray="850"/></g>${p("alain", n, 766, 225, 0.94, n === 23 ? "teach" : "calm")}${p("athoms", n, 1061, 279, 0.87, "calm")}<g class="flame"><path d="M889 352Q918 393 896 420Q868 399 889 352" fill="#f3cb7f"/><path d="M890 423V478" stroke="#bc8751" stroke-width="8"/></g>`;
  else if ([13, 14].includes(n))
    art = `<g class="scenery"><rect x="584" y="98" width="585" height="477" fill="#202a30"/><path d="M652 127H1100V551H652Z" fill="#354149" stroke="#bfa06e" stroke-width="2"/></g><g class="remembrance">${p("alain", n, 883, 212, 1)}</g><g class="candle"><rect x="1133" y="465" width="21" height="100" fill="#eee0c3"/><path class="flame" d="M1144 415Q1164 449 1144 465Q1129 452 1144 415" fill="#f4c571"/></g>`;
  else if (n === 17 || n === 22)
    art = `<g class="scenery"><path d="M570 580V108H1220V580" fill="#263f47"/><path d="M717 580V231Q917 37 1117 231V580" fill="#728a85"/><path d="M781 580V249Q917 110 1053 249V580" fill="#d9c89f"/><path d="M570 580L917 475 1220 580" fill="#465e60"/></g>${p("athoms", n, 930, 284, 0.8, "teach")}<g class="light"><path d="M792 520L640 580H1200L1050 520Z" fill="#e3cb96" opacity=".2"/></g>`;
  else art = stage(n);
  return art;
}
export function animateMoloto(
  s: FootballScene,
  tween: (selector: string, from: object, to: object, at?: number) => void,
) {
  if (!s.id.startsWith("legacy-")) return;
  const n = Number(s.id.slice(-2));
  tween(".scenery", { opacity: 0 }, { opacity: 1, duration: 1.1 }, 0);
  tween(
    ".character",
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 1.25, stagger: 0.24, ease: "power2.out" },
    0.35,
  );
  if ([1, 3, 16, 20, 21, 23, 24].includes(n))
    tween(
      ".route",
      { strokeDashoffset: 850 },
      { strokeDashoffset: 0, duration: Math.min(7, s.duration * 0.5) },
      1,
    );
  if ([8, 9, 11, 12].includes(n))
    tween(".book", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, 2);
  if ([18, 19].includes(n)) {
    tween(
      ".foundation",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1.4 },
      0.5,
    );
    tween(
      ".house",
      { opacity: 0, y: -24 },
      { opacity: 1, y: 0, duration: 1.6 },
      2,
    );
  }
}
