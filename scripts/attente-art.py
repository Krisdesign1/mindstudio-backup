"""Native HyperFrames SVG sets authored for feeding habits and choosing freedom."""
import importlib.util,re
from pathlib import Path
sp=importlib.util.spec_from_file_location('rig',Path(__file__).with_name('priere-v2-art.py'));rig=importlib.util.module_from_spec(sp);sp.loader.exec_module(rig)
mouth=rig.mouth
DEFS=rig.DEFS+'''<defs><linearGradient id="sage" x2="0" y2="1"><stop stop-color="#111a30"/><stop offset=".58" stop-color="#33486f"/><stop offset="1" stop-color="#596b8d"/></linearGradient><linearGradient id="cream" x2="1" y2="1"><stop stop-color="#fff5df"/><stop offset=".56" stop-color="#dfd2b8"/><stop offset="1" stop-color="#b9ac94"/></linearGradient><radialGradient id="lamp-glow"><stop stop-color="#ffd994" stop-opacity=".48"/><stop offset="1" stop-color="#ffd994" stop-opacity="0"/></radialGradient><pattern id="grain" width="48" height="48" patternUnits="userSpaceOnUse"><circle cx="7" cy="11" r="1.4" fill="#fff" opacity=".055"/><circle cx="36" cy="31" r="1" fill="#17233f" opacity=".06"/></pattern><filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="13"/></filter></defs>'''
def person(*a,**kw):
 s=rig.person(*a,**kw)
 if a[0]=='host':s=s.replace('#88749b','#b96f57')
 return s

def base(dark=False):
 return '<rect width="1920" height="1080" fill="url(#'+('sage' if dark else 'cream')+')"/><circle id="ambient-glow" cx="1510" cy="260" r="420" fill="url(#lamp-glow)"/><path d="M0 865H1920V1080H0Z" fill="'+('#202d4c' if dark else '#a99d87')+'"/><path d="M0 865H1920" stroke="#d0b88b" stroke-width="4"/><rect width="1920" height="1080" fill="url(#grain)" pointer-events="none"/>'
def room(dark=False):
 return base(dark)+'<path d="M90 770Q440 700 760 785" stroke="#17233f" stroke-width="34" opacity=".13" filter="url(#soft-shadow)"/><rect x="130" y="180" width="440" height="450" rx="90" fill="#7185aa"/><path d="M350 180V630M130 405H570" stroke="#e7dbc2" stroke-width="14"/><path d="M1260 815H1730V840H1260ZM1320 840V980M1680 840V980" stroke="#846c51" stroke-width="24"/><path d="M1580 310V810" stroke="#b28a58" stroke-width="12"/><path d="M1480 310H1680L1730 480H1430Z" fill="#d6ba82"/><circle cx="1580" cy="480" r="330" fill="url(#lamp-glow)"/><g id="room-props"><rect x="1180" y="745" width="170" height="55" rx="8" fill="#6e5a49"/><path d="M1210 745V690H1320V745" fill="#d8c59f"/><path d="M760 820Q910 730 1060 820" fill="none" stroke="#849a87" stroke-width="18"/></g>'
def tx(x,y,text,size=46,color='#1b2845'):
 return f'<text x="{x}" y="{y}" font-family="Arial" font-size="{size}" font-weight="bold" fill="{color}" text-anchor="middle">{text}</text>'
def phone(x=960,y=300,scale=1,mode='feed'):
 cards=''
 for j,label in enumerate({'feed':['Vidéo','Encore une vidéo','Suivre'],'chat':['Conversation','Répondre','Encore ?'],'unfollow':['Compte','Ne plus suivre','Confirmer'],'contact':['Une personne fiable','Appeler','Parler'],'groups':['Groupe','Quitter le groupe','Confirmer'],'delete':['Contact','Supprimer','Confirmer'],'block':['Conversation','Bloquer','Confirmer']}.get(mode,['Pause','Décider','Aujourd’hui'])):
  cards+=f'<g id="screen-{j}"><rect x="-175" y="{80+j*130}" width="350" height="105" rx="16" fill="{["#d6bc87","#a7bdb2","#b88972"][j]}"/>'+tx(0,145+j*130,label,29)+'</g>'
 return f'<g id="phone" transform="translate({x} {y}) scale({scale})"><rect x="-220" y="0" width="440" height="640" rx="48" fill="#1b2845" stroke="#8baaa0" stroke-width="9"/><rect x="-195" y="55" width="390" height="535" rx="19" fill="#f6edda"/>{cards}<path d="M-50 25H50" stroke="#759b90" stroke-width="10"/><circle cy="612" r="12" fill="#8baaa0"/></g>'
