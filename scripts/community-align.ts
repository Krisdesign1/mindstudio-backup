import { readFile, writeFile } from 'node:fs/promises';
import { alignTranscript } from '../lib/films/align-transcript';
async function main() {
const meta=JSON.parse(await readFile('.mindstudio/community-master/project.json','utf8'));
const text=await readFile(`.mindstudio/studio/${meta.id}/transcription.txt`,'utf8');
const speech=JSON.parse(await readFile('.mindstudio/community-master/speech.json','utf8'));
const aligned=alignTranscript([{id:'community',title:'',intent:'',labels:[],narration:text}],speech.flatMap((s:{words:unknown[]})=>s.words),43.43);
await writeFile('.mindstudio/community-master/aligned-words.json',JSON.stringify(aligned.words));
console.log(JSON.stringify({words:aligned.words.length,exactRatio:aligned.exactRatio}));
}
void main();
