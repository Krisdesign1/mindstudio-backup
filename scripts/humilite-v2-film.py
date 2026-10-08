"""Native HyperFrames landscape montage: editable SVG performances and word-based lips."""
import json,uuid,datetime,html,re,shutil,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;W=ROOT/'.mindstudio/humilite-v2';old=ROOT/'.mindstudio/studio/free-fa2bb054-a665-4f20-96c3-07db2fd17d14';D=350.590083
spec=importlib.util.spec_from_file_location('art',ROOT/'scripts/humilite-v2-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
meta=json.loads((W/'project.json').read_text()) if (W/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='L’humilité · Une force sous contrôle · Montage V2 · 16:9',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
W.joinpath('project.json').write_text(json.dumps(meta));p=ROOT/'.mindstudio/studio'/meta['id'];p.mkdir(exist_ok=True);(p/'compositions').mkdir(exist_ok=True)
(p/'mindstudio-project.json').write_text(json.dumps(meta));
for f in ['narration.wav','gsap.min.js','brief.txt','transcription.txt','paroles.srt']:shutil.copy(old/f,p/f)
words=json.loads((ROOT/'.mindstudio/humilite-work/aligned-words.json').read_text());lips=json.loads((W/'lip-sync.json').read_text())['frames'];shots=json.loads((old/'storyboard.json').read_text())
chapters=[(0,'Une autre idée de la force'),(12.44,'La puissance sous contrôle'),(33.58,'Savoir qui tu es'),(41.34,'Le Maître sert'),(62.16,'Le bruit de l’orgueil'),(81.08,'Le test de nos réactions'),(115.92,'Dans nos relations'),(129.72,'Reconnaître la valeur'),(151.96,'Changer de posture'),(165.92,'Grandir pour servir'),(179.84,'Une autorité qui protège'),(198.72,'Sans te diminuer'),(217.28,'Une identité stable'),(250.22,'Trois gestes concrets'),(298.86,'Le défi de cette semaine')]
# Precise authoring decisions, using existing aligned narration boundaries rather than clock cuts.
mapkind={'pressure':'dispute','conversation':'correction','relations':'team','leader':'work','tree':'fruit','lights':'recognize','noise':'authority','control':'power','book':'bible'}
explicit={0:('host','Humilité ≠ faiblesse'),3.1:('authority','Se laisser écraser ?'),6.98:('dispute','Défendre sa place'),10.14:('type','Une autre voie.'),12.44:('source','Athom’s Mbuma'),16.04:('host','Pas une absence de puissance'),18.76:('balance','Puissance sous contrôle'),22.06:('host','Et si la force pouvait servir ?'),24.92:('work','Fort. Et humble.'),28.6:('service','La force au service des autres'),32.06:('host','L’autorité sans arrogance'),33.58:('mirror','Savoir qui tu es'),36.28:('host','Sans écraser l’autre'),39.86:('recognize','Pas besoin de prouver'),41.34:('bible','Regarde Jésus'),44.96:('jesus','Une identité certaine'),47.76:('washing','Il a choisi de servir'),50.4:('cloth','Un linge. Une bassine.'),53.76:('basin','Imagine un instant'),56.78:('washing','Le Maître devient serviteur'),60.2:('host','La position la plus humble'),62.16:('type','La puissance sans bruit'),66.18:('authority','Être vu. À tout prix.'),68.96:('dispute','Toujours le dernier mot'),72.42:('chairs','La meilleure place ?'),76.2:('fruit','L’humilité porte du fruit'),79.54:('host','Une identité calme'),81.08:('type','Et toi ?'),83.78:('correction','Quand on te corrige…'),88.02:('listen','Écouter ou se défendre ?'),91.88:('host','Quelle est ta première réaction ?'),95.66:('recognize','Laisser l’autre briller'),99.64:('host','Féliciter sans se comparer'),103.1:('honor','Sa réussite n’est pas ta défaite'),105.64:('authority','Être servi ou protéger ?'),108.94:('work','Une responsabilité'),111.34:('umbrella','Une protection'),115.92:('host','La transformation se voit'),120:('family','Dans la famille'),123.6:('church','Dans l’église'),127.22:('school','À l’école. Au travail.'),129.72:('bible','Philippiens 2:3–5'),133.14:('host','Un repère pour nos relations'),135.48:('balance','Ta valeur reste entière'),139.6:('recognize','La valeur de l’autre aussi'),143.14:('work','Diriger sans dominer'),147.18:('listen','Corriger sans humilier'),150.52:('host','Ferme, sans arrogance'),151.96:('authority','La force ou la dureté ?'),155.04:('dispute','Imposer sa présence'),159.24:('chairs','Commander n’est pas tout'),162.74:('host','Et si nous confondions les deux ?'),165.92:('type','La grandeur sert'),168.66:('bible','Marc 10:42–45'),172.94:('service','Grandir pour servir'),176.76:('build','Construire avec les autres'),179.84:('umbrella','Le pouvoir protège'),183.94:('service','Élever les autres'),188.58:('team','S’approcher des oubliés'),192.16:('host','Ne pas les regarder de haut'),194.08:('umbrella','Une couverture'),198.72:('type','L’humilité ne te diminue pas'),201.94:('host','Elle te remet à ta juste place'),205.66:('chairs','Ta place n’est pas effacée'),207.48:('mirror','Tu gardes ta personnalité'),211.32:('host','Tu n’as pas à disparaître'),213.42:('power','Ta force, sans écraser'),217.28:('mirror','Une identité stable'),219.9:('host','Rien à prouver'),224.56:('service','Aider sans te diminuer'),227.16:('apology','Demander pardon'),230.8:('recognize','Son talent. Ta valeur.'),234.58:('type','Sa lumière n’éteint pas la tienne'),237.62:('authority','Tout devient compétition'),241.72:('dispute','Prouver. Montrer.'),244.58:('chairs','Le titre. La place.'),247.68:('host','Le bruit de l’orgueil'),250.22:('type','L’humilité se pratique'),253.3:('host','Trois gestes concrets'),255.66:('card','01 · ÉCOUTER'),259.68:('listen','Avant de répondre'),263.26:('host','Avant de défendre. Avant de décider.'),265.8:('card','02 · RECONNAÎTRE'),270.34:('recognize','Le talent de l’autre'),274.24:('honor','Tu fais cela mieux que moi'),278.28:('host','Ce n’est pas une menace'),280.16:('card','03 · HONORER'),283.74:('family','En public. En privé.'),287.12:('honor','Dans nos attitudes'),289.14:('host','Est-ce que je suis respecté ?'),292.56:('listen','Et si je changeais la question ?'),295.86:('type','Est-ce que je respecte les autres ?'),298.86:('host','Cette semaine, observe-toi'),303.54:('type','Choisis une relation'),306.98:('family','Couple. Parents. Enfants.'),311.44:('work','Travail. Église. Collaborateurs.'),315.54:('correction','Quand on te corrige'),318.46:('type','Avoir raison…'),322.54:('host','…ou ressembler à Jésus ?'),324.82:('fruit','Une preuve de transformation'),329.24:('service','La force qui sert'),331.1:('washing','Puissant. Et serviteur.'),333.98:('basin','L’autorité dans l’amour'),336.64:('host','Rien à prouver'),339.82:('type','L’humilité n’est pas une faiblesse'),344.14:('host','La force qui n’écrase plus'),347.52:('fruit','La vraie grandeur commence là')}
css='''*{box-sizing:border-box}html,body{margin:0}#root{width:1920px;height:1080px;position:relative;overflow:hidden;background:#173f3b;color:#f6ecd4;font-family:Arial}.stage{position:absolute;inset:0;width:1920px;height:1080px}.stage svg{width:1920px;height:1080px}.vignette{position:absolute;inset:0;background:linear-gradient(0deg,#122724dd 0%,transparent 32%)}.label{position:absolute;left:110px;top:66px;font-size:20px;letter-spacing:4px;color:#cbb783}.title{position:absolute;left:110px;top:125px;width:1400px;margin:0;font:600 61px/1.1 Georgia;text-shadow:0 3px 12px #18352d99}.title.compact{font-size:52px;max-width:1250px}.host-title{left:1070px;top:340px;width:700px;font-size:80px}.host-line{position:absolute;left:1070px;top:645px;width:630px;height:3px;background:#cbb783}.host-note{position:absolute;left:1070px;top:680px;font-size:21px;letter-spacing:2px;color:#b8cdbb}.type-title{left:220px;top:300px;width:1480px;text-align:center;font-size:112px;line-height:1.12}.card-title{left:830px;top:315px;width:900px;font-size:90px}.card-body{position:absolute;left:840px;top:570px;width:790px;font-size:38px;line-height:1.3;color:#c8d4ba}.caption{position:absolute;left:250px;width:1420px;bottom:65px;text-align:center;font:43px/1.25 Arial;color:#fff7e9}.caption span{display:inline-block;max-width:1420px;background:#112522df;padding:12px 30px;border-radius:12px}.caption strong{font-weight:700;color:#e2c081}.source-note{position:absolute;left:220px;top:575px;width:1480px;text-align:center;font-size:29px;color:#bad0bb}.frame-rule{position:absolute;left:110px;top:245px;width:85px;height:4px;background:#cab17a}'''
mounts=[];coverage=[]
for i,s in enumerate(shots):
    a,b=s['start'],s['end'];dur=b-a;cid=f'plan-{i+1:03}';kind,title=explicit.get(round(a,2),(mapkind.get(s['kind'],s['kind']),s['title']));s.update(kind=kind,title=title,chapter=next(name for t,name in reversed(chapters) if a>=t),composition=cid)
    host=kind=='host';graphic=kind in ('type','card','source')
    if host:svg=art.room()+art.person('host',530,300,.98,'f','open')
    elif kind=='card':svg=art.room()+art.person('host',420,320,.82,'f','listen' if a<265 else 'open');host=True
    elif graphic:svg=art.room()
    else:svg=art.scene(kind)
    body=f'<div id="stage" class="stage"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{art.DEFS}{svg}</svg></div><div class="vignette"></div>'
    # Contextual title is kept in the top safe margin; host/callout layouts change deliberately.
    cl='host-title' if kind=='host' else 'card-title' if kind=='card' else 'type-title' if graphic else 'compact'
    body+=f'<div id="label" class="label">{html.escape(s["chapter"].upper())}</div><h1 id="title" class="title {cl}">{html.escape(title)}</h1>'
    if kind=='host':body+='<div class="host-line"></div><div class="host-note">NARRATEUR ILLUSTRÉ · SYNTHÈSE FOURNIE</div>'
    if kind=='source':body+='<div class="source-note">Une synthèse de l’enseignement fourni.<br>Illustrations originales · aucune archive vidéo simulée.</div>'
    if kind=='card':body+=f'<div class="card-body">{ {255.66:"Laisser l’autre terminer.<br>Comprendre avant de répondre.",265.8:"Nommer le talent de l’autre.<br>Sans perdre ta propre valeur.",280.16:"Le respect dans les paroles.<br>Et dans les gestes."}.get(round(a,2),"")}</div>'
    tl='const tl=gsap.timeline({paused:true});'
    if i%4==0 or graphic:tl+="tl.from('#title',{opacity:0,y:20,duration:.28,ease:'power2.out'},0);"
    # Camera push is selective, confined to scenery and does not move essential text.
    camera='locked'
    if not graphic and i%3==1:
        camera='gentle push';tl+=f"tl.to('#stage',{{scale:1.025,transformOrigin:'50% 48%',duration:{dur},ease:'sine.inOut'}},0);"
    if kind in ('cloth','basin'):
        camera='detail';tl+="tl.set('#stage',{scale:1.13,transformOrigin:'66% 68%'},0);"
    if host:
        frames=[x for x in lips if a<=x['time']<b]
        shapes={'closed':(27,1),'teeth':(29,5),'round':(17,17),'open':(29,19),'wide':(35,8),'small':(25,6)}
        for f in frames:
            rx,ry=shapes[f['shape']];ry*=max(.5,min(1.12,f['energy']/.065)) if f['shape']!='closed' else 1;t=max(0,f['time']-a)
            tl+=f"tl.to('#host-cavity',{{attr:{{d:{json.dumps(art.mouth(rx,round(ry,2)))} }},duration:.08,ease:'none'}},{t:.5f});"
            tl+=f"tl.to('#host-lip',{{attr:{{d:{json.dumps(art.mouth(rx+3,round(ry+3,2)))} }},duration:.08,ease:'none'}},{t:.5f});"
            tl+=f"tl.set('#host-teeth',{{opacity:{.8 if f['shape'] in ('teeth','wide') else 0}}},{t:.5f});"
        for t in [1.1,3.2]:
            if t+.2<dur:
                tl+=f"tl.to('#host-eye--46,#host-eye-46',{{scaleY:.1,transformOrigin:'50% 50%',duration:.08,repeat:1,yoyo:true}},{t});"
        tl+=f"tl.to('#host-head',{{rotation:{2 if i%2 else -2},svgOrigin:'0 90',duration:{min(1,dur/3)},repeat:1,yoyo:true,ease:'sine.inOut'}},.3);"
        tl+=f"tl.to('#host-right-arm',{{rotation:{-5 if i%2 else 4},svgOrigin:'137 181',duration:{min(1.2,dur/3)},repeat:1,yoyo:true,ease:'sine.inOut'}},.5);"
    else:
        # Performance: attentive nods and conversational gestures, mouths stay closed in B-roll.
        for pid in ['a','b']:
            if f'id="{pid}-head"' in svg:
                tl+=f"tl.to('#{pid}-head',{{rotation:{3 if pid=='b' else -2},svgOrigin:'0 90',duration:{min(.8,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.5);"
                tl+=f"tl.to('#{pid}-right-arm',{{rotation:-4,svgOrigin:'137 181',duration:{min(.9,dur/4)},repeat:1,yoyo:true,ease:'sine.inOut'}},.8);"
        if 'id="water-ripple"' in svg:tl+=f"tl.to('#water-ripple',{{x:12,opacity:.4,duration:{min(.9,dur/4)},repeat:2,yoyo:true,ease:'sine.inOut'}},.1);"
        if kind in ('washing','cloth'):tl+=f"tl.to('#cloth',{{x:-12,y:-6,duration:{min(1,dur/4)},repeat:2,yoyo:true,ease:'sine.inOut'}},.2);"
        if kind=='umbrella':tl+=f"tl.to('#rain',{{y:35,opacity:.5,duration:{dur},ease:'none'}},0);"
        if kind=='fruit':tl+="tl.from('#fruit',{opacity:0,scale:.8,transformOrigin:'50% 50%',duration:.5},.3);"
        if kind=='build':tl+="tl.from('#blocks',{y:22,opacity:0,duration:.5},.2);"
    local=[w for w in words if a<=w['start']<b];chunks=[];chunk=[]
    for w in local:
        if chunk and (len(chunk)>=7 or len(' '.join(x['text'] for x in chunk))+len(w['text'])>60):chunks.append(chunk);chunk=[]
        chunk.append(w)
        if re.search(r'[.!?…]$',w['text']):chunks.append(chunk);chunk=[]
    if chunk:chunks.append(chunk)
    for j,c in enumerate(chunks):
        st=max(0,c[0]['start']-a);en=min(dur,c[-1]['end']-a)
        if en<=st:continue
        tx=html.escape(' '.join(w['text'] for w in c));tx=re.sub(r'\b(humilité|puissance|servir|amour|écouter|honorer|pardon|Jésus)\b',r'<strong>\1</strong>',tx,flags=re.I)
        body+=f'<div id="caption-{j}" class="clip caption" data-start="{st}" data-duration="{en-st}" data-track-index="4"><span>{tx}</span></div>'
    tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
    if kind in ('correction','dispute','listen','apology','recognize','honor','team','family','work','school','church','service','jesus','washing','cloth','basin','mirror','fruit','build','chairs','swim','balance'):
        body+='<style>.title.compact{color:#254a3e;text-shadow:none}.label{color:#5a6e56}</style>'
    # Prefix SVG IDs and selectors so separately mounted sub-compositions never share a rig.
    ids=re.findall(r'id="([^"]+)"',body)
    for ident in sorted(set(ids),key=len,reverse=True):
        body=body.replace(f'id="{ident}"',f'id="{cid}-{ident}"').replace(f'url(#{ident})',f'url(#{cid}-{ident})')
        tl=re.sub(r'#'+re.escape(ident)+r'(?=[,\'\" )])','#'+cid+'-'+ident,tl)
    s['camera']=camera;s['lipSync']=host
    (p/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="root" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="1920" data-height="1080">{body}</main><script>{tl}</script></body></html>')
    mounts.append(f'<div class="clip" id="clip-{i}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{a}" data-duration="{dur}" data-track-index="0" style="position:absolute;inset:0"></div>')
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0}}main{{position:relative;width:1920px;height:1080px;overflow:hidden}}</style></head><body><main id="root" data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1920" data-height="1080">'+''.join(mounts)+f'<audio class="clip" id="voice" src="narration.wav" data-start="0" data-duration="{D}" data-track-index="10" data-volume="1"></audio>'+''.join(f'<audio class="clip" id="{name}" src="{name}.wav" data-start="0" data-duration="{D}" data-track-index="{track}" data-volume="1"></audio>' for name,track in [('music',20),('ambience',30),('ui',40),('foley',50),('transitions',60),('impacts',70)])+'</main></body></html>')
(p/'storyboard.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(p/'lip-sync.json').write_text((W/'lip-sync.json').read_text());(p/'director-markers.json').write_text(json.dumps([dict(time=t,name=n) for t,n in chapters],ensure_ascii=False,indent=2))
(p/'notes.md').write_text('Montage V2 entièrement natif HyperFrames, 1920×1080, narration originale intégrale 350.590083 s. 107 plans calés aux mots et aux idées. Personnages fictifs SVG articulés, pas de portrait ou d’archive d’Athom’s. Synchronisation labiale stylisée : phonèmes français estimés à l’intérieur des mots alignés, fermeture sur silence mesuré. Ce n’est pas un alignement phonétique exact ni une imitation d’une personne réelle. Sept pistes de son originales locales. La rétention est une intention de montage, pas un résultat garanti.\n')
(p/'rehearsal.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Rehearsal V2</title><style>body{background:#142522;color:#eee;font:18px system-ui;display:flex;gap:20px;padding:20px}video{width:72vw;max-height:90vh}pre{white-space:pre-wrap;width:24vw}</style><video id="v" controls src="delivery.mp4"></video><pre id="o"></pre><script>const shots='+json.dumps(shots,ensure_ascii=False)+';v.ontimeupdate=()=>{let t=v.currentTime,s=shots.find(x=>t>=x.start&&t<x.end)||shots.at(-1);o.textContent=JSON.stringify({time:t.toFixed(2),chapter:s.chapter,visual:s.kind,lipSync:s.lipSync,camera:s.camera,punch:s.title,secondsSinceCut:(t-s.start).toFixed(2),nextCut:s.end,warning:t-s.start>5},null,2)};</script></html>')
print(json.dumps(dict(id=meta['id'],project=str(p),shots=len(shots),hostShots=sum(s['lipSync'] for s in shots))))
