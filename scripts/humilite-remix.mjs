// Use the installed HyperFrames producer's own mix and mux functions.
// No video frame is re-encoded; project gains are read from the saved Studio source.
import { readFile, copyFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
const { mixAudioTracks, muxVideoWithAudio, runFfmpeg } = await import('../.mindstudio/humilite-work/hyperframes-audio-internals.mjs');
try {
const p=resolve('.mindstudio/studio/free-fa2bb054-a665-4f20-96c3-07db2fd17d14');
const text=await readFile(`${p}/index.html`,'utf8');
const tags=text.match(/<audio\b[^>]*>/g)||[];
const attr=(tag,key)=>tag.match(new RegExp(`${key}="([^"]*)"`))?.[1];
const duration=350.625;
const tracks=tags.map(tag=>({elementId:attr(tag,'id'),srcPath:resolve(p,attr(tag,'src')),start:Number(attr(tag,'data-start')||0),end:Number(attr(tag,'data-duration')||350.590083),volume:Number(attr(tag,'data-volume')||1)}));
const mix=await mixAudioTracks(tracks,`${p}/mixed-audio.m4a`,duration,undefined,{audioGain:1});
if(!mix.success)throw Error(mix.error);
const strip=await runFfmpeg(["-i",`${p}/delivery.mp4`,"-an","-c:v","copy","-y",`${p}/video-only.mp4`]);
if(!strip.success)throw Error(strip.stderr);
const mux=await muxVideoWithAudio(`${p}/video-only.mp4`,`${p}/mixed-audio.m4a`,`${p}/delivery-remixed.mp4`);
if(!mux.success)throw Error(mux.error);
await copyFile(`${p}/delivery.mp4`,resolve('.mindstudio/humilite-work/delivery-before-music-fix.mp4'));
await rename(`${p}/delivery-remixed.mp4`,`${p}/delivery.mp4`);
console.log(JSON.stringify({tracks,mix:mix.success,mux:mux.success}));

} catch(error) { console.error(error); process.exitCode=1; }
