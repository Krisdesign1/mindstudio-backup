"""Native SVG prayer sets and articulated recurring cast, no generated raster assets."""
import importlib.util,re,math
from pathlib import Path
sp=importlib.util.spec_from_file_location('cast',Path(__file__).with_name('humilite-v2-art.py'));cast=importlib.util.module_from_spec(sp);sp.loader.exec_module(cast)
mouth=cast.mouth
DEFS=cast.DEFS+'''<defs><linearGradient id="evening" x2="0" y2="1"><stop stop-color="#24263e"/><stop offset="1" stop-color="#62526b"/></linearGradient><linearGradient id="day" x2="1" y2="1"><stop stop-color="#f4ead9"/><stop offset="1" stop-color="#dbccc0"/></linearGradient></defs>'''
def person(pid,x,y,s=1,gender='f',pose='open',emotion='calm',seated=False):
 raw=cast.person(pid,0,0,1,gender,pose,emotion,False,seated)
 # Keep original face exactly; replace only limbs and costume hues.
 coat='#88749b' if pid=='host' else ['#758d87','#9a8069','#8e799e','#8799a1','#ac877b'][sum(map(ord,pid))%5]
 raw=raw.replace('url(#jacket)',coat).replace('#567a6c',coat).replace('#596c7d',coat).replace('#a7beb0','#eee3d4')
 arms=''
 for side,sign in [('left',-1),('right',1)]:
  raised=pose in ('raised','pray') or pose=='point' and side=='right'
  ang=sign*(-105 if raised else -25 if pose=='open' else 0)
  fore=-sign*(45 if raised else 20 if pose=='open' else 0)
  fingers=''
  for j,(fx,fy,length) in enumerate([(-13,4,35),(-3,0,43),(7,2,40),(17,8,31)]):
   fingers+=f'<g id="{pid}-{side}-finger-{j}" transform="translate({fx} {fy})"><path d="M0 0V{length}" stroke="#ba805d" stroke-width="9" stroke-linecap="round"/></g>'
  arms+=f'<g id="{pid}-{side}-arm" transform="translate({sign*137} 181)"><g id="{pid}-{side}-upper" transform="rotate({ang})"><path d="M0 0L{sign*7} 105" stroke="{coat}" stroke-width="49" stroke-linecap="round"/><g transform="translate({sign*7} 105)"><g id="{pid}-{side}-fore" transform="rotate({fore})"><path d="M0 0L0 102" stroke="{coat}" stroke-width="39" stroke-linecap="round"/><g transform="translate(0 113)"><g id="{pid}-{side}-wrist"><path d="M0-15V12" stroke="#ba805d" stroke-width="26" stroke-linecap="round"/><g id="{pid}-{side}-hand"><ellipse cx="2" cy="20" rx="23" ry="28" fill="url(#skin)"/>{fingers}<g id="{pid}-{side}-thumb" transform="translate(-20 15)"><path d="M0 0L-14 21" stroke="#ba805d" stroke-width="12" stroke-linecap="round"/></g></g></g></g></g></g></g></g>'
 raw=re.sub(r'<g id="'+re.escape(pid)+r'-left-arm">.*?(?=<g id="'+re.escape(pid)+r'-head">)',arms,raw,flags=re.S)
 if pid!='host':
  raw=raw.replace('cx="-46"','cx="-44"').replace('cx="46"','cx="48"')
  if pid.endswith(('1','3')):raw=raw.replace('<ellipse cx="35" cy="-151" rx="54" ry="46" fill="#27302d"/>','').replace('fill="#27302d"','fill="#483a34"')
 # Face/pupils preserved; body breathing isolated from fixed ground contact.
 k=raw.index('<path d="M-155 190');h=raw.index(f'<g id="{pid}-left-arm"')
 raw=raw[:k]+f'<g id="{pid}-chest">'+raw[k:h]+'</g>'+raw[h:]
 return f'<g id="{pid}-motion" transform="translate({x} {y}) scale({s})">'+raw+'</g>'
def base(night=False):
 return f'<rect width="1920" height="1080" fill="{"url(#evening)" if night else "url(#day)"}"/><path d="M0 865H1920V1080H0Z" fill="{"#373447" if night else "#b6aaa0"}"/><path d="M0 985H1920" stroke="#cfc1b1" opacity=".25" stroke-width="3"/>'
