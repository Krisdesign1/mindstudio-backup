"""Local HyperFrames film: original narration, illustrated presenter, editable clips."""
from pathlib import Path
import json, uuid, datetime, shutil, html, re, sys, importlib.util
ROOT = Path(__file__).resolve().parent.parent
MASTER = '--master' in sys.argv
WORK = ROOT / ('.mindstudio/community-master' if MASTER else '.mindstudio/femme-esperance')
WORK.mkdir(exist_ok=True)
if MASTER and not (WORK/'speech.json').exists():
    shutil.copy(ROOT/'.mindstudio/femme-esperance/speech.json', WORK/'speech.json')
SOURCE = Path('/Users/user/Downloads/On-parle-beaucoup-de-tout-ce-qui-va-mal.wav')
DURATION = 43.43

if not (WORK/'speech.json').exists():
    from faster_whisper import WhisperModel
    model = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4, local_files_only=True)
    segments, _ = model.transcribe(str(SOURCE), language='fr', word_timestamps=True, vad_filter=True)
    speech = [dict(start=s.start, end=s.end, text=s.text.strip(), words=[dict(text=w.word.strip(), start=w.start, end=w.end) for w in s.words or []]) for s in segments]
    (WORK/'speech.json').write_text(json.dumps(speech, ensure_ascii=False))
speech = json.loads((WORK/'speech.json').read_text())
words = [w for s in speech for w in s['words']]
if MASTER:
    # Correct recognition against the supplied script where the audio is clear.
    for i,w in enumerate(words):
        if w['text'].lower()=='faibles.': w['text']='faibles.'
        if w['text'].lower()=='à' and i>0 and words[i-1]['text'].lower()=='servir': w['text']=''
    words=[w for w in words if w['text']]
