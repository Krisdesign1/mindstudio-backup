import { readFile,writeFile } from 'node:fs/promises';
import { planContextual } from '../lib/hyperframes/contextual';
import { prepareOverlay } from '../lib/services/motion-overlay';
import { overlayRequestSchema } from '../lib/schemas/motion-edit';
async function main(){const old=JSON.parse(await readFile('.mindstudio/overlay-smoke.json','utf8'));const layers=planContextual('Notre croissance commence par un investissement dans notre apprentissage. Ensemble, notre équipe trouve des idées pour avancer sur le chemin.',old.edit.source.duration);const job=await prepareOverlay(overlayRequestSchema.parse({projectId:crypto.randomUUID(),name:'Illustrations contextuelles',edit:{...old.edit,layers}}));await writeFile('.mindstudio/contextual-smoke.json',JSON.stringify(job));console.log(JSON.stringify(job));}void main().catch(e=>{console.error(e);process.exitCode=1;});
