"""Original SVG cast, articulated rigs and landscape sets. No real-person portrait."""
DEFS='''<defs>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#d49b74"/><stop offset=".5" stop-color="#b77956"/><stop offset="1" stop-color="#83513e"/></linearGradient>
<linearGradient id="jacket" x2="1" y2="1"><stop stop-color="#728f82"/><stop offset=".5" stop-color="#42645d"/><stop offset="1" stop-color="#29483f"/></linearGradient>
<linearGradient id="dress" x2="1" y2="1"><stop stop-color="#c7ad80"/><stop offset="1" stop-color="#8d7050"/></linearGradient>
<linearGradient id="wall" x2="1" y2="1"><stop stop-color="#e9dfcb"/><stop offset="1" stop-color="#bfbda5"/></linearGradient>
<linearGradient id="robe" x2="1" y2="1"><stop stop-color="#f8efd9"/><stop offset="1" stop-color="#bdb99d"/></linearGradient>
<radialGradient id="glow"><stop stop-color="#e4c47b" stop-opacity=".8"/><stop offset="1" stop-color="#e4c47b" stop-opacity="0"/></radialGradient>
<linearGradient id="water" x2="1" y2="1"><stop stop-color="#9ec6bc"/><stop offset="1" stop-color="#487b7c"/></linearGradient>
<pattern id="grain" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="7" cy="18" r="1" fill="#fff" opacity=".05"/><circle cx="43" cy="51" r="1" fill="#fff" opacity=".05"/></pattern>
</defs>'''
def mouth(rx=27,ry=3,cy=60):
    return f'M{-rx} {cy} C{-rx} {cy-ry*.7} {-rx*.5} {cy-ry} 0 {cy-ry} C{rx*.5} {cy-ry} {rx} {cy-ry*.7} {rx} {cy} C{rx} {cy+ry*.7} {rx*.5} {cy+ry} 0 {cy+ry} C{-rx*.5} {cy+ry} {-rx} {cy+ry*.7} {-rx} {cy} Z'
