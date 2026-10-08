import { applyFamily } from "./families";
import type { SpeechSegment } from "../schemas/transcription";
import {
  planContextual,
  inferIllustration,
  illustrationLabels,
} from "./contextual";
import type { Overlay } from "../schemas/motion-edit";
export function planFromSpeech(
  segments: SpeechSegment[],
  duration: number,
): Overlay[] {
  const valid = segments
    .filter((s) => s.text.trim() && s.end > s.start && s.start < duration)
    .sort((a, b) => a.start - b.start);
  if (!valid.length)
    throw new Error("Aucune parole reconnue dans cette vidéo.");
  const groups: SpeechSegment[] = [];
  for (const s of valid) {
    const last = groups.at(-1);
    const previousTheme = last ? inferIllustration(last.text) : "abstract";
    const nextTheme = inferIllustration(s.text);
    const ideaChanged =
      nextTheme !== "abstract" &&
      previousTheme !== "abstract" &&
      previousTheme !== nextTheme;
    const boundary =
      !last ||
      /[.!?…]$/.test(last.text.trim()) ||
      s.start - last.end >= 0.5 ||
      ideaChanged ||
      last.text.split(/\s+/).length >= 32;
    if (last && !boundary) {
      last.text += " " + s.text;
      last.end = s.end;
    } else groups.push({ ...s });
  }
  while (groups.length > 30) {
    let index = 0;
    for (let i = 0; i < groups.length - 1; i++)
      if (
        groups[i + 1].end - groups[i].start <
        groups[index + 1].end - groups[index].start
      )
        index = i;
    groups.splice(index, 2, {
      start: groups[index].start,
      end: groups[index + 1].end,
      text: groups[index].text + " " + groups[index + 1].text,
    });
  }
  // Filter excessively close boundaries, keep all narration, and cover pauses to avoid blank gaps.
  for (let i = groups.length - 1; i > 0; i--)
    if (
      groups[i].start - groups[i - 1].start < 0.2 ||
      duration - groups[i].start < 0.2
    ) {
      groups[i - 1].text += " " + groups[i].text;
      groups[i - 1].end = groups[i].end;
      groups.splice(i, 1);
    }
  return groups.map((s, i) => {
    const start = i === 0 ? 0 : s.start,
      end = i === groups.length - 1 ? duration : groups[i + 1].start;
    const base = planContextual(s.text, Math.max(0.2, end - start))[0];
    return applyFamily(
      {
        ...base,
        start,
        duration: end - start,
        narration: s.text.slice(0, 20000),
        intent: `Évoquer : ${illustrationLabels[inferIllustration(s.text)].toLowerCase()}.`,
        text: s.text
          .split(/(?<=[.!?])\s+/)[0]
          .trim()
          .split(/\s+/)
          .slice(0, 8)
          .join(" ")
          .replace(/[.,;:]$/, ""),
        illustration: inferIllustration(s.text),
        layout: (
          ["split", "typography", "cinema", "editorial", "poster"] as const
        )[i % 5],
        artVariant: (["minimal", "orbit", "cards"] as const)[i % 3],
        motion: (["slide", "zoom", "orbit", "float"] as const)[i % 4],
        family: (
          [
            "kinetic",
            "collage",
            "cinematic",
            "blueprint",
            "poster",
            "quote",
          ] as const
        )[i % 6],
        color: ["#c8f36b", "#b8a4ff", "#77dddb"][i % 3],
      },
      (
        [
          "kinetic",
          "collage",
          "cinematic",
          "blueprint",
          "poster",
          "quote",
        ] as const
      )[i % 6],
    );
  });
}
