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
