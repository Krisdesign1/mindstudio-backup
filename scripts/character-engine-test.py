from pathlib import Path
import importlib.util,json,uuid,datetime,shutil
root=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('art',root/'scripts/dena-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
w=root/'.mindstudio/character-engine-test';w.mkdir(exist_ok=True)
m=json.loads((w/'project.json').read_text()) if (w/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Character Engine · Test muet 15 s',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
p=root/'.mindstudio/studio'/m['id'];p.mkdir(exist_ok=True);(w/'project.json').write_text(json.dumps(m));(p/'mindstudio-project.json').write_text(json.dumps(m));shutil.copy(root/'node_modules/gsap/dist/gsap.min.js',p/'gsap.min.js')
character=art.person('dena',540,1020,1.65)
old='<path d="M-42 64Q-18 46 0 56Q18 46 43 61Q17 85-10 79Q-29 75-42 64" fill="#713d35"/><path d="M-35 63Q0 68 35 61" fill="none" stroke="#d79c80" stroke-width="3"/>'
character=character.replace(old,'<ellipse id="mouth" cx="0" cy="65" rx="30" ry="2" fill="#492a2a" stroke="#915448" stroke-width="4"/>')
# Local prototype uses the existing illustrated cast as a placeholder, no photo or voice.
css='''*{box-sizing:border-box}html,body{margin:0;background:#e7dcc4}#main{position:relative;width:1080px;height:1920px;overflow:hidden}.layer{position:absolute;inset:0;transform-origin:50% 60%}.layer svg{width:1080px;height:1920px}.caption{position:absolute;top:150px;left:85px;right:85px;font:24px Arial;letter-spacing:5px;color:#28484a}.caption small{display:block;font:20px Arial;letter-spacing:1px;margin-top:18px}#notice{opacity:0;position:absolute;left:100px;top:560px;width:880px;height:230px;border-radius:38px;padding:42px 45px;background:#fff8e9;box-shadow:0 28px 100px #243e4944;color:#253f43;transform-origin:50% 50%;overflow:hidden}#notice small{font:22px Arial;letter-spacing:3px;color:#7b785c}#notice h2{font:38px Georgia;margin:24px 0}#message{position:absolute;inset:380px 70px auto;font:66px/1.2 Georgia;opacity:0}#message span{display:block;font:25px Arial;letter-spacing:3px;margin-bottom:45px;color:#867442}#final{position:absolute;top:370px;left:80px;right:80px;overflow:hidden;text-align:center;color:#214447}#final span{transform:translateY(110px);display:block;font:86px Georgia}#warm{background:#edb361;mix-blend-mode:soft-light;opacity:0;pointer-events:none}#shade{background:linear-gradient(0deg,#173b4655,transparent 40%);pointer-events:none}'''
body=f'<div id="background" class="layer"><svg viewBox="0 0 1080 1920">{art.DEFS}{art.room()}</svg></div><div id="subject" class="layer"><svg viewBox="0 0 1080 1920">{character}</svg></div><div id="shade" class="layer"></div><div id="warm" class="layer"></div><div class="caption">CHARACTER ENGINE<small>TEST MUET · PERSONNAGE ILLUSTRÉ · 15 S</small></div><div id="notice"><small>NOUVEAU MESSAGE</small><h2>Quelque chose va changer.</h2><div id="message"><span>AUJOURD’HUI · 09:41</span>Et si tout<br>commençait<br>maintenant ?</div></div><div id="final"><span>J’AI COMPRIS.</span></div>'
tl='''const tl=gsap.timeline({paused:true});
tl.set('#notice',{opacity:0,y:45},0).set('#final span',{y:110},0).set('#subject',{scale:1,x:0,rotation:0,filter:'blur(0px)'},0);
tl.to('#background',{scale:1.018,duration:3,ease:'none'},0).to('#subject',{scale:1.04,duration:3,ease:'sine.inOut'},0);
tl.to('#notice',{opacity:1,y:0,duration:.42,ease:'power3.out'},3.35);
tl.to('#subject',{filter:'blur(7px)',x:-18,duration:.65,ease:'sine.inOut'},3.5);
tl.to('#warm',{opacity:.15,duration:.8},3.5);
// Deterministic geometry transition: one card expands into the message screen.
tl.to('#notice',{x:-55,y:-320,width:990,height:1450,borderRadius:58,duration:1.3,ease:'power3.inOut'},6);
tl.to('#notice h2',{opacity:0,duration:.3},6).to('#message',{opacity:1,duration:.5},6.8);
tl.to('#subject',{scale:1.12,opacity:.25,duration:1.2},6);
tl.to('#notice',{opacity:0,scale:1.12,duration:.55,ease:'power2.inOut'},9);
tl.to('#subject',{filter:'blur(0px)',opacity:1,scale:1.13,x:0,rotation:-1.1,duration:.65,ease:'sine.inOut'},9);
tl.to('#warm',{opacity:.34,duration:1},9);
tl.to('#subject',{rotation:0,duration:1.2,ease:'sine.inOut'},10.5);
tl.to('#final span',{y:0,duration:.65,ease:'power3.out'},12);
tl.to('#final',{scale:1.035,duration:.5,ease:'sine.inOut'},12.6);
'''
for start,ry,rx in [(9.7,12,27),(9.9,3,35),(10.15,19,20),(10.4,2,30),(10.7,10,38),(10.95,2,30),(12.2,15,24),(12.4,5,38),(12.65,2,30)]:
 tl+=f"tl.to('#mouth',{{attr:{{ry:{ry},rx:{rx}}},duration:.13,ease:'sine.inOut'}},{start});"
tl+="tl.to('#main',{opacity:0,duration:.5},14.5);window.__timelines=window.__timelines||{};window.__timelines.main=tl;"
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="main" data-composition-id="main" data-start="0" data-duration="15" data-width="1080" data-height="1920">{body}</main><script>{tl}</script></body></html>')
(p/'notes-test.md').write_text('''# Test muet — 15 secondes
Prototype HyperFrames HTML/SVG/GSAP, sans photo, audio ni génération externe.
Réutilise le personnage illustré du projet Dena comme substitut de test.
0–3 présence ; 3–6 notification et changement de focus ; 6–9 expansion de la carte ; 9–12 retour, inclinaison globale et poses de bouche ; 12–15 texte et fondu.
Les lèvres suivent des poses simulées, pas une voix. L’inclinaison concerne le groupe illustré, pas un rig anatomique de tête. L’expansion de carte est une interpolation géométrique continue, pas le plugin GSAP Flip. Le test ne valide ni fidélité à une photo, ni regard dirigé, ni synchronisation phonétique réelle. Il sert à évaluer le cadrage, le rythme et les transitions.
''')
print(m['id'])