def person(pid,x,y,s=1,gender='f',pose='open',emotion='calm',ancient=False,seated=False):
    female=gender=='f';coat='url(#jacket)' if female else '#596c7d'
    if ancient:coat='url(#robe)'
    legs='<path d="M-82 430L-71 670H-15L-4 450L25 670H83L86 430Z" fill="#33494a"/><path d="M-71 657L-105 689Q-110 704-17 702V657M25 657V702H113Q120 687 83 657Z" fill="#253a38"/>'
    if seated:legs='<path d="M-75 430L40 465L60 660H110L95 426L-10 385Z" fill="#586c6d"/><path d="M60 660L65 698H143Q162 687 110 660Z" fill="#91684d"/>'
    hairback='<path d="M-90-100Q-130-75-124 55L-108 160H108L120 47Q133-99 51-143Q-43-165-90-100Z" fill="#27302d"/>' if female else ''
    torso=f'<path d="M-155 190Q-143 143-58 132L0 157L58 132Q143 143 155 190L132 451H-132Z" fill="{coat}"/><path d="M0 160V447M-108 191L-85 442M108 191L85 442" stroke="#1e3e39" stroke-width="4" opacity=".3"/><path d="M-59 133L-87 158L-32 244L0 159L32 244L87 158L59 133L0 159Z" fill="{ '#e3dcc3' if ancient else '#a7beb0'}"/>'
    # Independent shoulder pivots and palm groups enable purposeful gestures.
    arms=''
    for side,sgn in [('left',-1),('right',1)]:
        endx=sgn*(242 if pose=='open' else 176);endy=286 if pose=='open' else 366
        if pose=='point' and side=='right':endx,endy=275,207
        if pose=='listen' and side=='left':endx,endy=-99,75
        arms+=f'<g id="{pid}-{side}-arm"><path d="M{sgn*137} 181Q{sgn*160} 239 {endx} {endy}" stroke="{coat if ancient else ("#567a6c" if female else "#596c7d")}" stroke-width="52" fill="none" stroke-linecap="round"/><path d="M{endx} {endy}l{sgn*17} 21" stroke="#b9805c" stroke-width="25" fill="none" stroke-linecap="round"/><g id="{pid}-{side}-hand" transform="translate({endx+sgn*17} {endy+21})"><path d="M-18 2Q-25-22-12-26L-5-6L0-32Q8-42 12-25L15-4L26-23Q40-29 34-12L23 15Q2 31-14 17Z" fill="url(#skin)"/><path d="M-12 10L9 13" stroke="#855238" stroke-width="2" opacity=".4"/></g></g>'
    brow='M-73-54Q-45-62-21-53M21-53Q45-62 73-54'
    if emotion=='tension':brow='M-73-63L-21-47M21-47L73-63'
    if emotion=='sad':brow='M-73-47Q-45-70-21-62M21-62Q45-70 73-47'
    eyes=''
    for ex in [-46,46]:eyes+=f'<g id="{pid}-eye-{ex}"><path d="M{ex-23}-26Q{ex}-40 {ex+23}-26Q{ex}-11 {ex-23}-26Z" fill="#e4d3b7"/><g class="{pid}-pupils"><ellipse cx="{ex+3}" cy="-25" rx="8" ry="10" fill="#252623"/><circle cx="{ex+5}" cy="-29" r="2.6" fill="#f8e9d1"/></g><path d="M{ex-23}-26Q{ex}-41 {ex+23}-26" stroke="#4e332c" stroke-width="4" fill="none"/></g>'
    hair='<path d="M-95-60Q-125-158-23-160Q91-170 106-72L82-87Q47-124 6-114Q-35-109-75-70Z" fill="#252e2b"/>'
    if female:hair='<ellipse cx="35" cy="-151" rx="54" ry="46" fill="#27302d"/><path d="M-95-56Q-122-157-18-165Q91-163 103-61L80-87Q47-130 5-115Q-54-88-95-56Z" fill="#27302d"/><path d="M-75-111Q-8-161 62-119" stroke="#546052" stroke-width="3" fill="none"/>'
    if ancient:hair='<path d="M-100-42Q-131-155-22-158Q91-161 106-55L91 8L72-68Q1-90-72-54L-86 24Z" fill="#4a382d"/><path d="M-83 20Q-70 93 0 118Q69 100 86 16L69 58Q0 93-67 56Z" fill="#4a382d"/>'
    face=f'<g id="{pid}-head">{hairback}<path d="M-43 80L-49 139Q0 175 49 139L43 80Z" fill="#9c6548"/><path d="M-91-37Q-120-58-114-19Q-107 4-90 9M91-37Q120-58 114-19Q107 4 90 9" fill="#a1684b"/><path d="M-91-72Q-89-137-12-141Q82-142 94-68L89 16Q82 85 0 111Q-77 92-88 20Z" fill="url(#skin)"/><path d="M65-81Q102-21 77 38Q56 86 18 103Q79 78 65 11Z" fill="#764833" opacity=".22"/>{eyes}<path id="{pid}-brows" d="{brow}" stroke="#48362d" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M6-24L-4 20Q5 32 18 20" stroke="#8a5038" stroke-width="4" stroke-linecap="round" fill="none"/>{hair}<g id="{pid}-mouth"><path id="{pid}-lip" d="{mouth(30,5)}" fill="#985c4d"/><path id="{pid}-cavity" d="{mouth(27,1)}" fill="#422c2b"/><path id="{pid}-teeth" d="M-24 52Q0 56 24 52L22 59Q0 62-22 59Z" fill="#f0e1c6" opacity="0"/></g><path d="M-20 83Q0 90 23 82" fill="none" stroke="#d29b76" stroke-width="3" opacity=".45"/>'
    if female:face+='<circle cx="-100" cy="12" r="7" fill="#d3b16f"/><circle cx="100" cy="12" r="7" fill="#d3b16f"/>'
    face+='</g>'
    return f'<g id="{pid}" transform="translate({x} {y}) scale({s})">{legs}{torso}{arms}{face}</g>'
