import {test} from 'node:test';
import assert from 'node:assert/strict';
import {subtitleCues,toSrt,cleanCaptionText} from './hyperframes/captions';
const words='Bonjour tout le monde. Voici une nouvelle idée pour avancer ensemble.'.split(' ').map((text,i)=>({text,start:i*.4,end:i*.4+.35}));
test('caption limits respect words, lines and punctuation without losing words',()=>{
 const settings={enabled:true,words,maxChars:20,maxWords:6,maxLines:2 as const};
 const cues=subtitleCues(settings,10);assert.ok(cues.length>=3);assert.equal(cues.flatMap(c=>c.lines.flat()).map(w=>w.text).join(' '),words.map(w=>w.text).join(' '));
 for(const cue of cues){assert.ok(cue.lines.length<=2);assert.ok(cue.lines.every(line=>line.map(w=>w.text).join(' ').length<=20));}
 assert.equal(cues[0].lines.flat().at(-1)!.text,'monde.');
});
test('SRT uses millisecond timecodes and corrected text, even when MP4 captions hidden',()=>{
 const text=toSrt({enabled:false,words:[{text:'Corrigé.',start:61.234,end:63.5}]},90);
 assert.equal(text,'1\n00:01:01,234 --> 00:01:03,500\nCorrigé.\n');assert.equal(cleanCaptionText(' bonjour   , '),'bonjour,');
});
test('manual timing overlaps cannot produce overlapping SRT cues',()=>{
 const cues=subtitleCues({enabled:true,words:[{text:'Bonjour.',start:0,end:4},{text:'Suite.',start:2,end:3}]},5);assert.ok(cues[0].end<=cues[1].start);
});