def room():
 return base()+'<rect x="150" y="160" width="510" height="490" rx="145" fill="#b8c9c8"/><path d="M405 170V650M155 415H655" stroke="#f4ead9" stroke-width="17"/><path d="M1450 180V840M1320 840H1590" stroke="#8c7882" stroke-width="12"/><path d="M1370 180L1300 315H1600L1530 180Z" fill="#c7a879"/><rect x="770" y="215" width="360" height="235" rx="8" fill="#dfd4c4"/><path d="M820 405L910 300L990 360L1060 270" stroke="#9eaa9d" stroke-width="11" fill="none"/>'
def assembly(expressive=False):
 svg=base(True)+'<path d="M180 0H520V740H180ZM1400 0H1740V740H1400Z" fill="#434058"/><path d="M610 140H1300V540H610Z" fill="#675571"/><path d="M955 205V470M865 300H1045" stroke="#ddc395" stroke-width="13"/><path d="M120 865H1800" stroke="#97809e" stroke-width="25"/>'
 for j in range(5):svg+=person('member'+str(j),330+j*310,485,.46,'f' if j%2 else 'm','raised' if expressive and j%2==0 else 'rest','calm')
 return svg
 def_unused=0
def bible():
 return base(True)+'<g id="book"><path d="M430 365Q695 275 960 390Q1225 275 1490 365V760Q1210 685 960 795Q695 685 430 760Z" fill="#f3e7cc" stroke="#ab956c" stroke-width="11"/><path d="M960 390V795" stroke="#af9a75" stroke-width="6"/>'+''.join(f'<path d="M500 {y}L865 {y+25}M1055 {y+25}L1420 {y}" stroke="#c7b89a" stroke-width="8"/>' for y in range(445,710,60))+'</g>'
def scene(k,i):
 if k=='host':return base(True)+'<path d="M110 160H1810M110 840H1810" stroke="#c4a88d" opacity=".3" stroke-width="2"/>'
 if k in ('assembly','order','song'):return assembly(k=='song')
 if k=='bible':return bible()
 if k=='pray':return room()+person('woman',970,335,.76,'f','pray','sad')
 if k in ('quiet','intimacy','alone'):return room()+person('woman',1110,340,.75,'f','rest','sad')
 if k=='listen':return room()+person('woman',620,360,.72,'f','rest')+person('partner',1290,360,.72,'m','open')
 if k=='raised':return assembly(True)
 if k=='tears':return room()+person('woman',970,435,1.08,'f','rest','sad')
 if k=='secret':return base(True)+'<path d="M350 160H900V865H350Z" fill="#756678"/><path d="M395 205H850V865H395Z" fill="#d8c8a9"/>'+person('woman',1220,370,.7,'f','rest')
 if k=='mic':return assembly(False)+'<g id="mic"><path d="M1000 430V830M880 830H1120" stroke="#ded4c3" stroke-width="13"/><rect x="966" y="340" width="68" height="160" rx="34" fill="#282639" stroke="#b7a4be" stroke-width="7"/></g>'
 if k=='carmel':
  return '<rect width="1920" height="1080" fill="#d4bc9a"/><path d="M0 720L420 340L950 770L1380 380L1920 730V1080H0Z" fill="#aa997c"/><path d="M0 870H1920V1080H0Z" fill="#81796b"/>'+person('woman',420,365,.68,'m','raised','tension')+person('partner',1510,365,.68,'m','rest')+'<g id="altar"><path d="M785 635H1135V865H785Z" fill="#82776b"/><path d="M785 710H1135M785 785H1135M960 635V865" stroke="#c8b390" stroke-width="9"/></g>'
 if k in ('heart','volume','comparison','question','type'):
  svg=base(True)
  if k=='heart':svg+='<g id="symbol"><path d="M960 705C760 590 690 490 760 405C820 330 910 380 960 440C1010 380 1100 330 1160 405C1230 490 1160 590 960 705Z" fill="#b17d88"/></g>'
  elif k=='volume':svg+='<g id="symbol">'+''.join(f'<rect x="{620+j*100}" y="{670-j*40}" width="65" height="{110+j*40}" rx="9" fill="{["#9ba9a2","#c1a779","#a18aae"][j%3]}"/>' for j in range(7))+'</g>'
  else:svg+='<path d="M450 750H1470" stroke="#cab18e" stroke-width="5"/>'
  return svg
 return room()+person('woman',950,350,.75,'f','open')