def room(kind='studio'):
    if kind=='studio':
        return '<rect width="1920" height="1080" fill="#173f3b"/><rect width="1920" height="1080" fill="url(#grain)"/><circle cx="650" cy="400" r="650" fill="url(#glow)" opacity=".2"/><path d="M150 100H690V850H150Z" fill="#234e47"/><path d="M190 850V310Q190 140 420 140Q650 140 650 310V850Z" fill="#395c50"/><path d="M0 940L1920 800V1080H0Z" fill="#102f2d"/><path d="M1370 165H1780M1370 225H1660" stroke="#96ae87" stroke-width="2" opacity=".3"/><g id="plant"><path d="M1580 825L1530 650H1700L1660 825Z" fill="#7b8970"/><path d="M1615 664V255" stroke="#66866c" stroke-width="10"/><ellipse cx="1560" cy="460" rx="48" ry="140" fill="#466c55" transform="rotate(-25 1560 460)"/><ellipse cx="1670" cy="370" rx="48" ry="140" fill="#698568" transform="rotate(26 1670 370)"/></g>'
    base='<rect width="1920" height="1080" fill="url(#wall)"/><path d="M0 760L1920 720V1080H0Z" fill="#a5a995"/><rect x="150" y="130" width="510" height="470" rx="110" fill="#cad9cf"/><path d="M405 130V600M150 370H660" stroke="#eee5d0" stroke-width="16"/><path d="M155 135L155 600L1040 870L1000 550Z" fill="#fff1c7" opacity=".17"/><path d="M0 895H1920" stroke="#798b7e" stroke-width="3" opacity=".3"/>'
    if kind=='office':base+='<rect x="1020" y="165" width="665" height="325" rx="20" fill="#527267"/><path d="M1100 245H1580M1100 305H1460M1100 365H1530" stroke="#c3d2b5" stroke-width="9"/><path d="M730 715H1540V750H730Z" fill="#9c805a"/><path d="M800 750V940M1470 750V940" stroke="#76694f" stroke-width="22"/>'
    if kind=='home':base+='<rect x="1100" y="190" width="460" height="270" rx="10" fill="#cbbf9d"/><path d="M1140 420L1280 300L1370 370L1510 250" stroke="#708873" fill="none" stroke-width="13"/><rect x="610" y="620" width="820" height="235" rx="65" fill="#7b9c8c"/><path d="M640 720H1400" stroke="#5c7f6e" stroke-width="8"/>'
    if kind=='school':base+='<rect x="850" y="130" width="800" height="425" rx="10" fill="#385e51"/><path d="M950 255H1510M950 340H1430M950 425H1540" stroke="#d9dcc2" stroke-width="10"/><path d="M280 800H1560" stroke="#9e8261" stroke-width="30"/>'
    if kind=='church':base+='<path d="M1120 150V560M970 300H1270" stroke="#b59b6a" stroke-width="17"/><rect x="965" y="675" width="340" height="175" rx="12" fill="#8d8869"/>'
    return base
