"""Native SVG scenes for sacrifice, isolation and rebuilding. No generated media."""
import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('cast',Path(__file__).with_name('humilite-v2-art.py'));cast=importlib.util.module_from_spec(spec);spec.loader.exec_module(cast)
mouth=cast.mouth
DEFS=cast.DEFS.replace('#728f82','#b87f9f').replace('#42645d','#81536f').replace('#29483f','#503b57')+'''<defs><linearGradient id="evening" x2="0" y2="1"><stop stop-color="#332a43"/><stop offset="1" stop-color="#745068"/></linearGradient><linearGradient id="cream" x2="1" y2="1"><stop stop-color="#f4e8dc"/><stop offset="1" stop-color="#d9c7c4"/></linearGradient><linearGradient id="day" x2="0" y2="1"><stop stop-color="#d4dcd7"/><stop offset="1" stop-color="#f6e6ce"/></linearGradient></defs>'''

def person(pid,x,y,s=1,gender='f',pose='open',emotion='calm',role='',seated=False):
 c=cast.person(pid,x,y,s,gender,pose,emotion,False,seated)
 if pid=='host':
  c=c.replace('#567a6c','#8e617e').replace('#a7beb0','#f5e3d6').replace('#1e3e39','#523b55')
 elif gender=='f':
  c=c.replace('url(#jacket)','#54858b' if role!='relative' else '#a87858').replace('#567a6c','#54858b' if role!='relative' else '#a87858').replace('#a7beb0','#c5ddda')
  c=c.replace('<ellipse cx="35" cy="-151" rx="54" ry="46" fill="#27302d"/>','').replace('fill="#27302d"','fill="#413331"').replace('stroke="#546052"','stroke="#786358"')
  if role=='mother':c=c.replace('fill="#413331"','fill="#91847c"')
  # A distinct bob silhouette and eye placement distinguish the fictional woman from the host.
  c=c.replace('cx="-43"','cx="-47"').replace('cx="49"','cx="45"')
 else:
  c=c.replace('#596c7d','#806079' if role=='partner' else '#8e846e').replace('#a7beb0','#e5d6c8')
  if role=='partner':c=c.replace('fill="#252e2b"','fill="#382c32"')
 return f'<g id="{pid}-motion">{c}</g>'

def plant(x=1630,y=850):
 return f'<g transform="translate({x} {y})"><path d="M-65 0H65L46 130H-46Z" fill="#a16f77"/><path d="M0 0V-300" stroke="#617877" stroke-width="11"/>'+''.join(f'<ellipse cx="{a}" cy="{b}" rx="35" ry="90" fill="{c}" transform="rotate({r} {a} {b})"/>' for a,b,c,r in [(-42,-210,'#60857e',-36),(42,-160,'#78958a',35),(-42,-95,'#60857e',-35),(35,-280,'#8aa79a',28)])+'</g>'

def room(mood='light',variant=0):
 dark=mood=='dark';wall='#514152' if dark else 'url(#cream)';floor='#312d40' if dark else '#c7b5b7'
 return f'<rect width="1920" height="1080" fill="{wall}"/><rect x="1120" y="135" width="620" height="470" rx="18" fill="{"url(#evening)" if dark else "url(#day)"}"/><path d="M1430 135V605M1120 375H1740" stroke="{"#84727b" if dark else "#fbf2e6"}" stroke-width="18"/><path d="M0 800L1920 760V1080H0Z" fill="{floor}"/><path d="M0 940L1920 890M450 790L320 1080M1450 780L1650 1080" stroke="#ad999e" stroke-width="2" opacity=".45"/><path d="M300 185H780V450H300Z" fill="#ad8796"/><path d="M350 400L470 270L595 360L730 235" fill="none" stroke="#e7ccc0" stroke-width="15"/>'+plant()

def sofa():
 return '<g id="sofa"><rect x="450" y="590" width="1040" height="300" rx="75" fill="#997589"/><rect x="470" y="700" width="1000" height="155" rx="42" fill="#806378"/><path d="M490 730V880M1450 730V880" stroke="#684e65" stroke-width="50" stroke-linecap="round"/><path d="M600 885V945M1330 885V945" stroke="#423648" stroke-width="20"/></g>'

