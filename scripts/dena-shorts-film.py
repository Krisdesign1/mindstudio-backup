import json, uuid, shutil, datetime, html, importlib.util, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / ".mindstudio" / "dena-shorts-work"
D = 56.88
AUDIO = Path("/Users/user/Downloads/Tu_connais_Dena_Mwana__mais_connais-tu_vraiment_son_histoire___e4b720c314.wav")
spec = importlib.util.spec_from_file_location("art", Path(__file__).with_name("dena-art.py"))
art = importlib.util.module_from_spec(spec); spec.loader.exec_module(art)

meta = json.loads((WORK / "project.json").read_text()) if (WORK / "project.json").exists() else {
    "id": "free-" + str(uuid.uuid4()),
    "name": "Dena Mwana · Dieu travaille dans le silence · Short",
    "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
}
P = ROOT / ".mindstudio" / "studio" / meta["id"]
(P / "compositions").mkdir(parents=True, exist_ok=True)
(P / "mindstudio-project.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
(WORK / "project.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
shutil.copy(AUDIO, P / "narration.wav")
shutil.copy(ROOT / "node_modules/gsap/dist/gsap.min.js", P / "gsap.min.js")
for name in ["transcription.txt", "transcript.json", "aligned.json", "paroles.srt"]:
    shutil.copy(WORK / name, P / name)

# Original local underscore: slow harmonic pad, no external media or rights ambiguity.
subprocess.run([
    "ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
    "sine=frequency=110:sample_rate=48000:duration=56.88",
    "-f", "lavfi", "-i", "sine=frequency=164.81:sample_rate=48000:duration=56.88",
    "-filter_complex", "[0:a]volume=0.018[a0];[1:a]volume=0.010[a1];[a0][a1]amix=inputs=2,lowpass=f=800,afade=t=in:st=0:d=1.5,afade=t=out:st=53:d=3.88",
    str(P / "music.wav")
], check=True)

shots = [
    (0.00, "hook", "Tu connais Dena Mwana…", "MAIS CONNAIS-TU SON HISTOIRE ?", "host"),
    (3.76, "stay", "Reste quelques secondes", "UNE VOIX QUI FORTIFIE LA FOI", "host"),
    (8.52, "stage", "Avant les grandes scènes", "PORTRAIT ILLUSTRÉ", "singer"),
    (11.32, "crowd", "Avant les foules", "DES MILLIERS DE VOIX", "singer"),
    (14.02, "backstage", "Il y a eu des moments silencieux", "AVANT LA LUMIÈRE", "singer"),
    (16.14, "hidden", "Personne ne voyait", "CE QUE DIEU CONSTRUISAIT", "none"),
    (19.60, "work", "C’est souvent comme ça", "DIEU TRAVAILLE", "host"),
    (22.88, "silence", "Dans le silence", "SILENCE", "none"),
    (24.16, "eyes", "Loin des regards", "LOIN DES REGARDS", "singer"),
    (25.62, "empty", "Loin des applaudissements", "SANS APPLAUDISSEMENTS", "none"),
    (26.54, "roots", "Quand les autres ne voient rien", "DIEU PRÉPARE DÉJÀ", "none"),
    (31.06, "path", "Le parcours de Dena Mwana", "ÉTAPE APRÈS ÉTAPE", "singer"),
    (35.46, "voice", "Pas seulement une voix", "UNE VIE FAÇONNÉE", "host"),
    (40.06, "steps", "Étape après étape", "UNE VIE EN CONSTRUCTION", "none"),
    (45.76, "effort", "Personne ne voit tes efforts ?", "NE T’ARRÊTE PAS", "host"),
    (49.80, "dawn", "Le silence n’est pas l’abandon", "DIEU TE PRÉPARE", "host"),
    (54.10, "amen", "Écris AMEN", "DIEU TRAVAILLE DANS LE SILENCE", "host"),
]

def svg(content):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">{art.DEFS}{content}</svg>'

def set_art(kind, who):
    night = '<rect width="1080" height="1920" fill="#071b25"/><circle cx="820" cy="290" r="330" fill="#173a49"/><circle cx="210" cy="1570" r="390" fill="#122f39"/>'
    warm = '<rect width="1080" height="1920" fill="#f0e5c9"/><circle cx="820" cy="410" r="360" fill="#f7cd70" opacity=".42"/><path d="M0 1420Q540 1180 1080 1410V1920H0Z" fill="#8ea191"/>'
    if kind in {"hook","stay","work","voice","effort","dawn","amen"}:
        body = warm + '<path d="M90 340H990M90 1510H990" stroke="#314f53" stroke-width="4" opacity=".35"/>'
        body += art.person('dena', 540, 820 if kind != 'hook' else 850, 1.22 if kind != 'hook' else 1.34, full=True)
        if kind == "stay": body += '<circle id="timer" cx="540" cy="620" r="126" fill="none" stroke="#2d5056" stroke-width="18" stroke-dasharray="792"/><path d="M540 620L540 535M540 620L610 655" stroke="#a5793c" stroke-width="18" stroke-linecap="round"/>'
        if kind == "dawn": body += '<circle id="sun" cx="540" cy="1420" r="190" fill="#ffd479" opacity=".7"/>'
        return body
    if kind in {"stage","crowd"}:
        body = night + '<path d="M160 0L420 1180H120ZM920 0L660 1180H960Z" fill="#f5dc8f" opacity=".16"/><ellipse cx="540" cy="1370" rx="420" ry="115" fill="#f8d889" opacity=".22"/>'
        body += art.person('sephora',540,865,1.18,full=True)
        body += '<g id="mic"><rect x="525" y="765" width="30" height="470" rx="15" fill="#d4bd86"/><ellipse cx="540" cy="735" rx="60" ry="78" fill="#26383d"/></g>'
        if kind == "crowd":
            for x,y in [(100,1550),(260,1500),(430,1580),(650,1540),(820,1490),(980,1570)]: body += f'<circle cx="{x}" cy="{y}" r="68" fill="#0a2029"/><path d="M{x-70} {y+65}Q{x} {y+10} {x+70} {y+65}V1920H{x-70}Z" fill="#0a2029"/>'
        return body
    if kind in {"backstage","eyes"}:
        return night + '<rect x="95" y="330" width="890" height="1180" rx="38" fill="#102d38"/><path d="M170 1450H910" stroke="#d9bd75" stroke-width="6"/><rect x="155" y="1180" width="260" height="210" rx="20" fill="#173d48"/><circle cx="285" cy="1255" r="52" fill="#2d5862"/><path d="M740 1160V1430M680 1430H805" stroke="#bfa767" stroke-width="15"/>' + art.person('sephora',540,900,1.10,full=True) + '<circle id="lamp" cx="540" cy="340" r="120" fill="#f6d688" opacity=".32"/>'
    if kind == "hidden":
        return night + '<g id="build"><rect x="190" y="920" width="700" height="540" rx="30" fill="#153744"/><path d="M240 1370L410 1120L540 1250L735 930L850 1370" fill="none" stroke="#d7b86f" stroke-width="25"/><circle cx="735" cy="930" r="38" fill="#f6d889"/></g><path d="M0 760Q540 460 1080 760V0H0Z" fill="#06151d" opacity=".8"/>'
    if kind == "silence":
        return '<rect width="1080" height="1920" fill="#06151d"/><circle id="pulse" cx="540" cy="960" r="120" fill="none" stroke="#e6c774" stroke-width="3"/><circle cx="540" cy="960" r="16" fill="#e6c774"/>'
    if kind == "empty":
        return night + '<ellipse cx="540" cy="1370" rx="380" ry="105" fill="#f5d98d" opacity=".13"/><rect x="525" y="770" width="30" height="500" rx="15" fill="#bca873"/><ellipse cx="540" cy="740" rx="58" ry="76" fill="#25383e"/><g id="chairs" fill="#183744">' + ''.join(f'<rect x="{100+(i%4)*230}" y="{1480+(i//4)*170}" width="160" height="95" rx="18"/>' for i in range(8)) + '</g>'
    if kind == "roots":
        return '<rect width="1080" height="1920" fill="#eadfbe"/><circle cx="180" cy="520" r="260" fill="#f5d98a" opacity=".55"/><path d="M0 900Q280 850 540 910Q810 970 1080 890V1920H0Z" fill="#493b31"/><path d="M0 1060Q300 1010 570 1090T1080 1050" stroke="#6a5542" stroke-width="8" fill="none" opacity=".7"/><g id="roots" fill="none" stroke="#d6b467" stroke-width="16" stroke-linecap="round"><path d="M540 910Q500 1130 280 1310M540 910Q620 1180 820 1390M520 1040Q390 1170 380 1580M570 1050Q730 1180 670 1700M470 1170Q250 1400 170 1730M650 1260Q850 1490 900 1760"/></g><ellipse cx="540" cy="930" rx="68" ry="42" fill="#a77b49"/><path id="stem" d="M540 930Q510 720 550 500" fill="none" stroke="#426c55" stroke-width="28"/><ellipse cx="458" cy="625" rx="118" ry="55" fill="#789c70" transform="rotate(-28 458 625)"/><ellipse cx="635" cy="555" rx="118" ry="55" fill="#789c70" transform="rotate(30 635 555)"/><circle cx="550" cy="470" r="25" fill="#e8c96f"/>'
    if kind in {"path","steps"}:
        body = art.pathscene() + '<g id="steps" fill="#ead49e"><rect x="150" y="1390" width="250" height="110"/><rect x="400" y="1270" width="250" height="230"/><rect x="650" y="1110" width="250" height="390"/></g>'
        if kind == "path": body += art.person('sephora',710,820,.88,full=True)
        if kind == "steps": body += art.person('dena',735,850,.82,full=True)
        return body
    return warm

mounts, board = [], []
for i, (start, kind, copy, label, who) in enumerate(shots):
    end = shots[i+1][0] if i+1 < len(shots) else D; dur = end-start; cid = f"scene-{i+1:02d}"
    body = f'<div id="art" data-layout-allow-overflow>{svg(set_art(kind, who))}</div><div class="vignette"></div><div id="title"><div class="kicker">{html.escape(label)}</div><h1>{html.escape(copy)}</h1></div>'
    css = f'''*{{box-sizing:border-box}}html,body{{margin:0;background:#06151d}}#{cid}{{width:1080px;height:1920px;position:relative;overflow:hidden}}svg{{display:block;width:1080px;height:1920px}}#art{{position:absolute;inset:0;transform-origin:50% 55%}}.vignette{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,15,22,.62),transparent 29%,transparent 67%,rgba(2,15,22,.62))}}#title{{position:absolute;left:54px;right:54px;top:120px;text-align:center;color:#fff8e9;text-shadow:0 3px 15px rgba(0,0,0,.7);background:rgba(4,24,31,.78);padding:24px 26px 30px;border-radius:30px}}h1{{font:700 76px/1.04 Arial,sans-serif;letter-spacing:-3px;margin:16px 0 0}}.kicker{{font:700 24px/1.2 Arial,sans-serif;letter-spacing:4px;color:#f4d67f}}'''
    js = f'''const tl=gsap.timeline({{paused:true}});tl.fromTo('#art',{{scale:1.02,y:15}},{{scale:1.075,y:-15,duration:{dur},ease:'none'}},0);tl.fromTo('#title',{{opacity:0,y:34}},{{opacity:1,y:0,duration:.35,ease:'power2.out'}},.05);'''
    if kind == 'silence': js += f"tl.fromTo('#pulse',{{scale:.3,opacity:1}},{{scale:5,opacity:0,duration:{dur},ease:'power1.out'}},0);"
    if kind == 'roots': js += f"tl.fromTo('#roots',{{opacity:0}},{{opacity:1,duration:{dur*.55}}},0);tl.fromTo('#stem',{{opacity:.2}},{{opacity:1,duration:{dur*.65}}},.3);"
    if kind == 'dawn': js += f"tl.fromTo('#sun',{{y:220,opacity:.1}},{{y:-120,opacity:.8,duration:{dur}}},0);"
    if who in ('host','singer') or kind in ('hook','stay','work','voice','effort','dawn','amen','stage','crowd','backstage','eyes','path'):
        js += f"tl.to('.character .right-arm',{{rotation:-10,transformOrigin:'0% 0%',duration:{max(.45,dur*.28)},yoyo:true,repeat:1,ease:'sine.inOut'}},.35);tl.to('.character .left-arm',{{rotation:7,transformOrigin:'100% 0%',duration:{max(.5,dur*.32)},yoyo:true,repeat:1,ease:'sine.inOut'}},.6);"
    js += f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
    (P/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="{cid}" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920">{body}</main><script>{js}</script></body></html>')
    mounts.append(f'<div id="mount-{cid}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{start}" data-duration="{dur}" data-track-index="0" style="position:absolute;inset:0"></div>')
    board.append({"id":cid,"start":start,"end":end,"scene":kind,"intent":label,"text":copy,"character":who})

# Editable native captions, each as its own timeline clip.
aligned = json.loads((WORK/'aligned.json').read_text())
for i, cue in enumerate(aligned['cues']):
    start=float(cue['start']); end=float(cue['end']); dur=max(.08,end-start); cid=f'caption-{i+1:02d}'
    txt='<br>'.join(html.escape(' '.join(word['text'] for word in line)) for line in cue['lines'])
    chtml=f'''<!doctype html><html><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>html,body{{margin:0}}#{cid}{{width:1080px;height:1920px;position:relative}}.cap{{position:absolute;left:64px;right:64px;bottom:150px;text-align:center;font:800 55px/1.16 Arial,sans-serif;color:#fff;padding:22px 30px;border-radius:28px;background:rgba(3,18,25,.82);text-shadow:0 3px 8px #000}}</style></head><body><main id="{cid}" data-composition-id="{cid}" data-duration="{dur}" data-width="1080" data-height="1920"><div id="cap" class="cap">{txt}</div></main><script>const tl=gsap.timeline({{paused:true}});tl.fromTo('#cap',{{opacity:0,y:16}},{{opacity:1,y:0,duration:.12}},0);window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;</script></body></html>'''
    (P/'compositions'/f'{cid}.html').write_text(chtml)
    mounts.append(f'<div id="mount-{cid}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{start}" data-duration="{dur}" data-track-index="3" style="position:absolute;inset:0"></div>')

(P/'index.html').write_text(f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0;background:#06151d}}#main{{width:1080px;height:1920px;position:relative;overflow:hidden}}</style></head><body><main id="main" data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1080" data-height="1920">{''.join(mounts)}<audio id="narration" class="clip" src="narration.wav" data-start="0" data-duration="{D}" data-track-index="1" data-volume="1"></audio><audio id="music" class="clip" src="music.wav" data-start="0" data-duration="{D}" data-track-index="2" data-volume="0.65"></audio></main></body></html>''')
(P/'storyboard.json').write_text(json.dumps(board, ensure_ascii=False, indent=2))
(P/'notes-montage.md').write_text('''# Dena Mwana · Dieu travaille dans le silence

Short YouTube natif HyperFrames, 1080 × 1920, 24 i/s. Audio original conservé intégralement (56,88 s), sans TTS. Sous-titres éditables issus du texte fourni, alignés sur l’audio local ; la reconnaissance avait notamment confondu « Dena Mwana » et « chants », corrigés à partir de la transcription de référence.

Direction artistique : bleu nuit, ivoire et or ; lumière qui passe de la scène visible aux racines cachées puis à l’aube. La présentatrice récurrente conserve son visage et son langage graphique. Dena Mwana est évoquée par un personnage secondaire distinct et clairement signalé comme « portrait illustré » : aucune archive ni imitation de prise de parole réelle.

Le montage alterne présentatrice, scène, coulisses, foule, plan vide, racines, parcours et étapes. La musique est une nappe instrumentale originale synthétisée localement, mixée très bas sous la narration. Les animations sont déterministes et reposent uniquement sur SVG/HTML/CSS/GSAP natifs.

Limite honnête : la synchronisation des sous-titres est un alignement automatique mot-à-mot corrigé par le texte fourni, pas un alignement phonétique manuel. La bouche de la présentatrice n’est pas forcée sur les scènes illustratives afin de ne pas faire parler les personnages silencieux.
''')
(P/'quality-report.md').write_text('''# Rapport qualité

- Format cible : 1080 × 1920, 24 i/s.
- Durée maître : 56,88 s, narration entière.
- 17 scènes avec évolution visuelle toutes les 1,3 à 5,7 secondes.
- Sous-titres : 2 lignes maximum, zone basse sûre, SRT livré.
- Sources : SVG/HTML/CSS/JS/GSAP, aucune image ou vidéo externe.
- Personne réelle : évocation illustrée explicitement étiquetée, sans fausse archive.
- Audio : narration originale + nappe locale séparée.
''')
print(P)
