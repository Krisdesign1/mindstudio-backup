"""A distinct contemporary relationship narrative, rendered and edited by native HyperFrames."""
import json,uuid,datetime,html,re,shutil,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;W=ROOT/'.mindstudio/priere-work';D=531.537042
REF=ROOT/'.mindstudio/studio/free-3a761b9e-0fd8-4391-b299-f8ee056a8d63'
spec=importlib.util.spec_from_file_location('art',ROOT/'scripts/priere-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
meta=json.loads((W/'project.json').read_text()) if (W/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Prier : le volume ou le cœur · YouTube 16:9',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
(W/'project.json').write_text(json.dumps(meta));P=ROOT/'.mindstudio/studio'/meta['id'];P.mkdir(exist_ok=True);(P/'compositions').mkdir(exist_ok=True)
(P/'mindstudio-project.json').write_text(json.dumps(meta));shutil.copy('/Users/user/Downloads/Est-ce_que_Dieu_t__coute_mieux_quand_tu_cries___480b19ec74.wav',P/'narration.wav');shutil.copy(REF/'gsap.min.js',P/'gsap.min.js')
for f in ['brief.txt','transcription.txt','paroles.srt','aligned-words.json','paragraphs.json','lip-sync.json']:shutil.copy(W/f,P/f)
shots=json.loads((W/'storyboard-plan.json').read_text());words=json.loads((W/'aligned-words.json').read_text());frames=json.loads((W/'lip-sync.json').read_text())['frames'];chapters=json.loads((W/'chapters.json').read_text())
CSS='''*{box-sizing:border-box}html,body{margin:0}#root{width:1920px;height:1080px;position:relative;overflow:hidden;background:#182c3b;color:#f4eee0;font-family:Arial}.stage{position:absolute;inset:0}.stage svg{width:1920px;height:1080px}.shade{position:absolute;inset:0;background:linear-gradient(0deg,#182c3b80 0%,transparent 34%)}.title{position:absolute;left:110px;top:85px;width:1700px;margin:0;font:700 54px/1.12 Arial;letter-spacing:-1.5px;color:#294654;text-wrap:balance}.title.dark{color:#f4eee0;text-shadow:0 3px 10px #10233566}.title.host{left:160px;top:350px;width:840px;font-size:86px;color:#f4eee0;text-shadow:0 4px 16px #182c3b}.title.host-left{left:970px;width:800px}.title.host-close{left:210px;top:85px;width:1500px;text-align:center;font-size:66px}.title.full{left:230px;top:315px;width:1460px;text-align:center;font-size:104px;color:#f4eee0;line-height:1.18}.historical{position:absolute;left:110px;top:25px;padding:8px 14px;border-radius:4px;background:#243d4be8;color:#e3c3a2;font-size:18px;letter-spacing:1px}.line{position:absolute;left:165px;top:700px;width:630px;height:5px;background:#ccac87}.line.left{left:975px}.caption{position:absolute;left:260px;bottom:65px;width:1400px;text-align:center;font:44px/1.25 Arial;color:#fff6e5}.caption span{display:inline-block;max-width:1400px;background:#1b303dec;padding:12px 28px;border-radius:8px}.caption strong{color:#e3b88f;font-weight:700}'''
mounts=[]
dark={'assembly','raised','song','bible','heart','volume','secret','carmel','intimacy','public','preach','camera','apology','empty','fracture','feed','rumor','identity','responsibility','trust','image','community','choice','pressure','host','alone','grief','silence','support','argument','distance','refuse','messages','isolation','network','identity','mirror','orbit','calendar','exit','door','prison','type','comparison','question'}
for i,s in enumerate(shots):
 a,b=s['start'],s['end'];dur=b-a;cid=f'plan-{i+1:03}';kind=s['kind'];host=kind=='host';layout=s['hostLayout'];tl='const tl=gsap.timeline({paused:true});'
 svg=art.scene(kind,i)
 if host:
  x,y,scale=(1435,300,.82) if layout=='right' else (490,300,.82) if layout=='left' else (960,455,1.04)
  svg+=art.person('host',x,y,scale,'f',s['pose'],s['emotion'])
 body=f'<div id="stage" class="stage"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{art.DEFS}{svg}</svg></div><div class="shade"></div>'
 if s['historical']:body+='<div class="historical">RÉCIT RAPPORTÉ · RECONSTITUTION ILLUSTRÉE</div>'
 
 if s['showTitle']:
  cl='host '+('host-left' if layout=='left' else 'host-close' if layout=='close' else '') if host else 'full' if kind in ('type','comparison','question') else 'dark' if kind in dark else ''
  body+=f'<h1 id="title" class="title {cl}">{html.escape(s["title"])}</h1>'
  if host and layout!='close':body+=f'<div class="line {"left" if layout=="left" else ""}"></div>'
  tl+="tl.from('#title',{opacity:0,y:16,duration:.3,ease:'power2.out'},0);"
 camera='locked'
 if kind in ('public','camera','apology'):tl+="tl.from('#lectern',{opacity:.5,duration:.4},0);"
 if kind=='fracture':tl+="tl.from('#fracture',{opacity:0,duration:1.2},.3);"
 if kind in ('feed','rumor'):tl+="tl.from('#feed',{y:16,opacity:.4,duration:.45},.1);"
 if kind in ('identity','responsibility','trust','image','community','choice','pressure'):tl+="tl.from('#panels',{opacity:.4,duration:.65},.1);"
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
 # Purposeful joint motion on all visible characters, never lip-sync silent cast.
 pids=re.findall(r'id="([a-zA-Z0-9]+)-head"',svg)
 for q,pid in enumerate(pids):
  at=.35+(q%5)*.18
  tl+=f"tl.to('#{pid}-chest',{{scaleY:1.009,svgOrigin:'0 430',duration:{min(2.3,dur/2)},repeat:1,yoyo:true,ease:'sine.inOut'}},0);"
  tl+=f"tl.to('#{pid}-head',{{rotation:{1.4 if q%2 else -1.2},svgOrigin:'0 90',duration:{min(.85,dur/3)},repeat:1,yoyo:true,ease:'sine.inOut'}},{at});"
  for blink in [1.1+q*.17+(i%3)*.13,4.3+q*.09]:
   if blink+.18<dur:tl+=f"tl.to('#{pid}-eye--46,#{pid}-eye-46',{{scaleY:.12,transformOrigin:'50% 50%',duration:.085,repeat:1,yoyo:true}},{blink});"
  if kind=='listen':tl+=f"tl.set('#{pid} .{pid}-pupils',{{x:{3 if q==0 else -3}}},0);"
  side='right' if (i+q)%2 else 'left'
  if kind not in ('quiet','alone','tears','secret','intimacy'):
   tl+=f"tl.to('#{pid}-{side}-upper',{{rotation:'+= {3 if q%2 else -4}',svgOrigin:'0 0',duration:{min(.7,dur/4)},repeat:1,yoyo:true,ease:'power2.inOut'}},{at+.1});".replace('+= ','+=')
   tl+=f"tl.to('#{pid}-{side}-fore',{{rotation:'+=6',svgOrigin:'0 0',duration:{min(.65,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},{at+.25});"
   tl+=f"tl.to('#{pid}-{side}-wrist',{{rotation:{-5 if q%2 else 5},svgOrigin:'0 0',duration:{min(.5,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},{at+.4});"
   for finger in range(4):
    tl+=f"tl.to('#{pid}-{side}-finger-{finger}',{{rotation:{-6+finger*3},svgOrigin:'0 0',duration:.4,repeat:1,yoyo:true,ease:'sine.inOut'}},{at+.45+finger*.035});"
   tl+=f"tl.to('#{pid}-{side}-thumb',{{rotation:-9,svgOrigin:'0 0',duration:.45,repeat:1,yoyo:true,ease:'sine.inOut'}},{at+.5});"
 if kind in ('heart','volume'):tl+="tl.from('#symbol',{opacity:0,y:16,duration:.6,ease:'power2.out'},.15);"
 if kind=='bible':tl+="tl.from('#book',{opacity:0,duration:.6},.1);"
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
 a=c[0]['start'];b=max(c[-1]['end'],min(chunks[j+1][0]['start'],a+1.1)) if j+1<len(chunks) else D;tx=html.escape(' '.join(w['text'] for w in c));tx=re.sub(r'\b(cœur|Dieu|ordre|sincérité|intimité|ferveur|profondeur|prière)\b',r'<strong>\1</strong>',tx,flags=re.I)
 if b>a:cb+=f'<div id="caption-{j}" class="clip caption" data-start="{a}" data-duration="{b-a}" data-track-index="1"><span>{tx}</span></div>'
(P/'compositions/captions.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{CSS}#root{{background:transparent}}</style></head><body><main id="root" data-composition-id="captions" data-no-timeline data-start="0" data-duration="{D}" data-width="1920" data-height="1080">{cb}</main></body></html>')
mounts.append(f'<div id="captions" class="clip" data-no-timeline data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{D}" data-track-index="5" data-track-kind="captions" style="position:absolute;inset:0;z-index:10;pointer-events:none"></div>')
audio=''.join(f'<audio class="clip" id="{name}" src="{name}.wav" data-start="0" data-duration="{D}" data-track-index="{track}" data-volume="1"></audio>' for name,track in [('narration',10),('music',20),('ambience',30),('ui',40),('foley',50),('transitions',60),('impacts',70)])
(P/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>html,body{{margin:0}}main{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#182c3b}}</style></head><body><main id="root" data-composition-id="main" data-start="0" data-duration="{D}" data-width="1920" data-height="1080">'+''.join(mounts)+audio+'</main><script>const master=gsap.timeline({paused:true});master.to({progress:0},{progress:1,duration:531.537042,ease:"none"},0);window.__timelines=window.__timelines||{};window.__timelines.main=master;</script></body></html>')
(P/'storyboard.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(P/'director-markers.json').write_text(json.dumps([dict(time=t,name=n) for t,n in chapters],ensure_ascii=False,indent=2))
(P/'legacy-notes.md').write_text('Direction artistique : bleu ardoise, ivoire et cuivre doux. Décors nouveaux de scène publique, caméra, salle calme et accompagnement ; contraste présence publique / parole privée. Visage et cheveux SVG de Humilité V2 conservés exactement, tenue gris bleu et blouse chaude. Les personnages secondaires sont fictifs, silencieux et ne sont pas des portraits des personnes nommées. Narration utilisateur intégrale ; affirmations rapportées attribuées au texte fourni, aucune archive ni preuve inventée. Source primaire de la prise de parole non fournie : aucune vérification indépendante revendiquée. Articulation française estimée dans les mots alignés, retour au repos sur silence : synchronisation stylisée approximative. Studio et rendu utilisent les mêmes sources natives.\n')
(W/'rehearsal.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Contrôle du montage Prier : le volume ou le cœur</title><style>body{background:#182c3b;color:#eee;font:18px system-ui;display:flex;gap:20px;padding:20px}video{width:72vw;max-height:90vh}pre{white-space:pre-wrap;width:24vw}</style><video id="v" controls src="delivery.mp4"></video><pre id="o"></pre><script>const shots='+json.dumps(shots,ensure_ascii=False)+';v.ontimeupdate=()=>{const t=v.currentTime,s=shots.find(x=>t>=x.start&&t<x.end)||shots.at(-1);o.textContent=JSON.stringify({time:t,chapter:s.chapter,intention:s.intention,visual:s.kind,lipSync:s.lipSync,nextCut:s.end},null,2)};</script></html>')
print(json.dumps(dict(id=meta['id'],project=str(P),shots=len(shots),hostShots=sum(s['lipSync'] for s in shots))))