def phone(x=960,y=495,s=1,kind='calls'):
 c=f'<g id="phone-motion"><g id="phone" transform="translate({x} {y}) scale({s})"><rect x="-155" y="-270" width="310" height="540" rx="37" fill="#383444" stroke="#736075" stroke-width="8"/><rect x="-133" y="-236" width="266" height="458" rx="16" fill="#eee0d8"/><path d="M-48-251H48" stroke="#a294a0" stroke-width="7" stroke-linecap="round"/>'
 if kind=='messages':
  c+='<g id="messages"><rect x="-112" y="-175" width="192" height="77" rx="15" fill="#b893a7"/><path d="M-94-148H48M-94-124H15" stroke="#f5e6dc" stroke-width="7"/><rect x="-50" y="-66" width="161" height="75" rx="15" fill="#bed0c9"/><path d="M-30-40H86M-30-15H65" stroke="#6b8880" stroke-width="7"/><rect x="-112" y="45" width="202" height="89" rx="15" fill="#b893a7"/><path d="M-94 73H55M-94 101H20" stroke="#f5e6dc" stroke-width="7"/></g>'
 else:
  c+='<circle cx="0" cy="-116" r="61" fill="#b49caa"/><circle cx="0" cy="-135" r="20" fill="#eee0d8"/><path d="M-37-85Q0-126 37-85" fill="#eee0d8"/><path d="M-90 10H90M-90 58H54M-90 106H72" stroke="#b8a4b2" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="179" r="27" fill="#64938a"/><path d="M-12 170L10 187" stroke="#e5ece0" stroke-width="10" stroke-linecap="round"/>'
 return c+'<circle cx="0" cy="245" r="10" fill="#a89aa5"/></g></g>'

def wedding():
 return '<rect width="1920" height="1080" fill="url(#cream)"/><path d="M0 840H1920V1080H0Z" fill="#c6b7bc"/><path d="M660 760V350Q660 130 960 130Q1260 130 1260 350V760" stroke="#b8918a" stroke-width="19" fill="none"/>'+''.join(f'<circle cx="{x}" cy="{y}" r="28" fill="{c}"/>' for x,y,c in [(680,300,'#e3a9b2'),(715,240,'#f1d1c5'),(780,185,'#b28a9c'),(1200,230,'#e3a9b2'),(1250,315,'#f1d1c5'),(1140,185,'#b28a9c')])+'<path d="M100 240Q960 520 1820 240" stroke="#ac8b83" stroke-width="3" fill="none"/>'+''.join(f'<circle cx="{x}" cy="{330-abs(x-960)/12}" r="10" fill="#fff0c9"/>' for x in range(180,1800,120))+'<ellipse cx="420" cy="740" rx="250" ry="60" fill="#f6e8dc"/><path d="M195 740H650V865H195Z" fill="#d7b4b8"/><path d="M310 865V970M555 865V970" stroke="#947e85" stroke-width="16"/>'

def table():return '<g id="table"><path d="M640 720H1450V765H640Z" fill="#a1787a"/><path d="M710 765V945M1380 765V945" stroke="#725669" stroke-width="22"/></g>'
def paper(x=1110,y=620):return f'<g id="paper"><path d="M{x-160} {y-100}L{x+185} {y-90}L{x+220} {y+105}L{x-140} {y+115}Z" fill="#f8e9db" stroke="#ba9da6" stroke-width="4"/>'+''.join(f'<path d="M{x-110} {y+j*35}H{x+130}" stroke="#bdabb0" stroke-width="6"/>' for j in [-1,0,1,2])+'</g>'
def money(x=1070,y=700):return f'<g id="money"><path d="M{x-160} {y-50}L{x+150} {y-70}L{x+175} {y+55}L{x-145} {y+70}Z" fill="#90aaa1" stroke="#526f70" stroke-width="5"/><ellipse cx="{x}" cy="{y}" rx="43" ry="32" fill="#d2dac0"/><path d="M{x-125} {y-10}H{x-65}M{x+65} {y-10}H{x+130}" stroke="#d4e0c9" stroke-width="10"/></g>'

