type Word = { text: string; start: number; end: number };
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
export const transcriptTokens = (s: string) =>
  s
    .replace(/\s+([?!:;»])/g, "$1")
    .replace(/«\s+/g, "«")
    .split(/\s+/)
    .filter((w) => normalize(w));
// Align supplied spelling to recognised words. Missing words interpolate between audio anchors.
export function alignTranscript<T extends { narration: string }>(
  parts: T[],
  recognized: Word[],
  duration: number,
) {
  const text = parts.flatMap((s) => transcriptTokens(s.narration)),
    n = text.length,
    m = recognized.length;
  if (!m) throw new Error("Aucun repère de parole disponible.");
  const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] +
          (normalize(text[i - 1]) === normalize(recognized[j - 1].text)
            ? 0
            : 1),
      );
  const aligned: (Word | undefined)[] = Array(n);
  let i = n,
    j = m,
    exact = 0;
  while (i || j) {
    if (
      i &&
      j &&
      dp[i][j] ===
        dp[i - 1][j - 1] +
          (normalize(text[i - 1]) === normalize(recognized[j - 1].text) ? 0 : 1)
    ) {
      if (normalize(text[i - 1]) === normalize(recognized[j - 1].text)) exact++;
      aligned[i - 1] = { ...recognized[j - 1], text: text[i - 1] };
      i--;
      j--;
    } else if (i && dp[i][j] === dp[i - 1][j] + 1) i--;
    else j--;
  }
  if (exact / n < 0.7)
    throw new Error(
      "Le son et la transcription ne correspondent pas suffisamment.",
    );
  for (let k = 0; k < n; k++) {
    if (aligned[k]) continue;
    let end = k;
    while (end < n && !aligned[end]) end++;
    const a = k ? aligned[k - 1]!.end : 0,
      b = end < n ? aligned[end]!.start : duration;
    if (b - a > 0.01) {
      for (let q = k; q < end; q++)
        aligned[q] = {
          text: text[q],
          start: a + ((b - a) * (q - k)) / (end - k),
          end: a + ((b - a) * (q - k + 1)) / (end - k),
        };
    } else {
      const prev = k ? aligned[k - 1] : undefined;
      const from = prev ? prev.start : a,
        to = end < n ? aligned[end]!.end : duration,
        count = end - k + 1 + (prev ? 1 : 0),
        step = (to - from) / count;
      let cursor = from;
      if (prev) {
        prev.end = cursor + step;
        cursor += step;
      }
      for (let q = k; q < end; q++) {
        aligned[q] = { text: text[q], start: cursor, end: cursor + step };
        cursor += step;
      }
      if (end < n) aligned[end]!.start = cursor;
    }
    k = end - 1;
  }
  const words = aligned as Word[];
  let offset = 0,
    start = 0;
  const scenes = parts.map((s, index) => {
    const count = transcriptTokens(s.narration).length,
      sw = words.slice(offset, offset + count);
    offset += count;
    const end =
      index === parts.length - 1
        ? duration
        : (sw.at(-1)!.end + words[offset].start) / 2;
    const result = { ...s, words: sw, duration: end - start };
    start = end;
    return result;
  });
  return { scenes, exactRatio: exact / n, words };
}