# V2 editorial scenes: each motif has a concrete action and a dedicated setting.
original_person=person
def person(pid,x,y,s=1,gender='f',pose='open',emotion='calm',seated=False,ancient=False):
 svg=original_person(pid,x,y,s,gender,pose,emotion,seated)
 if ancient:
  svg=svg.replace('#758d87','#c2b495').replace('#9a8069','#c2b495').replace('#8e799e','#c2b495').replace('#8799a1','#c2b495').replace('#ac877b','#c2b495')
  svg=svg.replace('<path d="M-155 190', '<path d="M-155 190')
  svg=svg.replace('<path d="M0 160V447', '<path d="M0 160V447')
  svg=svg.replace('#eee3d4','#d8c7a6')
  svg=re.sub(r'<g id="'+re.escape(pid)+r'-chest">.*?</g>',f'<g id="{pid}-chest"><path d="M-145 175Q-110 125-50 135L0 170L50 135Q110 125 145 175L130 455H-130Z" fill="#d5c3a1"/><path d="M0 170V450M-100 210L-85 445" stroke="#a59474" stroke-width="5" fill="none"/></g>',svg,flags=re.S)
  svg=svg.replace('<g id="'+pid+'-mouth">','<path d="M-77 35Q0 123 77 35Q65 119 0 133Q-65 119-77 35Z" fill="#4a382d"/><g id="'+pid+'-mouth">')
  svg=svg.replace('<g id="'+pid+'-head">','<g id="'+pid+'-head"><path d="M-110-90Q0-200 110-90L130 95H95V-45H-95V95H-130Z" fill="#786047"/>')
  svg=svg.replace('<path d="M-82 430L-71 670H-15L-4 450L25 670H83L86 430Z" fill="#33494a"/>','<path d="M-130 430L-105 668H105L130 430Z" fill="#c2b495"/>')
 if pid!='host':
  colors=[('#d49b74','#cb926b'),('#b77956','#a46a4d'),('#83513e','#754937')]
  if sum(map(ord,pid))%2: svg=svg.replace('url(#skin)','#bd8a68')
  # Different face geometry belongs only to supporting cast.
  if gender=='m' and sum(map(ord,pid))%3==0:svg=svg.replace('<path id="'+pid+'-brows"','<path d="M-73 42Q0 115 73 42Q60 107 0 126Q-60 105-73 42Z" fill="#45382e"/><path id="'+pid+'-brows"')
 return svg

def window_room(night=False):
 return base(night)+'<rect x="130" y="150" width="470" height="505" rx="115" fill="'+('#777e97' if night else '#b8c9c8')+'"/><path d="M365 150V655M130 410H600" stroke="#eaded0" stroke-width="14"/><rect x="1110" y="185" width="450" height="305" rx="10" fill="#c5b99e"/><path d="M1160 430L1260 310L1360 385L1490 270" stroke="#929d91" stroke-width="12" fill="none"/><path d="M680 790H1550V825H680Z" fill="#aa8c76"/><path d="M750 825V965M1460 825V965" stroke="#826c65" stroke-width="18"/>'
def icon_heart(x=960,y=450,scale=1):return f'<g id="heart-symbol" transform="translate({x} {y}) scale({scale})"><path d="M0 150C-200 35-270-65-200-150C-140-225-50-175 0-115C50-175 140-225 200-150C270-65 200 35 0 150Z" fill="#bd808e"/><path d="M-175-110Q-140-160-80-145" stroke="#dcafad" stroke-width="10" fill="none"/></g>'
def meter():return '<g id="meter"><rect x="680" y="265" width="560" height="480" rx="36" fill="#d7c7b2"/><path d="M770 520Q960 200 1150 520" fill="none" stroke="#9480a2" stroke-width="32"/><path id="needle" d="M960 555L1110 390" stroke="#665269" stroke-width="12" stroke-linecap="round"/><circle cx="960" cy="555" r="24" fill="#665269"/><path d="M800 655H1120" stroke="#a68f77" stroke-width="16"/></g>'
def crowd(expressive=False):
 svg=base(True)+'<path d="M290 0H590V730H290ZM1330 0H1630V730H1330Z" fill="#49425a"/><path d="M860 150V460M740 260H980" stroke="#cdb287" stroke-width="17"/>'
 for j,(x,y,sc) in enumerate([(440,435,.57),(980,435,.57),(1490,435,.57)]):svg+=person('listener'+str(j),x,y,sc,'f' if j==1 else 'm','raised' if expressive and j!=1 else 'rest','calm')
 return svg