def hallway():
 return '<rect width="1920" height="1080" fill="#c7c8c6"/><path d="M0 0L690 150V850L0 1080M1920 0L1230 150V850L1920 1080" fill="#dfd8d3"/><path d="M690 850H1230L1920 1080H0Z" fill="#9da6a4"/><path d="M765 210H1160V850H765Z" fill="#718e92"/><path d="M958 210V850" stroke="#dce3d8" stroke-width="7"/><path d="M865 420H1060M965 330V520" stroke="#edddd5" stroke-width="18"/><path d="M90 160H500V680H90Z" fill="#a5b9b7"/><path d="M140 265H430M140 325H380" stroke="#dfe6de" stroke-width="12"/>'

def park():
 return '<rect width="1920" height="1080" fill="url(#day)"/><circle cx="1460" cy="260" r="155" fill="#f0d2ad"/><path d="M0 650Q900 490 1920 650V1080H0Z" fill="#91ada0"/><path d="M0 850Q1000 640 1920 780V1080H0Z" fill="#78968c"/><path d="M480 1080L1010 650H1160L970 1080Z" fill="#d3c1ac"/><g fill="#74938a"><ellipse cx="250" cy="350" rx="170" ry="200"/><ellipse cx="1710" cy="350" rx="145" ry="180"/></g><path d="M250 510V820M1710 500V820" stroke="#8f7772" stroke-width="20"/>'

def studio():return room('dark')+'<path d="M110 115H840V710H110Z" fill="#6d4c67"/><path d="M185 155V650M260 155V650M335 155V650M410 155V650M485 155V650M560 155V650M635 155V650M710 155V650" stroke="#9a748c" stroke-width="3" opacity=".45"/>'

