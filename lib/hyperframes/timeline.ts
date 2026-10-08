import type { Overlay } from "../schemas/motion-edit";
export function moveBoundary(
  layers: Overlay[],
  leftId: string,
  time: number,
): Overlay[] {
  const ordered = [...layers].sort((a, b) => a.start - b.start),
    index = ordered.findIndex((l) => l.id === leftId),
    left = ordered[index],
    right = ordered[index + 1];
  if (
    !left ||
    !right ||
    Math.abs(left.start + left.duration - right.start) > 0.03 ||
    !Number.isFinite(time)
  )
    return layers;
  const end = right.start + right.duration,
    value = Math.min(end - 0.2, Math.max(left.start + 0.2, time));
  return layers.map((l) =>
    l.id === left.id
      ? { ...l, duration: value - left.start }
      : l.id === right.id
        ? { ...l, start: value, duration: end - value }
        : l,
  );
}
