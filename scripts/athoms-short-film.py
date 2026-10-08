"""Author the new native HyperFrames Short. Never rebuild after Studio edits.
Run only during initial authoring; existing published projects are untouched.
"""
import datetime
import html
import importlib.util
import json
import math
import re
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
ID='free-4977ba0f-5a3c-4cd9-897d-473fe135d3f9'
P=ROOT/'.mindstudio/studio'/ID
D=65.946542
def module(name,file):
    spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(file))
    result=importlib.util.module_from_spec(spec); spec.loader.exec_module(result); return result
rig=module('short_rig','athoms-short-rig.py')
sets=module('short_sets','athoms-short-sets.py')
phrases=json.loads((P/'phrase-timings.json').read_text())
words=json.loads((P/'aligned-words.json').read_text())
envelope=json.loads((P/'audio-envelope.json').read_text())
samples=envelope['samples']; step=envelope['step']

def boundary(i):
    if i==0:return 0
    return max(phrases[i-1]['end'],phrases[i]['start']-.5*max(0,phrases[i]['start']-phrases[i-1]['end']))

# One unique environment per scene. No environment or shot is mounted twice.
STORY=[
 ('portrait',0,'Athom’s Mbuma','Le visage public','athoms'),
 ('backstage',1,'Ce que tu ne vois pas','Interroger ce qui se trouve derrière la scène','host'),
 ('pulpit',2,'','Prédications, lectern et geste mesuré','athoms'),
 ('music',3,'','Chants, détail des instruments','none'),
 ('assembly',4,'','Assemblées, perspective immersive','crowd'),
 ('listener',5,'','Écouter, attention au téléphone','actor'),
 ('spotlights',6,'Pas seulement\nsous les projecteurs','Contraste entre visibilité et construction','host'),
 ('quiet',7,'','Silence, respiration et lecture','actor'),
 ('empty',8,'','Absence d’applaudissements, sièges vides','none'),
 ('loom',9,'','Préparation invisible, tissu qui se construit','none'),
 ('rain',10,'','Saison d’attente, arrêt sous la pluie','actor'),
 ('work',11,'','Prière et travail, carnet personnel','none'),
 ('persevere',11,'','Persévérance, ajustement d’un ouvrage','none'),
 ('season',12,'Ne méprise pas\ncette saison.','Encouragement direct, attitude ferme et douce','host'),
 ('dawn',13,'','Préparation pour demain, atelier qui s’ouvre','none'),
 ('single',14,'','Une présence suffit, petite pièce calme','actor'),
 ('heart',15,'Un cœur disponible','Disponibilité, paumes ouvertes','none'),
 ('resolve',16,'','Repartir, serrer un lacet','none'),
 ('prayer',17,'','Continuer à prier, mains jointes au chevet','none'),
 ('belief',18,'','Continuer à croire, protéger la flamme','none'),
 ('advance',19,'','Continuer à avancer, un pas posé sur le pont','none'),
 ('unseen',20,'','Personne ne regarde, espace urbain vide','actor'),
 ('foundation',21,'','Ce qui porte l’œuvre, structure sous la surface','none'),
 ('time',22,'','Un travail ancien, temps qui s’écoule','none'),
 ('amen',23,'Écris Amen','Invitation finale chaleureuse','host'),
]
assert len({s[0] for s in STORY})==len(STORY)

