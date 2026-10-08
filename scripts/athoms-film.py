"""HyperFrames documentary motion project, without fabricated person/archives."""
import ast, json, uuid, datetime, shutil, html, re, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
WORK=ROOT/'.mindstudio/athoms-work'; WORK.mkdir(exist_ok=True)
SOURCE=Path('/Users/user/Downloads/Il-y-a-des-pasteurs-qu-on-decouvre-par-une-predication.wav')
BRIEF=Path('/Users/user/Downloads/hyperframes_athoms_mbuma_master_brief_9x16.txt')
D=81.87
if not (WORK/'speech.json').exists():
    from faster_whisper import WhisperModel
    model=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=4,local_files_only=True)
    seg,_=model.transcribe(str(SOURCE),language='fr',word_timestamps=True,vad_filter=True)
    data=[dict(start=s.start,end=s.end,text=s.text.strip(),words=[dict(text=w.word.strip(),start=w.start,end=w.end) for w in s.words or []]) for s in seg]
    (WORK/'speech.json').write_text(json.dumps(data,ensure_ascii=False))
speech=json.loads((WORK/'speech.json').read_text()); words=[w for s in speech for w in s['words']]
text=BRIEF.read_text().split('2. SCRIPT EXACT À SERVIR')[1].split('3. OBJECTIF YOUTUBE')[0].strip('=\n ').rsplit('======================================================================',1)[0].strip()
(WORK/'transcription.txt').write_text(text)
if (WORK/'aligned-words.json').exists():words=json.loads((WORK/'aligned-words.json').read_text())
meta=json.loads((WORK/'project.json').read_text()) if (WORK/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()),name='Athom’s Mbuma · Un parcours, une mission',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
p=ROOT/'.mindstudio/studio'/meta['id'];p.mkdir(exist_ok=True);(p/'compositions').mkdir(exist_ok=True)
(WORK/'project.json').write_text(json.dumps(meta));(p/'mindstudio-project.json').write_text(json.dumps(meta))
shutil.copy(SOURCE,p/'narration.wav');shutil.copy(BRIEF,p/'brief.txt');shutil.copy(WORK/'transcription.txt',p/'transcription.txt');shutil.copy(ROOT/'node_modules/gsap/dist/gsap.min.js',p/'gsap.min.js')
# Reuse the original, explicitly illustrated presenter, without running its film script.
tree=ast.parse((ROOT/'scripts/femme-esperance.py').read_text())
presenter=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='presenter' for t in n.targets))
spec=importlib.util.spec_from_file_location('art',ROOT/'scripts/community-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
def norm(s):return re.sub(r'[^a-zà-ÿ]','',s.lower())
def at(phrase,fallback,after=0):
    tokens=[norm(w['text']) for w in words];target=[norm(w) for w in phrase.split()]
    for i in range(len(tokens)-len(target)+1):
        if words[i]['start']>=after and tokens[i:i+len(target)]==target:return words[i]['start']
    return fallback
shots=[(0,'Certains pasteurs…','presenter','HOOK'),(2.3,'Un parcours.\nUn message.','journey','PATTERN_INTERRUPT'),
       (at('Athom’s Mbuma',5.9),'Athom’s\nMbuma','name','ATHOMS_REVEAL'),
       (at('Aujourd’hui beaucoup',8.4),'L’enseignement','bible','KNOWN_FOR_TEACHING'),
       (at('ses prédications',11.8),'La prédication','teaching','PREACHING'),
       (at('d’expliquer la Bible',13.74),'Expliquer la Bible','bible','BIBLE_DETAIL'),
       (at('Mais son histoire',18.2),'Bien avant la caméra.','presenter','NOT_CAMERA_ORIGIN'),
       (at('Depuis plusieurs',21.6),'Le ministère\nde la louange','worship','WORSHIP_HISTORY'),
       (20.2,'La louange,\nune origine.','gospel','WORSHIP_DETAIL'),
       (at('le groupe GAEL',26.3),'GAEL','gospel','GAEL'),
       (at('responsabilités dans',29),'Vers le pastorat','church','PASTORAL_SHIFT'),
       (at('Aujourd’hui il dirige',31.8),'Athom’s & Nadège','presenter','PHILA_COUPLE'),
       (at('l’église Phila',34.3),'Phila\nCité d’Exaucement','church','PHILA'),
       (at('à Kinshasa',38),'Kinshasa · RDC','location','PHILA_KINSHASA'),
       (at('Mais ce qui',40.8),'Pas seulement\npasteur.','presenter','MORE_THAN_PASTOR'),
       (at('c’est qu’il',33.98),'Plusieurs dimensions.','journey','MINISTRY_DIMENSIONS'),
       (at('enseignant formateur',44),'Enseignant','teaching','TEACHER'),
       (at('formateur et',45.5),'Formateur','training','TRAINER'),
       (at('conducteur de louange',47),'Conducteur\nde louange','worship','WORSHIP_LEADER'),
       (at('Et encore aujourd’hui',49.9),'Au-delà de la RDC','reach','FRANCOPHONE_REACH'),
       (43.42,'Une portée plus large.','screens','REACH_DETAIL'),
       (at('ses enseignements diffusés',53),'La francophonie\nchrétienne','screens','FRANCOPHONE_MEDIA'),
       (at('Récemment encore',56.6),'Pentecôte\n2026','conference','PENTECOTE_2026'),
       (at('aux côtés',59),'Un rendez-vous\nfrancophone','conference','CONFERENCE_CONTEXT'),
       (at('Et quand',63),'Une chose ressort…','presenter','ONE_THING_STANDS_OUT'),
       (at('il n’a pas',65),'Pas une seule chose.','pillars','PILLARS_SETUP'),
       (at('La louange',69,after=60),'Louange','worship','PILLAR_WORSHIP'),
       (at('L’enseignement',71,after=60),'Enseignement','teaching','PILLAR_TEACHING'),
       (at('La formation',72.7,after=60),'Formation','training','PILLAR_TRAINING'),
       (at('Le pastorat',74,after=60),'Pastorat','church','PILLAR_PASTORAL'),
       (at('Tout semble',75.6),'Une même mission.','converge','MISSION'),
       (at('aider les gens',76),'Mieux connaître Dieu.','bible','MISSION_PAYOFF'),
       (at('Et peutêtre',77),'Une voix écoutée.','screens','WHY_LISTENED'),
       (73,'Une mission\nqui se transmet.','bible','TRANSMISSION'),
       (at('Mais voici',78.5),'Mais voici la question…','presenter','QUESTION'),
       (at('quel enseignement',78.36),'Quel enseignement\nt’a marqué ?','presenter','CTA')]
shots.sort(key=lambda s:s[0]);shots=[s for i,s in enumerate(shots) if s[0]<D and (i==0 or s[0]>shots[i-1][0]+.04)]
def visual(kind):
    if kind in ('bible','worship','gospel'):return art.art(kind)
    if kind=='church':return '<svg viewBox="0 0 1080 1920"><path d="M190 1430V820L540 530L890 820V1430Z" fill="#708a7c"/><path d="M540 560V720M480 620H600" stroke="#e6c57e" stroke-width="14"/><path d="M420 1430V1140Q540 950 660 1140V1430" fill="#efe3c3"/>'+''.join(art.person(x,1320,.65,'stand',c) for x,c in [(230,'#9c805c'),(540,'#4d726c'),(850,'#778da0')])+'</svg>'
    if kind in ('teaching','training','conference'):
        return '<svg viewBox="0 0 1080 1920"><rect x="120" y="610" width="840" height="510" rx="25" fill="#5f8075"/><path d="M235 755H835M235 850H735M235 945H630" stroke="#e7d8ac" stroke-width="13"/>'+art.person(760,1080,.85,'help')+''.join(art.person(x,1410,.6,'stand') for x in [240,430,620])+'<rect x="610" y="1280" width="300" height="110" rx="10" fill="#b59b69"/></svg>'
    if kind in ('reach','screens','location'):
        return '<svg viewBox="0 0 1080 1920"><g id="network"><circle cx="540" cy="1050" r="85" fill="#bfa467"/><text x="540" y="1068" text-anchor="middle" font-family="Arial" font-size="42" fill="#fff5dc">'+('RDC' if kind!='location' else 'Kinshasa')+'</text>'+''.join(f'<path d="M540 1050L{x} {y}" stroke="#6c8b7a" stroke-width="5"/><rect x="{x-80}" y="{y-60}" width="160" height="120" rx="15" fill="#647f78"/><path d="M{x-50} {y}H{x+50}" stroke="#d8cbaa" stroke-width="6"/>' for x,y in [(230,730),(815,720),(225,1370),(840,1340)])+'</g></svg>'
    if kind in ('pillars','converge','journey'):
        labels=['LOUANGE','ENSEIGNEMENT','FORMATION','PASTORAT'] if kind!='journey' else ['LOUANGE','TRANSMISSION','RESPONSABILITÉ','MISSION']
        return '<svg viewBox="0 0 1080 1920">'+''.join(f'<g id="pillar-{i}"><rect x="150" y="{650+i*210}" width="760" height="160" rx="18" fill="{["#5b7c72","#8d9c84","#b09266","#56706c"][i]}"/><text x="540" y="{750+i*210}" text-anchor="middle" font-family="Arial" font-size="43" fill="#fff4dc">{label}</text></g>' for i,label in enumerate(labels))+'</svg>'
    return ''
css='''*{box-sizing:border-box}html,body{margin:0;background:#e6dfcf}#root{width:1080px;height:1920px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 25% 30%,#fff2d6,transparent 65%),#ddd9c7}.visual{position:absolute;inset:0;transform-origin:50% 55%}.visual svg{width:1080px;height:1920px}.heading{position:absolute;left:90px;right:120px;top:165px;color:#284b43;font:500 82px/1.12 Georgia;white-space:pre-line;margin:0;overflow-wrap:break-word}.line{width:80px;height:5px;background:#b2925b;margin-top:28px}.shade{position:absolute;inset:0;background:linear-gradient(0deg,#263e3de8,transparent 32%);pointer-events:none}.caption{position:absolute;bottom:250px;left:100px;right:130px;color:#fff6e5;text-align:center;font:48px/1.25 Arial;text-shadow:0 2px 9px #0007}.name{position:absolute;top:640px;left:100px;right:130px;font:100px/1.06 Georgia;color:#294e45;white-space:pre-line}.note{position:absolute;left:90px;bottom:190px;color:#fff3d0;font:24px Arial;letter-spacing:2px}'''
mounts=[];board=[]
for i,(start,title,kind,marker) in enumerate(shots):
    end=shots[i+1][0] if i+1<len(shots) else D;duration=end-start;cid=f'shot-{i+1:02}'
    content=f'<div id="visual" class="visual">{presenter if kind=="presenter" else visual(kind)}</div><div class="shade"></div>'
    if kind=='name':content+=f'<div id="name" class="name">ATHOM’S<br>MBUMA<div class="line"></div><small style="font:30px Arial">UN PARCOURS · UNE MISSION</small></div>'
    else:content+=f'<h1 class="heading" id="title">{html.escape(title)}<div class="line"></div></h1>'
    if kind=='conference':content+='<div class="note">ILLUSTRATION SYMBOLIQUE · AUCUNE ARCHIVE</div>'
    if marker=='QUESTION':content+='<div class="note">RÉPONDS EN COMMENTAIRE</div>'
    tl='const tl=gsap.timeline({paused:true,defaults:{overwrite:"auto"}});'
    target='name' if kind=='name' else 'title'
    tl+=f"tl.from('#{target}',{{opacity:0,y:18,duration:{min(.35,duration/3)},ease:'power2.out'}},0);"
    if kind=='presenter':
        zoom=1.08 if marker in ('HOOK','QUESTION') else 1
        tl+=f"tl.set('#visual',{{scale:{zoom}}},0);"
        if marker in ('HOOK','QUESTION','ONE_THING_STANDS_OUT'):tl+=f"tl.to('#visual',{{scale:{zoom+.022},duration:{duration},ease:'sine.inOut'}},0);"
        for blink in range(2,int(duration),4):tl+=f"tl.to('#eyes',{{scaleY:.1,svgOrigin:'540 779',duration:.08,yoyo:true,repeat:1}},{blink});"
        if duration>1.5:tl+="tl.to('#hand',{rotation:-3,svgOrigin:'730 1540',duration:.6,yoyo:true,repeat:1},.2);"
    elif kind in ('bible','worship','gospel','church','training'):tl+=f"tl.fromTo('#visual',{{scale:1}},{{scale:1.025,duration:{duration},ease:'none'}},0);"
    if kind in ('journey','pillars','converge'):
        for j in range(4):tl+=f"tl.from('#pillar-{j}',{{opacity:0,x:{-30 if j%2==0 else 30},duration:{min(.3,duration/5)}}},{j*min(.35,duration/5)});"
        if kind=='converge':
            for j in range(4):tl+=f"tl.to('#pillar-{j}',{{y:{(1.5-j)*210},scale:.65,transformOrigin:'center',opacity:.18,duration:{min(.7,duration/2)},ease:'power2.inOut'}},{max(.7,duration-.8)});"
    local=[w for w in words if start<=w['start']<end]
    if kind=='presenter':
        for j,w in enumerate(local):
            if w['end']-w['start']<.02 or (j+1<len(local) and local[j+1]['start']-w['start']<.02):continue
            a=w['start']-start;dur=max(.001,min(w['end'],local[j+1]['start'] if j+1<len(local) else end)-w['start']-.001);tr=min(.04,dur/3)
            ry,rx=(12,25) if re.search('[ou]',w['text'].lower()) else (15,35)
            tl+=f"tl.to('#mouth',{{attr:{{ry:{ry},rx:{rx}}},duration:{tr}}},{a});tl.to('#mouth',{{attr:{{ry:4,rx:39}},duration:{tr}}},{a+dur-tr});"
    for j in range(0,len(local),5):
        c=local[j:j+5];a=c[0]['start']-start;b=min(c[-1]['end'],end)-start
        content+=f'<div id="caption-{j}" class="caption clip" data-start="{a}" data-duration="{max(.02,b-a)}" data-track-index="4">{html.escape(" ".join(w["text"] for w in c))}</div>'
    tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
    (p/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="root" data-composition-id="{cid}" data-start="0" data-duration="{duration}" data-width="1080" data-height="1920">{content}</main><script>{tl}</script></body></html>')
    mounts.append(f'<div id="clip-{i}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{start}" data-duration="{duration}" data-track-index="0" style="position:absolute;inset:0"></div>')
    board.append(dict(start=start,end=end,title=title,kind=kind,marker=marker))
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0}}#main{{width:1080px;height:1920px;position:relative;overflow:hidden}}</style></head><body><main id="main" data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1080" data-height="1920">'+''.join(mounts)+f'<audio id="voice" class="clip" src="narration.wav" data-start="0" data-duration="{D}" data-track-index="10" data-volume="1"></audio></main></body></html>')
(p/'storyboard.json').write_text(json.dumps(board,ensure_ascii=False,indent=2))
(p/'director-markers.json').write_text(json.dumps([dict(name=s['marker'],time=s['start']) for s in board]+[dict(name='END',time=D)],indent=2))
(p/'notes.md').write_text('Audio original intégral. Aucune photo ou archive fournie : aucun portrait d’Athom’s ni de Nadège fabriqué. Personnages de B-roll génériques et symboliques ; présentatrice dessinée en SVG. Lip-sync approximatif calé sur les mots, non phonétique. Les faits sont ceux du script utilisateur ; la carte réseau est un schéma de diffusion et ne représente pas des pays vérifiés. Pas de musique/SFX ajoutés faute d’assets fournis. Les noms de moteurs du brief sont des intentions de mise en scène, pas des modules activés.\n')
(p/'rehearsal.html').write_text('''<!doctype html><html lang="fr"><meta charset="utf-8"><title>Rehearsal · Athom’s</title><style>body{margin:0;background:#121719;color:#eee;font:17px system-ui;display:flex;gap:30px;padding:24px}video{height:88vh;max-width:55vw}pre{white-space:pre-wrap;width:380px}h1{font-size:24px}</style><video id="video" controls src="delivery.mp4"></video><section><h1>Rehearsal — hors export</h1><pre id="debug"></pre></section><script>const shots='''+json.dumps(board,ensure_ascii=False)+''';const v=document.getElementById('video'),out=document.getElementById('debug');v.addEventListener('timeupdate',()=>{const t=v.currentTime,s=shots.find(s=>t>=s.start&&t<s.end)||shots.at(-1);out.textContent=JSON.stringify({audioTime:t.toFixed(2),marker:s.marker,text:s.title,shot:s.kind,focus:s.kind==='presenter'?'visage':'illustration',lipSync:s.kind==='presenter'?'approximatif':'REST',music:'aucune',nextCut:s.end,secondsSinceCut:(t-s.start).toFixed(2),retentionWarning:t-s.start>4.5},null,2)});</script></html>''')
print(json.dumps(dict(id=meta['id'],project=str(p),shots=board),ensure_ascii=False))
