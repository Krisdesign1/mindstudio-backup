import { readFile, writeFile } from "node:fs/promises";
import { alignTranscript } from "../lib/films/align-transcript";
import { subtitleCues, toSrt } from "../lib/hyperframes/captions";
async function main() {
  const text = await readFile(
    ".mindstudio/david-work/transcription.txt",
    "utf8",
  );
  const speech = JSON.parse(
    await readFile(".mindstudio/david-work/transcript.json", "utf8"),
  );
  const parts = text
    .trim()
    .split(/\n\s*\n/)
    .map((narration, i) => ({
      id: `david-${i}`,
      title: "",
      intent: "",
      labels: [],
      narration,
    }));
  const aligned = alignTranscript(
    parts,
    speech.flatMap((s: { words: unknown[] }) => s.words),
    339.441,
  );
  const settings = {
    enabled: true,
    words: aligned.words,
    maxChars: 42,
    maxWords: 11,
    maxLines: 2 as const,
  };
  await writeFile(
    ".mindstudio/david-work/aligned.json",
    JSON.stringify({ ...aligned, cues: subtitleCues(settings, 339.441) }),
  );
  await writeFile(
    ".mindstudio/david-work/paroles.srt",
    toSrt(settings, 339.441),
  );
  console.log(
    JSON.stringify({
      exactRatio: aligned.exactRatio,
      words: aligned.words.length,
    }),
  );
}
void main();
