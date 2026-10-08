import json,uuid,shutil,datetime,html,importlib.util,re
from pathlib import Path
spec=importlib.util.spec_from_file_location('art',Path(__file__).with_name('dena-art.py'));art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
root=Path(__file__).resolve().parent.parent;work=root/'.mindstudio/dena-work';D=46.139456
# Rerunning updates this production only; the stored project ID is stable.
meta=json.loads((work/'project.json').read_text()) if (work/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Dena Mwana · Une réponse à Sephora',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
p=root/'.mindstudio/studio'/meta['id'];p.mkdir(exist_ok=True);(p/'compositions').mkdir(exist_ok=True)
(p/'mindstudio-project.json').write_text(json.dumps(meta));(work/'project.json').write_text(json.dumps(meta))
shutil.copy(work.joinpath('audio-path.txt').read_text(),p/'narration.mp3');shutil.copy(root/'node_modules/gsap/dist/gsap.min.js',p/'gsap.min.js')
for f in ['transcription.txt','paroles.srt']:shutil.copy(work/f,p/f)
# Cut points from local speech alignment. Text is intentionally sparse and editorial.
shots=[
(0,'portrait','Hello<br>la famille.','DENA MWANA','dena'),
(2.32,'tag','Une vidéo où<br>j’ai été taguée.','','dena'),
(8.2,'phone','Fally & Sephora','UNE CONVERSATION','pair'),
(13.5,'portrait','La grâce<br>sur Sephora.','','sephora'),
(19.2,'question','Ton artiste<br>préférée ?','','fally'),
(23.4,'answer','Dena Mwana.','','sephora'),
(25.28,'studio','Je réponds<br>à Sephora.','','dena'),
(31.48,'duet','Un feat<br>avec moi ?','','pair'),
(34.79,'portrait','Sur la voie<br>du Seigneur.','','dena'),
(38.62,'together','J’accepte de<br>t’accompagner.','','pair'),
(43.01,'closing','À très bientôt.','','dena')]
mounts=[];board=[]
for i,(start,kind,copy,label,who) in enumerate(shots):
 end=shots[i+1][0] if i+1<len(shots) else D;d=end-start;cid=f'plan-{i+1:02}'
 svgcount=0
 def svg(content):
  global svgcount
  svgcount+=1
  out='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">'+art.DEFS+content+'</svg>'
  for ident in re.findall(r'id="([^"]+)"',out):
   unique=f'{ident}-{i}-{svgcount}'
   out=out.replace(f'id="{ident}"',f'id="{unique}"').replace(f'url(#{ident})',f'url(#{unique})')
  return out
 bg=art.pathscene() if kind=='together' else art.room(kind in ['studio','duet'])
 cast=art.person(who if who!='pair' else 'dena',540,985,1.7)
 if kind=='question':cast=art.person('fally',510,990,1.7)
 if kind=='answer':cast=art.person('sephora',540,990,1.7)
 if kind in ['phone','tag']:
  pair=art.person('fally',318,1040,.86)+art.person('sephora',732,1040,.86)
  frame='<rect x="140" y="565" width="800" height="940" rx="72" fill="#18383d"/><rect x="162" y="590" width="756" height="890" rx="52" fill="#ded3bc"/><rect x="418" y="612" width="244" height="24" rx="12" fill="#365256"/>'+'<defs><clipPath id="phonecrop"><rect x="162" y="590" width="756" height="890" rx="52"/></clipPath></defs><g clip-path="url(#phonecrop)">'+pair+'</g><path d="M285 1430H795" stroke="#899185" stroke-width="3"/>'
  if kind=='phone':cast=frame
  else:cast=art.person('dena',540,1000,1.65)
 if kind=='duet':cast=art.person('dena',275,1080,1.03)+art.person('sephora',793,1080,1.03)+'<g stroke="#c7af72" stroke-width="6" fill="none"><path d="M540 910V1110M514 945V1075M566 945V1075M489 984V1040M591 984V1040"/></g>'
 if kind=='together':
  # The same illustrated characters, moving together in depth; no face regeneration.
  cast=art.person('dena',315,960,.94,full=True)+art.person('sephora',760,995,.90,full=True)
 body=f'<div id="bg-{i}" class="layer">{svg(bg)}</div><div id="cast-{i}" class="layer">{svg(cast)}</div>'
 if kind=='tag':body+=f'<div id="insert-{i}" class="layer">{svg(frame)}</div>'
 body+='<div class="shade"></div>'
 body+=f'<div id="copy-{i}" class="copy"><div class="eyebrow">{label}</div><h1>{copy}</h1><div class="rule"></div></div>'
 if kind=='phone':body+='<div class="names"><span>FALLY IPUPA</span><span>SEPHORA</span></div>'
 if kind=='duet':body+='<div class="names"><span>DENA MWANA</span><span>SEPHORA</span></div>'
 if kind=='closing':body+=f'<div id="blessing-{i}" class="blessing">Que le Seigneur<br>te bénisse.</div>'
 css=f'''*{{box-sizing:border-box}}html,body{{margin:0;background:#ded3bb}}#{cid}{{width:1080px;height:1920px;position:relative;overflow:hidden}}.layer{{position:absolute;inset:0;transform-origin:50% 60%}}.layer svg{{width:1080px;height:1920px;display:block}}.shade{{position:absolute;inset:0;background:linear-gradient(0deg,rgba(25,47,48,.55),transparent 28%,transparent 60%,rgba(247,239,218,.8));pointer-events:none}}.copy{{position:absolute;left:88px;right:88px;top:210px;text-align:center;color:#213f43}}.copy h1{{font:500 94px/1.06 Georgia,serif;letter-spacing:-3px;margin:22px 0 30px}}.eyebrow{{font:500 23px/1.5 Arial,sans-serif;letter-spacing:6px;min-height:35px}}.rule{{width:76px;height:4px;margin:0 auto;background:#a08247}}.names{{position:absolute;left:160px;right:160px;top:1560px;display:flex;justify-content:space-between;color:#f8efd8;font:500 25px Arial;letter-spacing:3px}}.blessing{{position:absolute;bottom:230px;left:88px;right:88px;text-align:center;color:#fff4dc;font:500 65px/1.13 Georgia}}'''
 if kind=='together':css+='.copy h1{font-size:86px}'
 tl='const tl=gsap.timeline({paused:true});'
 tl+=f"tl.set('#cast-{i}',{{scale:1,y:4,opacity:1,filter:'blur(0px)'}},0);"
 def ft(sel,a,b,at=0):return f'tl.fromTo({json.dumps(sel)},{json.dumps(a)},{json.dumps(b)},{at});'
 tl+=ft(f'#bg-{i}',{'scale':1.02,'x':-6},{'scale':1.035,'x':6,'duration':d,'ease':'none'})
 tl+=ft(f'#cast-{i}',{'scale':1,'y':4},{'scale':1.035,'y':-4,'duration':d,'ease':'sine.inOut'})
 tl+=ft(f'#copy-{i}',{'opacity':0,'y':18},{'opacity':1,'y':0,'duration':.38,'ease':'power2.out'},1.30 if kind=='answer' else .08)
 if kind=='tag':
  tl+=ft(f'#insert-{i}',{'opacity':0,'scale':.85,'y':85},{'opacity':1,'scale':1,'y':0,'duration':.85,'ease':'power2.out'},2.1)
  tl+=ft(f'#cast-{i}',{'filter':'blur(0px)','opacity':1},{'filter':'blur(10px)','opacity':.2,'duration':.85,'ease':'sine.inOut'},2.1)
 if kind=='together':tl+=ft(f'#cast-{i}',{'opacity':0},{'opacity':1,'duration':.6,'ease':'sine.inOut'})
 if kind=='closing':
  tl+=ft(f'#blessing-{i}',{'opacity':0,'y':14},{'opacity':1,'y':0,'duration':.22},1.59)
  tl+=f"tl.to('#{cid}',{{opacity:0,duration:.23}},{d-.23});"
 tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
 (p/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="{cid}" data-composition-id="{cid}" data-start="0" data-duration="{d}" data-width="1080" data-height="1920">{body}</main><script>{tl}</script></body></html>')
 mounts.append(f'<div id="clip-{i}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{start}" data-duration="{d}" data-track-index="0" style="position:absolute;inset:0"></div>')
 board.append(dict(id=cid,start=start,end=end,scene=kind,text=copy.replace('<br>',' ')))
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0;background:#ded3bb}}#main{{width:1080px;height:1920px;position:relative;overflow:hidden}}</style></head><body><main id="main" data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1080" data-height="1920">'+''.join(mounts)+f'<audio id="narration" class="clip" src="narration.mp3" data-start="0" data-duration="{D}" data-track-index="1" data-volume="1"></audio></main></body></html>')
(p/'storyboard.json').write_text(json.dumps(board,ensure_ascii=False,indent=2))
(p/'notes-montage.md').write_text('''# Dena Mwana · Une réponse à Sephora

Vidéo verticale 1080 × 1920, 24 images/s. Audio original conservé à volume unitaire, sans voix recréée ni musique ajoutée. Onze plans calés sur les paroles (alignement local puis sélection des points de coupe).

Illustrations natives SVG, HTML et GSAP exclusivement. Personnages stylisés inspirés des descriptions du brief : ils ne constituent pas des portraits photographiques ni des images de la conversation réelle. Visages et costumes réutilisés sans variation entre les plans. La scène du chemin est symbolique : déplacement en profondeur, pas une marche anatomique réaliste.

Textes clés uniquement dans la vidéo ; transcription et SRT disponibles dans le projet. Le SRT est un alignement automatique du texte fourni : quelques mots absents ou différents de l'enregistrement demandent une vérification si on l'utilise.

Le fichier delivery.mp4 est le rendu livré. Après une modification du projet, utiliser Export dans Studio pour produire un nouveau rendu.
''')
print(str(p))
