"""Rebuilt audio-led native HyperFrames project. Separate from the previous delivery."""
import json,uuid,datetime,html,re,shutil,importlib.util
from pathlib import Path
R=Path(__file__).resolve().parent.parent;W=R/'.mindstudio/priere-v2-work';D=531.537042
spec=importlib.util.spec_from_file_location('art',R/'scripts/priere-v2-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
meta=json.loads((W/'project.json').read_text()) if (W/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Le volume ou le cœur · Montage V2 · YouTube 16:9',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
(W/'project.json').write_text(json.dumps(meta));P=R/'.mindstudio/studio'/meta['id'];P.mkdir(exist_ok=True);(P/'compositions').mkdir(exist_ok=True)
(P/'mindstudio-project.json').write_text(json.dumps(meta));shutil.copy('/Users/user/Downloads/Est-ce_que_Dieu_t__coute_mieux_quand_tu_cries___480b19ec74.wav',P/'narration.wav');shutil.copy(R/'.mindstudio/studio/free-3a761b9e-0fd8-4391-b299-f8ee056a8d63/gsap.min.js',P/'gsap.min.js')
for f in ['brief.txt','transcription.txt','aligned-words.json','paroles.srt','paragraphs.json','lip-sync.json']:shutil.copy(W/f,P/f)
shots=json.loads((W/'storyboard-plan.json').read_text());frames=json.loads((W/'lip-sync.json').read_text())['frames'];words=json.loads((W/'aligned-words.json').read_text())
CSS='''*{box-sizing:border-box}html,body{margin:0}#root{width:1920px;height:1080px;position:relative;overflow:hidden;background:#292a42;color:#f5e9d6;font-family:Arial}.stage{position:absolute;inset:0}.stage svg{width:1920px;height:1080px}.title{position:absolute;left:110px;top:76px;width:1700px;margin:0;font:700 58px/1.14 Arial;letter-spacing:-1px;text-wrap:balance;color:#f5e9d6}.subtitle{position:absolute;left:110px;top:160px;font:24px Arial;color:#ceb9a0}.caption{position:absolute;left:220px;bottom:60px;width:1480px;text-align:center;font:44px/1.28 Arial;color:#fff6e5}.caption span{display:inline-block;max-width:1400px;background:#252a3af2;padding:12px 28px;border-radius:10px}.caption strong{color:#e6bb8a}.history{position:absolute;left:110px;top:170px;background:#313246db;color:#e7d5b8;border-radius:6px;padding:9px 16px;font-size:19px}.labels{font-family:Arial;fill:#292a42;font-size:46px;text-anchor:middle;font-weight:bold}'''
mounts=[]
for i,s in enumerate(shots):
 a,b=s['start'],s['end'];dur=b-a;cid=f'scene-{i+1:03}';k=s['kind'];host=s['host'];layout=s['layout'];v=s['variation'];tl='const tl=gsap.timeline({paused:true});'
 raw=art.scene(k,i)
 # Cadrage is chosen before animation. Host and illustration have separate areas.
 if host:
  left=layout in ('left','embedded','close');close=layout=='close'
  tx=800 if left else 70;ty=220;sc=.54 if close else .56
  bg=art.base(True)+f'<rect x="{tx}" y="220" width="1040" height="585" rx="28" fill="#776a80" opacity=".26"/>'
  svg=bg+f'<g id="illustration" transform="translate({tx} {ty}) scale({sc})">{raw}</g>'
  hx=435 if left else 1460;hy=510 if close else 360;hs=1.25 if close else .82
  svg+=art.person('host',hx,hy,hs,'f',s['pose'],s['emotion'])
 else:svg=raw
 # Semantic labels inside dedicated visual panels, not debug labels.
 labels=''
 if k=='pillars':
  for j,(first,second) in enumerate([('Ferveur','Ordre'),('Liberté','Discernement'),('Émotion','Profondeur'),('Feu','Édification')]):labels+=f'<g id="label-{j}" class="labels"><text x="{375+j*390}" y="480">{first}</text><text x="{375+j*390}" y="610">{second}</text></g>'
 if k=='choices':
  for j,name in enumerate(['Volume','Émotion','Sincérité']):labels+=f'<g id="label-{j}" class="labels"><text x="{430+j*530}" y="575">{name}</text></g>'
 if k=='seek':
  for j,name in enumerate(['Vérité','Intimité','Dieu']):labels+=f'<g id="label-{j}" class="labels"><text x="{530+j*430}" y="680">{name}</text></g>'
 if labels:
  labels='<g>'+labels+'</g>'
  if host:svg+=f'<g transform="translate({tx} {ty}) scale({sc})">{labels}</g>'
  else:svg+=labels
 body=f'<div id="visual" class="stage clip" data-start="0" data-duration="{dur}" data-track-index="0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{art.DEFS}{svg}</svg></div>'
 if s['showTitle']:body+=f'<h1 id="title" class="title clip" data-start="0" data-duration="{dur}" data-track-index="2">{html.escape(s["title"])}</h1>';tl+="tl.from('#title',{y:12,opacity:0,duration:.28,ease:'power2.out'},0);"
 if s['historical']:body+='<style>.title{color:#292a42}</style>';body+='<div class="history">RECONSTITUTION BIBLIQUE ILLUSTRÉE</div>'
 # Phoneme onset targets. At a cut, reconstruct the current mouth pose immediately.
 if host:
  shapes={'closed':(29,.65),'teeth':(29,4.5),'round':(15,18),'open':(28,20),'wide':(35,9),'small':(25,6)}
  prior=next((f for f in reversed(frames) if f['time']<=a),frames[0]);local=[dict(prior,time=a)]+[f for f in frames if a<f['time']<b]
  for f in local:
   rx,ry=shapes[f['shape']];t=max(0,f['time']-a);length=min(.028,max(.001,(f.get('end',f['time']+.08)-f['time'])*.6))
   for part,xx,yy in [('cavity',rx,ry),('lip',rx+2,ry+2)]:
    path=json.dumps(art.mouth(xx,yy))
    if t==0:tl+=f"gsap.set('#host-{part}',{{attr:{{d:{path}}}}});"
    elif f['shape']=='closed':tl+=f"tl.set('#host-{part}',{{attr:{{d:{path}}}}},{t:.6f});"
    else:tl+=f"tl.to('#host-{part}',{{attr:{{d:{path}}},duration:{length:.5f},ease:'none'}},{t:.6f});"
   tooth=1 if f['shape']=='teeth' else .8 if f['shape']=='wide' else 0
   if t==0:tl+=f"gsap.set('#host-teeth',{{opacity:{tooth}}});"
   else:tl+=f"tl.set('#host-teeth',{{opacity:{tooth}}},{t:.6f});"
 # Only purposeful motion; listening cast reacts at different moments.
 pids=re.findall(r'id="([a-zA-Z0-9-]+)-head"',svg)
 for q,pid in enumerate(pids):
  at=.35+q*.16;sgn=-1 if (i+q)%2 else 1
  if dur>.8:
   tl+=f"tl.to('#{pid}-chest',{{scaleY:1.007,svgOrigin:'0 430',duration:{min(2.3,dur/2):.4f},repeat:1,yoyo:true,ease:'sine.inOut'}},0);"
  if dur>1.5:
   tl+=f"tl.to('#{pid}-head',{{rotation:{sgn*1.8},svgOrigin:'0 90',duration:.65,repeat:1,yoyo:true,ease:'sine.inOut'}},{min(at,dur-1.35):.4f});"
  for blink in [1.05+(i%5)*.13+q*.21,4.7+(i%3)*.24+q*.11,8.3+q*.19]:
   if blink+.18<dur:tl+=f"tl.to('#{pid}-eye--46,#{pid}-eye-46',{{scaleY:.09,transformOrigin:'50% 50%',duration:.08,repeat:1,yoyo:true}},{blink:.4f});"
  listening=pid!='host'
  if listening and k in ('comfort','respect','connection','reconcile','bridge','turn-taking','order'):
   tl+=f"tl.set('#{pid} .{pid}-pupils',{{x:{3 if q%2==0 else -3}}},0);"
  if pid=='host' and k in ('pain','comfort','whisper'):tl+=f"tl.to('#{pid}-brows',{{y:2,duration:.6,repeat:1,yoyo:true}},.5);"
  active=pid=='host' or k in ('expressions','imitation','gratitude','emotion','community','carmel-crowd','respect','reconcile','comfort')
  if active and dur>2.4:
   side='right' if (i+q)%2 else 'left';start=min(at+.3,dur-2);amp=7 if k in ('expressions','community') else 4
   tl+=f"tl.to('#{pid}-{side}-upper',{{rotation:'+={sgn*amp}',svgOrigin:'0 0',duration:.6,ease:'power2.inOut'}},{start:.4f});"
   tl+=f"tl.to('#{pid}-{side}-fore',{{rotation:'+={sgn*9}',svgOrigin:'0 0',duration:.55,ease:'sine.inOut'}},{start+.16:.4f});"
   tl+=f"tl.to('#{pid}-{side}-wrist',{{rotation:{sgn*7},svgOrigin:'0 0',duration:.4,ease:'sine.inOut'}},{start+.32:.4f});"
   for finger in range(4):tl+=f"tl.to('#{pid}-{side}-finger-{finger}',{{rotation:{sgn*(finger*3-4)},svgOrigin:'0 0',duration:.3,ease:'sine.inOut'}},{start+.38+finger*.035:.4f});"
   tl+=f"tl.to('#{pid}-{side}-thumb',{{rotation:{sgn*10},svgOrigin:'0 0',duration:.3,ease:'sine.inOut'}},{start+.42:.4f});"
   tl+=f"tl.to('#{pid}-{side}-upper',{{rotation:'-={sgn*amp}',svgOrigin:'0 0',duration:.65,ease:'sine.inOut'}},{min(dur-.7,start+1.35):.4f});tl.to('#{pid}-{side}-fore',{{rotation:'-={sgn*9}',svgOrigin:'0 0',duration:.65,ease:'sine.inOut'}},{min(dur-.7,start+1.4):.4f});"
   tl+=f"tl.to('#{pid}-{side}-wrist',{{rotation:0,duration:.55}},{min(dur-.6,start+1.5):.4f});"
 # Object actions timed to narration inside the authored sequence.
 if k=='remove-props':
  for obj,phrase in [('keyboard','Sans clavier'),('microphone','Sans micro'),('audience','Sans foule')]:
   wd=next((w for w in words if a<=w['start']<b and w['text'].lower().startswith(phrase.split()[-1].lower())),None)
   if wd:tl+=f"tl.to('#{obj}',{{opacity:0,y:12,duration:.3}},{wd['start']-a:.5f});"
 if k=='meter-heart':tl+="tl.to('#meter',{opacity:.2,x:-100,duration:.65},.4);tl.from('#heart-symbol',{opacity:0,duration:.65},.5);"
 if k=='phone':tl+="tl.to('#phone',{rotation:-8,svgOrigin:'1345 770',duration:.65,ease:'power2.out'},.5);"
 if k=='turn-taking' and 'id="interruption"' in svg:tl+=f"tl.to('#interruption',{{opacity:.1,duration:.6}},{min(1.5,dur/2)});"
 if k in ('pillars','seek','choices'):
  for j in range(4 if k=='pillars' else 3):
   tl+=f"tl.from('#{'pillar' if k=='pillars' else 'seek' if k=='seek' else 'choice'}-{j},#label-{j}',{{opacity:0,y:10,duration:.35}},{min(j*.4,dur-.5):.4f});"
 if k=='debate':tl+="tl.from('#opinion-0',{x:-20,opacity:0,duration:.5},.2);tl.from('#opinion-1',{x:20,opacity:0,duration:.5},.6);"
 if not host and v%2 and k not in ('pain','retreat'):
  tl+=f"tl.to('#visual',{{scale:1.015,transformOrigin:'50% 45%',duration:{dur},ease:'sine.inOut'}},0);"
 tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
 ids=re.findall(r'id="([^"]+)"',body)
 for ident in sorted(set(ids),key=len,reverse=True):
  body=body.replace(f'id="{ident}"',f'id="{cid}-{ident}"').replace(f'url(#{ident})',f'url(#{cid}-{ident})');tl=re.sub(r'#'+re.escape(ident)+r'(?=[,\'\" )])','#'+cid+'-'+ident,tl)
 (P/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{CSS}</style></head><body><main id="root" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="1920" data-height="1080">{body}</main><script>{tl}</script></body></html>')
 mounts.append(f'<div class="clip" id="clip-{i}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{a}" data-duration="{dur}" data-track-index="0" style="position:absolute;inset:0"></div>');s.update(composition=cid,lipSync=host,camera=layout,framing='Présentation et illustration' if host else 'Scène immersive')
# Captions retain semantic groups across cuts; no scene-boundary slicing.
chunks=[];chunk=[]
for w in words:
 if chunk and (len(chunk)>=7 or len(' '.join(x['text'] for x in chunk))+len(w['text'])>55):chunks.append(chunk);chunk=[]
 chunk.append(w)
 if re.search(r'[.!?…]$',w['text']):chunks.append(chunk);chunk=[]
if chunk:chunks.append(chunk)
cb=''
for j,c in enumerate(chunks):
 a=c[0]['start'];b=max(c[-1]['end'],min(chunks[j+1][0]['start'],a+1.1)) if j+1<len(chunks) else D;tx=html.escape(' '.join(w['text'] for w in c));tx=re.sub(r'\b(cœur|Dieu|ordre|sincérité|intimité|ferveur|profondeur|prière)\b',r'<strong>\1</strong>',tx,flags=re.I)
 if b>a:cb+=f'<div id="caption-{j}" class="clip caption" data-start="{a}" data-duration="{b-a}" data-track-index="1"><span>{tx}</span></div>'
(P/'compositions/captions.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{CSS}#root{{background:transparent}}</style></head><body><main id="root" data-composition-id="captions" data-no-timeline data-start="0" data-duration="{D}" data-width="1920" data-height="1080">{cb}</main></body></html>')
mounts.append(f'<div class="clip" id="captions" data-no-timeline data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{D}" data-track-index="5" data-track-kind="captions" style="position:absolute;inset:0;z-index:10;pointer-events:none"></div>')
audio=''.join(f'<audio class="clip" id="{name}" src="{name}.wav" data-start="0" data-duration="{D}" data-track-index="{track}" data-volume="1"></audio>' for name,track in [('narration',10),('music',20),('ambience',30),('ui',40),('foley',50),('transitions',60),('impacts',70)])
(P/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>html,body{{margin:0}}main{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#292a42}}</style></head><body><main id="root" data-composition-id="main" data-start="0" data-duration="{D}" data-fps="24" data-width="1920" data-height="1080">'+''.join(mounts)+audio+f'</main><script>const master=gsap.timeline({{paused:true}});master.to({{progress:0}},{{progress:1,duration:{D},ease:"none"}},0);window.__timelines=window.__timelines||{{}};window.__timelines.main=master;</script></body></html>')
(P/'storyboard.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(P/'director-markers.json').write_text(json.dumps([dict(time=s['start'],name=s['chapter']) for s in shots if s['variation']==0],ensure_ascii=False,indent=2))
print(json.dumps(dict(id=meta['id'],project=str(P),shots=len(shots),hostSeconds=sum(s['end']-s['start'] for s in shots if s['host']))))
