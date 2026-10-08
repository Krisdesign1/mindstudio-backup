"""Rebuilt audio-led native HyperFrames project. Separate from the previous delivery."""
import json,uuid,datetime,html,re,shutil,importlib.util
from pathlib import Path
R=Path(__file__).resolve().parent.parent;W=R/'.mindstudio/attente-work';D=516.9355
spec=importlib.util.spec_from_file_location('art',R/'scripts/attente-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
meta=json.loads((W/'project.json').read_text()) if (W/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Quand Dieu te fait attendre · YouTube 16:9',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
(W/'project.json').write_text(json.dumps(meta));P=R/'.mindstudio/studio'/meta['id'];P.mkdir(exist_ok=True);(P/'compositions').mkdir(exist_ok=True)
(P/'mindstudio-project.json').write_text(json.dumps(meta));shutil.copy('/Users/user/Downloads/ma_narration_9006737c64.wav',P/'narration.wav');shutil.copy(R/'.mindstudio/studio/free-3a761b9e-0fd8-4391-b299-f8ee056a8d63/gsap.min.js',P/'gsap.min.js')
for f in ['brief.txt','transcription.txt','aligned-words.json','paroles.srt','paragraphs.json','lip-sync.json']:shutil.copy(W/f,P/f)
shots=json.loads((W/'storyboard-plan.json').read_text());frames=json.loads((W/'lip-sync.json').read_text())['frames'];words=json.loads((W/'aligned-words.json').read_text())
CSS='''*{box-sizing:border-box}html,body{margin:0}#root{width:1920px;height:1080px;position:relative;overflow:hidden;background:#17233f;color:#f5e9d6;font-family:Arial}.stage{position:absolute;inset:0}.stage svg{width:1920px;height:1080px}.title{position:absolute;left:110px;top:76px;width:1700px;margin:0;font:700 58px/1.14 Arial;letter-spacing:-1px;text-wrap:balance;color:#f5e9d6}.title.rehook{left:50%;top:115px;transform:translateX(-50%);width:auto;max-width:1500px;padding:18px 34px;border:2px solid #e0ad62;border-radius:999px;background:#17233fe8;text-align:center;font-size:42px;letter-spacing:.02em}.subtitle{position:absolute;left:110px;top:160px;font:24px Arial;color:#ceb9a0}.caption{position:absolute;left:220px;bottom:60px;width:1480px;text-align:center;font:44px/1.28 Arial;color:#fff6e5}.caption span{display:inline-block;max-width:1400px;background:#14243eef;padding:12px 28px;border-radius:10px}.caption strong{color:#e0bc86}.history{position:absolute;left:110px;top:170px;background:#313246db;color:#e7d5b8;border-radius:6px;padding:9px 16px;font-size:19px}.labels{font-family:Arial;fill:#17233f;font-size:46px;text-anchor:middle;font-weight:bold}'''
mounts=[]
for i,s in enumerate(shots):
 a,b=s['start'],s['end'];dur=b-a;cid=f'scene-{i+1:03}';k=s['kind'];host=s['host'];layout=s['layout'];v=s['variation'];tl='const tl=gsap.timeline({paused:true});'
 raw=art.scene(k,i)
 # Cadrage is chosen before animation. Host and illustration have separate areas.
 if host:
  left=layout in ('left','embedded','close');close=layout=='close'
  tx=800 if left else 70;ty=220;sc=.54 if close else .56
  bg=art.base(True)+f'<rect x="{tx}" y="220" width="1040" height="585" rx="28" fill="#7a9c8d" opacity=".26"/>'
  svg=bg+f'<g id="illustration" transform="translate({tx} {ty}) scale({sc})">{raw}</g>'
  hx=435 if left else 1460;hy=510 if close else 360;hs=1.25 if close else .82
  svg+=art.person('host',hx,hy,hs,'f',('open' if s['pose']=='point' and not left else s['pose']),s['emotion'])
 else:svg=raw
 # Semantic labels inside dedicated visual panels, not debug labels.
 labels=''
 if k=='pillars':
  for j,(first,second) in enumerate([('Ferveur','Ordre'),('Liberté','Discernement'),('Émotion','Profondeur'),('Feu','Édification')]):labels+=f'<g id="label-{j}" class="labels"><text x="{375+j*390}" y="480">{first}</text><text x="{375+j*390}" y="610">{second}</text></g>'
 if k=='never-existing-kind':
  for j,name in enumerate(['Volume','Émotion','Sincérité']):labels+=f'<g id="label-{j}" class="labels"><text x="{430+j*530}" y="575">{name}</text></g>'
 if k=='never-existing-kind':
  for j,name in enumerate(['Vérité','Intimité','Dieu']):labels+=f'<g id="label-{j}" class="labels"><text x="{530+j*430}" y="680">{name}</text></g>'
 if labels:
  labels='<g>'+labels+'</g>'
  if host:svg+=f'<g transform="translate({tx} {ty}) scale({sc})">{labels}</g>'
  else:svg+=labels
 body=f'<div id="visual" class="stage clip" data-start="0" data-duration="{dur}" data-track-index="0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{art.DEFS}{svg}</svg></div>'
 if s['showTitle']:body+=f'<h1 id="title" class="title clip{" rehook" if s.get("rehook") else ""}" data-start="0" data-duration="{dur}" data-track-index="2">{html.escape(s["title"])}</h1>';tl+="tl.from('#title',{y:18,opacity:0,duration:.34,ease:'power2.out'},0);"
 if s['historical']:body+='<div class="history">RECONSTITUTION BIBLIQUE ILLUSTRÉE</div>'
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
   # A reaction starts in the eyes, then reaches the head and chest. Offsets
   # differ per character so a group never moves as duplicated puppets.
   glance=min(at+.12,dur-1.05)
   tl+=f"tl.to('#{pid}-eye--46,#{pid}-eye-46',{{x:{sgn*(2.5+q)},duration:.22,ease:'power1.out'}},{glance:.4f});"
   tl+=f"tl.to('#{pid}-brows',{{y:{-2 if (i+q)%3 else 2},duration:.28,repeat:1,yoyo:true,ease:'sine.inOut'}},{min(glance+.16,dur-.65):.4f});"
  for blink in [1.05+(i%5)*.13+q*.21,4.7+(i%3)*.24+q*.11,8.3+q*.19]:
   if blink+.18<dur:tl+=f"tl.to('#{pid}-eye--46,#{pid}-eye-46',{{scaleY:.09,transformOrigin:'50% 50%',duration:.08,repeat:1,yoyo:true}},{blink:.4f});"
  listening=pid!='host'
  if listening and k in ('comfort','respect','connection','reconcile','bridge','turn-taking','order'):
   tl+=f"tl.set('#{pid} .{pid}-pupils',{{x:{3 if q%2==0 else -3}}},0);"
  if pid=='host' and k in ('pain','comfort','whisper'):tl+=f"tl.to('#{pid}-brows',{{y:2,duration:.6,repeat:1,yoyo:true}},.5);"
  active=pid=='host' or k in ('help','talk','listen','couple','limits','influence','restart','expressions','imitation','gratitude','emotion','community','carmel-crowd','respect','reconcile','comfort')
  if active and dur>2.4:
   side='right' if (i+q)%2 else 'left';start=min(at+.3,dur-2);amp=7 if k in ('expressions','community') else 4
   tl+=f"tl.to('#{pid}-{side}-upper',{{rotation:'+={sgn*amp}',svgOrigin:'0 0',duration:.6,ease:'power2.inOut'}},{start:.4f});"
   tl+=f"tl.to('#{pid}-{side}-fore',{{rotation:'+={sgn*9}',svgOrigin:'0 0',duration:.55,ease:'sine.inOut'}},{start+.16:.4f});"
   tl+=f"tl.to('#{pid}-{side}-wrist',{{rotation:{sgn*7},svgOrigin:'0 0',duration:.4,ease:'sine.inOut'}},{start+.32:.4f});"
   for finger in range(4):tl+=f"tl.to('#{pid}-{side}-finger-{finger}',{{rotation:{sgn*(finger*3-4)},svgOrigin:'0 0',duration:.3,ease:'sine.inOut'}},{start+.38+finger*.035:.4f});"
   tl+=f"tl.to('#{pid}-{side}-thumb',{{rotation:{sgn*10},svgOrigin:'0 0',duration:.3,ease:'sine.inOut'}},{start+.42:.4f});"
   tl+=f"tl.to('#{pid}-{side}-upper',{{rotation:'-={sgn*amp}',svgOrigin:'0 0',duration:.65,ease:'sine.inOut'}},{min(dur-.7,start+1.35):.4f});tl.to('#{pid}-{side}-fore',{{rotation:'-={sgn*9}',svgOrigin:'0 0',duration:.65,ease:'sine.inOut'}},{min(dur-.7,start+1.4):.4f});"
   tl+=f"tl.to('#{pid}-{side}-wrist',{{rotation:0,duration:.55}},{min(dur-.6,start+1.5):.4f});"
   for finger in range(4):tl+=f"tl.to('#{pid}-{side}-finger-{finger}',{{rotation:0,duration:.34,ease:'sine.out'}},{min(dur-.38,start+1.55+finger*.025):.4f});"
   tl+=f"tl.to('#{pid}-{side}-thumb',{{rotation:0,duration:.34,ease:'sine.out'}},{min(dur-.35,start+1.62):.4f});"
   # The torso anticipates the gesture and settles after the hand.
   tl+=f"tl.to('#{pid}-motion',{{rotation:{sgn*.65},transformOrigin:'50% 82%',duration:.42,ease:'power1.out'}},{max(.05,start-.12):.4f});"
   tl+=f"tl.to('#{pid}-motion',{{rotation:0,duration:.6,ease:'sine.out'}},{min(dur-.55,start+1.48):.4f});"

 if k in ('dogs','dogs-feed','forces'):
  tl+="tl.to('#white-dog-doghead',{rotation:5,svgOrigin:'0 0',duration:.8,repeat:1,yoyo:true},.6);tl.to('#black-dog-doghead',{rotation:-6,svgOrigin:'0 0',duration:.8,repeat:1,yoyo:true},1);"
 if k in ('phone','feed','chat'):
  tl+="tl.from('#screen-1',{opacity:0,y:30,duration:.6},.8);tl.from('#screen-2',{opacity:0,y:30,duration:.6},1.8);"
 if k in ('delete','unfollow','block','groups'):
  tl+="tl.to('#screen-0',{opacity:.18,duration:.45},1);tl.from('#screen-2',{opacity:0,duration:.5},1.5);"
 if k in ('grow','habits','daily','closing'):
  tl+=f"tl.from('#plant-0',{{scaleY:.65,svgOrigin:'960 865',duration:{min(dur,2.5)},ease:'power2.out'}},0);"
 if k in ('growth',):
  tl+=f"tl.from('#plant-0,#plant-1',{{scaleY:.55,svgOrigin:'960 865',duration:{min(dur,2.8)},stagger:.35,ease:'power2.out'}},0);"
 if k in ('clock','timing','no-false-promise'):
  tl+=f"tl.to('#clock-minute',{{rotation:32,svgOrigin:'0 0',duration:{dur},ease:'none'}},0);tl.to('#clock-hour',{{rotation:4,svgOrigin:'0 0',duration:{dur},ease:'none'}},0);"
 if k in ('comparison','whole-story','closed-doors'):
  # Keep the path reveal deterministic when the renderer seeks directly to a
  # frame. The former dash-offset tween could stall Chromium on its end frame.
  tl+="tl.from('#path',{opacity:0,scale:.985,transformOrigin:'50% 50%',duration:.72,ease:'power2.out'},.3);"
  if 'traveler1-motion' in svg:
   tl+=f"tl.from('#traveler1-motion',{{x:-34,opacity:.72,duration:{min(1.15,dur-.3)},ease:'power2.out'}},.18);"
 if k=='joseph-dream':
  tl+="tl.from('#dream-rays',{opacity:0,scale:.82,svgOrigin:'1160 250',duration:1.15,ease:'power2.out'},.35);"
 if k=='joseph-prison':
  tl+="tl.from('#joseph2-motion',{y:16,opacity:.65,duration:.9,ease:'power1.out'},.25);"
 if k=='david':
  tl+="tl.from('#crown',{y:-18,opacity:0,duration:.75,ease:'power2.out'},.55);"
 if k=='lazarus':
  tl+="tl.from('#martha1-motion',{x:-20,opacity:.72,duration:.65,ease:'power1.out'},.18);tl.from('#mary1-motion',{x:18,opacity:.72,duration:.65,ease:'power1.out'},.42);"
 if k in ('suffering','responsibility','life-moving','work-grow','movement','control'):
  for j in range(3):tl+=f"tl.from('#choice-{j}',{{opacity:0,y:20,duration:.45}},{min(.25+j*.42,dur-.5):.3f});"
 if k=='protect-heart':tl+=f"tl.from('#heart-symbol',{{scale:.8,opacity:0,svgOrigin:'960 500',duration:1,ease:'power2.out'}},.3);"
 if k=='opening' and 'id="pulse"' in svg:tl+=f"tl.to('#pulse',{{scale:1.18,opacity:.55,svgOrigin:'960 330',duration:{min(dur,2)},repeat:1,yoyo:true,ease:'sine.inOut'}},0);"
 if 'id="ambient-glow"' in svg:
  tl+=f"tl.to('#ambient-glow',{{x:{22 if i%2 else -18},y:{-8 if i%3 else 10},opacity:.82,duration:{dur},ease:'sine.inOut'}},0);"
 if 'id="room-props"' in svg and dur>2:
  tl+=f"tl.from('#room-props',{{opacity:.45,y:8,duration:.8,ease:'power1.out'}},.18);"
 if host and dur>2.5:tl+=f"tl.to('#illustration',{{x:{18 if i%2 else -18},duration:{dur},ease:'sine.inOut'}},0);"
 if k in ('choose','action','freedom','question','answer'):
  for j in range(3):tl+=f"tl.from('#choice-{j}',{{opacity:0,y:15,duration:.4}},{j*.45});"
 if k in ('secret','image','integrity'):tl+="tl.to('#mask',{opacity:.45,duration:1},.8);"
 if k in ('thought','thought-door','select'):tl+="tl.from('#thought',{opacity:0,duration:.55},.4);"
 if k in ('close-door','doors'):tl+="tl.from('#door-leaf',{scaleX:.12,transformOrigin:'0% 50%',duration:.9,ease:'power2.inOut'},.8);"
 # Object actions timed to narration inside the authored sequence.
 if k=='remove-props':
  for obj,phrase in [('keyboard','Sans clavier'),('microphone','Sans micro'),('audience','Sans foule')]:
   wd=next((w for w in words if a<=w['start']<b and w['text'].lower().startswith(phrase.split()[-1].lower())),None)
   if wd:tl+=f"tl.to('#{obj}',{{opacity:0,y:12,duration:.3}},{wd['start']-a:.5f});"
 if k=='meter-heart':tl+="tl.to('#meter',{opacity:.2,x:-100,duration:.65},.4);tl.from('#heart-symbol',{opacity:0,duration:.65},.5);"
 if k=='turn-taking' and 'id="interruption"' in svg:tl+=f"tl.to('#interruption',{{opacity:.1,duration:.6}},{min(1.5,dur/2)});"
 if k=='never-existing-kind':
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
(P/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>html,body{{margin:0}}main{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#17233f}}</style></head><body><main id="root" data-composition-id="main" data-start="0" data-duration="{D}" data-fps="24" data-width="1920" data-height="1080">'+''.join(mounts)+audio+f'</main><script>const master=gsap.timeline({{paused:true}});master.to({{progress:0}},{{progress:1,duration:{D},ease:"none"}},0);window.__timelines=window.__timelines||{{}};window.__timelines.main=master;</script></body></html>')
(P/'storyboard.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(P/'director-markers.json').write_text(json.dumps([dict(time=s['start'],name=s['chapter']) for s in shots if s['variation']==0],ensure_ascii=False,indent=2))
print(json.dumps(dict(id=meta['id'],project=str(P),shots=len(shots),hostSeconds=sum(s['end']-s['start'] for s in shots if s['host']))))
