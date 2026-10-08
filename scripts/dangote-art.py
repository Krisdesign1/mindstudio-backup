"""Original airport/industrial sets. Only the approved face and articulated rig are reused."""
import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('cast',Path(__file__).with_name('humilite-v2-art.py'));cast=importlib.util.module_from_spec(spec);spec.loader.exec_module(cast)
mouth=cast.mouth
DEFS=cast.DEFS.replace('#728f82','#c58a70').replace('#42645d','#a25e49').replace('#29483f','#74483f')+'''<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#11283e"/><stop offset="1" stop-color="#526a7c"/></linearGradient><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#f0e6d5"/><stop offset="1" stop-color="#ddd1ba"/></linearGradient><linearGradient id="metal" x2="1" y2=".7"><stop stop-color="#b9c6cc"/><stop offset="1" stop-color="#647d8a"/></linearGradient><linearGradient id="copper" x2="1" y2="1"><stop stop-color="#efb08b"/><stop offset="1" stop-color="#a26349"/></linearGradient></defs>'''

def person(pid,x,y,s=1,gender='f',pose='open',emotion='calm',role='',seated=False):
 c=cast.person(pid,x,y,s,gender,pose,emotion,False,seated)
 # Costume changes never touch any face, skin or mouth path.
 if gender=='f':c=c.replace('#567a6c','#ad6a54').replace('#a7beb0','#f0dfcf').replace('#1e3e39','#774737')
 else:c=c.replace('#596c7d',{'young':'#527b94','assistant':'#8e6955','bishop':'#493753','visitor':'#b9a990','worker':'#c49058'}.get(role,'#537285')).replace('#a7beb0','#e2dcd0')
 if role=='bishop':
  c=c.replace('fill="#493753"','fill="#493753"')
  c=c.replace(f'<g id="{pid}-head">',f'<path d="M0 167V295" stroke="#c4a674" stroke-width="3"/><path d="M-12 295H12M0 285V320" stroke="#d9bc7f" stroke-width="5"/><g id="{pid}-head">')
 if role=='worker':c=c.replace(f'<g id="{pid}-head">',f'<g id="{pid}-head"><path d="M-117-145Q-105-240 0-240Q104-240 117-145Z" fill="#d8a55d"/><path d="M-131-145H131" stroke="#a67a3f" stroke-width="18"/>')
 if role=='bishop':
  c=c.replace('fill="#252e2b"','fill="#b4a58f"')
  c=c.replace(f'<g id="{pid}-mouth">',f'<path d="M-83 18Q-70 101 0 119Q73 99 86 18L67 68Q0 98-67 67Z" fill="#b0a18c" opacity=".55"/><g id="{pid}-mouth">')
 if role=='assistant':c=c.replace('fill="#252e2b"','fill="#4a332d"')
 if pid=='daisy':
  c=c.replace('<ellipse cx="35" cy="-151" rx="54" ry="46" fill="#27302d"/>','').replace('fill="#27302d"','fill="#b3a392"').replace('stroke="#546052"','stroke="#d0c0aa"')
 return f'<g id="{pid}-motion">{c}</g>'

