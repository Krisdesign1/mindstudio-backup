"""New ministry-specific sets; preserves the approved Humilité V2 character rig."""
import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('base',Path(__file__).with_name('humilite-v2-art.py'));base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
DEFS=base.DEFS;person=base.person;mouth=base.mouth;room=base.room

def church(x=1220,y=260,s=1):
 return f'<g id="building" transform="translate({x} {y}) scale({s})"><path d="M-270 380V140L0-20L270 140V380Z" fill="#dbd4b8" stroke="#7b8d76" stroke-width="10"/><path d="M-305 155L0-40L305 155" stroke="#a69160" stroke-width="22" fill="none"/><path d="M-30 20V105M-75 65H15" stroke="#a88d5b" stroke-width="13"/><path d="M-75 380V255Q0 160 75 255V380" fill="#567366"/><rect x="-205" y="205" width="80" height="110" rx="36" fill="#aabfa8"/><rect x="125" y="205" width="80" height="110" rx="36" fill="#aabfa8"/></g>'

def landscape():return '<rect width="1920" height="1080" fill="#dad8bb"/><circle cx="1430" cy="240" r="160" fill="#f3e6bd"/><path d="M0 560Q360 300 780 570Q1380 320 1920 540V1080H0Z" fill="#a5b797"/><path d="M0 700Q500 500 1000 710Q1500 530 1920 660V1080H0Z" fill="#718f75"/>'

def road(blocked=False,second=False):
 c=landscape()+'<path d="M810 1080L820 650L270 330H440L980 560L1500 330H1660L1090 650L1250 1080Z" fill="#c2b48e"/><path d="M960 950V665L430 350M960 665L1510 350" stroke="#e7d7ae" stroke-width="6" stroke-dasharray="20 22" fill="none"/>'
 c+=person('paul',965,385,.69,'m','rest','calm',True)
 if blocked:c+='<g id="barrier"><path d="M'+('1260 395L1580 395' if second else '350 395L670 395')+'" stroke="#8c6453" stroke-width="32"/><path d="M'+('1320 385V540M1520 385V540' if second else '400 385V540M620 385V540')+'" stroke="#6a6551" stroke-width="14"/></g>'
 return c

