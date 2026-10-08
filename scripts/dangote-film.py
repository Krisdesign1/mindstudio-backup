"""A distinct industrial documentary, rendered and edited by native HyperFrames."""
import json,uuid,datetime,html,re,shutil,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;W=ROOT/'.mindstudio/dangote-work';D=382.997083
REF=ROOT/'.mindstudio/studio/free-3a761b9e-0fd8-4391-b299-f8ee056a8d63'
spec=importlib.util.spec_from_file_location('art',ROOT/'scripts/dangote-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
meta=json.loads((W/'project.json').read_text()) if (W/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Dangote · La parole et le processus · YouTube 16:9',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
(W/'project.json').write_text(json.dumps(meta));P=ROOT/'.mindstudio/studio'/meta['id'];P.mkdir(exist_ok=True);(P/'compositions').mkdir(exist_ok=True)
(P/'mindstudio-project.json').write_text(json.dumps(meta));shutil.copy('/Users/user/Downloads/Aujourd_hui__tout_le_monde_conna_t_Aliko_Dangote__b4262f64d4.wav',P/'narration.wav');shutil.copy(REF/'gsap.min.js',P/'gsap.min.js')
for f in ['brief.txt','transcription.txt','paroles.srt','aligned-words.json','paragraphs.json','lip-sync.json']:shutil.copy(W/f,P/f)
shots=json.loads((W/'storyboard-plan.json').read_text());words=json.loads((W/'aligned-words.json').read_text());frames=json.loads((W/'lip-sync.json').read_text())['frames'];chapters=json.loads((W/'chapters.json').read_text())
CSS='''*{box-sizing:border-box}html,body{margin:0}#root{width:1920px;height:1080px;position:relative;overflow:hidden;background:#142c42;color:#f4e6d4;font-family:Arial}.stage{position:absolute;inset:0}.stage svg{width:1920px;height:1080px}.shade{position:absolute;inset:0;background:linear-gradient(0deg,#0b1d30a8 0%,transparent 34%)}.title{position:absolute;left:110px;top:135px;width:1600px;margin:0;font:700 64px/1.12 Arial;letter-spacing:-1.5px;color:#203c53;text-wrap:balance}.title.dark{color:#f4e6d4;text-shadow:0 3px 10px #10233566}.title.host{left:160px;top:350px;width:840px;font-size:86px;color:#f7e8d5;text-shadow:0 4px 16px #152737}.title.host-left{left:970px;width:800px}.title.host-close{left:210px;top:85px;width:1500px;text-align:center;font-size:66px}.title.full{left:230px;top:315px;width:1460px;text-align:center;font-size:104px;color:#f4e6d4;line-height:1.18}.historical{position:absolute;left:110px;top:45px;padding:12px 19px;border-radius:4px;background:#173247e8;color:#e8c1a2;font-size:23px;letter-spacing:1px}.line{position:absolute;left:165px;top:700px;width:630px;height:5px;background:#bf8869}.line.left{left:975px}.caption{position:absolute;left:260px;bottom:65px;width:1400px;text-align:center;font:44px/1.25 Arial;color:#fff5e9}.caption span{display:inline-block;max-width:1400px;background:#102536ed;padding:12px 28px;border-radius:8px}.caption strong{color:#edb38b;font-weight:700}'''
mounts=[]
dark={'factory','cement','refinery','energy','fertilizer','sugar','construction','map','walk','calendar','type','comparison','question'}
for i,s in enumerate(shots):
 a,b=s['start'],s['end'];dur=b-a;cid=f'plan-{i+1:03}';kind=s['kind'];host=kind=='host';layout=s['hostLayout'];tl='const tl=gsap.timeline({paused:true});'
 svg=art.scene(kind,i)
 if host:
  x,y,scale=(1435,335,.9) if layout=='right' else (490,335,.9) if layout=='left' else (960,490,1.2)
  svg+=art.person('host',x,y,scale,'f',s['pose'],s['emotion'])
 body=f'<div id="stage" class="stage"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{art.DEFS}{svg}</svg></div><div class="shade"></div>'
 if s['historical']:body+='<div class="historical">RÉCIT RAPPORTÉ · RECONSTITUTION ILLUSTRÉE</div>'
 if kind=='map':body+='<div class="historical">PRÉSENCE AFRICAINE · SCHÉMA ILLUSTRATIF</div>'
 if s['showTitle']:
  cl='host '+('host-left' if layout=='left' else 'host-close' if layout=='close' else '') if host else 'full' if kind in ('type','comparison','question') else 'dark' if kind in dark else ''
  body+=f'<h1 id="title" class="title {cl}">{html.escape(s["title"])}</h1>'
  if host and layout!='close':body+=f'<div class="line {"left" if layout=="left" else ""}"></div>'
  tl+="tl.from('#title',{opacity:0,y:16,duration:.3,ease:'power2.out'},0);"
 camera='locked'
 if kind in ('airport','factory','refinery','cement','construction') and i%3==0:
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
  # Silent reenactment performances; they never pretend to reproduce authentic speech.
  if kind in ('request','meeting','blessing','advice','encourage','help'):
   for pid,offset in [('young',-4),('bishop',4),('a',4),('b',-4)]:
    if f'id="{pid}-head"' in svg:tl+=f"tl.set('#{pid} .{pid}-pupils',{{x:{offset}}},0);"
  for pid in ('a','b','bishop','young','assistant','visitor','daisy','worker'):
   if f'id="{pid}-head"' not in svg:continue
   if pid in ('bishop','b') or kind in ('meeting','request','advice','encourage'):
    tl+=f"tl.to('#{pid}-head',{{rotation:{-2 if pid in ('young','a') else 2},svgOrigin:'0 90',duration:{min(.75,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.5);"
   if kind in ('request','blessing','meeting','advice','help','encourage'):
    tl+=f"tl.to('#{pid}-{'right' if pid in ('bishop','a') else 'left'}-arm',{{rotation:{-5 if pid in ('bishop','a') else 4},svgOrigin:'{'137' if pid in ('bishop','a') else '-137'} 181',duration:{min(.8,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.6);"
  if kind in ('rise','give-seat'):tl+=f"tl.from('#young-motion',{{y:45,opacity:.45,duration:{min(.65,dur/2)},ease:'power2.out'}},.1);"
  if kind=='assistant':tl+=f"tl.from('#assistant-motion',{{y:45,opacity:.5,duration:{min(.6,dur/2)},ease:'power2.out'}},.2);"
  if kind=='exit':
   for pid in ('young','assistant','case-a'):tl+=f"tl.to('#{pid}-motion',{{x:75,duration:{dur},ease:'none'}},0);"
  if kind in ('trade','work'):tl+="tl.from('#crates',{y:14,opacity:.5,duration:.5},.2);"
  if kind in ('invest','risk','plan','discipline','learn'):tl+="tl.from('#ledger',{opacity:0,y:12,duration:.4},.2);"
  if kind=='construction':tl+=f"tl.from('#crane',{{opacity:.5,duration:{min(.8,dur/2)}}},0);"
  if kind=='door':tl+=f"tl.to('#door',{{scaleX:.78,transformOrigin:'0% 50%',duration:{min(1.5,dur/2)},ease:'power2.inOut'}},.3);"
  if kind=='map':
   for j in range(5):tl+=f"tl.from('#node-{j}',{{opacity:0,scale:.5,transformOrigin:'50% 50%',duration:.3}},{min(dur-.4,.2+j*.3)});"
  if kind=='timeline':
   for j in range(5):tl+=f"tl.from('#milestone-{j}',{{opacity:0,y:10,duration:.3}},{min(dur-.4,.1+j*.4)});"
  if kind=='airport':tl+=f"tl.to('#aircraft-motion',{{x:25,duration:{dur},ease:'none'}},0);"
  if kind=='walk':tl+=f"tl.to('#a-motion',{{x:75,y:-12,duration:{dur},ease:'none'}},0);"
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
cb=''
for j,c in enumerate(chunks):
 a=c[0]['start'];b=c[-1]['end'];tx=html.escape(' '.join(w['text'] for w in c));tx=re.sub(r'\b(Dangote|bénédiction|travail|discipline|temps|générosité|responsabilité|processus)\b',r'<strong>\1</strong>',tx,flags=re.I)
 if b>a:cb+=f'<div id="caption-{j}" class="clip caption" data-start="{a}" data-duration="{b-a}" data-track-index="1"><span>{tx}</span></div>'
(P/'compositions/captions.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{CSS}#root{{background:transparent}}</style></head><body><main id="root" data-composition-id="captions" data-no-timeline data-start="0" data-duration="{D}" data-width="1920" data-height="1080">{cb}</main></body></html>')
mounts.append(f'<div id="captions" class="clip" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{D}" data-track-index="5" data-track-kind="captions" style="position:absolute;inset:0;z-index:10;pointer-events:none"></div>')
audio=''.join(f'<audio class="clip" id="{name}" src="{name}.wav" data-start="0" data-duration="{D}" data-track-index="{track}" data-volume="1"></audio>' for name,track in [('narration',10),('music',20),('ambience',30),('ui',40),('foley',50),('transitions',60),('impacts',70)])
(P/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0}}main{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#142c42}}</style></head><body><main id="root" data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1920" data-height="1080">'+''.join(mounts)+audio+'</main></body></html>')
(P/'storyboard.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(P/'director-markers.json').write_text(json.dumps([dict(time=t,name=n) for t,n in chapters],ensure_ascii=False,indent=2))
(P/'notes.md').write_text('Univers original bleu nuit, cuivre et ivoire : aéroport, cabine et industrie. Visage et rig de la narratrice Humilité V2 réutilisés sans altération, nouvelle veste cuivre et blouse ivoire, aucun décor de référence repris. Audio fourni intégral et inchangé, durée 382.997083 secondes. Les scènes historiques sont des reconstitutions illustrées du récit rapporté, pas des archives ni des portraits authentifiés ; prudence du texte conservée. Articulation française stylisée, phonèmes estimés dans les mots alignés et silences mesurés, non parfaite. Sous-titres globaux indépendants des coupes. Rendu HyperFrames natif utilisant les mêmes fichiers que le Studio.\n')
(P/'rehearsal.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Contrôle du montage Dangote</title><style>body{background:#142c42;color:#eee;font:18px system-ui;display:flex;gap:20px;padding:20px}video{width:72vw;max-height:90vh}pre{white-space:pre-wrap;width:24vw}</style><video id="v" controls src="delivery.mp4"></video><pre id="o"></pre><script>const shots='+json.dumps(shots,ensure_ascii=False)+';v.ontimeupdate=()=>{const t=v.currentTime,s=shots.find(x=>t>=x.start&&t<x.end)||shots.at(-1);o.textContent=JSON.stringify({time:t,chapter:s.chapter,intention:s.intention,visual:s.kind,lipSync:s.lipSync,nextCut:s.end},null,2)};</script></html>')
print(json.dumps(dict(id=meta['id'],project=str(P),shots=len(shots),hostShots=sum(s['lipSync'] for s in shots))))
