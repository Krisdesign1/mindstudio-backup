import { readFile, writeFile } from "node:fs/promises";
import { importSourceAudio } from "../lib/services/motion-media";
import { startTranscription } from "../lib/services/transcription";
async function main() {
  const source = await importSourceAudio(
    new Request("http://localhost", {
      method: "POST",
      headers: { "x-file-name": "ma_narration_2cb7b94cc7.wav" },
      body: await readFile("/Users/user/Downloads/ma_narration_2cb7b94cc7.wav"),
    }),
  );
  await writeFile(".mindstudio/mourinho-source.json", JSON.stringify(source));
  console.log(source);
  console.log(await startTranscription(source.id));
}
void main();