def book(x=960,y=450,scale=1):
 return f'<g id="book" transform="translate({x} {y}) scale({scale})"><path d="M-370-140Q-180-210 0-130Q180-210 370-140V190Q180 125 0 220Q-180 125-370 190Z" fill="#f5e9ca" stroke="#ae8d57" stroke-width="10"/><path d="M0-130V220" stroke="#ae8d57" stroke-width="6"/>'+''.join(f'<path d="M-315 {j}L-65 {j+15}M65 {j+15}L315 {j}" stroke="#b8a684" stroke-width="7"/>' for j in [-75,-15,45,105])+'</g>'
def door(x=960,open_=False):
 return f'<g id="door"><path d="M{x-250} 190H{x+250}V865H{x-250}Z" fill="#84694d"/><path d="M{x-215} 225H{x+215}V865H{x-215}Z" fill="#e8d8b2"/><g id="door-leaf"><path d="M{x-215} 225H{x+(20 if open_ else 215)}V865H{x-215}Z" fill="#536b99"/><circle cx="{x-20 if open_ else x+160}" cy="565" r="14" fill="#e0ad62"/></g></g>'
def dog(pid,x,y,color,weak=False):
 return f'<g id="{pid}" transform="translate({x} {y})"><g id="{pid}-body"><path d="M-120-65Q20-100 130-40L120 60H-100Z" fill="{color}"/><path d="M-90 35V130M95 35V130" stroke="{color}" stroke-width="36" stroke-linecap="round"/><path d="M-120-40Q-200-140-175-190" stroke="{color}" stroke-width="23" fill="none" stroke-linecap="round"/></g><g id="{pid}-doghead" transform="translate(130 -70)"><path d="M-35-65Q50-95 90-10L110 25L30 55L-20 20Z" fill="{color}"/><path d="M-25-55L-65-110L-60 20Z" fill="#98795d"/><ellipse cx="105" cy="15" rx="19" ry="13" fill="#1b2845"/><circle cx="55" cy="-17" r="8" fill="#1b2845"/><path d="M35 42H80" stroke="#98795d" stroke-width="6"/></g><g id="{pid}-bowl"><path d="M-90 160H125L95 210H-60Z" fill="#b96f57"/>{'' if weak else '<path d="M-55 155L-30 135L0 155L25 130L60 155L85 140L110 160" fill="#d3b675"/>'}</g></g>'
def growth(two=False):
 s=base(True)
 for j in range(2 if two else 1):
  x=600+j*720 if two else 960
  s+=f'<g id="plant-{j}"><path d="M{x-100} 710H{x+100}L{x+75} 865H{x-75}Z" fill="#ba8969"/><path d="M{x} 710V390" stroke="#92b79a" stroke-width="18"/><path d="M{x} 600Q{x-180} 475 {x-140} 415Q{x-20} 435 {x} 560M{x} 525Q{x+170} 370 {x+155} 345Q{x+20} 365 {x} 485" fill="#91b196"/></g>'
 return s

