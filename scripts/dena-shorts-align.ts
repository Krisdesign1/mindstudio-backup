import { readFile, writeFile } from "node:fs/promises";
import { alignTranscript } from "../lib/films/align-transcript";
import { subtitleCues, toSrt } from "../lib/hyperframes/captions";

const DURATION = 56.88;
async function main() {
  const text = await readFile(".mindstudio/dena-shorts-work/transcription.txt", "utf8");
  const speech = JSON.parse(await readFile(".mindstudio/dena-shorts-work/transcript.json", "utf8"));
  const parts = text.trim().split(/\n\s*\n/).map((narration, i) => ({
    id: `dena-short-${i + 1}`, title: "", intent: "", labels: [], narration,
  }));
  const aligned = alignTranscript(parts, speech.flatMap((s: { words: unknown[] }) => s.words), DURATION);
  const settings = { enabled: true, words: aligned.words, maxChars: 31, maxWords: 7, maxLines: 2 as const };
  const cues = subtitleCues(settings, DURATION);
  await writeFile(".mindstudio/dena-shorts-work/aligned.json", JSON.stringify({ ...aligned, cues }, null, 2));
  await writeFile(".mindstudio/dena-shorts-work/paroles.srt", toSrt(settings, DURATION));
  console.log(JSON.stringify({ exactRatio: aligned.exactRatio, words: aligned.words.length, cues: cues.length }));
}
void main();
