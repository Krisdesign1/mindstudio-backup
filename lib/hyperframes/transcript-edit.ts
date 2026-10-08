import type { MotionEdit } from "../schemas/motion-edit";
export function replaceSceneTranscript(
  edit: MotionEdit,
  id: string,
  text: string,
): MotionEdit {
  const layer = edit.layers.find((l) => l.id === id);
  if (!layer) return edit;
  const end = layer.start + layer.duration;
  const old = (edit.captions?.words || []).filter(
    (w) => w.start >= layer.start && w.start < end,
  );
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const start = old[0]?.start ?? layer.start,
    stop = Math.min(end, old.at(-1)?.end ?? end);
  const words = tokens.map((word, i) => ({
    text: word.slice(0, 160),
    start:
      tokens.length === old.length
        ? old[i].start
        : start + ((stop - start) * i) / tokens.length,
    end:
      tokens.length === old.length
        ? old[i].end
        : start + ((stop - start) * (i + 1)) / tokens.length,
  }));
  const layers = edit.layers.map((l) =>
    l.id === id ? { ...l, narration: text } : l,
  );
  return {
    ...edit,
    layers,
    transcript: [...layers]
      .sort((a, b) => a.start - b.start)
      .map((l) => l.narration || "")
      .join(" "),
    captions: {
      ...edit.captions,
      enabled: edit.captions?.enabled ?? true,
      words: [
        ...(edit.captions?.words || []).filter(
          (w) => w.start < layer.start || w.start >= end,
        ),
        ...words,
      ].sort((a, b) => a.start - b.start),
    },
  };
}
