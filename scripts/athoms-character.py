"""Photo-referenced illustrated Athom's rig. Native SVG/GSAP, silent motion study."""
from pathlib import Path
import json,shutil,datetime
root=Path(__file__).resolve().parent.parent
p=root/'.mindstudio/studio/free-athoms-character-v1';p.mkdir(parents=True,exist_ok=True)
DEFS='''<defs><clipPath id="detail-frame"><rect x="1120" y="305" width="665" height="590"/></clipPath><linearGradient id="athoms-skin" x2="1" y2=".7"><stop stop-color="#965e43"/><stop offset=".5" stop-color="#74432f"/><stop offset="1" stop-color="#4f3028"/></linearGradient><linearGradient id="athoms-coat" x2="1" y2="1"><stop stop-color="#31687a"/><stop offset=".5" stop-color="#184659"/><stop offset="1" stop-color="#0d2e3d"/></linearGradient><linearGradient id="athoms-wall" x2="1" y2="1"><stop stop-color="#eee4cf"/><stop offset="1" stop-color="#c9b890"/></linearGradient></defs>'''
def fingers(pid,side):
 s=''
 for j,(x,y,l) in enumerate([(-13,10,30),(-2,4,40),(9,7,37),(19,14,28)]):
  s+=f'<g id="{pid}-{side}-finger-{j}" transform="translate({x} {y})"><g id="{pid}-{side}-fingerbend-{j}"><path d="M0 0Q-2 15 0 {l}" stroke="#895239" stroke-width="9" fill="none" stroke-linecap="round"/></g></g>'
 return s