def resolution():
    return '''<rect width="1080" height="1920" fill="#192539"/><path d="M0 280L1080 620V1920H0Z" fill="#28374e"/><path d="M0 1490L1080 1270" stroke="#44536a" stroke-width="6"/><g opacity=".2" stroke="#d9c19c" fill="none">'''+''.join(f'<path d="M0 {y}L1080 {y-220}"/>' for y in range(900,1800,130))+'''</g><g transform="translate(145 530) rotate(-9)"><path d="M170 40L342 74L330 499L183 499Z" fill="#344966"/><path d="M441 75L614 41L610 529L455 543Z" fill="#46617d"/><g id="laced-shoe"><path d="M163 432Q229 388 324 433L350 662Q410 713 463 741Q473 789 377 808H94Q41 784 66 733L154 597Z" fill="#b57754"/><path d="M176 463L297 468L315 672L151 674Z" fill="#d5a37c"/><path d="M70 749Q230 762 431 742L452 778Q318 831 66 787Z" fill="#eee1c7"/><g id="laces" fill="none" stroke="#f4ead5" stroke-width="10" stroke-linecap="round"><path d="M179 483L301 526M293 482L175 526M169 547L312 588M304 546L169 589M161 612L321 651M312 612L157 651"/><path d="M212 470Q169 355 136 408Q117 471 215 469Q316 472 340 411Q356 345 216 470L180 525M219 471L278 535"/></g></g><path d="M455 487Q518 448 604 473L631 663L661 763Q550 800 450 767Z" fill="#965b41"/><path d="M462 522L604 539M462 564L613 579M456 604L620 624" stroke="#e6cfab" stroke-width="10"/><path d="M448 756Q553 779 655 746L664 788H447Z" fill="#eee1c7"/><g id="tie-hand"><path d="M92 151Q123 119 149 159L217 292L247 417Q256 453 236 467Q217 481 208 449L197 403L153 315Z" fill="#b78260"/><path d="M165 287Q133 276 136 307L166 386L179 433Q189 455 202 444L200 404Z" fill="#cf9974"/><path d="M237 437L217 470" stroke="#81543b" stroke-width="3"/></g></g>'''

def actor_art(kind):
    if kind=='portrait':return rig.athoms('athom',485,655,1.09)
    if kind=='pulpit':return rig.athoms('athom',585,720,.77)
    if kind=='backstage':return rig.person('host',400,700,1.04,pose='question')
    if kind=='spotlights':return rig.person('host',447,770,.9,pose='explain')
    if kind=='season':return rig.person('host',490,640,1.1,pose='calm')
    if kind=='amen':return rig.person('host',490,655,1.1,pose='welcome')
    if kind=='listener':return rig.person('listener',425,843,.67,pose='lap',gender='m',host=False,seated=True)
    if kind=='quiet':return rig.person('reader',662,950,.64,pose='lap',gender='m',host=False,seated=True)+'''<g id="held-book"><path d="M599 1162Q629 1144 661 1160Q697 1146 728 1159L722 1200Q693 1184 661 1203Q628 1186 603 1200Z" fill="#eee0bf" stroke="#997854" stroke-width="3"/><path d="M661 1160V1201M611 1169L648 1173M675 1173L716 1168" fill="none" stroke="#b69b71" stroke-width="2"/></g>'''
    if kind=='rain':return rig.person('waiting',601,789,.85,pose='chest',gender='m',host=False,emotion='sad')
    if kind=='single':return rig.person('visitor',518,869,.68,pose='prayer',gender='m',host=False,seated=True)
    if kind=='unseen':return rig.person('walker',518,827,.65,pose='rest',gender='m',host=False)
    return ''

def phone_prop():
    return '''<g transform="translate(425 1104) rotate(-13)"><rect x="-22" y="-53" width="60" height="106" rx="9" fill="#172131" stroke="#d5b48a" stroke-width="3"/><rect x="-15" y="-39" width="46" height="68" rx="3" fill="#dfc39c"/><path d="M-4-11L-4 8L13-1Z" fill="#5d7190"/><circle cx="7" cy="40" r="4" fill="#d9c099"/></g><path d="M355 850Q350 735 425 722Q501 735 495 850" fill="none" stroke="#273a55" stroke-width="13"/><rect x="345" y="842" width="23" height="57" rx="10" fill="#d6bb90"/><rect x="485" y="842" width="23" height="57" rx="10" fill="#d6bb90"/>'''