def scene(k,i):
 if k=='opening':
  if i%3==0:return room(True)+person('believer1',960,360,.78,'f','pray','sad')+'<g id="pulse"><circle cx="960" cy="330" r="250" fill="none" stroke="#e0ad62" stroke-width="10" opacity=".18"/></g>'
  if i%3==1:return clock_art()+person('waiting1',420,410,.62,'f','rest','sad')
  return base(True)+'<g id="hands-detail" transform="translate(960 470) scale(2.1)"><path d="M-230 100Q-120-120 0 40Q120-120 230 100" fill="none" stroke="#c98360" stroke-width="70" stroke-linecap="round"/><path d="M-40-30V190M40-30V190" stroke="#f0d8bf" stroke-width="35" stroke-linecap="round"/></g>'
 # Alternatives share only objects, not one recurring decorative template.
 if k in ('dogs','dogs-feed','forces'):
  return base()+dog('white-dog',550,610,'#efe8d8',k=='dogs-feed')+dog('black-dog',1340,610,'#3d4441',False)+tx(960,280,'Ce que tu nourris prend de la force',52)
 if k in ('phone','feed','chat','unfollow','groups','delete','block','call'):
  mode={'phone':'feed','feed':'feed','call':'contact'}.get(k,k)
  return base()+phone(1090,240,.9,mode)+person('reader1',390,370,.7,'m','rest','sad')
 if k in ('opening','relapse','cycle'):
  return room(True)+person('alone1',760,350,.78,'m','pray' if k=='opening' else 'rest','sad')+'<g id="cycle"><path d="M1300 440A150 150 0 1 1 1298 438" fill="none" stroke="#e0ad62" stroke-width="16"/><path d="M1260 365L1350 405L1280 465Z" fill="#e0ad62"/></g>'
 if k in ('pray','prayer','restart'):
  return room()+person('believer1',970,350,.78,'m','pray' if k!='restart' else 'open','sad' if k=='pray' else 'calm')
 if k in ('bible','reading','strength'):
  return room()+book(1100,515,.75)+person('learner1',420,360,.75,'m','open')
 if k in ('grow','habits','daily'):
  return growth(k=='habits')+tx(960,270,'Un choix aujourd’hui. Puis demain.',48,'#f6edda')
 if k in ('couple','limits'):
  return room()+person('couple1',630,340,.73,'m','rest')+person('couple2',1270,340,.73,'f','rest')+('<path id="boundary" d="M960 340V865" stroke="#a55f48" stroke-width="14" stroke-dasharray="24 22"/>' if k=='limits' else '')
 if k in ('leave','close-door','doors'):
  return base(True)+door(1250,k=='leave')+person('choice1',500,355,.77,'m','open')
 if k in ('listen','help','trust','talk'):
  return room()+person('speaker1',620,345,.75,'m','open','sad')+person('listener2',1310,345,.75,'f','rest')+'<path d="M470 810H1470" stroke="#b28a58" stroke-width="16"/>'
 if k in ('secret','image','integrity'):
  return base(True)+person('hidden1',590,355,.78,'m','rest','sad')+'<g id="mask"><rect x="1190" y="340" width="360" height="370" rx="155" fill="#dfc799"/><path d="M1260 460H1320M1420 460H1480M1300 570Q1370 660 1450 570" stroke="#57786b" stroke-width="14" fill="none"/></g>'+tx(1370,790,'L’image / la vérité',44,'#f6edda')
 if k in ('thought','thought-door','select'):
  return base()+door(1230,k=='thought-door')+person('thinker1',540,365,.73,'m','rest')+'<g id="thought"><rect x="270" y="160" width="510" height="115" rx="55" fill="#9fb8a8"/><circle cx="600" cy="315" r="19" fill="#9fb8a8"/>'+tx(525,230,'Je ne nourris pas ça',39)+'</g>'
 if k in ('influence','relationships'):
  return base()+person('friend1',520,350,.73,'m','open')+person('friend2',960,350,.73,'f','rest')+person('friend3',1400,350,.73,'m','rest')
 if k in ('choose','action','freedom','question','answer'):
  return base(True)+'<g id="choice-0"><rect x="220" y="370" width="430" height="330" rx="35" fill="#d8bb88"/>'+tx(435,510,'Attente',49)+tx(435,590,'ce qui construit',35)+'</g><g id="choice-1"><rect x="730" y="370" width="430" height="330" rx="35" fill="#a5b8a2"/>'+tx(945,510,'Fermer',49)+tx(945,590,'ce qui détruit',35)+'</g><g id="choice-2"><rect x="1240" y="370" width="430" height="330" rx="35" fill="#bd957c"/>'+tx(1455,510,'Parler',49)+tx(1455,590,'à quelqu’un',35)+'</g>'
 if k in ('environment','routine'):
  return room()+phone(1180,360,.64,'pause')+book(500,565,.62)
 if k=='closing':return growth()+person('helper1',410,360,.7,'m','open')
 return room()+person('person1',960,350,.75,'m','rest')

# Waiting-season visual language: indigo night gradually opens into amber dawn.
_legacy_scene=scene
def clock_art():
 return base(True)+'<g id="clock" transform="translate(960 500)"><circle r="270" fill="#f6edda" stroke="#e0ad62" stroke-width="18"/><path id="clock-hour" d="M0 0V-130" stroke="#17233f" stroke-width="22" stroke-linecap="round"/><path id="clock-minute" d="M0 0L125 55" stroke="#b96f57" stroke-width="16" stroke-linecap="round"/><circle r="22" fill="#17233f"/></g>'
def doors_art():
 return base(True)+door(560,False)+door(1360,True)+'<path id="path" d="M960 880C1030 710 1110 600 1360 520" fill="none" stroke="#e0ad62" stroke-width="28" stroke-linecap="round"/>'+person('traveler1',900,420,.64,'f','open')