def character(pid='athoms',x=0,y=0,s=1):
 arms=''
 for side,sign in [('left',-1),('right',1)]:
  arms+=f'''<g transform="translate({sign*135} 184)"><g id="{pid}-{side}-shoulder"><path d="M0 0Q{sign*16} 42 {sign*8} 115" stroke="url(#athoms-coat)" stroke-width="63" fill="none" stroke-linecap="round"/><g transform="translate({sign*8} 115)"><g id="{pid}-{side}-elbow"><path d="M0 0L0 102" stroke="#153f50" stroke-width="50" stroke-linecap="round"/><path d="M-18 92H18" stroke="#31687a" stroke-width="4"/><g transform="translate(0 112)"><g id="{pid}-{side}-wrist"><path d="M0-12V13" stroke="#895239" stroke-width="28" stroke-linecap="round"/><g id="{pid}-{side}-palm"><path d="M-22 12Q-25-5-12-9H13Q27-1 24 24L16 41H-13Z" fill="url(#athoms-skin)"/>{fingers(pid,side)}<g id="{pid}-{side}-thumb"><path d="M-16 9Q-31 6-33 22L-29 35" stroke="#895239" stroke-width="12" fill="none" stroke-linecap="round"/></g><path d="M-10 20Q0 28 13 24" stroke="#512f26" stroke-width="2" opacity=".5" fill="none"/></g></g></g></g></g></g></g>'''
 head=f'''<g transform="translate(0 123)"><g id="{pid}-neck"><g transform="translate(0 -123)">
<path d="M-42 89L-44 151Q0 173 44 151L42 87" fill="#643b2d"/>
<path d="M-88-39Q-114-49-108-14L-88 10M88-39Q114-49 108-14L88 10" fill="#784630"/>
<path d="M-90-72Q-88-130-5-134Q80-130 91-70L84 21Q77 94 0 113Q-75 94-86 20Z" fill="url(#athoms-skin)"/>
<path d="M-90-67L-95-99Q-94-146-51-159Q-11-177 33-166Q78-161 92-127L91-68L76-93Q29-126-64-105L-76-66Z" fill="#172322"/>
<path d="M-71-132Q-24-161 33-145M-52-149L-47-130M-27-156L-22-136M2-157L7-137M28-154L33-134M53-144L58-124" stroke="#29302b" stroke-width="6" stroke-linecap="round" fill="none"/>
<path d="M-82 9Q-65 35-66 54Q-41 91 0 97Q46 90 68 51L82 8L80 63Q55 120 0 127Q-56 118-80 62Z" fill="#202826"/>
<path d="M-63 42Q-35 30-10 46Q0 36 10 46Q37 29 63 42L57 62Q28 58 0 67Q-29 57-57 62Z" fill="#202826"/>
<path id="{pid}-brows" d="M-72-48Q-46-63-20-53M20-53Q47-65 73-49" stroke="#292821" stroke-width="8" stroke-linecap="round" fill="none"/>
'''
 for ex in [-45,45]:
  head+=f'''<g transform="translate({ex} -25)"><g id="{pid}-eye-{ex}"><path d="M-23 0Q0-14 23 0Q0 12-23 0Z" fill="#d1b99b"/><g class="{pid}-pupils"><ellipse cx="2" cy="0" rx="8" ry="9" fill="#252a26"/><circle cx="4" cy="-3" r="2" fill="#f0e6d1"/></g><path d="M-23 0Q0-14 23 0" stroke="#442e25" stroke-width="4" fill="none"/></g></g>'''
 head+=f'''<path d="M7-19L-2 17Q5 31 24 19" fill="none" stroke="#4d2e25" stroke-width="5" stroke-linecap="round"/><path d="M-21 27Q0 19 24 27" fill="none" stroke="#4d2e25" stroke-width="5"/>
<g id="{pid}-mouth"><path d="M-33 53Q0 45 33 53Q29 77 0 78Q-26 77-33 53Z" fill="#432d28"/><path d="M-29 54Q0 49 29 54L25 62Q0 67-25 62Z" fill="#eadac0"/><path d="M-32 53Q0 43 33 53" stroke="#945d49" stroke-width="4" fill="none"/></g>
<path d="M-37 83Q0 108 37 84" stroke="#374036" stroke-width="3" opacity=".5" fill="none"/>
</g></g></g>'''
 return f'''<g id="{pid}" transform="translate({x} {y}) scale({s})">
<path d="M-155 422Q-163 499-137 566L-122 714H-30L-34 537L2 495L40 527L38 714H134L145 529Q144 468 132 422Z" fill="#202e30"/>
<path d="M-122 694L-153 747Q-112 763-27 750L-30 696M38 696L32 750H154Q165 739 134 696Z" fill="#172326"/>
<g id="{pid}-bust"><path d="M-147 184Q-109 134-52 139L0 157L52 139Q116 142 147 184L139 451H-141Z" fill="url(#athoms-coat)"/>
<path d="M-52 140Q0 166 52 140L60 447H-61Z" fill="#f0efde"/>
<path d="M-54 137L-96 165L-71 236L-42 213L-64 291L-65 449H-141M54 137L97 165L72 236L43 213L65 291L65 449H139" fill="url(#athoms-coat)"/>
<path d="M-52 141L-75 211L-48 229M52 141L75 211L48 229" fill="none" stroke="#497888" stroke-width="4"/>
<circle cx="94" cy="211" r="6" fill="#718477"/><circle cx="-86" cy="420" r="7" fill="#b6ac79"/>
</g>{arms}{head}</g>'''
svg=DEFS+'''<rect width="1920" height="1080" fill="url(#athoms-wall)"/><path d="M0 945H1920V1080H0Z" fill="#aaa58e"/><ellipse cx="550" cy="945" rx="155" ry="18" fill="#817f6f" opacity=".4"/>
<g font-family="Arial,sans-serif" fill="#244b4e"><text x="110" y="105" font-size="52" font-weight="bold">Athom’s · personnage illustré</text><text x="110" y="155" font-size="27">Étude de gestes muette · modèle natif HyperFrames</text></g>'''+character('athoms',550,355,.78)
svg+='''<path d="M1120 225H1785V905H1120Z" fill="#eee7d5"/><text x="1160" y="285" font-family="Arial" font-size="31" fill="#244b4e">VISAGE ET GESTUELLE</text>'''+'<g clip-path="url(#detail-frame)">'+character('detail',1460,650,1.35)+'</g>'+'''<rect x="1120" y="895" width="665" height="170" fill="#aaa58e"/><text x="1160" y="980" font-family="Arial" font-size="28" fill="#244b4e">Pas de voix ni de paroles attribuées</text>'''
tl="const tl=gsap.timeline({paused:true});\n"
for pid in ['athoms','detail']:
 # SVG attribute rotations preserve explicit shoulder/elbow/wrist hierarchy.
 for joint,pivot in [('neck',''),('left-shoulder',''),('right-shoulder',''),('left-elbow',''),('right-elbow',''),('left-wrist',''),('right-wrist','')]:
  tl+=f"tl.set('#{pid}-{joint}',{{attr:{{transform:'rotate(0)'}}}},0);\n"
 for target,rot,start,duration in [('left-shoulder',43,1,.7),('left-elbow',110,1.15,.75),('left-wrist',-28,1.4,.5),('neck',-3,1.3,.6),('neck',2,4,.7),('neck',0,5,.65),('left-wrist',-10,5.2,.5),('left-elbow',75,5.5,.65),('left-shoulder',28,5.4,.7),('right-shoulder',-22,6,.7),('right-elbow',-35,6.15,.7),('right-wrist',15,6.3,.5),('left-shoulder',0,9,.8),('left-elbow',0,9.1,.8),('left-wrist',0,9.2,.6),('right-shoulder',0,9.3,.8),('right-elbow',0,9.4,.8),('right-wrist',0,9.5,.6)]:
  tl+=f"tl.to('#{pid}-{target}',{{attr:{{transform:'rotate({rot})'}},duration:{duration},ease:'sine.inOut'}},{start});\n"
 for j,angle in enumerate([-48,-30,-15,0]):
  tl+=f"tl.to('#{pid}-left-fingerbend-{j}',{{attr:{{transform:'rotate({angle})'}},duration:.45,ease:'sine.inOut'}},1.5);tl.to('#{pid}-left-fingerbend-{j}',{{attr:{{transform:'rotate(0)'}},duration:.55}},5.1);\n"
 for time in [2.75,6.95,10.2]:
  for ex in [-45,45]:
   tl+=f"tl.to('#{pid}-eye-{ex}',{{attr:{{transform:'scale(1 .08)'}},duration:.075}},{time});tl.to('#{pid}-eye-{ex}',{{attr:{{transform:'scale(1 1)'}},duration:.12}},{time+.075});\n"
 tl+=f"tl.to('.{pid}-pupils',{{attr:{{transform:'translate(4 0)'}},duration:.35}},4);tl.to('.{pid}-pupils',{{attr:{{transform:'translate(0 0)'}},duration:.35}},5.5);\n"