def scene(kind,variant=0):
 if kind=='host':return studio()
 if kind in ('type','question','comparison'):
  return '<rect width="1920" height="1080" fill="#362d43"/><path d="M0 0H670V1080H0Z" fill="#62445d"/><path d="M1290 0H1920V1080H1290Z" fill="#55777a" opacity=".35"/><path d="M200 790H1720" stroke="#d1a9ab" stroke-width="3"/>'
 if kind in ('wedding','serve','meet','student'):
  c=wedding()
  if kind=='student':return c+person('partner',1200,310,.78,'m','rest',role='partner')+'<g id="bag"><path d="M870 670Q870 550 1000 550Q1120 550 1120 680V890H870Z" fill="#736f84"/><path d="M910 730H1080V840H910Z" fill="#aaa2aa"/></g>'
  c+=person('woman',600,350,.73,'f','open',role='woman')
  if kind in ('wedding','meet'):c+=person('partner',1340,350,.73,'m','open',role='partner')
  if kind=='serve':c+='<g id="tray"><ellipse cx="865" cy="635" rx="190" ry="26" fill="#b5c2bb"/><g fill="#eee5da"><path d="M750 535H795V625H750Z"/><path d="M835 535H880V625H835Z"/><path d="M920 535H965V625H920Z"/></g></g>'
  return c
 if kind in ('phone','messages','numbers','notification'):
  return room('dark' if kind=='messages' else 'light')+phone(1100,500,1.18,'messages' if kind=='messages' else 'calls')+person('woman',430,350,.74,'f','rest','sad' if kind=='messages' else 'calm',role='woman')
 if kind in ('couple','support','encourage','conversation','argument','family','apology','free-talk'):
  c=room('dark' if kind in ('argument','support') else 'light')+sofa()
  c+=person('woman',660,410,.73,'f','listen' if kind=='conversation' else 'open','sad' if kind in ('argument','apology') else 'calm',role='woman')
  c+=person('partner' if kind in ('couple','support','encourage','argument') else 'relative',1290,410,.73,'m' if kind in ('couple','support','encourage','argument','conversation') else 'f','point' if kind=='argument' else 'open',role='partner' if kind in ('couple','support','encourage','argument') else 'relative')
  return c
 if kind in ('job','projects','work'):
  c=room()+person('partner',470,350,.72,'m','point',role='partner')+table()+paper()
  c+='<g id="laptop"><path d="M1110 445H1410V670H1110Z" fill="#62546f"/><path d="M1130 465H1390V650H1130Z" fill="#b4c8c0"/><path d="M1060 675H1460L1490 705H1040Z" fill="#8f8498"/></g>'
  if kind!='job':c+=person('woman',820,430,.5,'f','rest',role='woman')
  return c
 if kind in ('money','loan','withdraw','give','budget'):
  if kind=='withdraw':return room()+person('woman',570,335,.75,'f','point',role='woman')+'<g id="atm"><rect x="1080" y="150" width="550" height="740" rx="20" fill="#6b6a7f"/><rect x="1140" y="230" width="430" height="250" rx="10" fill="#bbcec5"/><path d="M1160 540H1510M1160 620H1420" stroke="#d5ccd3" stroke-width="20"/><rect x="1150" y="705" width="300" height="75" fill="#3d3c4e"/></g>'+money(1250,754)
  c=room()+table()+paper()+money()
  if kind=='budget':return c+phone(470,510,.8)
  return c+person('woman',420,345,.72,'f','point' if kind in ('loan','give') else 'rest',role='woman')+(person('partner',1540,365,.64,'m','rest',role='partner') if kind=='give' else '')
 if kind in ('hospital','mother','operation'):return hallway()+person('woman',550,350,.74,'f','rest','sad',role='woman')+(person('relative',1450,380,.64,'f','open','sad',role='relative') if kind=='hospital' else '<g id="bed"><rect x="1110" y="650" width="650" height="195" rx="20" fill="#e9e5da"/><path d="M1090 510V910M1750 640V910" stroke="#8a9e9e" stroke-width="20"/><rect x="1170" y="570" width="180" height="85" rx="35" fill="#c9d7ce"/></g>')
 if kind in ('choice','pressure'):
  return hallway()+person('woman',960,390,.67,'f','rest','sad',role='woman')+'<path d="M960 855L540 750M960 855L1400 750" stroke="#b78092" stroke-width="12" fill="none"/><g fill="#4e3d52" font-family="Arial" font-size="48" text-anchor="middle"><text x="450" y="210">Sa mère</text><text x="1470" y="210">Son compagnon</text></g>'
 if kind in ('refuse','distance'):return room('dark')+person('woman',575,360,.72,'f','rest','sad',role='woman')+person('relative',1480,365,.7,'f','open','sad',role='relative')+'<path d="M960 200V850" stroke="#987783" stroke-width="3" stroke-dasharray="15 15"/>'
 if kind in ('grief','alone','silence'):
  return room('dark')+sofa()+person('woman',960,380,.72,'f','rest','sad',role='woman',seated=True)+'<g id="frame"><rect x="270" y="500" width="200" height="250" fill="#b896a0"/><rect x="288" y="518" width="164" height="214" fill="#decfc8"/><ellipse cx="370" cy="580" rx="37" ry="45" fill="#9c7e72"/><path d="M308 708Q310 627 370 627Q430 627 435 708" fill="#9c7e72"/></g>'
 if kind in ('isolation','network'):
  c='<rect width="1920" height="1080" fill="#443347"/>'+person('woman',960,375,.63,'f','rest','sad',role='woman')
  for j,(x,y) in enumerate([(270,390),(500,780),(1500,390),(1680,780)]):
   c+=f'<g id="connection-{j}"><path d="M{x} {y}L960 585" stroke="#b8ada8" stroke-width="5" stroke-dasharray="12 12" opacity=".55"/><circle cx="{x}" cy="{y}" r="102" fill="#8e7487"/><circle cx="{x}" cy="{y-24}" r="30" fill="#e5d5ce"/><path d="M{x-55} {y+60}Q{x-55} {y+4} {x} {y+4}Q{x+55} {y+4} {x+55} {y+60}" fill="#e5d5ce"/></g>'
  return c
 if kind in ('identity','mirror','recognize'):
  return room('dark' if kind!='recognize' else 'light')+'<g id="mirror"><rect x="1040" y="145" width="570" height="690" rx="120" fill="#997a89"/><rect x="1060" y="165" width="530" height="650" rx="110" fill="#b2c7c2"/>'+person('reflection',1325,390,.46,'f','rest','sad' if kind!='recognize' else 'calm',role='woman')+'<path d="M1100 460L1480 200M1110 660L1520 385" stroke="#f0e8df" stroke-width="10" opacity=".3"/></g>'+person('woman',510,330,.77,'f','rest','sad' if kind!='recognize' else 'calm',role='woman')
 if kind=='orbit':
  return '<rect width="1920" height="1080" fill="#443347"/><ellipse cx="1260" cy="560" rx="490" ry="290" fill="none" stroke="#b48f9e" stroke-width="3"/>'+person('partner',1240,335,.66,'m','rest',role='partner')+person('woman',450,425,.52,'f','rest','sad',role='woman')+'<path d="M715 565H870" stroke="#c7a9af" stroke-width="4"/>'
 if kind=='calendar':return room('dark')+'<g id="calendar"><rect x="495" y="255" width="930" height="560" rx="25" fill="#ecded6"/><path d="M495 255H1425V375H495Z" fill="#ae7a96"/><path d="M650 205V300M1280 205V300" stroke="#cfb7bc" stroke-width="25" stroke-linecap="round"/>'+''.join(f'<rect x="{600+j*155}" y="{440+i*100}" width="95" height="57" rx="6" fill="#bac8c2"/>' for i in range(3) for j in range(5))+'</g>'
 if kind in ('exit','door','prison'):
  c='<rect width="1920" height="1080" fill="#4b3c52"/><path d="M0 845H1920V1080H0Z" fill="#302d40"/><path d="M1090 130H1670V875H1090Z" fill="url(#day)"/><g id="door"><path d="M1100 145L1450 245V850L1100 865Z" fill="#926c82"/><circle cx="1400" cy="570" r="15" fill="#f1d7b8"/></g>'+person('woman',700,350,.74,'f','rest','sad' if kind=='prison' else 'calm',role='woman')
  if kind=='prison':c+='<g id="bars">'+''.join(f'<path d="M{x} 160V870" stroke="#927f91" stroke-width="20"/>' for x in range(350,1080,110))+'</g>'
  return c
 if kind in ('rebuild','repair','journal'):
  return room()+person('woman',510,345,.73,'f','point',role='woman')+table()+paper()+ '<g id="pieces"><path d="M1250 590L1310 530L1375 590L1310 650Z" fill="#bd91a3"/><path d="M1320 640L1390 580L1450 640L1390 700Z" fill="#93b1a7"/></g>'
 if kind in ('walk','hope','friends'):
  return park()+person('woman',680 if kind=='friends' else 930,340,.75,'f','open' if kind=='friends' else 'rest',role='woman')+(person('relative',1320,340,.75,'f','open',role='relative') if kind=='friends' else '')
 if kind=='faith':return room()+person('woman',460,345,.73,'f','rest',role='woman')+'<g id="book"><path d="M800 510Q1000 425 1210 520Q1420 425 1600 510V790Q1410 715 1210 805Q1010 715 800 790Z" fill="#f5e7d2" stroke="#a98c80" stroke-width="9"/><path d="M1210 520V805M900 565L1110 600M900 635L1110 670M1320 600L1500 565M1320 670L1500 635" stroke="#bcaaa0" stroke-width="6"/></g>'
 if kind=='boundaries':return room()+person('woman',670,335,.77,'f','open',role='woman')+'<path id="boundary" d="M1140 190V870" stroke="#a47691" stroke-width="12"/><g font-family="Arial" font-size="95" fill="#6d4e68"><text x="1300" y="560">NON</text></g>'
 return room()+person('woman',960,340,.76,'f','rest',role='woman')
