import { readFile, writeFile } from "node:fs/promises";
import { importSourceAudio } from "../lib/services/motion-media";
import { startTranscription } from "../lib/services/transcription";
async function main() {
  const source = await importSourceAudio(
    new Request("http://localhost", {
      method: "POST",
      headers: { "x-file-name": "ma_narration_d4bd4954ce.wav" },
      body: await readFile("/Users/user/Downloads/ma_narration_d4bd4954ce.wav"),
    }),
  );
  await writeFile(".mindstudio/reviens-source.json", JSON.stringify(source));
  console.log(source);
  console.log(await startTranscription(source.id));
}
void main();
