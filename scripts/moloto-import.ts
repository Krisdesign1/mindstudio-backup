import { readFile, writeFile } from "node:fs/promises";
import { importSourceAudio } from "../lib/services/motion-media";
import { startTranscription } from "../lib/services/transcription";
async function main() {
 const name = "Avant-Athom-s-Mbuma-il-y-avait-Alain-Moloto.wav";
 const source = await importSourceAudio(new Request("http://localhost", { method: "POST", headers: { "x-file-name": name }, body: await readFile(`/Users/user/Downloads/${name}`) }));
 await writeFile(".mindstudio/moloto-source.json", JSON.stringify(source));
 console.log(JSON.stringify({ source, transcription: await startTranscription(source.id) }));
}
void main();