def action_js(kind,cid,dur,start):
    s=lambda suffix:'#'+cid+'-'+suffix
    result=''
    if kind in ('portrait','pulpit'):
        p='athom'
        result+=f"tl.to('{s(p+'-neck')}',{{attr:{{transform:'rotate(-2)'}},duration:{min(.65,dur*.35)},ease:'sine.inOut'}},.1);"
        # Native independently articulated shoulder, elbow, wrist.
        if kind=='pulpit':
            for part,ang in [('right-shoulder',-14),('right-elbow',-61),('right-wrist',30)]:
                result+=f"tl.to('{s(p+'-'+part)}',{{attr:{{transform:'rotate({ang})'}},duration:.48,ease:'power2.out'}},.08);"
        else:
            result+=f"tl.to('{s(p+'-left-elbow')}',{{attr:{{transform:'rotate(6)'}},duration:.8,ease:'power1.inOut'}},0);"
    if kind in ('backstage','spotlights','season','amen'):
        p='host';pose={'backstage':'question','spotlights':'explain','season':'calm','amen':'welcome'}[kind]
        initial=rig.POSES[pose]
        result+='const poses='+json.dumps(rig.POSES)+f";const base=poses[v.pose]||poses['{pose}'];"
        result+=f"['left','right'].forEach((side,i)=>['shoulder','elbow','wrist'].forEach((joint,j)=>tl.set('#{cid}-host-'+side+'-'+joint,{{attr:{{transform:'rotate('+base[i][j]+')'}}}},0)));"
        # Prepared gesture, hold at key phrase, gradual release. No endless loops.
        motion={'backstage':[(0,7),(1,-9),(2,10)],'spotlights':[(0,-8),(1,-13),(2,9)],'season':[(0,7),(1,-12),(2,11)],'amen':[(0,-6),(1,-7),(2,6)]}[kind]
        for j,delta in motion:
            part=['shoulder','elbow','wrist'][j]; t=.15+j*.07
            result+=f"tl.to('{s(p+'-right-'+part)}',{{attr:{{transform:'rotate('+(base[1][{j}]+{delta}*v.gestureAmplitude)+')'}},duration:{min(.75,dur*.26)},ease:'power2.inOut'}},{t});"
            result+=f"tl.to('{s(p+'-right-'+part)}',{{attr:{{transform:'rotate('+base[1][{j}]+')'}},duration:{min(.8,dur*.22)},ease:'sine.inOut'}},{max(.8,dur*.7)});"
        result+=f"tl.to('{s(p+'-neck')}',{{attr:{{transform:'rotate({-2 if kind!='amen' else 2})'}},duration:.6,ease:'sine.inOut'}},.28);"
        result+=f"tl.to('{s(p+'-neck')}',{{attr:{{transform:'rotate(0)'}},duration:.7,ease:'sine.inOut'}},{dur*.66});"
        for i in range(4):
            result+=f"tl.to('{s(p+'-right-finger-'+str(i))}',{{attr:{{transform:'rotate({[-4,3,7,12][i]})'}},duration:.5,ease:'sine.inOut'}},.25);"
        if kind=='backstage':
            result+=f"tl.to('.{cid}-host-pupils',{{x:3,duration:.25}},.12);tl.to('.{cid}-host-pupils',{{x:0,duration:.25}},{dur*.6});"
        # Chest breath is anchored at pelvis. Arms/neck inherit torso, stable feet.
        result+=f"tl.to('{s(p+'-bust')}',{{attr:{{transform:'rotate(.3)'}},duration:{dur*.44},yoyo:true,repeat:1,ease:'sine.inOut'}},.15);"
        # Irregular deterministic blink times, actual visible eye groups.
        blink={'backstage':[1.13,3.22],'spotlights':[.8,2.9],'season':[.57],'amen':[1.7,3.85]}[kind]
        for t in blink:
            if t+.16<dur:
                for ex in (-46,46):
                    result+=f"tl.to('{s(p+'-eye-'+str(ex))}',{{scaleY:.07,svgOrigin:'{ex} -25',duration:.065}}, {t});tl.to('{s(p+'-eye-'+str(ex))}',{{scaleY:1,svgOrigin:'{ex} -25',duration:.09}},{t+.065});"
        result+=lip_js(cid,start,dur)
    if kind in ('listener','quiet','rain','single','unseen'):
        p={'listener':'listener','quiet':'reader','rain':'waiting','single':'visitor','unseen':'walker'}[kind]
        result+=f"tl.to('{s(p+'-neck')}',{{attr:{{transform:'rotate({3 if kind in ('quiet','single') else -2})'}},duration:{min(.7,dur*.3)},ease:'sine.inOut'}},.3);"
        if kind=='rain':
            result+=f"tl.to('{s(p+'-right-elbow')}',{{attr:{{transform:'rotate(121)'}},duration:.7,ease:'power2.inOut'}},.2);"
        for ex in (-46,46):
            result+=f"tl.to('{s(p+'-eye-'+str(ex))}',{{scaleY:.08,svgOrigin:'{ex} -25',duration:.07}},.65);tl.to('{s(p+'-eye-'+str(ex))}',{{scaleY:1,svgOrigin:'{ex} -25',duration:.09}},.72);"
    # Scene-specific target animations; targets authored by vector set module.
    if hasattr(sets,'ANIMATIONS'):
        for item in sets.ANIMATIONS.get(kind,[]):
            target=item['target']; props=item['props']; at=item.get('at',0)
            props={**props,'duration':min(item.get('duration',dur*.7),dur-at-.01)}
            if 'from' in item:
                result+=f"tl.fromTo('{s(target)}',{json.dumps(item['from'])},{json.dumps(props)},{at});"
            else:
                result+=f"tl.to('{s(target)}',{json.dumps(props)},{at});"
    if kind=='resolve':
        result+=f"tl.to('{s('tie-hand')}',{{x:-10,y:-30,duration:.38,ease:'power2.inOut'}},.2);tl.to('{s('laces')}',{{scaleY:.96,svgOrigin:'215 470',duration:.38,ease:'power2.inOut'}},.2);"
    return result

