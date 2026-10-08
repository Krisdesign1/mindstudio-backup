"""Original portrait-format vector sets for the Athom's Short.

All drawings are native SVG, with intentional depth, material, and story props.
Every set has a different geography and camera. This module has no side effects.
The film builder must prefix IDs and url(#...) references per composition.
"""

DEFS = '''<defs>
<linearGradient id="set-night" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#0d1527"/><stop offset=".55" stop-color="#233650"/><stop offset="1" stop-color="#101929"/></linearGradient>
<linearGradient id="set-plaster" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ece0c8"/><stop offset=".5" stop-color="#cfb89a"/><stop offset="1" stop-color="#947b68"/></linearGradient>
<linearGradient id="set-wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bd7d56"/><stop offset=".45" stop-color="#9c5b3e"/><stop offset="1" stop-color="#653b30"/></linearGradient>
<linearGradient id="set-curtain" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#311f31"/><stop offset=".25" stop-color="#754253"/><stop offset=".48" stop-color="#422a3c"/><stop offset=".76" stop-color="#895260"/><stop offset="1" stop-color="#342234"/></linearGradient>
<linearGradient id="set-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#192c49"/><stop offset=".65" stop-color="#637c91"/><stop offset="1" stop-color="#c9ada0"/></linearGradient>
<linearGradient id="set-dawn" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#688397"/><stop offset=".52" stop-color="#e7be8a"/><stop offset="1" stop-color="#fff1ca"/></linearGradient>
<linearGradient id="set-brass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6d697"/><stop offset=".4" stop-color="#c69a56"/><stop offset="1" stop-color="#715036"/></linearGradient>
<linearGradient id="set-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d59e79"/><stop offset=".55" stop-color="#b17a56"/><stop offset="1" stop-color="#855238"/></linearGradient>
<radialGradient id="set-lamp"><stop stop-color="#ffdf9e" stop-opacity=".7"/><stop offset=".48" stop-color="#d39c5c" stop-opacity=".2"/><stop offset="1" stop-color="#d39c5c" stop-opacity="0"/></radialGradient>
<radialGradient id="set-vignette"><stop offset=".5" stop-color="#071225" stop-opacity="0"/><stop offset="1" stop-color="#071225" stop-opacity=".4"/></radialGradient>
<pattern id="set-linen" width="13" height="13" patternUnits="userSpaceOnUse"><path d="M0 2H13M2 0V13" stroke="#f4ead5" stroke-width=".8" opacity=".14"/></pattern>
<pattern id="set-paper" width="27" height="27" patternUnits="userSpaceOnUse"><path d="M2 7L9 9M20 20L24 19" stroke="#fff5db" stroke-width=".9" opacity=".12"/></pattern>
<pattern id="set-grain" width="61" height="53" patternUnits="userSpaceOnUse"><circle cx="7" cy="11" r=".9" fill="#f4ead5" opacity=".055"/><circle cx="37" cy="31" r="1.2" fill="#0b1727" opacity=".12"/><path d="M47 8L49 9" stroke="#f4ead5" opacity=".06"/></pattern>
<clipPath id="set-cloth-mask"><rect id="set-cloth-reveal" x="238" y="824" width="536" height="429"/></clipPath>
</defs>'''


