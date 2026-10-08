"""Native HyperFrames SVG sets authored for feeding habits and choosing freedom."""
import importlib.util,re
from pathlib import Path
sp=importlib.util.spec_from_file_location('rig',Path(__file__).with_name('priere-v2-art.py'));rig=importlib.util.module_from_spec(sp);sp.loader.exec_module(rig)
mouth=rig.mouth
DEFS=rig.DEFS+'''<defs><linearGradient id="sage" x2="0" y2="1"><stop stop-color="#153e3b"/><stop offset="1" stop-color="#47736a"/></linearGradient><linearGradient id="cream" x2="1" y2="1"><stop stop-color="#f1e7ce"/><stop offset="1" stop-color="#d3c7ae"/></linearGradient></defs>'''
def person(*a,**kw):
 s=rig.person(*a,**kw)
 if a[0]=='host':s=s.replace('#88749b','#b4775d')
 return s

def base(dark=False):
 return '<rect width="1920" height="1080" fill="url(#'+('sage' if dark else 'cream')+')"/><path d="M0 865H1920V1080H0Z" fill="'+('#244f49' if dark else '#afa590')+'"/><path d="M0 865H1920" stroke="#d0b88b" stroke-width="4"/>'
def room(dark=False):
 return base(dark)+'<rect x="130" y="180" width="440" height="450" rx="90" fill="#94b5a7"/><path d="M350 180V630M130 405H570" stroke="#e7dbc2" stroke-width="14"/><path d="M1260 815H1730V840H1260ZM1320 840V980M1680 840V980" stroke="#846c51" stroke-width="24"/><path d="M1580 310V810" stroke="#b28a58" stroke-width="12"/><path d="M1480 310H1680L1730 480H1430Z" fill="#d6ba82"/>'
def tx(x,y,text,size=46,color='#203b37'):
 return f'<text x="{x}" y="{y}" font-family="Arial" font-size="{size}" font-weight="bold" fill="{color}" text-anchor="middle">{text}</text>'
def phone(x=960,y=300,scale=1,mode='feed'):
 cards=''
 for j,label in enumerate({'feed':['Vidéo','Encore une vidéo','Suivre'],'chat':['Conversation','Répondre','Encore ?'],'unfollow':['Compte','Ne plus suivre','Confirmer'],'contact':['Une personne fiable','Appeler','Parler'],'groups':['Groupe','Quitter le groupe','Confirmer'],'delete':['Contact','Supprimer','Confirmer'],'block':['Conversation','Bloquer','Confirmer']}.get(mode,['Pause','Décider','Aujourd’hui'])):
  cards+=f'<g id="screen-{j}"><rect x="-175" y="{80+j*130}" width="350" height="105" rx="16" fill="{["#d6bc87","#a7bdb2","#b88972"][j]}"/>'+tx(0,145+j*130,label,29)+'</g>'
 return f'<g id="phone" transform="translate({x} {y}) scale({scale})"><rect x="-220" y="0" width="440" height="640" rx="48" fill="#203b37" stroke="#8baaa0" stroke-width="9"/><rect x="-195" y="55" width="390" height="535" rx="19" fill="#f1e7ce"/>{cards}<path d="M-50 25H50" stroke="#759b90" stroke-width="10"/><circle cy="612" r="12" fill="#8baaa0"/></g>'
def book(x=960,y=450,scale=1):
 return f'<g id="book" transform="translate({x} {y}) scale({scale})"><path d="M-370-140Q-180-210 0-130Q180-210 370-140V190Q180 125 0 220Q-180 125-370 190Z" fill="#f5e9ca" stroke="#ae8d57" stroke-width="10"/><path d="M0-130V220" stroke="#ae8d57" stroke-width="6"/>'+''.join(f'<path d="M-315 {j}L-65 {j+15}M65 {j+15}L315 {j}" stroke="#b8a684" stroke-width="7"/>' for j in [-75,-15,45,105])+'</g>'
def door(x=960,open_=False):
 return f'<g id="door"><path d="M{x-250} 190H{x+250}V865H{x-250}Z" fill="#84694d"/><path d="M{x-215} 225H{x+215}V865H{x-215}Z" fill="#e8d8b2"/><g id="door-leaf"><path d="M{x-215} 225H{x+(20 if open_ else 215)}V865H{x-215}Z" fill="#467569"/><circle cx="{x-20 if open_ else x+160}" cy="565" r="14" fill="#d8b47b"/></g></g>'
def dog(pid,x,y,color,weak=False):
 return f'<g id="{pid}" transform="translate({x} {y})"><g id="{pid}-body"><path d="M-120-65Q20-100 130-40L120 60H-100Z" fill="{color}"/><path d="M-90 35V130M95 35V130" stroke="{color}" stroke-width="36" stroke-linecap="round"/><path d="M-120-40Q-200-140-175-190" stroke="{color}" stroke-width="23" fill="none" stroke-linecap="round"/></g><g id="{pid}-doghead" transform="translate(130 -70)"><path d="M-35-65Q50-95 90-10L110 25L30 55L-20 20Z" fill="{color}"/><path d="M-25-55L-65-110L-60 20Z" fill="#98795d"/><ellipse cx="105" cy="15" rx="19" ry="13" fill="#203b37"/><circle cx="55" cy="-17" r="8" fill="#203b37"/><path d="M35 42H80" stroke="#98795d" stroke-width="6"/></g><g id="{pid}-bowl"><path d="M-90 160H125L95 210H-60Z" fill="#b4775d"/>{'' if weak else '<path d="M-55 155L-30 135L0 155L25 130L60 155L85 140L110 160" fill="#d3b675"/>'}</g></g>'
