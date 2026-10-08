import { readFile, writeFile } from "node:fs/promises";
import { alignTranscript } from "../lib/films/align-transcript";
import { toSrt } from "../lib/hyperframes/captions";
async function main() {
  const work = ".mindstudio/athoms-work";
  const meta = JSON.parse(await readFile(`${work}/project.json`, "utf8"));
  const text = await readFile(`${work}/transcription.txt`, "utf8");
  const speech = JSON.parse(await readFile(`${work}/speech.json`, "utf8"));
  const aligned = alignTranscript(
    [{ id: "athoms", title: "", intent: "", labels: [], narration: text }],
    speech.flatMap((s: { words: unknown[] }) => s.words),
    81.87,
  );
  await writeFile(`${work}/aligned-words.json`, JSON.stringify(aligned.words));
  await writeFile(
    `.mindstudio/studio/${meta.id}/paroles.srt`,
    toSrt({ enabled: true, words: aligned.words, maxChars: 38, maxWords: 7, maxLines: 2 }, 81.87),
  );
  console.log(JSON.stringify({ words: aligned.words.length, exactRatio: aligned.exactRatio }));
}
void main();
