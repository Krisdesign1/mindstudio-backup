import json,uuid,shutil,datetime,html
from pathlib import Path
from joseph_art import scene,DEFS,joseph
root=Path(__file__).resolve().parent.parent;work=root/'.mindstudio/joseph-work';data=json.loads((work/'aligned.json').read_text());D=105.593292
key='free-'+str(uuid.uuid4());p=root/'.mindstudio/studio'/key;p.mkdir(parents=True);(p/'compositions').mkdir();(p/'references').mkdir()
meta=dict(id=key,name='Joseph · La prison et le palais',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat());(p/'mindstudio-project.json').write_text(json.dumps(meta));(work/'project.json').write_text(json.dumps(meta))
shutil.copy('/Users/user/Downloads/ESSAI_TECH_7341f344ac.wav',p/'narration.wav');shutil.copy(root/'node_modules/gsap/dist/gsap.min.js',p/'gsap.min.js');shutil.copy(work/'transcription.txt',p/'transcription.txt');shutil.copy(work/'paroles.srt',p/'paroles.srt')
for f in (work/'compositions/components').glob('*.html'):shutil.copy(f,p/'references'/f.name)
(p/'references/joseph-master.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#28383d"/>'+joseph(400,600,1.2)+joseph(1000,600,1.2,seated=True)+joseph(1550,600,1.2,young=True)+'</svg>')
starts=[];t=0
for a in data['scenes']:starts.append(t);t+=a['duration']
beats=[(0,'dream','push',''),(1,'pit','push',''),(2,'pit-pov','hold',''),(3,'dream','pull','PROMESSE'),(4,'wrists','push',''),(6,'caravan','travel',''),(7,'accused','push',''),(8,'door','close',''),(9,'prison','rack','PRISON'),(10,'question','hold',''),(13,'reveal','reveal',''),(15,'meeting','push',''),(16,'departure','leave',''),(18,'question','hold',''),(19,'door','close',''),(20,'question','hold','IL L’OUBLIE'),(21,'time','time',''),(24,'time','pull','DEUX ANS'),(26,'corridor','push',''),(27,'pharaoh','push',''),(28,'court','hold',''),(29,'meeting','push',''),(30,'question','hold',''),(31,'door','open',''),(32,'palace','travel',''),(33,'palace','pull',''),(34,'question','hold',''),(35,'prison','pull',''),(36,'reveal','reveal',''),(37,'question','hold',''),(38,'door','open','NE CONCLUS PAS TROP VITE'),(39,'payoff','match','')]
mounts=[];board=[]
for i,(idx,kind,motion,word) in enumerate(beats):
 a=starts[idx];b=starts[beats[i+1][0]] if i+1<len(beats) else D;d=b-a;cid=f'plan-{i+1:02}';bg,mg,fg=scene(kind)
 css=f'''*{{box-sizing:border-box}}html,body{{margin:0;background:#12212b}}#{cid}{{position:relative;width:1920px;height:1080px;overflow:hidden}}.layer{{position:absolute;inset:0;width:1920px;height:1080px;transform-origin:50% 55%}}.layer svg{{width:100%;height:100%}}.key{{position:absolute;left:180px;right:180px;bottom:110px;text-align:center;font:500 65px/1.2 Georgia,serif;letter-spacing:8px;color:#eee6cf;text-shadow:0 4px 30px #000;z-index:8}}.shade{{position:absolute;inset:0;background:linear-gradient(0deg,#08111988,transparent 35%);pointer-events:none}}'''
 def layer(name,content):return f'<div class="layer" id="{name}-{i}"><svg viewBox="0 0 1920 1080">{DEFS}{content}</svg></div>'
 body=layer('bg',bg)+layer('mg',mg)+layer('fg',fg)+'<div class="shade"></div>'
 if kind=='time':body+=f'<div class="layer" id="night-{i}" style="background:#081626;opacity:0"></div>'
 if motion=='match':body+=layer('match',''.join(f'<rect x="{x}" width="48" height="1080" fill="url(#iron)"/>' for x in [170,480,790,1100,1410,1720]))
 if word:body+=f'<div class="key" id="key-{i}">{html.escape(word)}</div>'
 tl='const tl=gsap.timeline({paused:true});'
 def tween(target,start,end,at=0):return f"tl.fromTo('{target}',{json.dumps(start)},{json.dumps(end)},{at});"
 if motion in ['push','pull','travel','rack','reveal','match']:
  for name,k in [('bg',.018),('mg',.035),('fg',.075)]:
   zoom=motion!='pull';tl+=tween(f'#{name}-{i}',dict(scale=1 if zoom else 1+k,x=0),dict(scale=1+k if zoom else 1,x=(-34 if name=='fg' else -14) if motion=='travel' else 0,duration=d,ease='none'))
 if motion=='rack':tl+=tween(f'#fg-{i}',dict(filter='blur(0px)'),dict(filter='blur(7px)',duration=min(1.5,d),ease='sine.inOut'))+tween(f'#mg-{i}',dict(filter='blur(6px)'),dict(filter='blur(0px)',duration=min(1.5,d),ease='sine.inOut'))
 if motion=='reveal':
  # Adapted from official focus-rack: coupled blur, opacity and depth shift; hold until narration reveals the man.
  at=min(1.7,d*.35);tl+=tween(f'#mg-{i} #other',dict(filter='blur(9px)',opacity=.32,x=22),dict(filter='blur(0px)',opacity=1,x=0,duration=min(1.5,d-at),ease='sine.inOut'),at)
 if motion=='leave':tl+=tween(f'#mg-{i} #other',dict(x=0,scale=1),dict(x=250,scale=.66,opacity=.2,duration=d,ease='sine.inOut'))
 if motion in ['close','open']:
  tl+=tween(f'#fg-{i} #door',dict(x=670 if motion=='close' else 0),dict(x=0 if motion=='close' else 750,duration=min(1.2,d),ease='power2.inOut'))
 if kind=='time':
  tl+=f"tl.to('#night-{i}',{{opacity:.62,duration:{d/3}}},0).to('#night-{i}',{{opacity:.03,duration:{d/3}}},{d/3}).to('#night-{i}',{{opacity:.32,duration:{d/3}}},{2*d/3});"
 if motion=='match':tl+=tween(f'#match-{i}',dict(scale=1,opacity=1),dict(scale=3,opacity=0,duration=d*.8,ease='power2.inOut'));tl+=tween(f'#mg-{i}',dict(opacity=.1),dict(opacity=1,duration=d*.7,ease='sine.inOut'))
 if word:tl+=tween(f'#key-{i}',dict(opacity=0),dict(opacity=1,duration=.45),min(.25,d*.1))
 if i==len(beats)-1:tl+=f"tl.to('#{cid}',{{opacity:0,duration:.65}},{d-.65});"
 tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
 (p/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="{cid}" data-composition-id="{cid}" data-start="0" data-duration="{d}" data-width="1920" data-height="1080">{body}</main><script>{tl}</script></body></html>')
 mounts.append(f'<div id="clip-{i}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{a}" data-duration="{d}" data-track-index="0" style="position:absolute;inset:0"></div>');board.append(dict(id=cid,start=a,end=b,scene=kind,motion=motion,text=word))
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0;background:#12212b}}#main{{width:1920px;height:1080px;position:relative;overflow:hidden}}</style></head><body><main id="main" data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1920" data-height="1080">'+''.join(mounts)+f'<audio id="narration" class="clip" src="narration.wav" data-start="0" data-duration="{D}" data-track-index="1" data-volume="1"></audio><audio id="ambiance" class="clip" src="ambiance.wav" data-start="0" data-duration="{D}" data-track-index="2" data-volume="1"></audio></main></body></html>')
(p/'storyboard.json').write_text(json.dumps(board,ensure_ascii=False,indent=2));print(json.dumps(meta))
