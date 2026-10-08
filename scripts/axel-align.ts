import { readFile, writeFile } from "node:fs/promises";
import { alignTranscript } from "../lib/films/align-transcript";
import { subtitleCues, toSrt } from "../lib/hyperframes/captions";
async function main() {
  const text = await readFile(
    ".mindstudio/axel-work/transcription.txt",
    "utf8",
  );
  const speech = JSON.parse(
    await readFile(".mindstudio/axel-work/transcript.json", "utf8"),
  );
  const parts = text
    .trim()
    .split(/\n\s*\n/)
    .map((narration, i) => ({
      id: `axel-${i}`,
      title: "",
      intent: "",
      labels: [],
      narration,
    }));
  const aligned = alignTranscript(
    parts,
    speech.flatMap((s: { words: unknown[] }) => s.words),
    319.981167,
  );
  const settings = {
    enabled: true,
    words: aligned.words,
    maxChars: 42,
    maxWords: 11,
    maxLines: 2 as const,
  };
  await writeFile(
    ".mindstudio/axel-work/aligned.json",
    JSON.stringify({ ...aligned, cues: subtitleCues(settings, 319.981167) }),
  );
  await writeFile(
    ".mindstudio/axel-work/paroles.srt",
    toSrt(settings, 319.981167),
  );
  console.log(
    JSON.stringify({
      exactRatio: aligned.exactRatio,
      words: aligned.words.length,
    }),
  );
}
void main();