def scene(kind,state='calm'):
    if kind in ('correction','dispute','listen','apology','recognize','honor','team','family','work','school','church','service'):
        setting='office' if kind in ('work','team','recognize','correction') else 'school' if kind=='school' else 'church' if kind=='church' else 'home'
        leftPose='listen' if kind=='listen' else 'point' if kind in ('correction','dispute') else 'open'
        c=room(setting)+person('a',540,340,.78,'m',leftPose,'tension' if kind=='dispute' else 'calm')+person('b',1260,340,.78,'f','rest','sad' if kind in ('correction','apology') else 'calm')
        if kind=='family':c+=person('child',970,540,.42,'m','rest')
        if kind=='recognize':c+='<g id="accent"><path d="M1120 175L1140 225L1195 228L1152 266L1163 320L1120 290L1077 320L1088 266L1045 228L1100 225Z" fill="#d7b06c"/></g>'
        if kind=='service':c+='<g id="prop"><rect x="855" y="565" width="170" height="170" rx="14" fill="#b69a66"/><path d="M940 565V735M855 620H1025" stroke="#e6d4a9" stroke-width="10"/></g>'
        return c
    if kind in ('jesus','washing','cloth','basin'):
        c='<rect width="1920" height="1080" fill="#c9c2a5"/><path d="M0 180H1920M0 510H1920" stroke="#e1d7bb" stroke-width="11"/><path d="M180 0V800M1690 0V800" stroke="#aba88c" stroke-width="50"/><path d="M0 830H1920V1080H0Z" fill="#8d9784"/><path d="M150 0L1000 830H1430L500 0Z" fill="#ffe9b0" opacity=".15"/>'
        c+=person('disciple',1320,270,.88,'m','rest','calm',True,True)
        c+='<g id="servant"><path d="M730 530Q820 480 895 535L950 740L720 765Z" fill="url(#robe)"/><path d="M755 745L685 835H910" stroke="#c1bca2" stroke-width="60" fill="none" stroke-linecap="round"/><ellipse cx="815" cy="465" rx="72" ry="90" fill="url(#skin)"/><path d="M743 450Q712 346 795 358Q887 324 890 433L865 409Q800 380 750 462Z" fill="#47372b"/><path d="M770 448Q786 456 801 450M826 452Q840 459 853 453" stroke="#48362d" stroke-width="5" fill="none"/><path d="M813 455L806 484L821 490" stroke="#925a3d" stroke-width="4" fill="none"/><path d="M795 510Q813 516 831 509" stroke="#633c30" stroke-width="4" fill="none"/><path d="M749 480Q813 570 873 472Q862 550 818 557Q760 544 749 480Z" fill="#47372b"/><path d="M846 565L1010 660L1265 782" stroke="#bb805b" stroke-width="36" stroke-linecap="round" fill="none"/></g>'
        c+='<g id="basin"><path d="M1030 820Q1230 1010 1430 820L1380 950H1080Z" fill="#527e79"/><ellipse cx="1230" cy="820" rx="200" ry="40" fill="url(#water)"/><path id="water-ripple" d="M1095 821Q1220 800 1360 825" stroke="#d3e8d3" stroke-width="4" fill="none"/></g><g id="cloth"><path d="M1150 740L1295 785L1270 852L1115 795Z" fill="#f6edce"/><path d="M1160 750L1260 802" stroke="#cec4a4" stroke-width="3"/></g>'
        return c
    if kind=='authority':
        return '<rect width="960" height="1080" fill="#583f3c"/><rect x="960" width="960" height="1080" fill="#2e5e4c"/><path d="M960 120V940" stroke="#ccbb8d" stroke-width="3"/>'+person('a',420,310,.82,'m','point','tension')+person('b',1440,310,.82,'f','open')+'<g fill="#e8d8b5" font-family="Arial" font-size="38" text-anchor="middle"><text x="480" y="205">DOMINER</text><text x="1440" y="205">SERVIR</text></g>'
    if kind=='umbrella':
        return '<rect width="1920" height="1080" fill="#25474b"/><g id="rain" stroke="#779794" stroke-width="3" opacity=".35">'+''.join(f'<path d="M{x} 180L{x-45} 320M{x+30} 530L{x-15} 670"/>' for x in range(130,1880,140))+'</g><g id="umbrella"><path d="M430 505Q960-80 1490 505Q1300 420 1200 505Q1070 410 960 505Q820 410 700 505Q550 420 430 505Z" fill="#bba56e"/><path d="M960 90V825Q960 920 870 880" stroke="#dec58b" stroke-width="17" fill="none"/></g>'+person('a',690,495,.50,'m','rest')+person('b',1220,495,.50,'f','rest')
    if kind=='mirror':
        return room('home')+'<g id="mirror"><rect x="1010" y="105" width="600" height="710" rx="155" fill="#a48c5d"/><rect x="1035" y="130" width="550" height="660" rx="135" fill="#bacfc2"/>'+person('reflection',1320,355,.53,'f','rest')+'<path d="M1080 380L1510 175M1100 680L1535 430" stroke="#edf0d5" stroke-width="13" opacity=".33"/></g>'+person('a',555,310,.82,'f','open')
    if kind in ('fruit','build'):
        c='<rect width="1920" height="1080" fill="#d9d9ba"/><circle cx="1430" cy="280" r="280" fill="#f1e5bf"/><path d="M0 680Q850 420 1920 665V1080H0Z" fill="#a1b49a"/><path d="M0 810Q1000 630 1920 800V1080H0Z" fill="#789581"/>'
        if kind=='fruit':c+='<path d="M1350 850V330M1350 560L1180 350M1350 520L1535 340" stroke="#786b4c" stroke-width="25"/><g id="leaves">'+''.join(f'<ellipse cx="{x}" cy="{y}" rx="145" ry="120" fill="{color}"/>' for x,y,color in [(1180,300,'#719773'),(1350,215,'#8bac7c'),(1535,300,'#537e68'),(1340,400,'#6b9472')])+'</g><g id="fruit"><circle cx="1215" cy="365" r="30" fill="#deaf63"/><circle cx="1490" cy="365" r="30" fill="#deaf63"/></g>'+person('a',610,320,.75,'f','open')
        else:c+=person('a',565,340,.75,'m','open')+person('b',1330,340,.75,'f','open')+'<g id="blocks"><rect x="840" y="590" width="270" height="235" fill="#ad9160"/><rect x="875" y="450" width="200" height="140" fill="#c5b085"/><path d="M860 710H1090M970 590V825" stroke="#e4d4a2" stroke-width="5"/></g>'
        return c
    if kind=='chairs':return room('church')+''.join(f'<g id="chair-{i}"><path d="M{x} 470V740H{x+170}V470Z" fill="{ "#b89c61" if i==2 else "#78927d"}"/><path d="M{x} 680H{x+190}V750H{x}Z" fill="#aab498"/><path d="M{x+15} 750V880M{x+175} 750V880" stroke="#607665" stroke-width="17"/></g>' for i,x in enumerate([360,740,1120]))
    if kind=='swim':return '<rect width="1920" height="1080" fill="#dcd7bd"/><rect y="440" width="1920" height="640" fill="#57847f"/><path id="water-ripple" d="M0 500Q200 460 400 500T800 500T1200 500T1600 500T2000 500M0 660Q200 620 400 660T800 660T1200 660T1600 660T2000 660" stroke="#aad2bd" stroke-width="8" fill="none"/><g id="swimmer"><ellipse cx="1060" cy="440" rx="70" ry="90" fill="url(#skin)"/><path d="M650 590Q900 450 1190 560M1050 540L1340 350" stroke="#c09169" stroke-width="55" stroke-linecap="round" fill="none"/></g>'
    if kind=='bible':return '<rect width="1920" height="1080" fill="#21483f"/><circle cx="960" cy="410" r="530" fill="url(#glow)" opacity=".25"/><g id="book"><path d="M400 365Q675 260 960 380Q1250 260 1520 365V755Q1260 665 960 790Q650 675 400 755Z" fill="#eee2c1" stroke="#a28c5c" stroke-width="13"/><path d="M960 380V790" stroke="#a69366" stroke-width="6"/><path d="M480 460L850 495M480 535L850 570M480 610L850 645M1060 495L1420 460M1060 570L1420 535M1060 645L1420 610" stroke="#c4b692" stroke-width="9"/></g>'
    if kind=='power':return '<rect width="1920" height="1080" fill="#183f3e"/><circle cx="960" cy="475" r="425" fill="url(#glow)" opacity=".55"/><g id="orb"><circle cx="960" cy="475" r="165" fill="#d4bd80"/><circle cx="960" cy="475" r="210" fill="none" stroke="#98b591" stroke-width="4"/><path d="M640 250V700M1280 250V700M640 250H750M640 700H750M1280 250H1170M1280 700H1170" stroke="#d3c089" stroke-width="14" stroke-linecap="round"/></g>'
    if kind=='balance':return '<rect width="1920" height="1080" fill="#dce0c5"/><g id="balance"><path d="M960 250V840M480 450H1440M780 840H1140" stroke="#44685a" stroke-width="20"/><path d="M480 450L340 700H620ZM1440 450L1300 700H1580Z" fill="#95ad90" stroke="#44685a" stroke-width="6"/><circle cx="960" cy="250" r="50" fill="#b49b62"/></g><g fill="#315347" font-family="Arial" font-size="42" text-anchor="middle"><text x="480" y="785">FORCE</text><text x="1440" y="785">AMOUR</text></g>'
    return room('studio')