def historical(kind):
 sky='<rect width="1920" height="1080" fill="#17233f"/><path d="M0 760Q460 530 900 730T1920 690V1080H0Z" fill="#8b6a4b"/><g fill="#f6d894">'+''.join(f'<circle cx="{120+(j*173)%1720}" cy="{100+(j*97)%390}" r="{3+j%5}"/>' for j in range(18))+'</g>'
 if kind=='joseph-dream':return sky+person('joseph1',780,360,.7,'m','open')+'<path id="dream-rays" d="M1080 170L1400 440M1180 120L1490 260M970 120L1050 410" stroke="#e0ad62" stroke-width="12" opacity=".75"/>'
 if kind=='joseph-prison':return sky+'<rect x="1120" y="150" width="470" height="710" rx="20" fill="#111a2e"/><g stroke="#7185aa" stroke-width="30">'+''.join(f'<path d="M{1170+j*95} 180V850"/>' for j in range(5))+'</g>'+person('joseph2',720,390,.7,'m','rest','calm')+'<path d="M1510 180L980 700" stroke="#f5d89b" stroke-width="80" opacity=".25"/>'
 if kind=='david':return sky+'<path d="M1040 300Q1480 200 1680 520V860H1040Z" fill="#3b3650"/>'+person('david1',660,380,.69,'m','open')+'<path id="crown" d="M520 245L585 160L650 245L715 150L780 245V300H520Z" fill="#e0ad62" opacity=".55"/>'
 return sky+person('martha1',560,390,.68,'f','open','sad')+person('mary1',980,410,.65,'f','rest','sad')+'<path d="M1260 340H1660V860H1260Z" fill="#44455f"/><path d="M1320 420H1600" stroke="#e0ad62" stroke-width="12"/>'
def cards(labels):
 out=base(True)
 for j,label in enumerate(labels):out+=f'<g id="choice-{j}"><rect x="{180+j*560}" y="350" width="460" height="350" rx="34" fill="{["#9d6c32","#536b99","#934d3a"][j%3]}" opacity=".96"/>{tx(410+j*560,520,label,45,"#fff6e5")}</g>'
 return out
def scene(k,i):
 if k in ('clock','timing'):return clock_art()
 if k in ('joseph-dream','joseph-prison','david','lazarus'):return historical(k)
 if k in ('comparison','whole-story','closed-doors'):return doors_art()
 if k=='hidden-work':return base(True)+'<g id="layers">'+''.join(f'<rect x="{260+j*290}" y="{240+j*70}" width="850" height="500" rx="35" fill="{["#263558","#536b99","#e0ad62"][j]}" opacity="{.75-j*.12}"/>' for j in range(3))+'</g>'+person('observer1',1420,360,.7,'f','rest')
 if k=='suffering':return cards(['INJUSTICE','MALADIE','PERTE'])
 if k=='responsibility':return cards(['POSITION','RELATION','INFLUENCE'])
 if k in ('honest-pain','honesty','simple-prayer'):return room(True)+person('believer1',960,360,.78,'f','pray','sad')
 if k in ('life-moving','work-grow','movement'):return cards(['APPRENDRE','SERVIR','CONSTRUIRE'])
 if k=='pressure-choice':return base(True)+'<path d="M960 880V520M960 520L430 250M960 520L1490 250" stroke="#e0ad62" stroke-width="30" fill="none"/>'+person('chooser1',820,400,.65,'f','rest')+tx(430,210,'PRÉCIPITER',42,'#f6edda')+tx(1490,210,'DISCERNER',42,'#f6edda')
 if k=='community':return room()+person('speaker1',470,390,.65,'f','open','sad')+person('listener1',960,370,.67,'m','rest')+person('listener2',1450,390,.65,'f','open')
 if k=='control':return cards(['PRÉPARER','OBÉIR','CONFIER'])
 if k=='no-false-promise':return clock_art()+tx(960,900,'PAS DE DATE INVENTÉE',46,'#f6edda')
 if k=='protect-heart':return base(True)+'<g id="heart-symbol" transform="translate(960 500)"><path d="M0 260C-420 20-310-270-120-230C-40-212 0-140 0-140C0-140 40-212 120-230C310-270 420 20 0 260Z" fill="#b96f57"/><path d="M-300 80Q0-190 300 80" fill="none" stroke="#e0ad62" stroke-width="32"/></g>'
 if k in ('growth','closing'):return growth(True)+person('future1',960,350,.62,'f','open')
 return _legacy_scene(k,i)