def mouth_path(rx,ry):return rig.reference.mouth(rx,ry,60)
phonemes=[]
for word in words:
    if not re.search(r'\w',word['text']) or word['end']<=word['start']:continue
    ipa=subprocess.check_output(['espeak','-q','--ipa','-v','fr',word['text']],text=True).strip()
    phones=[c for c in ipa if c.isalpha()]
    if not phones:continue
    weights=[1.35 if c in 'aeiouɑɛɔøyœɪ' else .75 for c in phones];total=sum(weights);t=word['start']
    for c,w in zip(phones,weights):
        end=t+(word['end']-word['start'])*w/total
        shape='closed' if c in 'mbp' else 'teeth' if c in 'fv' else 'round' if c in 'ouɔøywœɥ' else 'open' if c in 'aɑɛæ' else 'wide' if c in 'ieɪj' else 'small'
        phonemes.append({'start':t,'end':end,'phone':c,'shape':shape});t=end
lipframes=[]
def lip_js(cid,start,dur):
    result='';shapes={'closed':(27,1),'teeth':(28,4),'round':(15,14),'open':(28,18),'wide':(33,8),'small':(24,6)}
    for f in range(math.ceil(dur*24)):
        at=f/24;t=start+at;energy=samples[min(len(samples)-1,int(t/step))]['rms']
        ph=next((p for p in phonemes if p['start']<=t<p['end']),None)
        shape=ph['shape'] if ph and energy>.004 else 'closed';rx,ry=shapes[shape]
        dt=max(.001,min(1/24-.0001,dur-at))
        result+=f"tl.to('#{cid}-host-lip',{{attr:{{d:{json.dumps(mouth_path(rx+3,ry+3))}}},duration:{dt},ease:'none'}},{at});"
        result+=f"tl.to('#{cid}-host-cavity',{{attr:{{d:{json.dumps(mouth_path(rx,ry))}}},duration:{dt},ease:'none'}},{at});"
        result+=f"tl.to('#{cid}-host-teeth',{{opacity:{.85 if shape in ('teeth','wide') else 0},duration:{dt},ease:'none'}},{at});"
        lipframes.append({'time':round(t,4),'scene':cid,'shape':shape,'audioRms':energy})
    return result

