/** Original vector interpretations, based on public portrait references.
 * Alain: full beard, high rounded hair, broad face, embroidered ivory tunic.
 * Athom's: close cropped hair, narrower jaw, short beard, patterned blue tunic.
 * These are illustrations, not photographs or reconstructions of real events.
 */
export function portrait(
  who: "alain" | "athoms",
  id: string,
  x: number,
  y: number,
  scale = 1,
  pose: "sing" | "teach" | "calm" = "calm",
) {
  const alain = who === "alain";
  const skin = alain ? "#8f4c35" : "#975b40";
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="character character-${who}">
  <defs>
    <linearGradient id="skin-${id}" x1="0" x2="1" y2=".3"><stop stop-color="#c98759"/><stop offset=".42" stop-color="${skin}"/><stop offset="1" stop-color="#4c302b"/></linearGradient>
    <linearGradient id="cloth-${id}" x1="0" x2="1" y2="1"><stop stop-color="${alain ? "#faf0d4" : "#79a7ad"}"/><stop offset="1" stop-color="${alain ? "#9d947e" : "#243b5a"}"/></linearGradient>
    <pattern id="pattern-${id}" width="32" height="30" patternUnits="userSpaceOnUse"><path d="M0 0H32L16 16ZM0 20H32" fill="none" stroke="${alain ? "#c1a777" : "#d6b989"}" stroke-width="${alain ? 1 : 3}"/></pattern>
    <clipPath id="shirt-${id}"><path d="M-42 148Q-72 154 -127 181L-156 336H156L127 181Q72 154 42 148L0 177Z"/></clipPath>
  </defs>
  <ellipse cx="0" cy="334" rx="158" ry="16" fill="#080f15" opacity=".2"/>
  <path d="M-39 121L-42 160Q0 192 42 160L36 117" fill="url(#skin-${id})"/>
  <path d="M-42 148Q-72 154 -127 181L-156 336H156L127 181Q72 154 42 148L0 177Z" fill="url(#cloth-${id})"/>
  <g clip-path="url(#shirt-${id})"><path d="M-170 210L155 173V222L-170 260ZM-160 280L160 250V297L-160 327Z" fill="url(#pattern-${id})" opacity=".85"/>${alain ? '<path d="M18 170V339M38 164V339M58 168V339" stroke="#e7d5b0" stroke-width="5"/>' : ""}<path d="M-113 207L-105 340M113 207L106 340" stroke="#253943" opacity=".3" stroke-width="3"/></g>
  <path d="M-42 148L0 177L42 148M0 177V336" stroke="${alain ? "#fcf5e4" : "#b2cad0"}" stroke-width="3" fill="none"/>
  <g class="portrait-head" transform="scale(${alain ? 1.1 : 1} 1)">
  <ellipse cx="-61" cy="63" rx="12" ry="23" fill="${skin}"/><ellipse cx="61" cy="63" rx="11" ry="23" fill="#613c2d"/>
  <path d="M-63 22Q-66 -20 0 -29Q67 -25 64 28L59 88Q53 126 0 ${alain ? 148 : 137}Q-48 132 -60 90Z" fill="url(#skin-${id})"/>
  ${alain ? '<path d="M-63 39L-71 1Q-69 -44 -29 -46Q13 -60 51 -36Q76 -15 64 39L51 10Q12 -9 -40 10L-55 38Z" fill="#1f2022"/><path d="M-67 0Q-60 -29 -36 -34M-23 -40Q15 -48 46 -28" fill="none" stroke="#383333" stroke-width="5"/>' : '<path d="M-63 31Q-76 -27 -14 -37Q53 -46 65 11L62 35L51 3Q3 -12 -49 6Z" fill="#262b31"/><path d="M-53 -3Q-5 -31 49 -7" stroke="#45444a" stroke-width="9" fill="none"/>'}
  <path d="M-54 45Q-33 29 -12 42M12 40Q34 29 54 42" stroke="#2c2422" stroke-width="7" fill="none"/>
  <path d="M-49 54Q-31 43 -15 53Q-32 63 -49 54M15 53Q34 41 50 51Q34 62 15 53" fill="#e3d1b9"/>
  <ellipse cx="-31" cy="53" rx="6" ry="6" fill="#251e1b"/><ellipse cx="33" cy="51" rx="6" ry="6" fill="#251e1b"/><circle cx="-29" cy="51" r="1.7" fill="#fff"/><circle cx="35" cy="49" r="1.7" fill="#fff"/>
  <path d="M2 47L-7 78Q0 85 13 78" stroke="#5a3028" stroke-width="4" fill="none"/><path d="M-15 77Q-22 81 -13 86M12 79Q24 82 18 86" stroke="#442b26" stroke-width="3" fill="none"/>
  <path d="M-49 72Q-58 94 -39 121Q-6 ${alain ? 157 : 141} 33 126Q61 110 56 70L45 92Q24 89 15 93Q0 101 -15 94Q-34 88 -45 94Z" fill="${alain ? "#222124" : "#303033"}"/>
  <path d="M-22 100Q0 91 26 99L18 111Q-2 119 -21 106Z" fill="#aa6b59"/>
  ${!alain || pose === "sing" ? '<path d="M-20 100Q3 103 22 99L17 105Q0 112 -17 105Z" fill="#f3e3c9"/>' : '<path d="M-22 101Q0 106 24 100" fill="none" stroke="#4d2926" stroke-width="3"/>'}
  <path d="M-46 65L-31 71M30 68L47 60M-17 122Q0 131 20 119" stroke="#da9b6a" opacity=".25" fill="none" stroke-width="3"/>
  </g>
  ${pose === "sing" ? '<g class="microphone"><path d="M80 286L31 204" stroke="#3c444a" stroke-width="18"/><rect x="11" y="161" width="31" height="61" rx="15" transform="rotate(-29 27 190)" fill="#c4c8c2"/><path d="M81 293Q25 285 21 245Q16 222 32 226L53 245L103 264" fill="' + skin + '"/></g>' : pose === "teach" ? '<g class="gesture"><path d="M-125 230Q-95 204 -58 218L-18 194Q-5 186 3 195L-19 218L17 210Q31 210 24 221L-32 245Q-97 255 -125 256" fill="' + skin + '"/><path d="M-117 217L-141 271L-87 277L-71 232" fill="url(#cloth-' + id + ')"/></g>' : ""}
  </g></g>`;
}
