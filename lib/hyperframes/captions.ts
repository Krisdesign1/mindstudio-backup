import type { MotionEdit } from "../schemas/motion-edit";
type Settings = NonNullable<MotionEdit["captions"]>;
type Word = Settings["words"][number];
export function cleanCaptionText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}
export function captionGroups(
  words: Word[],
  duration: number,
  settings?: Partial<Settings>,
) {
  const maxChars = settings?.maxChars ?? 32,
    maxLines = settings?.maxLines ?? 2,
    maxWords = settings?.maxWords ?? 8;
  const groups: Word[][] = [];
  for (const original of [...words]
    .filter((w) => w.text.trim() && w.start < duration && w.end > w.start)
    .sort((a, b) => a.start - b.start)) {
    const word = {
        ...original,
        text: cleanCaptionText(original.text),
        end: Math.min(duration, original.end),
      },
      last = groups.at(-1);
    const combined = last ? [...last, word] : [word];
    if (
      !last ||
      last.length >= maxWords ||
      word.start - last.at(-1)!.end > 0.6 ||
      /[.!?…]$/.test(last.at(-1)!.text) ||
      (/[,;:]$/.test(last.at(-1)!.text) && last.length >= 3) ||
      captionLines(combined, maxChars).length > maxLines ||
      word.end - last[0].start > 5
    )
      groups.push([word]);
    else last.push(word);
  }
  // Manual timing edits must not create overlapping exported cues.
  for (let i = 0; i < groups.length - 1; i++) {
    const next = groups[i + 1][0].start;
    groups[i] = groups[i]
      .filter((w) => w.start < next)
      .map((w) => ({ ...w, end: Math.min(w.end, next) }));
  }
  return groups.filter((g) => g.length && g.at(-1)!.end > g[0].start);
}
export function captionLines(words: Word[], maxChars = 32): Word[][] {
  const lines: Word[][] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (
      !last ||
      last.map((w) => w.text).join(" ").length + word.text.length + 1 > maxChars
    )
      lines.push([word]);
    else last.push(word);
  }
  if (lines.length === 2) {
    const a = lines[0],
      b = lines[1];
    while (
      a.length > 1 &&
      a.map((w) => w.text).join(" ").length >
        b.map((w) => w.text).join(" ").length + 8 &&
      a.at(-1)!.text.length + 1 + b.map((w) => w.text).join(" ").length <=
        maxChars
    )
      b.unshift(a.pop()!);
  }
  return lines;
}
export function subtitleCues(settings: Settings, duration: number) {
  return captionGroups(settings.words, duration, settings).map((group) => ({
    start: group[0].start,
    end: group.at(-1)!.end,
    lines: captionLines(group, settings.maxChars ?? 32),
  }));
}
export function toSrt(settings: Settings, duration: number) {
  const stamp = (seconds: number) => {
    const ms = Math.max(0, Math.round(seconds * 1000));
    return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
  };
  return subtitleCues(settings, duration)
    .map(
      (cue, i) =>
        `${i + 1}\n${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.lines.map((line) => line.map((w) => w.text.replace(/[<>]/g, "")).join(" ")).join("\n")}\n`,
    )
    .join("\n");
}