def rect(x, y, w, h, fill, rx=0, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" {extra}/>'


def path(d, fill='none', stroke=None, width=1, extra=''):
    s = f' stroke="{stroke}" stroke-width="{width}"' if stroke else ''
    return f'<path d="{d}" fill="{fill}"{s} {extra}/>'


def lines(coords, color, width=2, opacity=1):
    return path(''.join(f'M{x1} {y1}L{x2} {y2}' for x1,y1,x2,y2 in coords), stroke=color, width=width, extra=f'opacity="{opacity}"')


def ground(y=1450, color='#182337'):
    return path(f'M0 {y}H1080V1920H0Z', color)


def plant(x, y, s=1, color='#49635e', pot='#aa6a50'):
    return f'<g transform="translate({x} {y}) scale({s})">'+path('M-47 0L-34 89H37L51 0Z',pot)+path('M0 0V-225M0-63L-48-122M0-112L47-169',stroke='#52665d',width=8)+''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="20" ry="50" fill="{co}" transform="rotate({ro} {cx} {cy})"/>' for cx,cy,ro,co in [(-38,-141,-36,color),(33,-188,31,color),(-7,-221,-8,'#6b7b67'),(39,-97,42,'#657c6b')])+'</g>'


def boards(x,y,w,h,vertical=False):
    if vertical:
        return lines([(a,y,a,y+h) for a in range(x+18,x+w,42)], '#643d31', 2,.25)
    return lines([(x,b,x+w,b) for b in range(y+15,y+h,34)], '#5b372f',2,.25)


def crowd_person(i,x,y,s,coat,skin='#a67151',turn=0):
    # Native, distinct small silent listeners. Each has a separate head group.
    return f'<g id="set-crowd-{i}" transform="translate({x} {y}) scale({s})">'+path('M-29 32Q-40 40-46 92H46Q42 40 29 32Z',coat)+path('M-11 20V41L0 49L11 41V20Z',skin)+f'<g id="set-crowd-head-{i}" transform="rotate({turn})"><ellipse cy="1" rx="23" ry="30" fill="{skin}"/>'+path('M-23-5Q-25-32 0-33Q24-31 23-7L14-18Q-8-11-23-5Z','#1c2430')+path('M-12 2h5M7 2h5',stroke='#322b2b',width=2)+path('M-4 18h8',stroke='#674439',width=2)+'</g></g>'


def polished(svg):
    return svg+rect(0,0,1080,1920,'url(#set-grain)')+rect(0,0,1080,1920,'url(#set-vignette)')


def scene(kind):
    """SVG inner markup. Use foreground(kind) AFTER people where appropriate."""
    if kind == 'portrait':
        svg=rect(0,0,1080,1920,'url(#set-night)')
        svg+=path('M76 1420V452Q76 241 470 240Q864 241 864 452V1420Z','#2d405b')
        svg+=path('M124 1410V465Q124 296 471 290Q816 297 816 465V1410Z','#142137',stroke='#a78c65',width=3)
        svg+=lines([(143,430,143,1390),(180,403,180,1390),(780,403,780,1390),(815,430,815,1390)],'#506078',3,.5)
        svg+='<ellipse cx="468" cy="822" rx="398" ry="552" fill="url(#set-lamp)" opacity=".23"/>'
        svg+=path('M0 1460L906 1390L1080 1487V1920H0Z','#121b2d')+lines([(0,1630,928,1460),(0,1860,952,1460),(590,1920,964,1460)],'#394256',2,.5)
        svg+=path('M92 1422H847V1440H92Z','#bc9b6a')+rect(280,350,385,5,'#d6ad72',2)
    elif kind == 'backstage':
        svg=rect(0,0,1080,1920,'#151b2b')+path('M125 223L954 308V1450L125 1400Z','#071321')
        svg+=path('M377 309L925 342V1345L377 1270Z','#7e735e')
        svg+=path('M377 900L925 815V1345L377 1270Z','#b98e5b')
        svg+=lines([(400,976,925,899),(410,1103,925,1053),(430,1242,925,1222)],'#775b41',2,.6)
        svg+='<g id="set-curtain-reveal">'+path('M-80 112Q90 135 277 165L284 1381Q93 1412-30 1450Z','url(#set-curtain)')+path('M37 160Q90 800 17 1407M137 174Q197 795 131 1387M235 181Q227 905 236 1385',stroke='#ac6971',width=4,extra='opacity=".3"')+'</g>'
        svg+=path('M899 133L1080 161V1467L952 1438Z','url(#set-curtain)')
        svg+=lines([(937,200,975,1374),(994,186,1041,1430)],'#a7656d',4,.25)
        svg+='<g id="set-warm-stage-light">'+path('M574 278L863 278L694 1130L246 1040Z','#ffe4aa',extra='opacity=".13"')+'</g>'
        svg+=ground(1460,'#0d1525')+path('M126 1410L965 1451L961 1475L125 1430Z','#735846')
    elif kind == 'pulpit':
        svg=rect(0,0,1080,1920,'url(#set-plaster)')
        svg+=path('M655 114V947H926V114Z','#a98977')+path('M682 195Q682 105 790 105Q899 105 899 195V887H682Z','#32455b')
        svg+=lines([(790,123,790,887),(682,382,899,382),(682,645,899,645)],'#d4bd92',10)
        svg+=path('M40 113V1330M173 85V1290',stroke='#ac917e',width=35)+path('M0 1400L1080 1260V1920H0Z','#583f39')
        svg+=path('M0 1390L1014 1258L1043 1285L0 1424Z','#d0ae84')+path('M0 1495L1080 1330',stroke='#98755d',width=14)
        svg+='<g id="set-window-shaft">'+path('M682 290L900 290L566 1440L182 1450Z','#fff0c4',extra='opacity=".14"')+'</g>'
        svg+=plant(865,1210,.8,'#596e59','#87614b')
        svg+=path('M120 332L346 303V540L120 569Z','#bb9a79')+path('M136 348L330 323V520L136 547Z','#536477')
    elif kind == 'music':
        svg=rect(0,0,1080,1920,'#182234')+path('M0 410L1080 219V1525L0 1630Z','#283b55')
        svg+='<ellipse cx="295" cy="731" rx="536" ry="667" fill="url(#set-lamp)" opacity=".2"/>'
        svg+='<g id="set-microphone" transform="translate(309 548) rotate(-21)"><rect x="-52" y="0" width="104" height="243" rx="50" fill="#bac0c2"/><rect x="-52" y="0" width="104" height="145" rx="48" fill="#869599"/>'+lines([(-43,y,43,y) for y in range(26,137,16)],'#45556a',4)+lines([(x,10,x,145) for x in range(-32,44,16)],'#c3cccb',3,.6)+rect(-50,149,100,20,'#273449',8)+path('M-36 236L-19 621H19L36 236Z','#203044')+path('M0 245V625',stroke='#617a88',width=6)+path('M0 625Q100 738 177 808',stroke='#0a1425',width=15)+'</g>'
        svg+='<g id="set-guitar" transform="translate(611 690) rotate(16)">'+path('M-82 235Q-183 282-158 416Q-206 474-171 581Q-138 708 0 706Q147 696 173 566Q189 468 139 424Q152 275 66 235L32 2H-32Z','url(#set-wood)',stroke='#d29a65',width=7)+path('M-62 261Q-138 302-112 417Q-161 498-112 596Q-80 663 0 661Q94 661 120 580Q142 502 96 434Q126 312 43 266Z','#a96d42')+'<circle cy="403" r="65" fill="#402d2b"/><circle cy="403" r="78" fill="none" stroke="#dab575" stroke-width="8"/>'+rect(-30,0,60,354,'#42342e',4)+rect(-38,-103,76,113,'#4d3830',8)+lines([(-30,y,30,y) for y in range(28,348,25)],'#9d8b73',3)+lines([(x,-76,x,565) for x in [-17,-10,-3,4,11,18]],'#e9d1aa',1.5)+rect(-64,559,128,22,'#3c2b2a',4)+''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="#c3a477"/>' for x,y in [(-46,-78),(46,-69),(-46,-43),(46,-35),(-46,-10),(46,-1)])+'</g>'
        svg+=path('M0 1417L1080 1502V1920H0Z','#101a2b')+path('M181 1273Q255 1264 327 1301L327 1408L181 1379Z','#eddec4')+path('M257 1290V1397',stroke='#b5a28a',width=4)+lines([(202,1300,238,1309),(269,1321,308,1331),(202,1339,238,1346)],'#92775f',3)
    elif kind == 'assembly':
        svg=rect(0,0,1080,1920,'url(#set-night)')+path('M125 326Q498 102 887 320L934 734H72Z','#3b4257')
        svg+=path('M232 400Q498 258 765 400V729H232Z','#1a293f')+path('M413 403V717M567 390V717',stroke='#687183',width=2)
        svg+=path('M85 733L914 733L967 810L38 810Z','#b4875b')+path('M39 813H968V840H39Z','#715542')
        svg+='<g id="set-stage-glow">'+path('M198 301L389 307L482 733H82Z','#ffda93',extra='opacity=".1"')+path('M823 295L694 303L571 733H941Z','#ebc387',extra='opacity=".1"')+'</g>'
        svg+=path('M446 836L595 836L745 1522H286Z','#514842')
        coats=['#4c6973','#925c51','#707766','#ab845c','#67738a','#6f5758']
        for row,(yy,ss) in enumerate([(906,.9),(1044,1.18),(1235,1.65)]):
            for col,xx in enumerate([112,255,704,864]):
                shift=(col%2)*13
                i=row*4+col
                svg+=crowd_person(i,xx,yy-shift,ss,coats[i%6],['#a77150','#ca9670','#764c37'][i%3],[-4,2,-2,4][col])
                svg+=path(f'M{xx-43*ss} {yy+67*ss}Q{xx} {yy+46*ss} {xx+43*ss} {yy+67*ss}V{yy+118*ss}H{xx-43*ss}Z','#674852',stroke='#9b7774',width=2)
        svg+=path('M-31 1600V1510Q90 1440 210 1510V1640M886 1640V1523Q993 1460 1115 1530V1640','#593f4c')+path('M0 1650H1080V1920H0Z','#142034')
    elif kind == 'listener':
        svg=rect(0,0,1080,1920,'#667789')+rect(0,190,1080,1120,'#7a8692')
        svg+=path('M0 1280L1080 1212V1920H0Z','#2e3f50')+rect(67,269,411,546,'#364e69',13)+rect(84,286,377,509,'#a4b3b5',4)
        svg+=lines([(272,286,272,795),(84,550,461,550)],'#e1d8c5',15)+path('M87 633L244 541L447 599V794H87Z','#526983')+path('M87 348L451 573L451 697L87 474Z','#f2e6cf',extra='opacity=".12"')
        svg+=path('M657 615H1080V1186H657Z','#526276')+lines([(681,674,1080,674),(681,893,1080,893),(729,622,729,1183)],'#243c52',8)
        svg+=''.join(rect(748+i*40,714+((i%3)*13),26,175-((i%3)*13),['#b67855','#a4ab94','#e4c891','#516580'][i%4],2) for i in range(7))
        svg+=path('M57 1073Q69 985 187 985H595Q696 985 707 1100V1363H57Z','#ba765e')+path('M102 1114H664V1345H102Z','#a66051')+lines([(328,998,328,1278),(91,1184,676,1184)],'#744546',4,.45)
        svg+=plant(839,1270,.65,'#56766b','#a47759')
    elif kind == 'spotlights':
        svg=rect(0,0,1080,1920,'#0b1321')+lines([(0,233,1080,233),(0,320,1080,320)],'#3e475d',22)
        svg+=lines([(50,233,130,320),(230,233,310,320),(410,233,490,320),(590,233,670,320),(770,233,850,320),(950,233,1030,320)],'#344157',8)
        svg+='<g id="set-light-beams">'+path('M207 384L81 1381L803 1381L314 384Z','#f8d79c',extra='opacity=".16"')+path('M786 392L305 1392L1059 1392L897 392Z','#c8d8db',extra='opacity=".095"')+'</g>'
        svg+='<g id="set-lights">'+''.join(f'<g transform="translate({x} 327) rotate({ro})">'+rect(-68,0,136,88,'#344558',10)+rect(-81,59,162,44,'#202d42',4)+path('M-58 103H58L45 117H-45Z','#efd09a')+'</g>' for x,ro in [(248,-15),(843,24)])+'</g>'
        svg+=path('M0 1410L1080 1373V1920H0Z','#172237')+path('M0 1405L1080 1368',stroke='#6c6b67',width=5)
        svg+=path('M790 631H1080V1428H834Z','#18202f')+lines([(858,653,861,1401),(912,649,912,1387),(969,641,969,1383)],'#303248',3)
        svg+=path('M118 1226H505V1325H118Z','#282f42',stroke='#64717d',width=3)+rect(144,1248,319,36,'#202738',5)+rect(494,1245,15,63,'#8b825e',2)+path('M376 1328Q535 1390 612 1369T790 1387',stroke='#080e19',width=14)
    elif kind == 'quiet':
        svg=rect(0,0,1080,1920,'#253348')+rect(0,150,1080,1300,'#334259')
        svg+=path('M0 1460L1080 1350V1920H0Z','#1c2a3b')+rect(461,270,470,708,'#121c30',18)+rect(488,295,415,653,'#334b67',7)
        svg+='<g id="set-window-rain">'+lines([(x,337,x-17,424) for x in range(508,903,57)]+[(x,684,x-15,763) for x in range(520,903,67)],'#a5bdc7',3,.35)+'</g>'
        svg+=lines([(696,295,696,949),(488,622,903,622)],'#71818d',12)+path('M488 819L605 760L733 811L891 738V947H488Z','#21334e')
        svg+='<ellipse cx="299" cy="1030" rx="370" ry="430" fill="url(#set-lamp)"/>'
        svg+='<g id="set-reading-lamp">'+path('M110 840L149 673H325L365 840Z','#d8bb87',stroke='#b09065',width=3)+path('M149 678L135 833M200 675L196 835M275 675L287 835M325 680L351 835',stroke='#937c5d',width=2,extra='opacity=".5"')+path('M237 840V1180',stroke='#bb9361',width=10)+'<ellipse cx="237" cy="1189" rx="75" ry="14" fill="#675247"/></g>'
        svg+=path('M54 1201H382V1240H54Z','url(#set-wood)')+path('M85 1240V1455M347 1240V1418',stroke='#654234',width=18)
        svg+=path('M465 1090Q464 1020 530 1020H781Q846 1020 844 1118V1440H472Z','#546874')+path('M510 1223H812',stroke='#344b5b',width=8)
        svg+=path('M95 1210L174 1185L298 1198L217 1230Z','#efe0bd')+path('M173 1185L214 1227',stroke='#aa8d67',width=3)
    elif kind == 'empty':
        svg=rect(0,0,1080,1920,'#1a263c')+path('M0 328L1080 160V1920H0Z','#26354c')
        for i,(x,y,s) in enumerate([(771,449,.57),(468,574,.69),(179,747,.85),(-175,985,1.2)]):
            svg+=f'<g id="set-vacant-chair-{i}" transform="translate({x} {y}) scale({s})">'+path('M-48 0Q0-19 180-5Q226 2 230 48L222 355H-36Z','#805364',stroke='#a7777c',width=6)+path('M-33 52Q80 21 188 44V289H-28Z','#714b5c')+path('M-39 355L273 327L312 421L-43 460Z','#ac7774',stroke='#d3a189',width=5)+path('M-15 459V618M270 425V577',stroke='#354154',width=22)+path('M9 500H239',stroke='#4b5669',width=14)+path('M8 67Q88 50 157 62',stroke='#ca968a',width=4,extra='opacity=".35"')+'</g>'
        svg+=path('M719 840L1080 729V1920H945Z','#3a3c4a')+lines([(716,879,1080,764),(793,1084,1080,998),(865,1301,1080,1246)],'#c29e7c',5,.35)
        svg+='<g id="set-empty-light">'+path('M217 161L831 271L264 1457L0 1168Z','#fde0a8',extra='opacity=".065"')+'</g>'
        svg+=path('M462 991L551 954L603 1131L505 1159Z','#e4d1a8')+path('M481 1012L538 991M486 1038L544 1018M494 1067L552 1046',stroke='#a5947c',width=3)
    elif kind == 'loom':
        svg=rect(0,0,1080,1920,'#273747')+path('M0 1420H1080V1920H0Z','#192b3b')
        svg+='<ellipse cx="535" cy="837" rx="493" ry="552" fill="url(#set-lamp)" opacity=".25"/>'
        svg+=path('M150 366H854V436H150Z','url(#set-wood)')+path('M148 410L116 1406H191L230 410ZM781 410L817 1406H892L855 410Z','url(#set-wood)')
        svg+=lines([(182,375,180,426),(817,375,817,426)],'#e1b580',3,.4)
        svg+='<g id="set-warp">'+lines([(x,437,x,1207) for x in range(240,770,18)],'#d8c8a2',3,.65)+'</g>'
        svg+=rect(207,614,594,33,'#9e6446',5)+lines([(x,615,x,648) for x in range(235,782,17)],'#402b2d',4)
        svg+='<g id="set-cloth" clip-path="url(#set-cloth-mask)">'+path('M240 828H770V1204Q624 1272 502 1224Q366 1260 240 1210Z','#b9795b')+rect(240,828,530,400,'url(#set-linen)')+lines([(240,867,770,867),(240,932,770,932),(240,998,770,998),(240,1111,770,1111)],'#eed6ab',9,.75)+lines([(281,828,281,1210),(398,828,398,1239),(640,828,640,1237),(724,828,724,1218)],'#334b5d',11,.9)+'</g>'
        svg+='<g id="set-shuttle">'+path('M310 724Q493 647 650 724Q503 776 310 724Z','url(#set-brass)')+path('M392 711Q505 678 568 713L556 733Q503 749 392 732Z','#654940')+rect(432,699,92,51,'#ecd7ae',16)+lines([(448,700,448,749),(461,700,461,749),(474,700,474,749),(487,700,487,749),(500,700,500,749)],'#aa8762',2)+'</g>'
        svg+=path('M166 1408H861',stroke='#8f6049',width=40)+path('M157 1410L98 1491H931L857 1410Z','#3f3940')
    elif kind == 'rain':
        svg=rect(0,0,1080,1920,'url(#set-sky)')+path('M0 638L96 602V367H302V601L419 534V293H612V560L704 488V229H956V657L1080 622V1514H0Z','#344b66')
        svg+=''.join(rect(x,y,19,39,'#d7bc84',2,extra='opacity=".45"') for x in [131,185,239,450,506,562,746,805,864,918] for y in [420,511,598])
        svg+=path('M0 1410L1080 1373V1920H0Z','#2b4058')+path('M0 1510L1080 1444M0 1700L1080 1595',stroke='#718194',width=4,extra='opacity=".25"')
        svg+=path('M105 558L878 468L946 556L118 654Z','#142b43')+path('M141 657V1419M859 573V1388',stroke='#b0b9b5',width=21)+path('M169 650L834 573V1312L169 1367Z','#94b1b9',extra='opacity=".14"')
        svg+=lines([(450,619,450,1343)],'#8093a0',7,.5)+path('M225 1207L732 1168L775 1204L240 1249Z','#ae8265')+path('M248 1247V1377M730 1215V1370',stroke='#536577',width=19)
        svg+='<g id="set-rain">'+lines([(x,y,x-33,y+99) for x in range(18,1050,109) for y in [350,770,1201]],'#bdd0d3',3,.35)+'</g>'
        svg+='<g id="set-reflection" opacity=".18">'+path('M164 1472L302 1470L400 1831H139Z','#cfbb95')+path('M768 1452L858 1450L963 1770H879Z','#cad9d5')+'</g>'
        svg+=rect(199,760,162,281,'#324862',7)+rect(215,781,131,242,'#b2b5a3',2)+path('M239 817H322M239 856H291M239 938H307',stroke='#647c86',width=7)
    elif kind == 'work':
        svg=rect(0,0,1080,1920,'url(#set-wood)')+boards(0,0,1080,1920)
        svg+='<g transform="translate(122 431) rotate(-9)">'+rect(15,22,589,739,'#3e302e',19)+rect(0,0,583,741,'#eadcbe',13)+rect(10,10,563,721,'#f1e5cb',7)+lines([(x,25,x,705) for x in [50]],'#c07f69',2,.4)+lines([(77,y,526,y) for y in range(108,689,47)],'#9ba6a1',2,.45)+'</g>'
        svg+='<g transform="translate(122 431) rotate(-9)"><clipPath id="set-note-mask"><rect id="set-note-reveal" x="102" y="119" width="332" height="55"/></clipPath><g id="set-written-lines" clip-path="url(#set-note-mask)">'+path('M105 137Q189 124 257 141T430 143',stroke='#576e7a',width=4,extra='stroke-linecap="round"')+'</g>'+path('M105 184Q191 180 264 186T400 189M105 231Q240 218 411 235M105 325Q241 311 459 330M105 372Q203 359 298 375T453 381M105 420Q281 408 417 428',stroke='#576e7a',width=4,extra='stroke-linecap="round"')+'</g>'
        svg+='<g id="set-pencil"><g transform="translate(320 430) rotate(30)">'+path('M-9-242H9V104L0 146L-9 104Z','#e4bd77',stroke='#68524b',width=2)+path('M-9 104H9L0 146Z','#ead9b6')+path('M-3 132H3L0 146Z','#334356')+rect(-9,-270,18,28,'#a5766c',3)+grip_hand()+'</g></g>'
        svg+='<g id="set-cup" transform="translate(782 592)"><ellipse cx="11" cy="21" rx="103" ry="102" fill="#3b2c2b" opacity=".3"/><circle r="89" fill="#ebe0c8"/><circle r="71" fill="#6d4433"/><circle cx="-9" cy="-11" r="57" fill="#805237"/><path d="M-61-18Q-4-72 47-22" fill="none" stroke="#bf9263" stroke-width="4"/><path d="M75-39Q161-58 150 21Q136 49 78 42" fill="none" stroke="#e8d5b4" stroke-width="21"/></g>'
        svg+=rect(693,993,225,140,'#465e6a',9)+path('M720 1023H890M720 1054H829M720 1083H865',stroke='#a6b2ae',width=4)+plant(855,1365,.77,'#516857','#ac7354')
        svg+=path('M21 280L1018 261',stroke='#b5815f',width=3)
    elif kind == 'persevere':
        svg=rect(0,0,1080,1920,'#405268')+path('M0 246H1080V975H0Z','#526176')+rect(109,344,594,413,'#bda77e',13)+lines([(x,368,x,729) for x in range(141,682,36)],'#967e60',1,.5)+lines([(133,y,680,y) for y in range(377,741,36)],'#967e60',1,.5)
        svg+=path('M180 439V598Q213 634 248 598V439M296 420L322 446L334 575L312 589L299 452ZM430 414V568L459 577V412',stroke='#2a3a4e',width=17,extra='stroke-linejoin="round"')
        svg+=path('M0 1104L958 987L1080 1049V1256L0 1400Z','url(#set-wood)')+path('M0 1232L1080 1112V1260L0 1395Z','#704837')+lines([(0,1154,1017,1040),(0,1210,1057,1090)],'#dfa36b',3,.35)
        svg+='<g id="set-repair-frame" transform="translate(431 825) rotate(-9)">'+path('M-202 0H204V206H-202Z','#b99060',stroke='#e5c294',width=7)+path('M-166 34H168V170H-166Z','#4e6174')+path('M-188 188L182 18',stroke='#6e4e39',width=6)+rect(-213,-8,55,52,'#3f4655',3)+rect(163,-8,54,52,'#3f4655',3)+'</g>'
        svg+=path('M274 1081L819 994L841 1026L301 1114Z','#cf9a68',stroke='#e8bf8d',width=3)+path('M303 1091L816 1010',stroke='#915d3d',width=2)
        svg+='<g id="set-plane"><g transform="translate(698 994) rotate(-9)">'+path('M-95 0H99L83 44H-106Z','#253448')+path('M-41 0V-64Q-41-102-10-93Q13-91 10-56V0Z','#9d6345')+path('M40 0L28-84L52-91L62 0Z','#929c9c')+'<g transform="translate(-12 -59) scale(.7) rotate(-11)">'+grip_hand()+'</g></g></g>'
        svg+='<g id="set-wood-shavings">'+path('M66 1063Q107 1008 120 1056T165 1061M749 929Q790 877 807 921T848 929M278 1180Q326 1111 342 1164T375 1173',stroke='#e0b17e',width=8,extra='stroke-linecap="round"')+'</g>'
        svg+=path('M98 1393V1738M921 1281V1634',stroke='#452f2b',width=58)
    elif kind == 'season':
        svg=rect(0,0,1080,1920,'url(#set-sky)')+'<circle cx="193" cy="421" r="126" fill="#dfab7b" opacity=".6"/>'
        svg+=path('M0 792H87V574H225V763H300V530H441V775H493V651H642V844H709V592H820V776H910V691H1080V1460H0Z','#3c4b61')
        svg+=path('M0 930H1080V1450H0Z','#222f46')+path('M0 1397L1080 1267V1920H0Z','#29364b')
        svg+=path('M0 1196L1080 1077V1267L0 1397Z','#536071')+path('M0 1171L1080 1052V1077L0 1211Z','#adb0a2')
        svg+=lines([(160,1194,160,1320),(397,1161,397,1291),(644,1139,644,1268),(865,1110,865,1241)],'#3e4f63',4)
        svg+=plant(108,1380,.83,'#53645a','#9e7258')+plant(916,1288,.68,'#4a655f','#836150')
        svg+=path('M0 1650L870 1333M335 1920L972 1300',stroke='#445066',width=3,extra='opacity=".4"')
    elif kind == 'dawn':
        svg=rect(0,0,1080,1920,'#555768')+rect(0,183,1080,1150,'#65707b')+path('M0 1393L1080 1241V1920H0Z','#56504c')
        svg+=path('M153 330H868V1251H153Z','url(#set-dawn)')+path('M153 915Q384 768 585 840T868 790V1251H153Z','#77918d')+path('M153 1111Q470 944 868 1054V1251H153Z','#566e71')
        svg+='<g id="set-shutter-left">'+path('M83 343L389 318V1283L83 1321Z','url(#set-wood)')+lines([(104,y,367,y-29) for y in range(389,1273,66)],'#d4966a',8,.6)+path('M338 415V1152',stroke='#623a30',width=10)+'</g>'
        svg+='<g id="set-shutter-right">'+path('M659 318L927 341V1307L659 1283Z','url(#set-wood)')+lines([(682,y-21,905,y) for y in range(389,1273,66)],'#d4966a',8,.6)+path('M706 415V1152',stroke='#623a30',width=10)+'</g>'
        svg+='<g id="set-morning-shaft">'+path('M383 947H660L819 1539L243 1617Z','#fff0be',extra='opacity=".18"')+'</g>'
        svg+=path('M0 1115H155V1153H0Z','#986a4d')+path('M106 1153V1433',stroke='#694535',width=21)+path('M0 1141Q41 1105 94 1137V1185H0Z','#d3b385')
    elif kind == 'single':
        svg=rect(0,0,1080,1920,'#c5b59e')+path('M0 176L780 247V1370L0 1472Z','#d9c7a8')+path('M780 247L1080 151V1478L780 1370Z','#ab9482')+path('M0 1471L780 1370L1080 1478V1920H0Z','#796759')
        svg+=rect(190,322,278,478,'#796d60',7)+rect(211,344,237,434,'#9baaa8',3)+path('M328 344V779M212 555H448',stroke='#dfccaa',width=15)
        svg+=path('M215 408L448 416L847 1455L538 1490Z','#fff1c6',extra='opacity=".11"')
        svg+='<g id="set-stool"><ellipse cx="520" cy="1161" rx="125" ry="37" fill="#997452" stroke="#c4a47a" stroke-width="4"/>'+path('M429 1177L408 1438M609 1177L648 1407',stroke='#614737',width=25)+path('M429 1303L627 1286',stroke='#75543c',width=18)+'</g>'
        svg+=path('M760 777L796 788V932L760 921Z','#957963')+path('M763 875L794 884',stroke='#d0ae78',width=5)+rect(117,1465,575,132,'#9b8c77',8)+rect(117,1465,575,132,'url(#set-linen)',8)
    elif kind == 'heart':
        svg=rect(0,0,1080,1920,'#17293a')+'<ellipse cx="510" cy="921" rx="516" ry="716" fill="url(#set-lamp)" opacity=".38"/>'
        svg+='<g id="set-available-hands">'+open_hands(503,1051,1.0)+'</g>'
        svg+='<g id="set-heart-light"><ellipse cx="501" cy="923" rx="160" ry="163" fill="url(#set-lamp)" opacity=".65"/>'+path('M423 930Q411 903 429 870Q450 835 488 867Q524 830 552 851Q590 879 582 911Q570 946 496 991Q446 967 423 930Z','#e9bc78',extra='opacity=".75"')+path('M493 876Q455 847 437 881',stroke='#fff1c9',width=4,extra='opacity=".75"')+'</g>'
        svg+=path('M199 1660L285 1285L482 1218L596 1219L792 1297L883 1660Z','#405365')+rect(0,1770,1080,150,'#132335')
    elif kind == 'prayer':
        svg=rect(0,0,1080,1920,'#6b7381')+path('M0 1300L1080 1221V1920H0Z','#3a485b')+rect(627,267,305,504,'#3a4b61',13)+rect(645,286,270,465,'#7b8e9d',4)+lines([(780,286,780,751),(645,520,915,520)],'#c6bfae',10)
        svg+=path('M657 284Q617 506 659 750H607Q568 505 610 284ZM906 284Q966 525 915 751H965Q1010 507 955 284Z','#b8a693')+path('M0 797L472 746L541 1059L0 1117Z','#c6b69d')
        svg+=path('M0 937L462 886L500 1265L0 1337Z','#99776a')+path('M0 1093L483 1041L500 1267L0 1337Z','#856456')+path('M0 978L457 932',stroke='#e6d0ad',width=8)+path('M27 828L264 802L276 906L32 940Z','#e2d4b9')
        svg+=path('M81 1297L100 1447M423 1279L458 1402',stroke='#40333a',width=35)+rect(579,960,295,193,'#aa7e5e',8)+path('M611 1153V1357M838 1153V1330',stroke='#705142',width=19)
        svg+=path('M636 982L712 966L794 981L719 1003Z','#efdfb9')+path('M713 967L719 1003',stroke='#aa9775',width=3)
        svg+=path('M319 1467L751 1399L895 1556L454 1627Z','#52677b')+path('M360 1480L751 1419M427 1585L840 1526',stroke='#93a1a4',width=6,extra='opacity=".45"')
    elif kind == 'belief':
        svg=rect(0,0,1080,1920,'#16263c')+path('M0 311H1080V1450H0Z','#2c3c4e')+lines([(0,y,1080,y) for y in [410,642,878,1109,1343]],'#52616c',5,.45)+lines([(x,y,x,y+229) for x,y in [(243,410),(735,410),(0,642),(490,642),(982,642),(243,878),(735,878),(0,1109),(490,1109),(982,1109)]],'#52616c',4,.45)
        svg+=path('M0 1516L1080 1435V1920H0Z','#172739')+'<ellipse cx="513" cy="945" rx="358" ry="477" fill="url(#set-lamp)" opacity=".3"/>'
        svg+=path('M149 1310L875 1249L890 1304L163 1374Z','#baac91')+path('M163 1374L890 1304V1447L163 1522Z','#6d6c63')
        svg+='<g id="set-candle"><ellipse cx="516" cy="1298" rx="107" ry="21" fill="#233243"/><ellipse cx="516" cy="1279" rx="104" ry="17" fill="url(#set-brass)"/>'+path('M474 1074H558V1278Q516 1303 474 1278Z','#e7d8b5')+'<ellipse cx="516" cy="1075" rx="42" ry="11" fill="#f3e7cc"/>'+path('M515 1063V1028',stroke='#674b37',width=4)+'</g>'
        svg+='<g id="set-flame">'+path('M515 1040Q468 1007 507 952Q528 925 521 908Q573 978 552 1018Q543 1040 515 1040Z','#e9ae5b')+path('M522 1030Q498 1011 520 978Q546 1012 536 1027Z','#fff2b7')+'</g>'
        svg+='<g id="set-protective-hand">'+path('M717 1398Q714 1303 681 1228L652 1162Q635 1131 618 1145Q606 1157 620 1192L648 1265L630 1244Q608 1223 595 1240Q587 1253 605 1274L644 1323L663 1427Z','url(#set-skin)',stroke='#a16e4f',width=3)+path('M671 1252L646 1114Q640 1089 625 1093Q610 1099 616 1124L640 1239M665 1237L663 1088Q663 1066 680 1069Q690 1074 691 1095L704 1249M698 1264L702 1120Q704 1098 719 1101Q734 1107 730 1130L729 1302',stroke='#b5825d',width=24,extra='stroke-linecap="round"')+path('M661 1399L736 1387L765 1602L649 1602Z','#40576b')+'</g>'
    elif kind == 'advance':
        svg=rect(0,0,1080,1920,'url(#set-sky)')+path('M0 484Q400 308 1080 480V1395H0Z','#486c76')+path('M0 902Q425 743 1080 825V1465H0Z','#355867')
        svg+=path('M78 1920L323 381H505L965 1920Z','#9d795b')+lines([(118,1648,881,1648),(159,1416,811,1416),(197,1221,752,1221),(229,1061,704,1061),(253,922,663,922),(274,803,627,803),(291,699,596,699),(305,608,569,608),(318,527,546,527),(326,456,526,456)],'#544338',width=14)
        svg+=lines([(283,377,0,1920),(572,377,1078,1920)],'#d8c094',14)+lines([(239,634,101,1466),(660,634,936,1466)],'#405568',9)
        svg+=lines([(244,599,241,931),(217,849,208,1194),(174,1201,155,1630),(676,645,688,957),(753,916,775,1242),(860,1263,895,1622)],'#ded0aa',8)
        svg+='<g id="set-planted-foot" transform="translate(428 1080) rotate(-7)">'+path('M-42-236L42-226L25-19H-33Z','#2d4154')+path('M-36-32H26Q25-12 66 13L99 43Q103 62 74 70H-56Q-64 57-54 34Z','#344654')+path('M-52 67H74',stroke='#bfb29a',width=7)+'</g>'
        svg+='<g id="set-stepping-foot"><g transform="translate(614 1381) rotate(10)">'+path('M-47-368L48-358L29-25H-36Z','#384e64')+path('M-36-42H29L46 1L101 50Q111 67 87 80H-57Q-72 65-62 41Z','#243447')+path('M-62 77H85',stroke='#c6ba9f',width=9)+path('M-23-7L21-5M-21 11L28 13M-18 29L39 32',stroke='#8b9ca5',width=5)+'</g></g>'
        svg+=path('M338 1149L484 1149L493 1179L335 1175Z','#304755',extra='opacity=".3"')+'<g id="set-step-shadow">'+path('M493 1475L754 1475L791 1526L484 1519Z','#253c4b',extra='opacity=".3"')+'</g>'
    elif kind == 'unseen':
        svg=rect(0,0,1080,1920,'#102035')+path('M0 176L338 320V1292L0 1530Z','#25384d')+path('M1080 200L717 332V1305L1080 1537Z','#1e3047')+path('M338 321L717 333V1306H338Z','#33475b')
        svg+=path('M0 1530L338 1292L717 1306L1080 1537V1920H0Z','#2c3f52')+lines([(54,1845,433,1298),(1004,1845,615,1298),(0,1576,1080,1576),(0,1741,1080,1741)],'#637488',2,.25)
        svg+=path('M0 561L190 604V1085L0 1172Z','#16283d')+lines([(0,732,190,749),(81,581,81,1125)],'#576b7c',8)+path('M909 567L1080 526V1074L909 1104Z','#102035')+lines([(909,734,1080,701),(996,548,996,1086)],'#4b6075',8)
        svg+=path('M468 725H592V1130H468Z','#8c8273')+path('M480 748H580V1130H480Z','#101f33')
        svg+='<g id="set-street-lamp">'+path('M852 1249V467L816 438H692',stroke='#a18b69',width=12)+path('M657 438H732L744 464H645Z','#303c4b')+path('M652 465H735L718 485H669Z','#e5c189')+'</g>'
        svg+='<g id="set-pavement-light">'+path('M666 489L365 1530H847L729 489Z','#edc88d',extra='opacity=".09"')+'</g>'
        svg+=plant(259,1340,.6,'#405e58','#615448')+rect(74,1299,70,130,'#3d5366',6)
    elif kind == 'foundation':
        svg=rect(0,0,1080,1920,'#8f9290')+path('M0 258H1080V805H0Z','#bbc1b8')+path('M0 800H1080V1020H0Z','#807c6c')+path('M0 1018H1080V1920H0Z','#5c493e')
        svg+=path('M140 387H795V858H140Z','#ddd4bd')+path('M104 395L478 214L839 395Z','#455667')+path('M169 413H758V450H169Z','#b9a587')+rect(274,480,163,215,'#6b7f86',7)+rect(541,480,163,215,'#6b7f86',7)+lines([(355,487,355,689),(622,487,622,689)],'#dcc5a1',7)
        svg+='<g id="set-hidden-foundation">'+path('M173 901H756V965H173Z','#9d9f94')+path('M218 952V1397H284V952ZM645 952V1397H711V952Z','#b2aca0')+path('M179 1391H324V1490H179ZM605 1391H755V1490H605Z','#858b88')+path('M273 1066L646 1394M273 1394L646 1066',stroke='#6d777c',width=28)+path('M0 1534Q160 1507 256 1551T464 1517T696 1548T901 1515T1080 1544',stroke='#7d6551',width=4)+path('M0 1742Q118 1703 280 1748T499 1718T741 1763T1080 1733',stroke='#846a50',width=5)+'</g>'
        svg+=path('M0 987H1080',stroke='#e1c79b',width=5)+path('M84 1132L145 1162L137 1190L75 1161ZM826 1351L874 1324L888 1348L836 1377Z','#a38c67')
        svg+=path('M377 836L413 801L506 807L535 841Z','#a66a4c')+path('M385 835H524V854H385Z','#683c32')
    elif kind == 'time':
        svg=rect(0,0,1080,1920,'#b4ab98')+path('M0 352H1080V1364H0Z','#c9bda5')+path('M0 1390L1080 1302V1920H0Z','#7c6656')
        svg+='<g id="set-clock" transform="translate(297 692)"><circle cx="16" cy="26" r="212" fill="#827564" opacity=".3"/><circle r="214" fill="url(#set-wood)"/><circle r="190" fill="#efe4c8"/><circle r="180" fill="none" stroke="#bea481" stroke-width="3"/>'+''.join(f'<path d="M0-151V-169" stroke="#5c6370" stroke-width="{6 if i%3==0 else 3}" transform="rotate({i*30})"/>' for i in range(12))+'<g id="set-clock-hands"><path d="M0 10V-97" stroke="#3c4e60" stroke-width="13" stroke-linecap="round"/><path d="M-10 4L115 40" stroke="#3c4e60" stroke-width="9" stroke-linecap="round"/><path d="M0 25L-56-124" stroke="#b97050" stroke-width="3"/></g><circle r="10" fill="#b77651"/></g>'
        svg+='<g id="set-calendar" transform="translate(606 692) rotate(8)">'+path('M-85 0H237V399L-72 428Z','#716154',extra='opacity=".3"')+rect(-101,-15,332,411,'#f2e3c5',9)+rect(-101,-15,332,70,'#985a47',8)+path('M-79 69H208',stroke='#bdab8d',width=2)+lines([(x,90,x,366) for x in [-42,17,76,135,194]],'#bdab8d',2)+lines([(-78,y,208,y) for y in [145,200,255,310,366]],'#bdab8d',2)+''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="#7b8590"/>' for x in [-61,-2,57,116,175] for y in [115,169,222,278,337])+path('M-94 394L220 387L154 345Z','#dbc6a1')+'<g id="set-calendar-turn" opacity="0"><path id="set-calendar-page" d="M-97 59H229V385Q170 398 110 391L-97 394Z" fill="#f6e8c8"/></g>'+path('M-42-44V7M161-44V7',stroke='#b7a180',width=12,extra='stroke-linecap="round"')+'</g>'
        svg+=path('M105 1330L607 1268L838 1332L335 1411Z','url(#set-wood)')+path('M335 1411L838 1332V1424L335 1505Z','#7b4d36')+path('M103 1330L335 1411V1505L103 1424Z','#926044')
        svg+='<g id="set-pencil-time">'+path('M232 1342L541 1304L574 1311L541 1321L232 1358Z','#d4ac63')+'</g>'
        svg+=path('M206 1308L380 1262L507 1289L337 1335Z','#eee0bd')+path('M272 1294L392 1280M285 1311L429 1294',stroke='#75828a',width=4)
    elif kind == 'amen':
        svg=rect(0,0,1080,1920,'#e1d2b5')+path('M85 259V1377H897V259Z','#d5bea0')+path('M151 1337V572Q151 335 485 335Q820 335 820 572V1337Z','#849b9b')
        svg+=path('M177 1337V572Q177 365 486 362Q794 368 794 572V1337Z','url(#set-dawn)')+path('M184 1020Q363 908 563 978T790 919V1337H184Z','#799287')
        svg+=lines([(486,362,486,1337),(177,716,794,716),(178,1010,793,1010)],'#ecd9b3',15)
        svg+=path('M82 1337L894 1337L1080 1490V1920H0V1416Z','#b7a486')+path('M171 450L436 366L820 1439L529 1492Z','#fff3cc',extra='opacity=".18"')
        svg+=plant(141,1317,.72,'#687c63','#ac7857')+plant(907,1312,.95,'#556e5f','#b18761')
        svg+=path('M80 1625L899 1373M389 1920L904 1385',stroke='#8e8773',width=3,extra='opacity=".45"')
        svg+=rect(75,155,822,16,'#a89068',3)+rect(116,182,740,3,'#ccb68f',1)
    else:
        raise ValueError(f'Unknown original set: {kind}')
    return polished(svg)


def open_hands(x,y,s=1):
    """Two cupped palms, five digits each, intact wrists, a lower warm light."""
    # Fingers are not cylinders attached randomly: four along the outer edge,
    # thumb runs inward, palm profile remains one uninterrupted contour.
    palm=path('M-71 212L-97 88Q-112 37-110-14L-100-113Q-98-139-82-138Q-65-133-69-109L-71-44L-49-181Q-44-206-28-201Q-12-195-19-171L-39-58L-14-211Q-10-238 8-232Q22-224 17-202L-9-52L15-185Q20-209 37-201Q51-193 44-169L25-63Q43-82 76-107Q96-124 108-108Q120-92 98-70L48-13Q28 18 41 91L65 198Z','url(#set-skin)',stroke='#986547',width=3)
    palm+=path('M-50 62Q-9 82 21 61M-43-30Q-13-9 22-14M-50 112Q-23 126 21 115',stroke='#855238',width=3,extra='opacity=".45"')
    return f'<g transform="translate({x} {y}) scale({s})"><g id="set-left-cupped-hand" transform="translate(-101 0) rotate(-20)">{palm}</g><g id="set-right-cupped-hand" transform="translate(101 0) scale(-1 1) rotate(-20)">{palm}</g></g>'


def grip_hand():
    """Native overhead right hand gripping at x=0,y=-60; five visible digits.

    Included INSIDE the same moving group as the held pencil or plane.
    Separate knuckle details are not extra fingers; no detached wrist.
    """
    svg=path('M116-160L131-96Q102-66 89-16L42 24L20-33L21-119Q54-151 116-160Z','url(#set-skin)',stroke='#946046',width=2)
    # Four long fingers folded around the shaft, each with its own outline.
    for i,yy in enumerate([-111,-89,-67,-45]):
        svg+=path(f'M64 {yy-10}Q34 {yy-21} 1 {yy-10}Q-20 {yy-4}-11 {yy+11}Q-1 {yy+23} 35 {yy+12}L73 {yy+9}Z','url(#set-skin)',stroke='#986747',width=2)
        svg+=path(f'M6 {yy-2}L9 {yy+7}',stroke='#d29b71',width=2)
    # Thumb crosses the palm on the other side of the same object.
    svg+=path('M71-32Q48-62 28-55L3-36Q-11-24-2-11Q8 0 22-8L41-17L49 8Q70 14 83-9Z','url(#set-skin)',stroke='#946046',width=2)
    svg+=path('M107-173L142-101L285-185L243-268Z','#344d62',stroke='#50697b',width=3)+path('M118-158L140-115',stroke='#b8b8a6',width=4)
    return svg


def prayer_hands():
    """Two joined hands in a close shot, attached forearms and distinct fingers."""
    left=path('M-97 156L-46 63Q-46 19-21-36L-9-67L-2-82L35-34Q16 23-5 65L-26 181Z','url(#set-skin)',stroke='#99674b',width=3)
    for d in [
        'M-27-28L-15-154Q-14-173 0-168Q9-164 7-149L-2-47Z',
        'M-13-42L0-183Q2-201 17-194Q25-189 22-173L12-36Z',
        'M3-42L19-169Q22-185 36-177Q43-172 39-156L28-27Z',
        'M17-21L37-131Q43-148 56-138Q62-132 55-114L41-8Z',
    ]:
        left+=path(d,'url(#set-skin)',stroke='#99674b',width=2)
    left+=path('M-44 29Q-33 4-15-33L8-59Q20-72 32-60Q43-49 32-35L8-6L-5 49Z','url(#set-skin)',stroke='#99674b',width=2)
    left+=path('M-45 64Q-21 64-5 45M-65 115L-27 131',stroke='#85563f',width=3,extra='opacity=".45"')
    left+=path('M-111 154L-17 184L-62 348H-202Z','#485e72',stroke='#697786',width=3)+path('M-101 173L-28 199',stroke='#bbc4bb',width=5)
    return '<g id="set-joined-hands"><g transform="translate(607 1160) scale(.86)"><g id="set-prayer-hand-left" transform="translate(-65 0) rotate(18)">'+left+'</g><g id="set-prayer-hand-right" transform="translate(65 0) scale(-1 1) rotate(18)">'+left+'</g></g></g>'


def foreground(kind):
    if kind=='pulpit':
        return '<g id="set-lectern">'+path('M252 999L659 932L722 1007L312 1080Z','url(#set-wood)',stroke='#d7b387',width=4)+path('M312 1080L722 1007L699 1381L331 1457Z','#80543c')+path('M349 1117L683 1053L665 1348L366 1404Z','#986f4f')+path('M331 1457L699 1381L753 1430L304 1517Z','#513c32')+path('M347 1120L361 1400M679 1054L665 1348',stroke='#c49c71',width=3)+path('M445 1060L516 1024L568 1034L497 1068Z','#ecddbb')+path('M519 1025L501 1064',stroke='#a7906d',width=3)+'</g>'
    if kind=='listener':
        return '<g id="set-front-coffee-table">'+path('M28 1411L537 1349L726 1457L191 1537Z','url(#set-wood)')+path('M191 1537L726 1457V1505L191 1589Z','#684333')+path('M221 1583V1753M654 1516V1678',stroke='#3e3332',width=22)+'</g>'
    if kind=='prayer':
        return prayer_hands()
    return ''


META = {
 'portrait': {'actor': (470, 689, 1.00), 'role':'Athom illustrated, not documentary footage', 'targets':[], 'action':'A close illustrated portrait; small purposeful head reaction, not speaking the off-screen voice.'},
 'backstage': {'actor': (540, 713, .93), 'role':'host', 'targets':['set-curtain-reveal','set-warm-stage-light'], 'action':'Curtain opens a little as the presenter questions what lies behind the public image.'},
 'pulpit': {'actor': (611, 688, .92), 'role':'Athom illustrated, silent', 'targets':['set-window-shaft','set-lectern'], 'action':'One restrained open-palm teaching gesture, glance towards congregation. Lectern overlays actor.'},
 'music': {'actor':None, 'targets':['set-microphone','set-guitar'], 'action':'Separate musical object details; subtle reveal without pretending to hear a performance.'},
 'assembly': {'actor':None, 'targets':['set-stage-glow','set-crowd-0','set-crowd-head-5'], 'action':'Depth reveal towards distant stage, staggered small head reactions in the listening crowd.'},
 'listener': {'actor':(425,843,.67), 'role':'fictional seated listener', 'targets':['set-front-coffee-table'], 'action':'A private listener, not a copied speaker. A quiet glance to the root-held device; no floating second phone.'},
 'spotlights': {'actor':None, 'targets':['set-light-beams','set-lights'], 'action':'Beams dim, revealing empty equipment and wings instead of cycling the portrait again.'},
 'quiet': {'actor':(662,950,.64), 'role':'fictional seated reader', 'targets':['set-window-rain','set-reading-lamp'], 'action':'Slow page/reading reaction; seated stability, eyes down. New night location.'},
 'empty': {'actor':None, 'targets':['set-empty-light','set-vacant-chair-1'], 'action':'Push from empty chair edge into the silent row; no applause, no repeated public view.'},
 'loom': {'actor':None, 'targets':['set-warp','set-cloth','set-shuttle'], 'action':'Shuttle crosses once; cloth reveals downward, metaphor of patient unseen preparation.'},
 'rain': {'actor':(601,789,.85), 'role':'fictional woman waiting', 'targets':['set-rain','set-reflection'], 'action':'Lowered gaze then head lifts towards the shelter exit. Rain is deterministic.'},
 'work': {'actor':None, 'targets':['set-written-lines','set-pencil','set-cup'], 'action':'Pencil tracks the native written-line reveal, avoiding a meaningless floating object.'},
 'persevere': {'actor':None, 'targets':['set-repair-frame','set-plane','set-wood-shavings'], 'action':'Plane moves along wood in one controlled repair action; new overhead-oblique shot.'},
 'season': {'actor':(504,671,1.00), 'role':'host', 'targets':[], 'action':'Stable roof pose, reassuring hand then a pause; not the same room as the opening.'},
 'dawn': {'actor':None, 'targets':['set-shutter-left','set-shutter-right','set-morning-shaft'], 'action':'Shutters progressively open and warm shaft appears; reveal of tomorrow.'},
 'single': {'actor':(518,869,.68), 'role':'fictional seated person', 'targets':['set-stool'], 'action':'One small person in a large plain room establishes no crowd is required. Keep seat contact.'},
 'heart': {'actor':None, 'targets':['set-left-cupped-hand','set-right-cupped-hand','set-heart-light'], 'action':'Open cupped hands with five digits each; receive light, no constantly beating heart.'},
 'prayer': {'actor':None, 'role':'fictional praying person in a close hand shot', 'targets':['set-joined-hands','set-prayer-hand-left','set-prayer-hand-right'], 'action':'Two joined hands and attached clothed forearms in the bedside foreground. No extra standing actor needed.'},
 'belief': {'actor':None, 'targets':['set-flame','set-protective-hand'], 'action':'Palm shields the candle, flame steadies; fingers remain coordinated and plausible.'},
 'advance': {'actor':None, 'targets':['set-planted-foot','set-stepping-foot'], 'action':'Front shoe plants once with a grounded heel, then rear shoe begins advancing. No walking loop.'},
 'unseen': {'actor':(518,827,.65), 'role':'fictional passer-by', 'targets':['set-pavement-light'], 'action':'Separate distant street, paused departure then a small step. Do not slide a rigid silhouette.'},
 'foundation': {'actor':None, 'targets':['set-hidden-foundation'], 'action':'Soil cutaway exposes supports underneath the completed modest house; narrative reveal.'},
 'time': {'actor':None, 'targets':['set-clock-hands','set-calendar-turn','set-pencil-time'], 'action':'Clock hand arcs, one page edge turns. Native still-life, not an imported icon montage.'},
 'amen': {'actor':(484,683,.98), 'role':'host', 'targets':[], 'action':'A new sunlit atrium, host makes one welcoming gesture. Upper area remains clear for editable Amen CTA.'},
}


# Native GSAP motion recipes; root prefixes IDs and applies on a paused timeline.
# props = end state; optional from = fromTo state. All positions are scene-local.
# No RAF/time/random/loop, no permanent zoom, one causal gesture per shot.
ANIMATIONS = {
 'portrait': [],
 'backstage': [{'target':'set-curtain-reveal','props':{'x':60,'ease':'power2.inOut'},'at':.4,'duration':1.1}],
 'pulpit': [{'target':'set-window-shaft','from':{'opacity':.55},'props':{'opacity':1,'ease':'power1.inOut'},'at':.2,'duration':1.5}],
 'music': [{'target':'set-microphone','props':{'opacity':1},'from':{'opacity':.55},'at':.05,'duration':.55}, {'target':'set-guitar','from':{'opacity':.4},'props':{'opacity':1,'ease':'power1.out'},'at':.28,'duration':.6}],
 'assembly': [{'target':'set-crowd-head-5','props':{'attr':{'transform':'rotate(4)'},'ease':'power2.inOut'},'at':.4,'duration':.5}, {'target':'set-crowd-head-9','props':{'attr':{'transform':'rotate(-3)'},'ease':'power1.inOut'},'at':.75,'duration':.6}, {'target':'set-crowd-head-2','props':{'attr':{'transform':'rotate(0)'},'ease':'power1.inOut'},'at':1.1,'duration':.55}],
 'listener': [],
 'spotlights': [{'target':'set-light-beams','from':{'opacity':1},'props':{'opacity':.13,'ease':'power1.inOut'},'at':.4,'duration':1.0}],
 'quiet': [{'target':'set-window-rain','props':{'y':22,'ease':'none'},'at':0,'duration':3}],
 'empty': [{'target':'set-empty-light','from':{'opacity':.2},'props':{'opacity':1,'ease':'power1.inOut'},'at':.25,'duration':1.3}],
 'loom': [{'target':'set-shuttle','from':{'x':-140},'props':{'x':120,'ease':'power2.inOut'},'at':.35,'duration':.7}, {'target':'set-cloth-reveal','from':{'attr':{'height':90}},'props':{'attr':{'height':429},'ease':'power1.out'},'at':.7,'duration':1.3}],
 'rain': [{'target':'set-rain','props':{'y':48,'x':-16,'ease':'none'},'at':0,'duration':3}],
 'work': [{'target':'set-note-reveal','from':{'attr':{'width':0}},'props':{'attr':{'width':332},'ease':'none'},'at':.7,'duration':1.05}, {'target':'set-pencil','props':{'x':322,'y':-51,'ease':'none'},'at':.7,'duration':1.05}],
 'persevere': [{'target':'set-plane','props':{'x':-137,'y':22,'ease':'power1.inOut'},'at':.4,'duration':.85}, {'target':'set-wood-shavings','from':{'opacity':0},'props':{'opacity':1,'ease':'power1.out'},'at':.75,'duration':.65}],
 'season': [],
 'dawn': [{'target':'set-shutter-left','props':{'x':-106,'ease':'power2.inOut'},'at':.25,'duration':1.15}, {'target':'set-shutter-right','props':{'x':100,'ease':'power2.inOut'},'at':.25,'duration':1.15}, {'target':'set-morning-shaft','from':{'opacity':0},'props':{'opacity':1,'ease':'power1.inOut'},'at':.65,'duration':1}],
 'single': [],
 'heart': [{'target':'set-heart-light','from':{'opacity':.1},'props':{'opacity':1,'ease':'power2.out'},'at':.3,'duration':1.15}],
 'prayer': [{'target':'set-joined-hands','from':{'y':14},'props':{'y':0,'ease':'power2.out'},'at':.2,'duration':.65}],
 'belief': [{'target':'set-protective-hand','from':{'x':42},'props':{'x':0,'ease':'power2.out'},'at':.3,'duration':.65}, {'target':'set-flame','from':{'opacity':.6},'props':{'opacity':1,'ease':'power1.out'},'at':.8,'duration':.55}],
 'advance': [{'target':'set-stepping-foot','from':{'y':-76},'props':{'y':0,'ease':'power2.in'},'at':.42,'duration':.24}, {'target':'set-step-shadow','from':{'opacity':0},'props':{'opacity':1,'ease':'power1.in'},'at':.55,'duration':.11}],
 'unseen': [{'target':'set-pavement-light','from':{'opacity':.45},'props':{'opacity':1,'ease':'power1.out'},'at':.3,'duration':1.05}],
 'foundation': [{'target':'set-hidden-foundation','from':{'opacity':.06},'props':{'opacity':1,'ease':'power2.out'},'at':.35,'duration':1.2}],
 'time': [{'target':'set-clock-hands','props':{'attr':{'transform':'rotate(21)'},'ease':'none'},'at':.1,'duration':1.5}, {'target':'set-calendar-turn','props':{'opacity':1,'ease':'power1.out'},'at':.5,'duration':.2}, {'target':'set-calendar-page','props':{'attr':{'d':'M180 59H229V385Q210 395 205 385L180 59Z'},'ease':'power2.inOut'},'at':.65,'duration':.8}, {'target':'set-calendar-turn','props':{'opacity':0},'at':1.4,'duration':.2}],
 'amen': [],
}
