/** Deterministic scene evaluation: safe for backward seeks and frame renders. */
export const markers = { CALM_START:0,NOTIFICATION:4,LOOK_PHONE:4.12,PHONE_PICKUP:7.55,REACTION:11,LIPSYNC_START:11.5,LIPSYNC_END:16.5,B_ENTERS:17,LOOK_B:17.15,REVERSE_SHOT:21,FINAL_CLOSEUP:25,END:28 };
export const presets = {medium:{scale:1,x:0},closeup:{scale:1.12,x:0},entrance:{scale:1,x:-35},final:{scale:1.15,x:0}};
export function stateAt(time, config={}) {
 const m={...markers,...config.markers};
 const active=Object.entries(m).filter(([,t])=>t<=time).sort((a,b)=>a[1]-b[1]).at(-1)?.[0]??'CALM_START';
 return {time,marker:active,phone:{holder:time>=m.PHONE_PICKUP?'A_RIGHT_HAND':null,position:time>=m.PHONE_PICKUP?'hand_right':'table'},characterA:{eyeTarget:time>=m.LOOK_B?'entrance':time>=m.LOOK_PHONE?'phone':'camera',emotion:time>=m.REACTION?'realization':'neutral'},characterB:{visible:false,mode:'offscreen'},cameraSide:'axis_A',focus:time>=m.REVERSE_SHOT&&time<m.FINAL_CLOSEUP?'entrance':time>=m.NOTIFICATION&&time<m.PHONE_PICKUP?'notification':'face',lighting:time>=m.REACTION?'warm_realization':'warm_neutral',voice:'absent',lipMode:'simulated'};
}
export function qualityReport(config={}) {
 const m={...markers,...config.markers};
 const samples=[0,4.2,7.6,11,18,21,25,27].map(t=>stateAt(t,config));
 return {checks:[{name:'ordered markers',pass:Object.values(m).every((v,i,a)=>i===0||v>=a[i-1])},{name:'phone stays in right hand',pass:samples.filter(s=>s.time>=m.PHONE_PICKUP).every(s=>s.phone.holder==='A_RIGHT_HAND')},{name:'camera axis stable',pass:samples.every(s=>s.cameraSide==='axis_A')},{name:'no invented B',pass:samples.every(s=>!s.characterB.visible)}],untested:['photo identity','true phoneme alignment','sound mix','spatial audio','photographic face rig','B reverse shot','physical collisions'],samples};
}