meta = json.loads((WORK/'project.json').read_text()) if (WORK/'project.json').exists() else dict(id='free-'+str(uuid.uuid4()), name='Dieu agit encore · Une génération se lève', createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
if MASTER: meta['name']='Une génération se lève · Montage illustré'
project = ROOT/'.mindstudio/studio'/meta['id']
project.mkdir(exist_ok=True)
(project/'compositions').mkdir(exist_ok=True)
(WORK/'project.json').write_text(json.dumps(meta))
(project/'mindstudio-project.json').write_text(json.dumps(meta))
shutil.copy(SOURCE, project/'narration.wav')
shutil.copy(ROOT/'node_modules/gsap/dist/gsap.min.js', project/'gsap.min.js')
shutil.copy('/Users/user/Downloads/'+('hyperframes_christian_french_community_9x16_full_master_brief.txt' if MASTER else 'hyperframes_femme_chretienne_9x16_script_brief.txt'), project/'brief.txt')
(project/'transcription.txt').write_text('\n\n'.join(s['text'] for s in speech))
if MASTER:
    brief=(project/'brief.txt').read_text()
    transcript=brief.split('3. SCRIPT AUDIO / TRANSCRIPTION')[1].split('4. STRATÉGIE')[0]
    transcript=transcript.strip('=\n ').rsplit('==================================================',1)[0].strip()
    (project/'transcription.txt').write_text(transcript)
    if (WORK/'aligned-words.json').exists(): words=json.loads((WORK/'aligned-words.json').read_text())

def anchor(phrase, fallback):
    tokens = [re.sub(r'[^a-zà-ÿ]', '', w['text'].lower()) for w in words]
    targets = phrase.split()
    for i in range(len(tokens)-len(targets)+1):
        if tokens[i:i+len(targets)] == targets:
            return words[i]['start']
    return fallback

beats = [(0, 'On parle de ce qui va mal…', 'contrast'),
         (anchor('mais', 2.5), 'Quelque chose de bon se passe.', 'hope'),
         (anchor('des jeunes', 7), 'Des jeunes reviennent à Dieu.', 'youth'),
         (anchor('à kinshasa', 15.3), 'Annoncer Jésus autrement.', 'generation'),
         (anchor('ailleurs', 19.04), 'La foi devient action.', 'faith'),
         (anchor('une nouvelle', 24.6), 'Une génération se lève.', 'generation'),
         (anchor('et ça', 27.68), 'Et si Dieu la réveillait ?', 'faith'),
         (anchor('peutêtre', 35.3), 'Le réveil commence dans un cœur.', 'final')]
beats.sort(key=lambda b: b[0])
if MASTER:
    spec=importlib.util.spec_from_file_location('community_art',ROOT/'scripts/community-art.py')
    artwork=importlib.util.module_from_spec(spec);spec.loader.exec_module(artwork)
    beats=[(0,'Tout ce qui va mal…','contrast'),(2,'Mais pendant ce temps…','hope'),
           (4.5,'Quelque chose se passe.','map'),(7.1,'Ils reviennent vers Dieu.','youth'),
           (anchor('des milliers',8.6),'Le baptême.','baptism'),
           (anchor('prier',11.7),'Prier.','prayer'),(anchor('louer',12.1),'Louer.','worship'),
           (anchor('apprendre',12.6),'Apprendre la Bible.','bible'),
           (anchor('servir',14.1),'Servir les plus faibles.','service'),
           (15.3,'Kinshasa · Le cinéma.','cinema'),(19.04,'Le gospel agit.','gospel'),
           (anchor('aider des',21.1),'Aider des enfants.','children'),
           (22.62,'Une génération se lève.','generation'),
           (26,'Une vraie soif de Dieu.','hope'),(27.68,'Et ça pose une question.','contrast'),
           (30,'Et si…','faith'),(32,'Une génération qu’on croyait perdue ?','faith'),
           (35.3,'Pas toujours dans une grande salle.','final'),
           (38.6,'Dans le cœur d’un jeune.','intimate')]
    beats.sort(key=lambda b:b[0])

# One original illustrated identity throughout; face, eyes and mouth are separate editable elements.
presenter = '''<svg viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="skin" x2="1" y2="1"><stop stop-color="#b97852"/><stop offset="1" stop-color="#794936"/></linearGradient>
<linearGradient id="coat" x2="1" y2="1"><stop stop-color="#dfc9ad"/><stop offset="1" stop-color="#9e8268"/></linearGradient></defs>
<g id="body"><path d="M230 1830L245 1220Q285 1100 425 1080H655Q802 1100 837 1220L866 1830" fill="url(#coat)"/>
<path d="M439 1077L540 1350L638 1077L602 1750H475" fill="#f8eee0"/><path d="M430 1075L365 1220L473 1270L540 1350M650 1075L720 1220L610 1270L540 1350" fill="none" stroke="#94745c" stroke-width="6"/>
<path d="M479 958V1100Q540 1170 602 1100V958" fill="url(#skin)"/>
<g id="head"><path d="M356 740Q323 483 540 470Q767 487 724 775L751 1180Q680 1140 647 1045H422Q400 1150 329 1180Z" fill="#27211f"/>
<ellipse cx="540" cy="793" rx="157" ry="224" fill="url(#skin)"/>
<path d="M380 733Q375 530 540 528Q675 548 704 701Q583 687 501 598Q468 676 380 733" fill="#29211f"/>
<g id="eyes"><path d="M423 774Q454 753 486 777M591 777Q622 753 653 774" fill="none" stroke="#382821" stroke-width="9"/>
<ellipse cx="456" cy="779" rx="12" ry="15" fill="#231c18"/><ellipse cx="622" cy="779" rx="12" ry="15" fill="#231c18"/><circle cx="460" cy="775" r="4" fill="#fff3df"/><circle cx="626" cy="775" r="4" fill="#fff3df"/></g>
<path d="M420 739Q452 723 483 737M593 737Q625 723 653 739" fill="none" stroke="#34251e" stroke-width="8"/>
<path d="M539 786L523 858Q540 871 558 858" fill="none" stroke="#75452f" stroke-width="5"/>
<ellipse id="mouth" cx="540" cy="915" rx="39" ry="4" fill="#4b2528" stroke="#a86258" stroke-width="7"/>
<circle cx="384" cy="855" r="10" fill="#d5ad63"/><circle cx="696" cy="855" r="10" fill="#d5ad63"/></g>
<g id="hand"><path d="M730 1540Q660 1450 630 1390L577 1367Q550 1330 577 1314L637 1338L606 1266Q599 1246 616 1242Q632 1240 642 1263L681 1323L679 1290Q678 1268 693 1268Q710 1269 712 1290L733 1402L794 1480Z" fill="url(#skin)"/></g></g></svg>'''
css = '''*{box-sizing:border-box}html,body{margin:0;background:#e8dfce}.frame{position:relative;width:1080px;height:1920px;overflow:hidden;background:#e8dfce}.bg{position:absolute;inset:0;background:radial-gradient(ellipse at 25% 30%,#fff5dc,transparent 60%),linear-gradient(110deg,#f2e9d7,#c8c5b4)}.arch{position:absolute;left:120px;top:260px;width:720px;height:1150px;border-radius:360px 360px 0 0;border:3px solid #fff8e744;background:#ffffff16}.plant{position:absolute;right:-90px;top:1120px;width:300px;height:630px;border-radius:50%;background:#556c5755;filter:blur(35px)}.subject{position:absolute;inset:0;transform-origin:50% 52%}.subject svg{width:1080px;height:1920px}.shade{position:absolute;inset:0;background:linear-gradient(0deg,#243d3ce6,transparent 31%);pointer-events:none}.heading{position:absolute;top:160px;left:88px;right:110px;color:#274a44;font:500 76px/1.12 Georgia;margin:0;max-height:290px;overflow-wrap:break-word}.accent{width:75px;height:5px;background:#b5965d;margin-top:28px}.caption{position:absolute;left:100px;right:130px;bottom:250px;text-align:center;color:#fff6e6;font:500 48px/1.28 Arial;text-shadow:0 2px 12px #0008}.warm{position:absolute;inset:0;background:#f7b768;mix-blend-mode:soft-light;opacity:0;pointer-events:none}'''
mounts, board = [], []
for i, (start, heading, mood) in enumerate(beats):
    end = beats[i+1][0] if i+1<len(beats) else DURATION
    if end <= start: continue
    duration = end-start
    cid = f'beat-{i+1:02}'
    content = f'<div class="bg" id="background"><div class="arch"></div><div class="plant"></div></div><div class="subject" id="presenter">{presenter}</div><div class="warm" id="light"></div><div class="shade"></div><h1 class="heading" id="title">{html.escape(heading)}<div class="accent"></div></h1>'
    tl = 'const tl=gsap.timeline({paused:true,defaults:{overwrite:"auto"}});'
    scale = 1.055 if mood in ('faith','final') else 1
    tl += f"tl.set('#presenter',{{scale:{scale}}},0);tl.from('#title',{{opacity:0,y:22,duration:.45,ease:'power2.out'}},.1);"
    if mood in ('hope','final'):
        tl += f"tl.to('#presenter',{{scale:{scale+.025},duration:{duration},ease:'sine.inOut'}},0);tl.to('#light',{{opacity:.2,duration:1}},0);"
    tl += f"tl.to('#body',{{y:-4,duration:2,yoyo:true,repeat:{int(duration/2)},ease:'sine.inOut'}},0);"
    tl += "tl.to('#hand',{rotation:-3,svgOrigin:'730 1540',duration:.7,yoyo:true,repeat:1,ease:'sine.inOut'},1);"
    for blink in range(2, int(duration), 4):
        tl += f"tl.to('#eyes',{{scaleY:.08,svgOrigin:'540 779',duration:.09,yoyo:true,repeat:1}},{blink});"
    local_words = [w for w in words if start <= w['start'] < end]
    for wi, w in enumerate(local_words):
        at = w['start']-start
        next_start = local_words[wi+1]['start'] if wi+1<len(local_words) else end
        dur = max(.01, min(w['end'],end,next_start)-w['start'])
        text = w['text'].lower()
        narrow = bool(re.search('[ou]',text))
        ry,rx = (13,23) if narrow else (17,36)
        if re.fullmatch('[mbp.,!? ]+',text): ry,rx=2,36
        transition = min(.04,dur/3)
        tl += f"tl.to('#mouth',{{attr:{{rx:{rx},ry:{ry}}},duration:{transition},ease:'sine.inOut'}},{at});tl.to('#mouth',{{attr:{{rx:39,ry:4}},duration:{transition}}},{at+dur-transition});"
    # Light captions, five words per cue; separate editable timeline clips.
    for j in range(0,len(local_words),5):
        chunk = local_words[j:j+5]
        a,b=chunk[0]['start']-start,min(chunk[-1]['end'],end)-start
        content += f'<div id="caption-{j}" class="caption clip" data-start="{a}" data-duration="{max(.05,b-a)}" data-track-index="4">{html.escape(" ".join(w["text"] for w in chunk))}</div>'
    tl += f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
    if MASTER and mood in ('map','youth','baptism','prayer','worship','bible','service','cinema','gospel','children','generation','intimate'):
        captions=content[content.index('<div id="caption-'): ] if '<div id="caption-' in content else ''
        content=f'<div class="subject" id="visual">{artwork.art(mood)}</div><div class="shade"></div><h1 class="heading" id="title">{html.escape(heading)}<div class="accent"></div></h1>'+captions
        tl='const tl=gsap.timeline({paused:true});'
        tl+=f"tl.from('#title',{{opacity:0,y:15,duration:{min(.25,duration/3)},ease:'power2.out'}},0);"
        if mood in ('youth','generation','intimate','cinema'):
            tl+=f"tl.fromTo('#visual',{{scale:1}},{{scale:1.025,duration:{duration},ease:'none'}},0);"
        if mood=='map':
            for point in range(4):tl+=f"tl.from('#point-{point}',{{opacity:0,scale:.7,transformOrigin:'center',duration:.3}},{point*.35});"
        if mood in ('bible','children','service'):
            target='book' if mood=='bible' else 'gift'
            tl+=f"tl.from('#{target}',{{y:16,opacity:.5,duration:{min(.5,duration/2)},ease:'sine.out'}},0);"
        tl+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
    (project/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css.replace(".frame{", "#root{")}</style></head><body><main id="root" data-composition-id="{cid}" data-start="0" data-duration="{duration}" data-width="1080" data-height="1920">{content}</main><script>{tl}</script></body></html>')
    mounts.append(f'<div id="clip-{i}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{start}" data-duration="{duration}" data-track-index="0" style="position:absolute;inset:0"></div>')
    board.append(dict(start=start,end=end,title=heading,mood=mood))
(project/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0;background:#e8dfce}}#main{{width:1080px;height:1920px;position:relative;overflow:hidden}}</style></head><body><main id="main" data-composition-id="main" data-no-timeline data-start="0" data-duration="{DURATION}" data-width="1080" data-height="1920">'+''.join(mounts)+f'<audio id="voice" class="clip" src="narration.wav" data-start="0" data-duration="{DURATION}" data-track-index="10" data-volume="1"></audio></main></body></html>')
(project/'storyboard.json').write_text(json.dumps(board,ensure_ascii=False,indent=2))
markers = ['HOOK_START','CONTRAST_POINT','GOOD_NEWS_START','CREATIVE_EVANGELISM','FAITH_ACTS','GENERATION_RISES','EMOTIONAL_POINT','FINAL_HOPE']
if MASTER: markers=['HOOK_START','PROMISE_START','FRANCOPHONIE','YOUTH_RETURN','BAPTISM_POINT','PRAYER_POINT','WORSHIP_POINT','BIBLE_POINT','SERVICE_POINT','KINSHASA_CINEMA','GOSPEL','GOSPEL_CHILDREN','GENERATION_RISES','THIRST_FOR_GOD','BIG_QUESTION','QUESTION_PAUSE','QUESTION_CLIMAX','FINAL_PAYOFF','INTIMATE_RETURN']
(project/'director-markers.json').write_text(json.dumps([dict(name=n,time=b['start']) for n,b in zip(markers,board)]+[dict(name='END',time=DURATION)],indent=2))
def timecode(t):
    ms=round(t*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
cues=[]
for i in range(0,len(words),5):
    chunk=words[i:i+5]
    cues.append(f'{len(cues)+1}\n{timecode(chunk[0]["start"])} --> {timecode(chunk[-1]["end"])}\n'+ ' '.join(w['text'] for w in chunk))
(project/'paroles.srt').write_text('\n\n'.join(cues)+'\n')
(project/'notes.md').write_text('Présentatrice originale illustrée SVG, sans photo ni avatar externe. Animation native GSAP pilotée par HyperFrames. Bouche approximative selon les mots et les voyelles, pas un alignement phonétique certifié. Audio utilisateur conservé intégralement. Aucun asset contextuel ou effet audio externe ajouté. Les affirmations du script sont celles de la narration fournie ; aucun événement documentaire inventé. Six séquences, cadrage et titres éditables.\n')
if MASTER:
    (project/'notes.md').write_text('Version master : 19 plans, dont 11 familles de B-roll SVG symboliques. Les scènes illustrent le récit, sans représenter des événements documentaires vérifiés. Audio original intégral, sans musique ou SFX externes. Présentatrice illustrée identique entre les plans ; lèvres approximatives calées sur les mots, sans alignement phonétique. Les noms de moteurs du brief sont des intentions, pas des modules activés : aucune simulation de physique ou de collision revendiquée. Courts inserts prière/louange/Bible synchronisés à la liste orale. Climax calme, conclusion intime. Toute animation et tout timing pilotés par HyperFrames/GSAP.\n')
    (project/'rehearsal.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Rehearsal · Montage</title><style>body{background:#121719;color:#eee;font:18px system-ui;padding:32px}td,th{padding:12px;text-align:left}tr:nth-child(even){background:#24302c}</style><h1>Rehearsal — hors export</h1><p>Repères, plans et intentions de caméra. Lip-sync approximatif sur les A-rolls uniquement.</p><table><tr><th>Temps</th><th>Événement</th><th>Plan</th><th>Texte</th></tr>'+''.join(f'<tr><td>{b["start"]:.2f}–{b["end"]:.2f}</td><td>{n}</td><td>{"A-roll" if b["mood"] in ("contrast","hope","faith","final") else "B-roll"}</td><td>{html.escape(b["title"])}</td></tr>' for n,b in zip(markers,board))+'</table></html>')
print(json.dumps(dict(project=str(project),id=meta['id'],beats=board),ensure_ascii=False))
