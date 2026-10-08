"""A distinct contemporary relationship narrative, rendered and edited by native HyperFrames."""
import json,uuid,datetime,html,re,shutil,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;W=ROOT/'.mindstudio/relation-work';D=426.353042
REF=ROOT/'.mindstudio/studio/free-3a761b9e-0fd8-4391-b299-f8ee056a8d63'
spec=importlib.util.spec_from_file_location('art',ROOT/'scripts/relation-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
meta=json.loads((W/'project.json').read_text()) if (W/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Aimer sans disparaître · YouTube 16:9',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
(W/'project.json').write_text(json.dumps(meta));P=ROOT/'.mindstudio/studio'/meta['id'];P.mkdir(exist_ok=True);(P/'compositions').mkdir(exist_ok=True)
(P/'mindstudio-project.json').write_text(json.dumps(meta));shutil.copy('/Users/user/Downloads/Elle_pensait_avoir_trouv__l_homme_avec_qui_construire_sa_vie__bbe7ed44a2.wav',P/'narration.wav');shutil.copy(REF/'gsap.min.js',P/'gsap.min.js')
for f in ['brief.txt','transcription.txt','paroles.srt','aligned-words.json','paragraphs.json','lip-sync.json']:shutil.copy(W/f,P/f)
shots=json.loads((W/'storyboard-plan.json').read_text());words=json.loads((W/'aligned-words.json').read_text());frames=json.loads((W/'lip-sync.json').read_text())['frames'];chapters=json.loads((W/'chapters.json').read_text())
CSS='''*{box-sizing:border-box}html,body{margin:0}#root{width:1920px;height:1080px;position:relative;overflow:hidden;background:#362d43;color:#f5e6dc;font-family:Arial}.stage{position:absolute;inset:0}.stage svg{width:1920px;height:1080px}.shade{position:absolute;inset:0;background:linear-gradient(0deg,#282335a8 0%,transparent 34%)}.title{position:absolute;left:110px;top:85px;width:1700px;margin:0;font:700 54px/1.12 Arial;letter-spacing:-1.5px;color:#523d55;text-wrap:balance}.title.dark{color:#f5e6dc;text-shadow:0 3px 10px #10233566}.title.host{left:160px;top:350px;width:840px;font-size:86px;color:#f7e7dd;text-shadow:0 4px 16px #30273a}.title.host-left{left:970px;width:800px}.title.host-close{left:210px;top:85px;width:1500px;text-align:center;font-size:66px}.title.full{left:230px;top:315px;width:1460px;text-align:center;font-size:104px;color:#f5e6dc;line-height:1.18}.historical{position:absolute;left:110px;top:25px;padding:8px 14px;border-radius:4px;background:#403046e8;color:#eac6c6;font-size:18px;letter-spacing:1px}.line{position:absolute;left:165px;top:700px;width:630px;height:5px;background:#c99da8}.line.left{left:975px}.caption{position:absolute;left:260px;bottom:65px;width:1400px;text-align:center;font:44px/1.25 Arial;color:#fff2e8}.caption span{display:inline-block;max-width:1400px;background:#32273bed;padding:12px 28px;border-radius:8px}.caption strong{color:#edb1bf;font-weight:700}'''
mounts=[]
dark={'host','alone','grief','silence','support','argument','distance','refuse','messages','isolation','network','identity','mirror','orbit','calendar','exit','door','prison','type','comparison','question'}
for i,s in enumerate(shots):
 a,b=s['start'],s['end'];dur=b-a;cid=f'plan-{i+1:03}';kind=s['kind'];host=kind=='host';layout=s['hostLayout'];tl='const tl=gsap.timeline({paused:true});'
 svg=art.scene(kind,i)
 if host:
  x,y,scale=(1435,335,.9) if layout=='right' else (490,335,.9) if layout=='left' else (960,490,1.2)
  svg+=art.person('host',x,y,scale,'f',s['pose'],s['emotion'])
 body=f'<div id="stage" class="stage"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{art.DEFS}{svg}</svg></div><div class="shade"></div>'
 if s['historical']:body+='<div class="historical">RÉCIT RAPPORTÉ · PERSONNAGES FICTIFS</div>'
 
 if s['showTitle']:
  cl='host '+('host-left' if layout=='left' else 'host-close' if layout=='close' else '') if host else 'full' if kind in ('type','comparison','question') else 'dark' if kind in dark else ''
  body+=f'<h1 id="title" class="title {cl}">{html.escape(s["title"])}</h1>'
  if host and layout!='close':body+=f'<div class="line {"left" if layout=="left" else ""}"></div>'
  tl+="tl.from('#title',{opacity:0,y:16,duration:.3,ease:'power2.out'},0);"
 camera='locked'
 if kind in ('wedding','hospital','grief','walk','alone') and i%4==0:
  camera='selective slow push';tl+=f"tl.to('#stage',{{scale:1.025,transformOrigin:'50% 58%',duration:{dur},ease:'sine.inOut'}},0);"
 if host:
  shapes={'closed':(27,1),'teeth':(29,5),'round':(17,17),'open':(29,19),'wide':(35,8),'small':(25,6)}
  for f in frames:
   if not a<=f['time']<b:continue
   rx,ry=shapes[f['shape']];ry*=max(.5,min(1.12,f['energy']/.065)) if f['shape']!='closed' else 1;t=f['time']-a
   tl+=f"tl.to('#host-cavity',{{attr:{{d:{json.dumps(art.mouth(rx,round(ry,2)))} }},duration:.08,ease:'none'}},{t:.5f});"
   tl+=f"tl.to('#host-lip',{{attr:{{d:{json.dumps(art.mouth(rx+3,round(ry+3,2)))} }},duration:.08,ease:'none'}},{t:.5f});"
   tl+=f"tl.set('#host-teeth',{{opacity:{.8 if f['shape'] in ('teeth','wide') else 0}}},{t:.5f});"
  for t in [1.0+(i%3)*.3,3.3+(i%2)*.2]:
   if t+.18<dur:tl+=f"tl.to('#host-eye--46,#host-eye-46',{{scaleY:.1,transformOrigin:'50% 50%',duration:.08,repeat:1,yoyo:true}},{t});"
  tl+=f"tl.to('#host-head',{{rotation:{-1.5 if '?' in s['title'] else 1.3},svgOrigin:'0 90',duration:{min(.85,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.5);"
  if s['pose']!='rest':tl+=f"tl.to('#host-{'left' if layout=='left' else 'right'}-arm',{{rotation:{3 if layout=='left' else -4},svgOrigin:'{'-137' if layout=='left' else '137'} 181',duration:{min(1.1,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.7);"
 else:
  # Reenacted characters listen and react; only the host articulates the supplied voice.
  for pid in ('woman','partner','relative'):
   if f'id="{pid}-head"' not in svg:continue
   facing=4 if pid=='woman' and kind in ('couple','support','meet','encourage','conversation','argument','family','apology','free-talk') else -4 if pid in ('partner','relative') else 0
   if facing:tl+=f"tl.set('#{pid} .{pid}-pupils',{{x:{facing}}},0);"
   if kind in ('couple','meet','support','conversation','apology','free-talk','encourage'):
    tl+=f"tl.to('#{pid}-head',{{rotation:{2 if pid=='woman' else -2},svgOrigin:'0 90',duration:{min(.8,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.55);"
   if kind in ('give','serve','meet','encourage','family','apology','free-talk','boundaries'):
    side='right' if pid=='woman' else 'left';origin='137' if side=='right' else '-137'
    tl+=f"tl.to('#{pid}-{side}-arm',{{rotation:{-4 if side=='right' else 4},svgOrigin:'{origin} 181',duration:{min(.85,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.6);"
   if dur>2.2:tl+=f"tl.to('#{pid}-eye--46,#{pid}-eye-46',{{scaleY:.12,transformOrigin:'50% 50%',duration:.09,repeat:1,yoyo:true}},{1.1+(i%3)*.22});"
  if kind=='serve':tl+="tl.from('#tray',{x:-35,opacity:.6,duration:.65,ease:'power2.out'},.15);"
  if kind in ('numbers','phone','notification'):tl+="tl.from('#phone-motion',{y:20,opacity:.5,duration:.4,ease:'power2.out'},.15);"
  if kind=='messages':tl+="tl.from('#messages',{opacity:0,y:12,duration:.5,ease:'power2.out'},.25);"
  if kind in ('give','money','withdraw'):tl+="tl.from('#money',{x:-25,opacity:.5,duration:.6,ease:'power2.out'},.25);"
  if kind in ('loan','journal','projects','rebuild','repair'):tl+="tl.from('#paper',{opacity:.5,y:10,duration:.4},.2);"
  if kind=='isolation':
   for j in range(4):tl+=f"tl.to('#connection-{j}',{{opacity:.18,duration:.65,ease:'sine.inOut'}},{min(dur-.7,.3+j*.4)});"
  if kind in ('door','exit'):tl+=f"tl.to('#door',{{scaleX:.72,transformOrigin:'0% 50%',duration:{min(1.5,dur/2)},ease:'power2.inOut'}},.3);"
  if kind in ('walk','exit'):tl+=f"tl.to('#woman-motion',{{x:60,duration:{dur},ease:'none'}},0);"
  if kind=='repair':tl+="tl.from('#pieces',{x:25,opacity:.5,duration:.7,ease:'power2.out'},.25);"
  if kind=='calendar':tl+="tl.from('#calendar',{opacity:.5,y:14,duration:.45},.2);"
 tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
 ids=re.findall(r'id="([^"]+)"',body)
 for ident in sorted(set(ids),key=len,reverse=True):
  body=body.replace(f'id="{ident}"',f'id="{cid}-{ident}"').replace(f'url(#{ident})',f'url(#{cid}-{ident})');tl=re.sub(r'#'+re.escape(ident)+r'(?=[,\'\" )])','#'+cid+'-'+ident,tl)
 (P/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{CSS}</style></head><body><main id="root" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="1920" data-height="1080">{body}</main><script>{tl}</script></body></html>')
 mounts.append(f'<div class="clip" id="clip-{i}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{a}" data-duration="{dur}" data-track-index="0" style="position:absolute;inset:0"></div>');s.update(composition=cid,camera=camera,lipSync=host,framing='Presentatrice '+layout if host else 'Plan de situation')
# A single caption composition preserves linguistic groups across scene cuts.
chunks=[];chunk=[]
for w in words:
 if chunk and (len(chunk)>=7 or len(' '.join(x['text'] for x in chunk))+len(w['text'])>55):chunks.append(chunk);chunk=[]
 chunk.append(w)
 if re.search(r'[.!?…]$',w['text']):chunks.append(chunk);chunk=[]
if chunk:chunks.append(chunk)
merged=[]
for c in chunks:
 if len(c)<=2 and merged and len(merged[-1])+len(c)<=9 and len(' '.join(w['text'] for w in merged[-1]+c))<=68 and c[0]['start']-merged[-1][-1]['end']<.55 and not re.search(r'[.!?…]$',merged[-1][-1]['text']):merged[-1]+=c
 else:merged.append(c)
chunks=merged
cb=''
for j,c in enumerate(chunks):
 a=c[0]['start'];b=max(c[-1]['end'],min(chunks[j+1][0]['start'],a+1.1)) if j+1<len(chunks) else D;tx=html.escape(' '.join(w['text'] for w in c));tx=re.sub(r'\b(amour|identité|isolement|limites|famille|reconstruire|disparition|sacrifice)\b',r'<strong>\1</strong>',tx,flags=re.I)
 if b>a:cb+=f'<div id="caption-{j}" class="clip caption" data-start="{a}" data-duration="{b-a}" data-track-index="1"><span>{tx}</span></div>'
(P/'compositions/captions.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{CSS}#root{{background:transparent}}</style></head><body><main id="root" data-composition-id="captions" data-no-timeline data-start="0" data-duration="{D}" data-width="1920" data-height="1080">{cb}</main></body></html>')
mounts.append(f'<div id="captions" class="clip" data-no-timeline data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{D}" data-track-index="5" data-track-kind="captions" style="position:absolute;inset:0;z-index:10;pointer-events:none"></div>')
audio=''.join(f'<audio class="clip" id="{name}" src="{name}.wav" data-start="0" data-duration="{D}" data-track-index="{track}" data-volume="1"></audio>' for name,track in [('narration',10),('music',20),('ambience',30),('ui',40),('foley',50),('transitions',60),('impacts',70)])
(P/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>html,body{{margin:0}}main{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#362d43}}</style></head><body><main id="root" data-composition-id="main" data-start="0" data-duration="{D}" data-width="1920" data-height="1080">'+''.join(mounts)+audio+'</main><script>const master=gsap.timeline({paused:true});master.to({progress:0},{progress:1,duration:426.353042,ease:"none"},0);window.__timelines=window.__timelines||{};window.__timelines.main=master;</script></body></html>')
(P/'storyboard.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(P/'director-markers.json').write_text(json.dumps([dict(time=t,name=n) for t,n in chapters],ensure_ascii=False,indent=2))
(P/'notes.md').write_text('Univers contemporain prune, rose et crème, avec accent teal pour la reconstruction. Visage et rig de la présentatrice Humilité V2 réutilisés ; veste prune et blouse crème. Femme du récit fictive, cheveux libres et tenue teal, distincte de la présentatrice. Nouveaux décors : mariage, salon, hôpital, retrait bancaire, téléphone, parc, miroir, porte. Aucun média raster généré. Audio original intégral de 426.353042 secondes. Reconstitutions illustratives, aucune capture de conversation authentique ni citation inventée. Décès non présenté comme conséquence médicalement prouvée du choix rapporté. Articulation française estimée dans les mots alignés, silences mesurés, synchronisation stylisée et approximative. Sous-titres globaux indépendants des coupes. Source commune Studio et rendu HyperFrames natif. Le personnage secondaire reste silencieux.\n')
(W/'rehearsal.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Contrôle du montage Aimer sans disparaître</title><style>body{background:#362d43;color:#eee;font:18px system-ui;display:flex;gap:20px;padding:20px}video{width:72vw;max-height:90vh}pre{white-space:pre-wrap;width:24vw}</style><video id="v" controls src="delivery.mp4"></video><pre id="o"></pre><script>const shots='+json.dumps(shots,ensure_ascii=False)+';v.ontimeupdate=()=>{const t=v.currentTime,s=shots.find(x=>t>=x.start&&t<x.end)||shots.at(-1);o.textContent=JSON.stringify({time:t,chapter:s.chapter,intention:s.intention,visual:s.kind,lipSync:s.lipSync,nextCut:s.end},null,2)};</script></html>')
print(json.dumps(dict(id=meta['id'],project=str(P),shots=len(shots),hostShots=sum(s['lipSync'] for s in shots))))