tl+="tl.set({}, {},12);window.__timelines={main:tl};"
shutil.copy(root/'node_modules/gsap/dist/gsap.min.js',p/'gsap.min.js')
(p/'index.html').write_text(f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Athom’s — étude de personnage</title><script src="gsap.min.js"></script><style>html,body{{margin:0}}#main{{width:1920px;height:1080px;overflow:hidden}}svg{{width:1920px;height:1080px;display:block}}</style></head><body><main id="main" data-composition-id="main" data-width="1920" data-height="1080" data-start="0" data-duration="12" data-fps="24"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{svg}</svg></main><script>{tl}</script></body></html>''')
(p/'athoms-rig.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-220 -200 440 970">'+DEFS+character()+'</svg>')
(p/'mindstudio-project.json').write_text(json.dumps({'id':p.name,'name':'Athom’s · personnage illustré V1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat()},ensure_ascii=False))
(p/'README.md').write_text('''# Athom’s — étude illustrée V1
Référence fournie : /Users/user/Downloads/images-16.jpeg. Représentation stylisée, sans prétention de portrait photographique exact.
Cheveux courts, barbe, blazer bleu pétrole, tee-shirt ivoire, pantalon sombre. Visage dessiné spécialement pour ce personnage ; présentatrice existante inchangée.
Rig natif SVG : épaules, coudes, poignets, paumes, quatre doigts et pouce, cou, yeux et pupilles. GSAP déterministe avec préparations, maintiens et retours au repos.
Test muet de 12 secondes : geste d’explication, regard, clignements et ouverture du second bras. La bouche sourit et ne simule aucune parole. Aucune synchronisation labiale n’est revendiquée sans audio.
Limites V1 : pose debout stylisée, pas de marche, pas de rotation de tête en 3D ; poses de doigts partielles, aucun alignement phonétique. Le geste de précision de la photo reste une intention, pas un contact pouce-index validé.
Sources réutilisables : athoms-rig.svg, index.html, gsap.min.js et scripts/athoms-character.py. Les articulations internes ne sont pas garanties dans l’inspecteur du Studio.
''')
print(p)