def growth(two=False):
 s=base(True)
 for j in range(2 if two else 1):
  x=600+j*720 if two else 960
  s+=f'<g id="plant-{j}"><path d="M{x-100} 710H{x+100}L{x+75} 865H{x-75}Z" fill="#ba8969"/><path d="M{x} 710V390" stroke="#92b79a" stroke-width="18"/><path d="M{x} 600Q{x-180} 475 {x-140} 415Q{x-20} 435 {x} 560M{x} 525Q{x+170} 370 {x+155} 345Q{x+20} 365 {x} 485" fill="#91b196"/></g>'
 return s

def scene(k,i):
 # Alternatives share only objects, not one recurring decorative template.
 if k in ('dogs','dogs-feed','forces'):
  return base()+dog('white-dog',550,610,'#efe8d8',k=='dogs-feed')+dog('black-dog',1340,610,'#3d4441',False)+tx(960,280,'Ce que tu nourris prend de la force',52)
 if k in ('phone','feed','chat','unfollow','groups','delete','block','call'):
  mode={'phone':'feed','feed':'feed','call':'contact'}.get(k,k)
  return base()+phone(1090,240,.9,mode)+person('reader1',390,370,.7,'m','rest','sad')
 if k in ('opening','relapse','cycle'):
  return room(True)+person('alone1',760,350,.78,'m','pray' if k=='opening' else 'rest','sad')+'<g id="cycle"><path d="M1300 440A150 150 0 1 1 1298 438" fill="none" stroke="#d8b47b" stroke-width="16"/><path d="M1260 365L1350 405L1280 465Z" fill="#d8b47b"/></g>'
 if k in ('pray','prayer','restart'):
  return room()+person('believer1',970,350,.78,'m','pray' if k!='restart' else 'open','sad' if k=='pray' else 'calm')
 if k in ('bible','reading','strength'):
  return room()+book(1100,515,.75)+person('learner1',420,360,.75,'m','open')
 if k in ('grow','habits','daily'):
  return growth(k=='habits')+tx(960,270,'Un choix aujourd’hui. Puis demain.',48,'#f1e7ce')
 if k in ('couple','limits'):
  return room()+person('couple1',630,340,.73,'m','rest')+person('couple2',1270,340,.73,'f','rest')+('<path id="boundary" d="M960 340V865" stroke="#a55f48" stroke-width="14" stroke-dasharray="24 22"/>' if k=='limits' else '')
 if k in ('leave','close-door','doors'):
  return base(True)+door(1250,k=='leave')+person('choice1',500,355,.77,'m','open')
 if k in ('listen','help','trust','talk'):
  return room()+person('speaker1',620,345,.75,'m','open','sad')+person('listener2',1310,345,.75,'f','rest')+'<path d="M470 810H1470" stroke="#b28a58" stroke-width="16"/>'
 if k in ('secret','image','integrity'):
  return base(True)+person('hidden1',590,355,.78,'m','rest','sad')+'<g id="mask"><rect x="1190" y="340" width="360" height="370" rx="155" fill="#dfc799"/><path d="M1260 460H1320M1420 460H1480M1300 570Q1370 660 1450 570" stroke="#57786b" stroke-width="14" fill="none"/></g>'+tx(1370,790,'L’image / la vérité',44,'#f1e7ce')
 if k in ('thought','thought-door','select'):
  return base()+door(1230,k=='thought-door')+person('thinker1',540,365,.73,'m','rest')+'<g id="thought"><rect x="270" y="160" width="510" height="115" rx="55" fill="#9fb8a8"/><circle cx="600" cy="315" r="19" fill="#9fb8a8"/>'+tx(525,230,'Je ne nourris pas ça',39)+'</g>'
 if k in ('influence','relationships'):
  return base()+person('friend1',520,350,.73,'m','open')+person('friend2',960,350,.73,'f','rest')+person('friend3',1400,350,.73,'m','rest')
 if k in ('choose','action','freedom','question','answer'):
  return base(True)+'<g id="choice-0"><rect x="220" y="370" width="430" height="330" rx="35" fill="#d8bb88"/>'+tx(435,510,'Nourrir',49)+tx(435,590,'ce qui construit',35)+'</g><g id="choice-1"><rect x="730" y="370" width="430" height="330" rx="35" fill="#a5b8a2"/>'+tx(945,510,'Fermer',49)+tx(945,590,'ce qui détruit',35)+'</g><g id="choice-2"><rect x="1240" y="370" width="430" height="330" rx="35" fill="#bd957c"/>'+tx(1455,510,'Parler',49)+tx(1455,590,'à quelqu’un',35)+'</g>'
 if k in ('environment','routine'):
  return room()+phone(1180,360,.64,'pause')+book(500,565,.62)
 if k=='closing':return growth()+person('helper1',410,360,.7,'m','open')
 return room()+person('person1',960,350,.75,'m','rest')