P.mkdir(parents=True,exist_ok=True);(P/'compositions').mkdir(exist_ok=True)
shutil.copy(ROOT/'node_modules/gsap/dist/gsap.min.js',P/'gsap.min.js')
metadata={'id':ID,'name':'Athom’s Mbuma · Ce que tu ne vois pas · Short original','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
if not (P/'mindstudio-project.json').exists():(P/'mindstudio-project.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
board=[];mounts=[]
for n,(kind,phrase,title,intent,who) in enumerate(STORY):
    start=boundary(phrase)
    if kind=='persevere':
        start=next((w['start'] for w in phrases[11]['words'] if 'pers' in w['text']),31.44)
    nextshot=STORY[n+1] if n+1<len(STORY) else None
    end=boundary(nextshot[1]) if nextshot else D
    if kind=='work':end=next((w['start'] for w in phrases[11]['words'] if 'pers' in w['text']),31.44)
    dur=end-start;cid=f'scene-{n+1:02d}'
    scene=resolution() if kind=='resolve' else sets.scene(kind)
    # Overlay characters behind appropriate foreground furniture.
    foreground=sets.foreground(kind) if hasattr(sets,'foreground') else ''
    scene+=actor_art(kind)
    if kind=='listener':scene+=phone_prop()
    scene+=foreground
    defs=rig.DEFS+sets.DEFS
    art=rig.prefix(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">{defs}<g id="world">{scene}</g></svg>',cid)
    schema=[{'id':'title','type':'string','label':'Texte affiché','default':title},{'id':'accent','type':'color','label':'Accent ambre','default':'#e9bc78'},{'id':'costume','type':'color','label':'Tenue de la présentatrice','default':'#d79575'},{'id':'gestureAmplitude','type':'number','label':'Amplitude des gestes','default':1},{'id':'pose','type':'string','label':'Pose (question/explain/calm/welcome/rest)','default':{'backstage':'question','spotlights':'explain','season':'calm','amen':'welcome'}.get(kind,'rest')}]
    if who!='host':
        schema=[variable for variable in schema if variable['id'] in ('title','accent')]
    schemaattr=html.escape(json.dumps(schema,ensure_ascii=False),quote=True)
    label='<div class="representation">Représentation illustrée</div>' if who=='athoms' else ''
    color='#f4ead5'
    css=f'''*{{box-sizing:border-box}}html,body{{margin:0;background:#162034}}#{cid}{{position:relative;width:1080px;height:1920px;overflow:hidden;color:{color};font-family:Arial,sans-serif}}.art,.art svg{{position:absolute;inset:0;width:1080px;height:1920px}}.veil{{position:absolute;inset:0;background:linear-gradient(180deg,#111a2bcc,transparent 27%,transparent 72%,#101827c9)}}.headline{{position:absolute;left:76px;top:150px;width:800px;margin:0;font:600 78px/1.09 Georgia,serif;white-space:pre-line;letter-spacing:-1.5px;text-shadow:0 3px 12px #142036aa}}.headline:empty{{display:none}}.representation{{position:absolute;left:78px;top:352px;font:24px/1.3 Arial;letter-spacing:1px;color:#e9cd9e}}'''
    js=f"const v=window.__hyperframes.getVariables();const root=document.getElementById('{cid}');root.querySelector('.headline').textContent=v.title;root.querySelector('.headline').style.color=v.accent;const coat=document.querySelector('#{cid}-hostcoat stop');if(coat)coat.setAttribute('stop-color',v.costume);root.querySelectorAll('[data-sleeve=host]').forEach(e=>e.setAttribute('stroke',v.costume));const tl=gsap.timeline({{paused:true}});"
    if title:js+=f"tl.fromTo('#{cid}-headline',{{opacity:0,y:12}},{{opacity:1,y:0,duration:.24,ease:'power2.out'}},0);"
    js+=action_js(kind,cid,dur,start)
    js+=f"tl.set(root,{{opacity:1}},{max(0,dur-.001)});window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
    source=f'<!doctype html><html lang="fr" data-composition-variables="{schemaattr}"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css}</style></head><body><main id="{cid}" data-composition-id="{cid}" data-start="0" data-duration="{dur:.6f}" data-width="1080" data-height="1920"><div class="art">{art}</div><div class="veil"></div><h1 id="{cid}-headline" class="headline"></h1>{label}</main><script>{js}</script></body></html>'
    (P/'compositions'/f'{cid}.html').write_text(source)
    mounts.append(f'<div id="mount-{cid}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{start:.6f}" data-duration="{dur:.6f}" data-track-index="0" style="position:absolute;inset:0"></div>')
    board.append({'id':cid,'start':start,'end':end,'duration':dur,'scene':kind,'passageExact':phrases[phrase]['text'],'intention':intent,'cast':who,'spokenCharacter':'host' if who=='host' else None,'displayText':title,'source':f'compositions/{cid}.html','camera':'vertical original, fixed captions, varied illustration framing','animation':'purposeful native articulated gestures and unique object actions','sound':'separate narration/music/sparse authored effects'})

accent_words={'silence','prépare','continue','prier','croire','avancer','disponible','amen','persévères'}
cues=json.loads((P/'captions.json').read_text())['cues']
for n,cue in enumerate(cues):
    cid=f'caption-{n+1:03d}';start=cue['start'];dur=cue['end']-start
    lines=cue['lines'];schema=[{'id':f'line{i+1}','type':'string','label':f'Ligne {i+1}','default':lines[i] if len(lines)>i else ''} for i in range(2)]+[{'id':'accent','type':'color','label':'Mots importants','default':'#e9bc78'}]
    attr=html.escape(json.dumps(schema,ensure_ascii=False),quote=True)
    js=f"const v=window.__hyperframes.getVariables();const cap=document.getElementById('{cid}-text');const important={json.dumps(list(accent_words))};[v.line1,v.line2].filter(Boolean).forEach((line,i)=>{{const row=document.createElement('div');line.split(' ').forEach((word,j)=>{{const span=document.createElement('span');span.textContent=(j?' ':'')+word;if(important.includes(word.toLowerCase().replace(/[.,!?…:]/g,'')))span.style.color=v.accent;row.append(span)}});cap.append(row)}});"
    css=f'html,body{{margin:0}}#{cid}{{width:1080px;height:1920px;position:relative;pointer-events:none}}.cap{{position:absolute;left:65px;top:1550px;width:840px;text-align:center;font:700 49px/1.19 Arial,sans-serif;letter-spacing:-.6px;color:#fff8ed;background:#131c2dea;padding:20px 24px;border-radius:18px;box-shadow:0 4px 16px #050b143d}}'
    (P/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr" data-composition-variables="{attr}"><head><meta charset="utf-8"><style>{css}</style></head><body><main id="{cid}" data-composition-id="{cid}" data-no-timeline data-duration="{dur:.6f}" data-width="1080" data-height="1920"><div id="{cid}-text" class="cap"></div></main><script>{js}</script></body></html>')
    mounts.append(f'<div id="mount-{cid}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-no-timeline data-start="{start:.6f}" data-duration="{dur:.6f}" data-track-index="3" style="position:absolute;inset:0;z-index:5"></div>')

(P/'index.html').write_text(f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html,body{{margin:0;background:#162034}}#main{{width:1080px;height:1920px;position:relative;overflow:hidden}}</style></head><body><main id="main" data-composition-id="main" data-no-timeline data-start="0" data-duration="{D}" data-width="1080" data-height="1920">{''.join(mounts)}<audio id="narration-original" class="clip" src="narration-original.wav" data-start="0" data-duration="{D}" data-track-index="1" data-volume="1" data-timeline-locked></audio><audio id="music-original" class="clip" src="music.wav" data-start="0" data-duration="{D}" data-track-index="2" data-volume="1"></audio><audio id="effects-original" class="clip" src="effects.wav" data-start="0" data-duration="{D}" data-track-index="4" data-volume="1"></audio></main></body></html>''')
(P/'storyboard.json').write_text(json.dumps(board,ensure_ascii=False,indent=2))
(P/'director-markers.json').write_text(json.dumps([{'time':b['start'],'label':b['intention']} for b in board],ensure_ascii=False,indent=2))
(P/'lip-sync.json').write_text(json.dumps({'method':'Estimated French eSpeak pronunciation distributed within measured aligned words; measured audio RMS closes mouth on silence; not exact phoneme alignment','phonemes':phonemes,'frames':lipframes,'speakers':'Only fictional host in4 presentation scenes. Athom’s and all other characters silent.'},ensure_ascii=False))
(P/'rig-library.json').write_text(json.dumps({'sourceFace':'scripts/humilite-v2-art.py person female head, exact geometry and skin gradient','newCostume':'terracotta blazer, ivory shirt, indigo trousers, ochre sole','hierarchy':['placement/root/pelvis','pelvis/hip/knee/ankle','pelvis/bust/shoulder/elbow/wrist/palm/fingers','bust/neck/head/eyes/brows/mouth'],'origins':'Explicit translation wrappers; local SVG rotate attributes about0,0. Eye blink SVG origins at each eye center. No rotation-origin mixing on same joint.','gestures':rig.POSES,'hands':'Palm, four fingers and thumb independent; relaxed/open/point/grip variants','contacts':'Static seated and standing root, contacts stable; bridge footstep uses a single planted landing not an endless walk. Secondary figures listen/react, never mouth the voice-over.','editable':'Native timeline starts/durations/audio volumes; source SVG joints and GSAP paths. Scene variables title,accent,costume,pose,gestureAmplitude use getVariables. Internal SVG joints require sourceediting, not claimed automaticallyinspector controls.'},ensure_ascii=False,indent=2))
(P/'notes-montage.md').write_text('''# Athom’s Mbuma · Ce que tu ne vois pas

Short 9:16, 1080 ×1920, 24 i/s, audio fourni intégral de65,946542s. Nouveau projet distinct. Aucun TTS, raster généré, archive fabriquée ou moteur de montage externe.

## Direction artistique

Bleu nuit et indigo, terre cuite, ambre et ivoire. Illustration vectorielle travaillée avec architecture, objets utiles, lumière et perspective. 25 scènes distinctes : aucune scène ni décor réutilisé une deuxième fois. L’image publique alterne avec des situations fictives et des métaphores compréhensibles. Le portrait illustré d’Athom’s est le SVG de référence déjà présent; ses scènes publiques ne prétendent pas être des archives. Les illustrations d’attente, travail et prière sont symboliques, pas des faits biographiques ajoutés.

## Personnages

Visage exact de la fille d’HumilitéV2 (géométrie, teint, coiffure, yeux, nez, bouche), nouvelle tenue terracotta. Nouvelle hiérarchie pour épaules/coudes/poignets/paumes/doigts. Gestes préparés, maintenus puis relâchés, regards et clignements irréguliers déterministes. Poses assises et debout stables. Personnages silencieux avec réactions discrètes. Seule la présentatrice fictive articule la narration dans ses4 interventions; le portrait d’Athom’s ne parle pas.

La synchronisation labiale est stylisée: prononciation française eSpeak estimée à l’intérieur des mots alignés, fermeture par l’énergie mesurée de l’audio. Ce n’est pas un alignement phonétique exact.

## Édition native

Studio et rendu lisent le même index.html et les mêmes sous-compositions. Textes/couleurs/tenue/pose/amplitude pilotés par variables réellement utilisées. Débuts, durées, sous-titres et volumes éditables nativement. Les articulations SVG et leurs animations sont éditables dans les sources, pas promises comme boutons d’inspecteur individuels. Narration verrouillée par data-timeline-locked. Ne pas relancer le script de génération après des modifications Studio; exporter depuis ce projet source.

Catalog0.8.81 consulté pour transitions; coupes franches et actions narratives choisies sans ajouter de presets inutiles. Sources sonores originales locales séparées, aucun service payant ni média aux droits inconnus.
''')
for file in ['athoms-short-film.py','athoms-short-rig.py','athoms-short-sets.py']:
    (P/'sources').mkdir(exist_ok=True);shutil.copy(Path(__file__).with_name(file),P/'sources'/file)
print(json.dumps({'project':str(P),'scenes':len(board),'uniqueScenes':len(set(b['scene'] for b in board)),'captions':len(cues),'duration':D,'frames':math.ceil(D*24)}))
