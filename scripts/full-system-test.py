from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
s=(root/'scripts/character-engine-test.py').read_text().replace("w=root/'.mindstudio/character-engine-test'","w=root/'.mindstudio/full-system-test'").replace('Character Engine · Test muet 15 s','Le Message · Prototype système 28 s').replace('TEST MUET · PERSONNAGE ILLUSTRÉ · 15 S','PROTOTYPE MUET · 28 S').replace('data-duration="15"','data-duration="28"')
# Reuse the visual shell, replacing the complete timeline with marker-driven staging.
s=s[:s.index("tl='''")]+'''\nconfig=dict(markers=dict(CALM_START=0,NOTIFICATION=4,LOOK_PHONE=4.12,PHONE_PICKUP=7.55,REACTION=11,LIPSYNC_START=11.5,LIPSYNC_END=16.5,B_ENTERS=17,LOOK_B=17.15,REVERSE_SHOT=21,FINAL_CLOSEUP=25,END=28),rehearsal=False)
(p/'config.json').write_text(json.dumps(config,indent=2))
shutil.copy(root/'lib/hyperframes/character-test/state.mjs',p/'state.mjs')
# Subject and prop share the same coordinate plane. The hand contacts the phone before both move together.
phone='<div id="hand"><svg viewBox="0 0 1080 1920"><path d="M280 1740Q320 1500 580 1460L650 1450Q704 1490 666 1550L592 1540Q440 1590 420 1770Z" fill="#ac714f"/></svg></div><div id="phone"><div class="phone-screen"><span>MESSAGE</span><b>Tout commence<br>maintenant.</b></div></div>'
body=body.replace('<div id="shade"',phone+'<div id="shade"')
body+='<div id="entrance"><div class="door-light"></div></div><pre id="debug"></pre>'
css+='#hand{position:absolute;inset:0;opacity:0}#hand svg{width:1080px;height:1920px}#phone{position:absolute;left:615px;top:1450px;width:140px;height:250px;border:10px solid #20393f;border-radius:24px;background:#fcf3df;transform:rotate(12deg)}.phone-screen{padding:18px 8px;color:#365453}.phone-screen span{font:10px Arial;letter-spacing:2px}.phone-screen b{display:block;margin-top:45px;font:18px Georgia}#entrance{position:absolute;inset:0;background:#b7ae95;opacity:0;pointer-events:none}.door-light{position:absolute;left:240px;top:190px;width:650px;height:1630px;background:linear-gradient(120deg,#f5ebc8,#c5cdb9);border:40px solid #6d776c;box-shadow:70px 20px 0 #918d78}#debug{display:none;position:absolute;inset:100px 40px auto;background:#101e2eee;color:#b9f5d0;font:25px/1.4 monospace;padding:28px;z-index:99}'
# Pupils and highlights move together; restrained look shifts. Facial identity is not assessed without a photo.
import re
body=re.sub(r'(<ellipse cx="-?59"[^>]+fill="#241d1a"/>)',r'<g class="pupil">\\1</g>',body)
body=re.sub(r'(<ellipse cx="65"[^>]+fill="#241d1a"/>)',r'<g class="pupil">\\1</g>',body)
tl="""const tl=gsap.timeline({paused:true});
const M=CONFIG.markers;
tl.to('#background',{scale:1.015,duration:3,ease:'sine.inOut'},M.CALM_START);
tl.to('#subject',{scale:1.025,duration:3,ease:'sine.inOut'},M.CALM_START);
tl.to('#notice',{opacity:1,y:0,duration:.35,ease:'power2.out'},M.NOTIFICATION);
tl.to('.pupil',{x:5,y:4,duration:.15},M.LOOK_PHONE);
tl.to('#subject',{rotation:1,transformOrigin:'50% 60%',duration:.3},M.LOOK_PHONE+.12);
tl.to('#subject',{filter:'blur(4px)',duration:.5},M.NOTIFICATION+.25);
tl.to('#notice',{opacity:0,duration:.3},6.5);
tl.to('#subject',{filter:'blur(0px)',duration:.5},6.6);
tl.fromTo('#hand',{opacity:0,x:-70,y:70},{opacity:1,x:0,y:0,duration:.4,ease:'power2.inOut'},M.PHONE_PICKUP-.4);
tl.to(['#hand','#phone'],{x:-70,y:-260,duration:.4,ease:'power2.inOut'},M.PHONE_PICKUP);
tl.to(['#hand','#phone'],{y:-252,duration:.2,ease:'sine.out'},M.PHONE_PICKUP+.4);
tl.to('#subject',{scale:1.10,rotation:0,duration:.8,ease:'sine.inOut'},M.REACTION);
tl.to('#warm',{opacity:.22,duration:1},M.REACTION);
for(let i=0;i<12;i++){const at=M.LIPSYNC_START+i*.4;tl.to('#mouth',{attr:{ry:i%3===0?2:12,rx:i%3===1?20:30},duration:.16},at);}
tl.to('#mouth',{attr:{ry:2,rx:30},duration:.15},M.LIPSYNC_END);
tl.to('.pupil',{x:-6,y:0,duration:.15},M.LOOK_B);
tl.to('#subject',{rotation:-1,duration:.3},M.LOOK_B+.12);
tl.set('#entrance',{opacity:1},M.REVERSE_SHOT);
tl.set('#entrance',{opacity:0},23);
tl.to('#subject',{scale:1.15,rotation:0,duration:.7},M.FINAL_CLOSEUP);
tl.to('#final span',{y:0,duration:.5,ease:'power2.out'},M.FINAL_CLOSEUP);
tl.to('#main',{opacity:0,duration:.5},M.END-.5);
window.__timelines=window.__timelines||{};window.__timelines.main=tl;
"""
# No realtime clock: debug is derived from the same timeline, including reverse seeks.
js='const CONFIG='+json.dumps(config)+';'+tl
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="main" data-composition-id="main" data-start="0" data-duration="28" data-width="1080" data-height="1920">{body}</main><script>{js}</script><script type="module">import {{stateAt}} from "./state.mjs";const q=new URLSearchParams(location.search);if(q.get("rehearsal")==="1"){{const box=document.getElementById("debug");box.style.display="block";const update=()=>{{box.textContent=JSON.stringify(stateAt(window.__timelines.main.time(),CONFIG),null,2)}};window.__timelines.main.eventCallback("onUpdate",update);update();}}</script></body></html>')
(p/'notes-test.md').write_text("Prototype muet 28 s. Personnage illustré de substitution. Prise de téléphone par mouvement commun main/objet après contact; regard animé; présence B uniquement hors champ et cut sur une entrée vide. Pas de voix ni bruitages inventés. Lèvres simulées. Contrôles d’état déterministes, mode répétition via ?rehearsal=1. Ce prototype ne constitue pas l’implémentation de tous les moteurs listés dans le brief. Photo, phonèmes, audio spatial, physique et rig anatomique restent non validés.")
print(m['id'])
'''
exec(compile(s,str(root/'scripts/character-engine-test.py'),'exec'),{'__file__':str(root/'scripts/character-engine-test.py')})