def skyline():
 return ''.join(f'<g fill="{color}"><rect x="{x}" y="{y}" width="{w}" height="{850-y}"/>'+''.join(f'<rect x="{x+22+j*38}" y="{y+35+i*57}" width="15" height="20" fill="#b9c6cb" opacity=".22"/>' for i in range(max(1,(800-y)//57)) for j in range(max(1,(w-40)//38)))+'</g>' for x,y,w,color in [(70,490,170,'#24435b'),(270,360,200,'#38576c'),(510,590,180,'#29475e'),(1000,500,150,'#3f6072'),(1200,320,210,'#36536a'),(1460,520,200,'#29475c'),(1690,420,180,'#3c596a')])

def loft():
 return '<rect width="1920" height="1080" fill="url(#sky)"/><circle cx="1450" cy="300" r="150" fill="#c79978" opacity=".55"/>'+skyline()+'<g stroke="#101f2f" stroke-width="23"><path d="M0 140H1920M0 760H1920M330 0V800M960 0V800M1580 0V800"/></g><path d="M0 805L1920 770V1080H0Z" fill="#142d40"/><path d="M0 935L1920 875M650 810L350 1080M1330 790L1650 1080" stroke="#587082" stroke-width="2" opacity=".3"/><rect x="1240" y="665" width="470" height="30" rx="5" fill="#ae7458"/><path d="M1280 695V895M1660 695V880" stroke="#203c50" stroke-width="17"/>'

def aircraft(x=1080,y=450,s=1):
 return f'<g id="aircraft-motion"><g id="aircraft" transform="translate({x} {y}) scale({s})"><path d="M-480 35Q-400-30 220-30L375-147H425L345 22L520 40Q585 83 470 105H-405Q-560 106-480 35Z" fill="#e6e6dc" stroke="#748f9d" stroke-width="5"/><path d="M-70 55L-290 215H-190L185 65" fill="#a6bbc6"/><path d="M-460 73H450" stroke="#ad7257" stroke-width="13"/>'+''.join(f'<rect x="{j}" y="18" width="29" height="24" rx="8" fill="#35596e"/>' for j in range(-335,280,52))+'<path d="M-410 38L-460 45L-450 60H-405Z" fill="#294e66"/><path d="M-285 106V135M245 105V135" stroke="#4c6170" stroke-width="13"/><circle cx="-285" cy="140" r="15" fill="#213748"/><circle cx="245" cy="140" r="15" fill="#213748"/></g></g>'

def airport():
 return '<rect width="1920" height="1080" fill="#b8c7ce"/><rect y="590" width="1920" height="490" fill="#aab5b8"/><path d="M0 760H1920M0 870H1920" stroke="#e1e3d8" stroke-width="12"/>'+aircraft(1150,460,.83)+'<path d="M0 0H1920V180H0Z" fill="#314f63"/><g stroke="#567082" stroke-width="24"><path d="M145 170V940M710 170V940M1330 170V940M1850 170V940"/></g><rect x="165" y="225" width="390" height="135" rx="8" fill="#243e53"/><g fill="#e9deca" font-family="Arial" font-size="45"><text x="210" y="285">DÉPARTS</text><text x="210" y="335" font-size="30">LAGOS</text></g><path d="M0 950H1920V1080H0Z" fill="#5b7483"/>'

def suitcase(x,y,pid='case'):
 return f'<g id="{pid}-motion"><g id="{pid}" transform="translate({x} {y})"><rect x="-65" y="-105" width="130" height="145" rx="16" fill="#9a684d" stroke="#644b3f" stroke-width="5"/><path d="M-30-105V-132H30V-105M-40-105V40M40-105V40" stroke="#c09b75" stroke-width="8" fill="none"/><circle cx="-43" cy="48" r="9" fill="#243b48"/><circle cx="43" cy="48" r="9" fill="#243b48"/></g></g>'

def seat(x,y,pid='seat'):
 return f'<g id="{pid}-motion"><g id="{pid}" transform="translate({x} {y})"><rect x="-110" y="-100" width="220" height="255" rx="35" fill="#6d8693"/><rect x="-95" y="-80" width="190" height="50" rx="15" fill="#ddd8ca"/><path d="M-118 110H118V174H-118Z" fill="#496678"/><path d="M-127 60V170M127 60V170M-70 174V265M70 174V265" stroke="#304b60" stroke-width="18" fill="none"/></g>'

def cabin():
 return '<rect width="1920" height="1080" fill="#d7d9d2"/><path d="M0 0Q960 330 1920 0V150Q960 420 0 150Z" fill="#f0ede1"/><path d="M0 230H1920M0 320H1920" stroke="#9eafb4" stroke-width="7"/>'+''.join(f'<g><rect x="{x}" y="335" width="165" height="220" rx="70" fill="#5e7f91" stroke="#ecede3" stroke-width="23"/><path d="M{x+15} 460H{x+150}" stroke="#c5d3d8" stroke-width="4"/></g>' for x in [180,535,890,1245,1600])+'<path d="M0 790L1920 755V1080H0Z" fill="#526a79"/><path d="M650 820L420 1080M1180 810L1500 1080" stroke="#9aacae" stroke-width="4"/>'

def industry(kind='factory'):
 c='<rect width="1920" height="1080" fill="url(#sky)"/><circle cx="1490" cy="290" r="145" fill="#bd8e70" opacity=".6"/><path d="M0 805H1920V1080H0Z" fill="#233e52"/>'
 if kind in ('refinery','energy','fertilizer'):
  for j,x in enumerate([210,410,780,980,1440,1610]):
   h=[370,250,510,310,440,330][j];c+=f'<g id="tower-{j}"><rect x="{x}" y="{800-h}" width="105" height="{h}" fill="url(#metal)"/><ellipse cx="{x+52}" cy="{800-h}" rx="52" ry="18" fill="#adbdc3"/>'+''.join(f'<path d="M{x-7} {y}H{x+112}" stroke="#435f70" stroke-width="7"/>' for y in range(820-h,780,70))+'</g>'
  c+='<g id="pipes" fill="none" stroke="#b07b5a" stroke-width="19"><path d="M160 820V675H540V770H1170V650H1780V820M340 850H1600V620H1790"/></g><path d="M1150 780V375" stroke="#344f63" stroke-width="26"/><path d="M1150 375Q1110 340 1150 282Q1190 340 1150 375Z" fill="#d7a66f"/>'
 else:
  c+='<path d="M170 810V540L350 440V540L530 440V540L710 440V540L890 440V810Z" fill="#8a9daa"/><path d="M170 540L350 440V540L530 440V540L710 440V540L890 440" stroke="#bb8868" stroke-width="10" fill="none"/>'+''.join(f'<rect x="{x}" y="650" width="100" height="95" fill="#d2ceb8"/>' for x in [235,430,625])
  c+='<g id="silos">'+''.join(f'<rect x="{x}" y="350" width="150" height="455" fill="url(#metal)"/><ellipse cx="{x+75}" cy="350" rx="75" ry="24" fill="#bbc5c7"/><path d="M{x} 790L{x+75} 860L{x+150} 790" fill="#647d8b"/>' for x in [1080,1295,1510])+'</g><g id="conveyor"><path d="M780 690L1330 430" stroke="#29475d" stroke-width="39"/><path d="M780 690L1330 430" stroke="#bc9b76" stroke-width="9" stroke-dasharray="22 20"/></g>'
 return c

def office():
 return '<rect width="1920" height="1080" fill="url(#paper)"/><rect x="120" y="160" width="630" height="490" fill="#9cbbc9"/><path d="M120 410H750M435 160V650" stroke="#f2e9db" stroke-width="18"/><path d="M0 835H1920V1080H0Z" fill="#b6aea0"/><rect x="1190" y="165" width="500" height="435" fill="#354f61"/><path d="M1260 455L1360 405L1460 435L1600 280" stroke="#d8a77c" stroke-width="10" fill="none"/><path d="M800 710H1620V750H800Z" fill="#9d6b51"/><path d="M865 750V935M1550 750V935" stroke="#526574" stroke-width="21"/>'

def scene(kind,variant=0):
 if kind=='host':return loft()
 if kind in ('factory','cement','refinery','energy','fertilizer'):return industry(kind)
 if kind=='sugar':return industry('factory')+'<g id="sacks">'+''.join(f'<path d="M{x} {y}Q{x+60} {y-30} {x+120} {y}L{x+133} {y+160}Q{x+65} {y+193} {x-8} {y+160}Z" fill="#d7c8a7" stroke="#9d8968" stroke-width="5"/><path d="M{x+25} {y+70}H{x+95}" stroke="#ae8060" stroke-width="15"/>' for x,y in [(400,630),(580,640),(760,610)])+'</g>'
 if kind=='airport':return airport()
 if kind=='arrivals':return airport()+person('bishop',430,370,.63,'m','open',role='bishop')+person('visitor',940,390,.60,'m','rest',role='visitor')+person('daisy',1430,385,.60,'f','rest')+suitcase(1150,845)
 if kind in ('full','still','empty','give-seat','rise','assistant','exit','boarding','refusal'):
  c=cabin()
  if kind=='empty':return c+seat(730,580,'seat-a')+seat(1260,580,'seat-b')
  if kind=='boarding':return c+seat(730,580,'seat-a')+seat(1260,580,'seat-b')+person('visitor',715,395,.55,'m','rest',role='visitor',seated=True)+person('daisy',1245,395,.55,'f','rest',seated=True)
  if kind=='exit':return c+seat(380,580,'seat-a')+seat(850,580,'seat-b')+person('young',1180,340,.62,'m','rest',role='young')+person('assistant',1570,385,.55,'m','rest',role='assistant')+suitcase(1350,835,'case-a')
  if kind=='full':return c+''.join(seat(x,580,f'seat-{i}')+person('passenger'+str(i),x,395,.55,'f' if i==2 else 'm','rest',role='young',seated=True) for i,x in enumerate([385,945,1490]))
  if kind in ('rise','give-seat','assistant'):
   c+=seat(720,580,'seat-a')+seat(1300,580,'seat-b')+person('young',705,335,.63,'m','open',role='young')
   c+=person('assistant',1280,340 if kind=='assistant' else 395,.63 if kind=='assistant' else .55,'m','rest',role='assistant',seated=kind!='assistant')
   return c+suitcase(945,855,'case-a')
  return c+seat(720,580,'seat-a')+seat(1260,580,'seat-b')+person('young',705,395,.55,'m','rest','tension' if kind=='refusal' else 'calm',role='young',seated=True)+person('assistant',1245,395,.55,'m','rest',role='assistant',seated=True)
 if kind in ('request','meeting','blessing'):
  c=cabin()+person('bishop',450,335,.70,'m','point' if kind=='request' else 'open',role='bishop')
  if kind=='request':return c+seat(1170,580,'seat-a')+seat(1630,580,'seat-b')+person('young',1155,395,.55,'m','rest',role='young',seated=True)+person('assistant',1615,395,.55,'m','rest',role='assistant',seated=True)
  return c+seat(1670,580,'seat-b')+person('young',1270,340,.70,'m','rest',role='young')+suitcase(1515,880)
 if kind in ('trade','invest','risk','plan','discipline','learn','work','advice','encourage','help'):
  c=office()+person('a',495,345,.75,'m','point' if kind in ('advice','plan','learn') else 'rest',role='young')
  if kind in ('advice','encourage','help'):c+=person('b',1300,360,.72,'f','open')
  if kind in ('trade','work'):c+='<g id="crates">'+''.join(f'<rect x="{x}" y="{y}" width="190" height="155" fill="#ae835c" stroke="#765c47" stroke-width="5"/><path d="M{x+15} {y+35}H{x+175}M{x+15} {y+110}H{x+175}M{x+60} {y}V{y+155}" stroke="#d1aa7a" stroke-width="7"/>' for x,y in [(965,615),(1165,615),(1065,450)])+'</g>'
  if kind in ('invest','risk','plan','discipline','learn'):c+='<g id="ledger"><path d="M930 500L1430 520L1530 695L1000 680Z" fill="#e9dfcb" stroke="#bda782" stroke-width="5"/><path d="M1080 535L1370 550M1100 585L1400 598M1110 630L1430 645" stroke="#8e9e9f" stroke-width="8"/><path d="M1480 500L1320 670" stroke="#b77155" stroke-width="15"/></g>'
  return c
 if kind=='construction':return industry('factory')+'<g id="crane" stroke="#bf8c5f" stroke-width="14" fill="none"><path d="M955 290V850M640 320H1510M955 290L640 320M955 290L1510 320M1450 320V490"/><path d="M925 330L985 430L925 530L985 630L925 730L985 830" stroke-width="7"/></g>'+person('worker',440,420,.60,'m','point',role='worker')
 if kind=='calendar':return '<rect width="1920" height="1080" fill="#172c40"/><g id="calendar"><rect x="420" y="260" width="1080" height="545" rx="20" fill="#e6dfce"/><path d="M420 260H1500V380H420Z" fill="#a66d52"/><path d="M590 210V305M1330 210V305" stroke="#a3b4bd" stroke-width="22" stroke-linecap="round"/>'+''.join(f'<rect x="{530+j*175}" y="{440+i*100}" width="110" height="55" rx="5" fill="#b8c4c4"/>' for i in range(3) for j in range(5))+'</g>'
 if kind=='timeline':return '<rect width="1920" height="1080" fill="url(#paper)"/><path d="M270 580H1650" stroke="#567d92" stroke-width="14"/>'+''.join(f'<g id="milestone-{i}"><circle cx="{x}" cy="580" r="28" fill="#bd8060"/><path d="M{x} 610V760" stroke="#b59c7e" stroke-width="3"/></g>' for i,x in enumerate([300,650,1000,1350,1630]))+suitcase(300,515)+ '<path d="M1450 485V325H1570V485M1400 485H1720V510H1400Z" fill="#718c9c"/>'
 if kind=='door':return '<rect width="1920" height="1080" fill="#b9c6ce"/><path d="M780 180H1210V850H780Z" fill="#314e66"/><g id="door"><path d="M790 190L1135 245V850L790 840Z" fill="#ac7c5c"/><circle cx="1085" cy="565" r="12" fill="#e9c58e"/></g><path d="M1210 300L1920 730V1080H1210Z" fill="#f0d5a2" opacity=".38"/>'+person('a',485,350,.73,'m','open',role='young')
 if kind=='waiting':return office()+person('a',500,350,.75,'m','rest',role='young')+'<g id="clock"><circle cx="1320" cy="445" r="185" fill="#e7ddc7" stroke="#a47459" stroke-width="12"/><path d="M1320 300V445L1430 500" stroke="#426179" stroke-width="14" fill="none" stroke-linecap="round"/></g>'
 if kind=='walk':return '<rect width="1920" height="1080" fill="url(#sky)"/><circle cx="1450" cy="290" r="180" fill="#d5a27d"/><path d="M0 670L1920 580V1080H0Z" fill="#456475"/><path d="M730 1080L1250 600H1370L1150 1080Z" fill="#b89471"/><path d="M1290 605V320H1540" stroke="#d8baa0" stroke-width="10" fill="none"/>'+person('a',980,350,.72,'m','rest',role='young')
 if kind in ('type','comparison','question'):return '<rect width="1920" height="1080" fill="#122b41"/><path d="M0 0L720 0L250 1080H0Z" fill="#294759"/><path d="M1430 0H1920V1080H900Z" fill="#563c3b" opacity=".45"/><path d="M0 880H1920" stroke="#a47055" stroke-width="3"/>'
 if kind=='map':return '<rect width="1920" height="1080" fill="#142d43"/><g id="africa"><path d="M740 260L1040 235L1230 345L1335 550L1240 615L1150 810L995 870L895 680L755 650L630 480Z" fill="#8fa7b0" stroke="#bb8b68" stroke-width="8"/>'+''.join(f'<circle id="node-{i}" cx="{x}" cy="{y}" r="17" fill="#e2b187"/><path d="M{x} {y}L1030 585" stroke="#c79672" stroke-width="3" fill="none" opacity=".65"/>' for i,(x,y) in enumerate([(790,500),(1030,585),(1135,730),(1170,450),(930,385)]))+'</g>'
 return loft()
