import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {motionEditSchema,newOverlay} from './schemas/motion-edit';
import {overlayComposition} from './hyperframes/overlay-composition';
const source={id:crypto.randomUUID(),name:'source',duration:5,width:1280,height:720,hasAudio:false};
test('project identity overrides presentation without mutating scenes and escapes signature',()=>{
 const edit=motionEditSchema.parse({layers:[{...newOverlay(),contextual:true}],quality:'720p',keepAudio:true,identity:{enabled:true,accent:'#112233',background:'#445566',text:'#ffffff',font:'serif',signature:'Ma marque <script>',captionStyle:'highlight'}});
 const before=JSON.stringify(edit);const html=overlayComposition(edit,source).html;assert.match(html,/Ma marque &lt;script&gt;/);assert.match(html,/background:#445566!important/);assert.match(html,/font-family:Georgia,serif!important/);assert.equal(JSON.stringify(edit),before);
 const off=overlayComposition({...edit,identity:{...edit.identity!,enabled:false}},source).html;assert.doesNotMatch(off,/Ma marque &lt;script&gt;/);
});
test('inline title editing exists only in editable preview, and generated scripts compile',()=>{
 const edit=motionEditSchema.parse({layers:[newOverlay()],quality:'720p',keepAudio:true});
 for(const preview of [false,true]){const html=overlayComposition(edit,source,{preview,editable:true}).html;assert.equal(html.includes("type:'motion-title'"),preview);for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>new Script(m[1]));}
});