def scene(k,i):
 if k=='question':return base(True)+'<g transform="translate(-200 0) scale(.85)">'+meter()+'</g>'+icon_heart(1400,500,.58)
 if k in ('answer','closing','audience','whisper'):return window_room(True)+('<g id="thought"><circle cx="1310" cy="390" r="190" fill="#a48cae" opacity=".25"/></g>' if k=='question' else '')
 if k=='debate':return base()+''.join(f'<g id="opinion-{j}" transform="translate({330+j*690} {270+j*190})"><rect width="570" height="210" rx="42" fill="{["#b8c9c8","#cdb6bc"][j]}"/><path d="M65 85H460M65 135H380" stroke="#f3e9d8" stroke-width="16"/><path d="M120 210L70 285L240 210" fill="{["#b8c9c8","#cdb6bc"][j]}"/></g>' for j in range(2))
 if k in ('expressions','gratitude','emotion','permission'):return crowd(True)
 if k in ('contrast','two-prayers','balance','no-competition'):
  return base()+person('quiet-one',470,340,.70,'f','rest')+person('expressive-one',1450,340,.70,'m','raised')+'<path d="M960 180V855" stroke="#b8a49c" stroke-width="4"/>'+icon_heart(470,245,.20)+icon_heart(1450,245,.20)
 if k in ('bridge','unity','reconcile','connection','respect'):
  return base()+person('friend-one',600,355,.73,'f','open')+person('friend-two',1330,355,.73,'m','open')+'<g id="link"><path d="M770 645Q970 575 1160 645" stroke="#c2aa85" stroke-width="20" fill="none"/><circle cx="970" cy="605" r="45" fill="#c2aa85"/></g>'
 if k=='scripture':return bible()
 if k=='comfort':return window_room()+person('hurt',690,345,.74,'f','rest','sad')+person('helper',1190,345,.74,'m','open')
 if k=='pain':return window_room(True)+person('hurt',960,440,1.03,'f','rest','sad')+'<g id="tear"><path d="M1030 426Q1050 457 1030 460Q1009 457 1030 426Z" fill="#b5d0d6" opacity=".7"/></g>'
 if k=='imitation':return crowd(True)+'<g id="echo"><path d="M470 205H1450" stroke="#c2aa85" stroke-width="7" stroke-dasharray="20 20"/></g>'
 if k=='thought':return base(True)+'<g id="thought"><ellipse cx="960" cy="430" rx="380" ry="190" fill="#ad93b3"/><circle cx="620" cy="660" r="50" fill="#ad93b3"/><circle cx="565" cy="745" r="25" fill="#ad93b3"/><path d="M740 410H1180M740 480H1090" stroke="#eee0cd" stroke-width="18"/></g>'
 if k=='retreat':return '<rect width="1920" height="1080" fill="#c4c6b7"/><circle cx="1480" cy="260" r="130" fill="#e2cfa4"/><path d="M0 600Q650 300 1920 680V1080H0Z" fill="#8d9f94"/><path d="M0 870Q800 620 1920 850V1080H0Z" fill="#607f77"/><path d="M840 1080Q1250 820 1420 470" stroke="#d4c29f" stroke-width="100" fill="none"/>'+person('solitary',1010,420,.55,'m','rest','calm',ancient=True)
 if k in ('heart','meter-heart','source'):
  return base(True)+(meter() if k=='meter-heart' else '<g id="book-small" transform="translate(100 90) scale(.85)">'+bible()+'</g>' if k=='source' else '')+icon_heart(960,480,.85)
 if k in ('order','assembly','community','peace','turn-taking'):
  svg=crowd(k=='community')
  svg+='<g id="speech"><rect x="730" y="220" width="400" height="150" rx="35" fill="#ded0b7"/><path d="M780 280H1080M780 325H1020" stroke="#9b879b" stroke-width="12"/></g>'
  if k=='turn-taking':svg+='<g id="interruption"><rect x="320" y="200" width="350" height="145" rx="35" fill="#bb858c"/><path d="M375 260H600M375 305H550" stroke="#eedcd0" stroke-width="12"/></g>'
  return svg
 if k in ('carmel-crowd','carmel-elijah'):
  svg='<rect width="1920" height="1080" fill="#d4bc9a"/><path d="M0 720L420 340L950 770L1380 380L1920 730V1080H0Z" fill="#a18f71"/><path d="M0 870H1920V1080H0Z" fill="#81796b"/><g id="altar"><path d="M760 665H1150V865H760Z" fill="#82776b"/><path d="M760 735H1150M760 805H1150M930 665V865" stroke="#c8b390" stroke-width="9"/><path d="M820 650L1090 605M840 600L1080 665" stroke="#70594a" stroke-width="18"/></g>'
  if k=='carmel-crowd':svg+=person('prophet-one',400,350,.7,'m','raised','tension',ancient=True)+person('prophet-two',1490,355,.7,'m','raised','tension',ancient=True)
  else:svg+=person('elijah',1340,330,.75,'m','rest','calm',ancient=True)+'<path d="M260 900H680" stroke="#b4a080" stroke-width="10"/>'
  return svg
 if k=='stage':return crowd(True)+'<g id="spotlight"><path d="M850 0L470 860H1470L1080 0Z" fill="#e7cda1" opacity=".17"/></g><g id="microphone"><path d="M960 435V875M830 875H1090" stroke="#d3bda4" stroke-width="12"/><rect x="930" y="330" width="60" height="135" rx="30" fill="#2c2c3d"/></g>'
 if k=='mirror':return window_room()+'<g id="mirror"><rect x="1050" y="175" width="520" height="650" rx="100" fill="#967b74"/><rect x="1075" y="200" width="470" height="600" rx="75" fill="#c0ceca"/>'+person('reflection',1310,375,.48,'f','rest')+'</g>'+person('observer',590,325,.77,'f','rest')
 if k=='remove-props':return base(True)+'<g id="keyboard"><rect x="200" y="485" width="525" height="170" rx="20" fill="#d9cdbb"/>'+''.join(f'<rect x="{230+j*50}" y="500" width="30" height="130" fill="#5c5369"/>' for j in range(9))+'</g><g id="microphone"><rect x="920" y="320" width="80" height="230" rx="40" fill="#c2aa85"/><path d="M960 550V850M820 850H1100" stroke="#c2aa85" stroke-width="13"/></g><g id="audience">'+person('back-one',1360,425,.46,'m','rest')+person('back-two',1630,425,.46,'f','rest')+'</g>'
 if k=='secret':return window_room(True)+person('solitary',960,335,.77,'f','rest')+'<g id="empty-seats"><path d="M150 700H430V860H150ZM1490 700H1770V860H1490Z" fill="#746279" opacity=".45"/></g>'
 if k in ('distracted','phone'):return window_room()+person('distracted-one',1050,330,.78,'m','rest')+'<g id="phone"><rect x="1270" y="655" width="150" height="230" rx="20" fill="#514c66"/><rect x="1285" y="680" width="120" height="160" rx="10" fill="#a9c1bd"/><circle cx="1345" cy="859" r="8" fill="#ded0ba"/></g>'
 if k=='pillars':return base(True)+''.join(f'<g id="pillar-{j}"><rect x="{220+j*390}" y="{365+j%2*90}" width="310" height="400" rx="26" fill="{["#8fa39b","#a38bb0","#ba9588","#bba47d"][j]}"/><path d="M{260+j*390} 720H{490+j*390}" stroke="#f0e2cc" stroke-width="10"/></g>' for j in range(4))
 if k=='seek':return base(True)+''.join(f'<g id="seek-{j}"><circle cx="{530+j*430}" cy="470" r="150" fill="{["#9baa9e","#a18aae","#baa17d"][j]}"/><path d="M{455+j*430} 460H{605+j*430}M{530+j*430} 385V535" stroke="#eadaca" stroke-width="11"/></g>' for j in range(3))
 if k=='choices':return base(True)+''.join(f'<g id="choice-{j}"><rect x="{230+j*530}" y="360" width="400" height="400" rx="45" fill="{["#bba47d","#b98a91","#8eaa9f"][j]}"/></g>' for j in range(3))
 return window_room()
