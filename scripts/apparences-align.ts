import { readFile, writeFile } from "node:fs/promises";
import { alignTranscript, transcriptTokens } from "../lib/films/align-transcript";
import { toSrt } from "../lib/hyperframes/captions";
async function main() {
  const work = ".mindstudio/apparences-work";
  const text = await readFile(`${work}/transcription.txt`, "utf8");
  const speech = JSON.parse(await readFile(`${work}/speech.json`, "utf8"));
  const aligned = alignTranscript([{ narration: text }], speech.flatMap((s: { words: unknown[] }) => s.words), 522.364833);
  await writeFile(`${work}/aligned-words.json`, JSON.stringify(aligned.words));
  let offset = 0;
  const paragraphs = text.trim().split(/\n\s*\n/).map((text) => {
    const count = transcriptTokens(text).length;
    const words = aligned.words.slice(offset, offset + count);
    offset += count;
    return { text, start: words[0].start, end: words.at(-1)!.end };
  });
  await writeFile(`${work}/paragraphs.json`, JSON.stringify(paragraphs));
  await writeFile(`${work}/paroles.srt`, toSrt({ enabled: true, words: aligned.words, maxChars: 38, maxWords: 7, maxLines: 2 },522.364833));
  console.log(JSON.stringify({ words: aligned.words.length, exactRatio: aligned.exactRatio }));
}
void main();
