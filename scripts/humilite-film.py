"""Original, symbolic HyperFrames film. The supplied narration is never regenerated."""
import json,uuid,datetime,shutil,html,re,importlib.util,math
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
W=ROOT/'.mindstudio/humilite-work'; D=350.590083
words=json.loads((W/'aligned-words.json').read_text())
paras=json.loads((W/'paragraphs.json').read_text())
meta=json.loads((W/'project.json').read_text()) if (W/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='L’humilité · La force qui sert',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
p=ROOT/'.mindstudio/studio'/meta['id']; p.mkdir(exist_ok=True);(p/'compositions').mkdir(exist_ok=True)
(W/'project.json').write_text(json.dumps(meta));(p/'mindstudio-project.json').write_text(json.dumps(meta))
for src,dest in [(Path('/Users/user/Downloads/humi_010e7c67e0.wav'),'narration.wav'),(Path('/Users/user/Downloads/hyperframes_athoms_humilite_full_audio_5m51_master.txt'),'brief.txt'),(W/'transcription.txt','transcription.txt'),(W/'paroles.srt','paroles.srt'),(ROOT/'node_modules/gsap/dist/gsap.min.js','gsap.min.js')]:shutil.copy(src,p/dest)
spec=importlib.util.spec_from_file_location('art',ROOT/'scripts/community-art.py'); art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
def norm(s):return re.sub(r'[^a-z0-9]','',__import__('unicodedata').normalize('NFD',s.lower()).encode('ascii','ignore').decode())
def at(phrase,after=0):
    ts=[norm(w['text']) for w in words];q=[norm(x) for x in phrase.split()]
    for i in range(len(ts)-len(q)+1):
        if words[i]['start']>=after and ts[i:i+len(q)]==q:return words[i]['start']
    raise ValueError('Missing audio anchor: '+phrase)
# Meaning-first chapter entrances; estimated timings in the brief are deliberately not used.
beats=[('On confond souvent','Humilité ≠ faiblesse','balance','HUMILITY_NOT_WEAKNESS'),
('On pense qu’être','Se laisser écraser ?','pressure','MISCONCEPTION'),
('Mais ce n’est','Une autre voie.','hero','REHOOK_JESUS'),
('Le pasteur','Athom’s Mbuma','name','SOURCE_ATTRIBUTION'),
('C’est une puissance','Puissance sous contrôle.','balance','POWER_UNDER_CONTROL'),
('Et ça change','La force peut servir.','service','REDEFINITION'),
('Parce qu’une personne','Fort. Et humble.','leader','STRENGTH'),
('L’humilité ne consiste','Savoir qui tu es.','mirror','IDENTITY_INTRO'),
('Regarde Jésus','Regarde Jésus.','bible','JESUS_MODEL'),
('Et pourtant','Il a choisi de servir.','basin','JOHN_13'),
('Imagine un instant','Le Maître sert.','washing','MASTER_SERVANT'),
('Pourquoi','La puissance sans bruit.','hero','REHOOK_POWER'),
('L’orgueil lui','Être vu. À tout prix.','noise','PRIDE_NOISE'),
('Mais l’humilité','Le calme d’une identité.','tree','HUMILITY_FRUIT'),
('Et c’est là','Et toi ?','hero','PERSONAL_QUESTION'),
('Que se passe-t-il','Quand on te corrige…','conversation','CORRECTION'),
('Quand quelqu’un d’autre','Laisser l’autre briller.','recognize','RECOGNITION_TEST'),
('Et lorsque','Ton autorité protège ?','umbrella','AUTHORITY_TEST'),
('C’est là que','La transformation se voit.','relations','TRANSFORMATION'),
('La Bible dit','Philippiens 2:3–5','bible','PHILIPPIANS'),
('Cela ne signifie','Ta valeur reste entière.','balance','OTHERS_VALUE'),
('Tu peux être compétent','Ferme sans arrogance.','conversation','FIRMNESS'),
('Et c’est peutêtre','Une confusion à dépasser.','pressure','CULTURE_CONTRAST'),
('Mais Jésus présente','La grandeur sert.','hero','REHOOK_SERVICE'),
('Dans Marc','Marc 10:42–45','bible','MARK_10'),
('Autrement dit','Grandir pour servir.','leader','SERVICE_AUTHORITY'),
('Plus tu reçois de pouvoir','Le pouvoir protège.','umbrella','POWER_PROTECTS'),
('Plus tu reçois d’influence','Élever les autres.','service','INFLUENCE'),
('Plus tu deviens','S’approcher des oubliés.','relations','APPROACH'),
('Parce que l’autorité','Une couverture.','umbrella','AUTHORITY_PROTECTS'),
('Et voilà pourquoi','L’humilité ne te diminue pas.','hero','REHOOK_NOT_SMALL'),
('Tu ne deviens pas un','Tu gardes ta personnalité.','mirror','NOT_INVISIBLE'),
('Tu choisis simplement','Ta force, sans écraser.','balance','CONTROLLED_FORCE'),
('Et il y a','Une identité stable.','mirror','IDENTITY_STABLE'),
('Quand tu sais','Servir sans te diminuer.','service','SECURE_SERVICE'),
('Demander pardon','Demander pardon.','conversation','APOLOGY'),
('Reconnaître le talent','Son talent. Ta valeur.','recognize','OTHERS_TALENT'),
('Laisser quelqu’un','Sa lumière n’éteint pas la tienne.','lights','OTHERS_LIGHT'),
('Mais lorsque','Tout devient compétition.','noise','FRAGILE_IDENTITY'),
('Alors comment','L’humilité se pratique.','hero','PRACTICE_HUMILITY'),
('Premièrement','01 · Écouter','listen','LISTEN'),
('Deuxièmement','02 · Reconnaître','recognize','RECOGNIZE'),
('Et troisièmement','03 · Honorer','honor','HONOR'),
('Parce qu’une personne humble','Est-ce que je respecte les autres ?','conversation','RESPECT_QUESTION'),
('Et peutêtre que c’est','Cette semaine, observe-toi.','hero','FINAL_CHALLENGE'),
('Dans quelle relation','Choisis une relation.','relations','RELATION_CHALLENGE'),
('Et pose-toi','Avoir raison… ou ressembler à Jésus ?','hero','FINAL_QUESTION'),
('Parce qu’au fond','Une preuve de transformation.','tree','TRANSFORMATION_PAYOFF'),
('Jésus était','Puissant. Et serviteur.','washing','JESUS_PAYOFF'),
('Alors non','L’humilité n’est pas une faiblesse.','hero','PAYOFF'),
('L’humilité c’est la force','La force qui n’écrase plus.','balance','FINAL_DEFINITION'),
('Et peutêtre que la vraie','La vraie grandeur commence là.','tree','END_PAYOFF')]
anchors=[];cursor=0
for phrase,title,kind,marker in beats:
    t=at(phrase,cursor);anchors.append((t,title,kind,marker));cursor=t+.01
anchors[0]=(0,*anchors[0][1:])
# Reframes are cuts at real sentence/word boundaries. No arbitrary caption-duration scene changes.
variants={'balance':['balance','control','service'],'pressure':['pressure','conversation','hero'],'leader':['leader','service','relations'],'mirror':['mirror','service','lights'],'bible':['bible','book','service'],'basin':['basin','washing'],'washing':['washing','basin'],'noise':['noise','pressure'],'tree':['tree','service'],'conversation':['conversation','listen'],'recognize':['recognize','lights','honor'],'umbrella':['umbrella','leader'],'relations':['relations','conversation','service'],'service':['service','leader'],'lights':['lights','recognize'],'listen':['listen','conversation'],'honor':['honor','relations'],'hero':['hero','control']}
shots=[]
for i,(a,title,kind,marker) in enumerate(anchors):
    b=anchors[i+1][0] if i+1<len(anchors) else D
    cuts=[a]; pos=a
    while b-pos>4.7:
        target=pos+3.6
        candidates=[x['start'] for x in paras if pos+2.4<=x['start']<=min(pos+4.6,b-1.3)]
        if not candidates:candidates=[x['start'] for x in words if pos+2.8<=x['start']<=min(pos+4.6,b-1.3)]
        cut=min(candidates,key=lambda x:abs(x-target)) if candidates else target
        cuts.append(cut);pos=cut
    for j,start in enumerate(cuts):
        ks=variants.get(kind,[kind]);k=ks[j%len(ks)]
        shots.append(dict(start=start,end=cuts[j+1] if j+1<len(cuts) else b,title=title,kind=k,marker=marker,chapter=i+1,detail=j>0))
def svg(kind):
    people=art.person
    bg='<rect width="1080" height="1920" fill="#e6dfce"/><circle cx="830" cy="710" r="480" fill="#f5ecd9"/><path d="M0 1450Q600 1180 1080 1400V1920H0Z" fill="#c1c7b2"/>'
    c=''
    if kind in ('bible','book'):return art.art('bible')
    if kind=='service':return art.art('service')
    if kind in ('conversation','listen','honor','recognize','relations'):
        c='<rect x="100" y="750" width="880" height="610" rx="45" fill="#c8cfba"/>'+people(285,925,1.3,'help','#527a70')+people(770,925,1.3,'stand','#ac855d')+'<path d="M450 1370H660" stroke="#bca77f" stroke-width="25"/>'
        if kind=='listen':c+='<g id="signal"><path d="M615 820Q670 870 615 925M650 790Q745 870 650 955" fill="none" stroke="#bc985b" stroke-width="10"/></g>'
        if kind in ('honor','recognize'):c+='<g id="signal"><path d="M710 650L733 705L790 710L746 749L761 808L710 778L659 808L674 749L630 710L687 705Z" fill="#c5a25d"/></g>'
        if kind=='relations':c+=people(530,1175,.65,'stand','#879d8e')
    elif kind in ('basin','washing'):
        c='<path d="M80 520H1000V1380H80Z" fill="#c6c6ac"/><path d="M150 600H930M150 670H930" stroke="#d9d5bb" stroke-width="9"/>'
        c+=people(760,820,1.45,'stand','#aa825f')+'<g id="servant"><path d="M320 1150Q380 1110 450 1150L480 1280H295Z" fill="#efe6d1"/><ellipse cx="385" cy="1080" rx="47" ry="60" fill="#b57a55"/><path d="M338 1060Q360 1000 414 1028L432 1063" fill="#49372b"/><path d="M430 1160L565 1230L690 1265" stroke="#b57a55" stroke-width="25" fill="none" stroke-linecap="round"/><path d="M315 1280L260 1365H425" stroke="#d1c4a7" stroke-width="50" fill="none" stroke-linecap="round"/></g><path d="M570 1300Q715 1415 855 1300L825 1400H600Z" fill="#688e8b"/><ellipse cx="713" cy="1300" rx="142" ry="28" fill="#b2d1c4"/><path d="M630 1225L725 1255L705 1300L615 1265Z" fill="#fff5e0"/>'
    elif kind in ('balance','control'):
        c='<g id="balance"><path d="M540 830V1380M240 970H840M400 1380H680" stroke="#41665d" stroke-width="20"/><path d="M240 970L130 1190H350ZM840 970L730 1190H950Z" fill="#afbdab" stroke="#41665d" stroke-width="6"/><circle cx="540" cy="815" r="52" fill="#c09a5c"/></g><text x="240" y="1290" text-anchor="middle" fill="#31584e" font-size="40" font-family="Arial">FORCE</text><text x="840" y="1290" text-anchor="middle" fill="#31584e" font-size="40" font-family="Arial">AMOUR</text>'
    elif kind in ('pressure','noise'):
        c=people(540,980,1.5,'stand','#795c53')+''.join(f'<path d="M{x} {y}l{dx} {dy}" stroke="#b47c60" stroke-width="18" stroke-linecap="round"/>' for x,y,dx,dy in [(160,850,170,90),(920,850,-170,90),(140,1100,150,0),(940,1100,-150,0)])+'<path d="M220 730L340 810M860 730L740 810" stroke="#ac715c" stroke-width="10"/>'
    elif kind=='umbrella':
        c='<g id="umbrella"><path d="M90 1040Q540 390 990 1040Q865 970 760 1040Q650 960 540 1040Q430 960 320 1040Q200 970 90 1040Z" fill="#5f8376"/><path d="M540 720V1450Q540 1540 455 1500" fill="none" stroke="#bb965a" stroke-width="20"/></g>'+people(275,1180,.8,'stand')+people(805,1180,.8,'stand','#9e805a')
    elif kind=='mirror':
        c='<rect x="180" y="620" width="720" height="800" rx="200" fill="#b69a69"/><rect x="210" y="650" width="660" height="740" rx="175" fill="#b8ccc0"/>'+people(540,905,1.25,'stand','#547c72')+'<path d="M260 970L750 720M310 1220L820 950" stroke="#eef5e6" stroke-width="15" opacity=".4"/>'
    elif kind in ('lights','tree'):
        if kind=='lights':c='<g id="signal"><circle cx="310" cy="1010" r="135" fill="#ddbd79"/><circle cx="780" cy="1010" r="135" fill="#ddbd79"/></g><path d="M310 1170V1380M780 1170V1380" stroke="#58786b" stroke-width="20"/>'
        else:c='<path d="M540 1390V930M540 1120L360 920M540 1050L730 850" stroke="#8b7754" stroke-width="30"/><g id="leaves">'+''.join(f'<ellipse cx="{x}" cy="{y}" rx="145" ry="130" fill="{color}"/>' for x,y,color in [(330,830,'#8da487'),(540,715,'#6d917d'),(735,805,'#537969'),(510,940,'#7b9b80')])+'</g><circle cx="375" cy="890" r="27" fill="#d7ad66"/><circle cx="665" cy="900" r="27" fill="#d7ad66"/>'
    elif kind=='leader':c='<rect x="140" y="1250" width="800" height="160" rx="24" fill="#b2bea5"/>'+people(540,785,1.4,'help','#527a70')+people(245,1110,.75,'stand','#a78a60')+people(840,1110,.75,'stand','#7d958c')
    else:c='<g id="signal"><circle cx="540" cy="1030" r="310" fill="#365e53"/><circle cx="540" cy="1030" r="355" fill="none" stroke="#b6955f" stroke-width="3"/></g>'
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">'+bg+'<g id="illustration">'+c+'</g></svg>'
css='''*{box-sizing:border-box}html,body{margin:0;background:#e6dfce}#root{position:relative;width:1080px;height:1920px;overflow:hidden}.visual{position:absolute;inset:0;transform-origin:50% 56%}.visual svg{width:1080px;height:1920px}.title{position:absolute;left:92px;right:142px;top:190px;margin:0;color:#294f45;font:600 76px/1.12 Georgia;overflow-wrap:break-word}.rule{width:86px;height:5px;background:#b69253;margin-top:25px}.eyebrow{position:absolute;left:94px;top:120px;color:#557366;font:25px Arial;letter-spacing:4px}.shade{position:absolute;inset:0;background:linear-gradient(0deg,#142c2bea,transparent 32%)}.caption{position:absolute;left:95px;right:150px;bottom:270px;text-align:center;color:#fff8ea;font:47px/1.26 Arial;text-shadow:0 2px 7px #0007}.hero{position:absolute;left:155px;right:155px;top:805px;text-align:center;color:#fff1d6;font:67px/1.14 Georgia}.note{position:absolute;left:95px;right:140px;bottom:205px;color:#e5d9bc;font:23px Arial}'''
mounts=[]
for i,s in enumerate(shots):
    a,b=s['start'],s['end'];dur=b-a;cid=f'shot-{i+1:03}';kind=s['kind'];title=s['title']
    body=f'<div class="visual" id="visual">{svg(kind)}</div><div class="shade"></div><div class="eyebrow">L’HUMILITÉ · LA FORCE QUI SERT</div>'
    body+=f'<h1 id="title" class="title">{html.escape(title)}<div class="rule"></div></h1>'
    if kind in ('hero','name'):body+=f'<div class="hero" id="hero">{html.escape(title if kind=="name" else {"REHOOK_SERVICE":"GRANDIR POUR SERVIR","FINAL_QUESTION":"JÉSUS OU MON ORGUEIL ?","PAYOFF":"UNE FORCE SOUS CONTRÔLE"}.get(s["marker"],"SERVIR · AIMER · GRANDIR"))}</div>'
    if kind=='name':body+='<div class="note">SYNTHÈSE NARRÉE FOURNIE · PAS UNE ARCHIVE</div>'
    tl='const tl=gsap.timeline({paused:true});'
    # Mostly clean cuts; only selected chapter openings dissolve their title.
    if i%5==0 and i>0:tl+="tl.from('#title',{opacity:0,y:16,duration:.22,ease:'power2.out'},0);"
    scale=1.065 if s['detail'] and kind not in ('hero','name') else 1
    tl+=f"tl.set('#visual',{{scale:{scale}}},0);"
    if kind not in ('hero','name','bible','book'):tl+=f"tl.to('#visual',{{scale:{scale+.014},duration:{dur},ease:'sine.inOut'}},0);"
    if kind in ('umbrella','tree','lights','listen','recognize'):tl+=f"tl.from('#{ {'umbrella':'umbrella','tree':'leaves'}.get(kind,'signal')}',{{opacity:.45,y:12,duration:{min(.65,dur/3)},ease:'power2.out'}},0);"
    local=[w for w in words if a<=w['start']<b]
    chunks=[];chunk=[]
    for w in local:
        if chunk and (len(chunk)>=6 or len(' '.join(x['text'] for x in chunk))+len(w['text'])>38):chunks.append(chunk);chunk=[]
        chunk.append(w)
        if re.search(r'[.!?…]$',w['text']):chunks.append(chunk);chunk=[]
    if chunk:chunks.append(chunk)
    for j,c in enumerate(chunks):
        start=max(0,c[0]['start']-a);end=min(dur,c[-1]['end']-a)
        if end<=start:continue
        body+=f'<div id="cap-{j}" class="clip caption" data-start="{start}" data-duration="{end-start}" data-track-index="4">{html.escape(" ".join(w["text"] for w in c))}</div>'
    tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
    (p/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="root" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920">{body}</main><script>{tl}</script></body></html>')
    mounts.append(f'<div class="clip" id="clip-{i}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{a}" data-duration="{dur}" data-track-index="0" style="position:absolute;inset:0"></div>')
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0}}main{{position:relative;width:1080px;height:1920px;overflow:hidden}}</style></head><body><main data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1080" data-height="1920">'+''.join(mounts)+f'<audio class="clip" id="voice" src="narration.wav" data-start="0" data-duration="{D}" data-track-index="10" data-volume="1"></audio><audio class="clip" id="music" src="music.wav" data-start="0" data-duration="{D}" data-track-index="20" data-volume="1"></audio></main></body></html>')
(p/'storyboard.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(p/'director-markers.json').write_text(json.dumps([dict(time=a,name=m) for a,t,k,m in anchors]+[dict(time=D,name='END')],indent=2))
(p/'notes.md').write_text('Narration originale intégrale : 350.590083 s. Transcription utilisateur alignée aux mots détectés localement. Aucun faux portrait, aucune archive réelle : scènes SVG symboliques. Aucune prétention à une citation enregistrée d’Athom’s. Références bibliques du brief affichées comme repères, sans verset inventé. Musique minimaliste originale synthétisée localement, sous la voix. Les moteurs du brief sont des intentions de mise en scène, pas des modules installés. Rétention : rythme conçu, résultat non garanti sans données spectateurs.\n')
(p/'rehearsal.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Rehearsal · Humilité</title><style>body{margin:0;background:#101817;color:#eee;font:18px system-ui;display:flex;gap:25px;padding:20px}video{height:90vh}pre{white-space:pre-wrap;max-width:400px}</style><video id="v" controls src="delivery.mp4"></video><pre id="o"></pre><script>const shots='+json.dumps(shots,ensure_ascii=False)+';v.ontimeupdate=()=>{const t=v.currentTime,s=shots.find(x=>t>=x.start&&t<x.end)||shots.at(-1);o.textContent=JSON.stringify({time:t.toFixed(2),beat:s.chapter,marker:s.marker,visual:s.kind,punch:s.title,secondsSinceCut:(t-s.start).toFixed(2),music:"pad discret",nextEvent:s.end,retentionWarning:t-s.start>5},null,2)};</script></html>')
print(json.dumps(dict(id=meta['id'],duration=D,shots=len(shots),longest=max(s['end']-s['start'] for s in shots),project=str(p)),ensure_ascii=False))