def scene(kind,state='calm'):
 if kind in ('church-building','church-copy'):
  c=landscape()+church()+person('a',530,350,.76,'m','open')
  if kind=='church-copy':c=landscape()+church(530,300,.68)+church(1390,300,.68)+'<path id="copy-arrow" d="M810 570H1110M1050 520L1110 570L1050 620" stroke="#aa8e5a" stroke-width="16" fill="none"/>'
  return c
 if kind=='phone':return room('studio')+person('a',460,350,.75,'m','point')+'<g id="phone"><rect x="1030" y="205" width="410" height="660" rx="55" fill="#203e36" stroke="#abac87" stroke-width="12"/><rect x="1055" y="265" width="360" height="515" rx="20" fill="#cbdac1"/><path d="M1170 235H1300" stroke="#8fa08a" stroke-width="9" stroke-linecap="round"/>'+''.join(f'<g id="bubble-{i}"><rect x="{1080+(i%2)*30}" y="{340+i*125}" width="265" height="86" rx="22" fill="{ "#729c7a" if i%2 else "#e2e5cc"}"/><path d="M{1105+(i%2)*30} {372+i*125}h180M{1105+(i%2)*30} {396+i*125}h120" stroke="#536f58" stroke-width="6"/></g>' for i in range(3))+'</g>'
 if kind in ('paul','blocked','blocked-two','destination'):
  return road(kind.startswith('blocked'),kind=='blocked-two') + ('<path id="destination-route" d="M1090 610L1510 360" stroke="#ecd199" stroke-width="16" fill="none"/><circle cx="1510" cy="360" r="24" fill="#f2dca6"/>' if kind=='destination' else '')
 if kind=='vision':return '<rect width="1920" height="1080" fill="#193e3c"/><circle cx="1260" cy="420" r="430" fill="url(#glow)" opacity=".33"/>'+person('paul',480,360,.74,'m','rest','calm',True)+'<g id="vision"><path d="M970 160H1640V840H970Z" fill="#aac4a5" opacity=".14"/>'+person('helper',1290,370,.62,'m','open','calm',True)+'</g><path id="light-path" d="M720 740Q900 610 1060 690" stroke="#cdb77c" stroke-width="8" fill="none" stroke-dasharray="15 18"/>'
 if kind=='compass':return room('studio')+'<g id="compass"><circle cx="1250" cy="550" r="285" fill="#294f44" stroke="#beab74" stroke-width="12"/><circle cx="1250" cy="550" r="230" fill="none" stroke="#8aab91" stroke-width="3"/><path id="needle" d="M1250 325L1165 590L1250 550L1335 510Z" fill="#d9c180"/><path d="M1250 775L1165 590L1250 550L1335 510Z" fill="#829e85"/><circle cx="1250" cy="550" r="18" fill="#e9d6a5"/></g>'+person('a',460,350,.75,'f','open')
 if kind=='calendar':return room('studio')+'<g id="calendar"><rect x="930" y="255" width="660" height="550" rx="30" fill="#e2dcc1"/><rect x="930" y="255" width="660" height="110" rx="30" fill="#718e72"/><path d="M1080 220V295M1440 220V295" stroke="#c1ae7a" stroke-width="18" stroke-linecap="round"/>'+''.join(f'<rect x="{1020+j*125}" y="{430+i*100}" width="65" height="52" rx="8" fill="#adbca1"/>' for i in range(3) for j in range(4))+'<circle id="day" cx="1300" cy="554" r="48" fill="none" stroke="#ad8657" stroke-width="9"/></g>'+person('a',455,350,.76,'m','rest')
 if kind=='internet':return room('office')+person('a',510,350,.74,'m','point')+'<g id="screen"><rect x="945" y="255" width="695" height="420" rx="25" fill="#29483f" stroke="#b5ab81" stroke-width="12"/><rect x="975" y="285" width="635" height="340" fill="#a5bd9e"/>'+person('teacher',1285,390,.28,'f','open')+'<path d="M1170 785H1410M1290 675V785" stroke="#7a846b" stroke-width="22"/></g>'
 if kind=='mentoring':return room('church')+person('mentor',490,350,.72,'m','open')+''.join(person('young'+str(i),930+i*270,430,.58,'f' if i%2 else 'm','rest') for i in range(3))
 if kind=='prayer':return room('church')+person('a',650,350,.75,'f','rest','sad')+person('b',1300,350,.75,'m','rest','calm')
 if kind=='seminar':return room('church')+person('speaker',1100,295,.65,'m','point')+'<g id="lectern"><path d="M850 620H1300L1275 850H880Z" fill="#748b72"/><path d="M850 620H1300" stroke="#b7a575" stroke-width="16"/></g>'+'<g fill="#405d4b">'+''.join(f'<circle cx="{x}" cy="845" r="38"/><path d="M{x-50} 920Q{x} 870 {x+50} 920V1080H{x-50}Z"/>' for x in [280,520,1450,1680])+'</g>'
 if kind=='waiting':return room('studio')+person('a',500,350,.75,'f','rest')+'<g id="clock"><circle cx="1310" cy="535" r="240" fill="#c2c7a9" stroke="#a69a68" stroke-width="14"/><path d="M1310 350V535L1440 600" stroke="#436d58" stroke-width="15" stroke-linecap="round"/>'+''.join(f'<circle cx="{1310+int(205*__import__("math").sin(i*__import__("math").pi/6))}" cy="{535-int(205*__import__("math").cos(i*__import__("math").pi/6))}" r="6" fill="#54745f"/>' for i in range(12))+'</g>'
 if kind=='steps':return landscape()+'<g id="steps"><path d="M500 900H850V750H1100V600H1350V450H1630" fill="none" stroke="#d6c49b" stroke-width="55"/><path id="next-step" d="M900 720H1050M1000 675L1050 720L1000 765" fill="none" stroke="#ecd7a0" stroke-width="14"/></g>'+person('a',580,350,.74,'f','rest')
 return base.scene(kind,state)
