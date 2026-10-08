"""Original SVG scenography: stable characters and visual motifs, no generated photos."""
GOLD='#d7b57b'; RED='#8c343c'; INK='#101b26'
def figure(x,y,s=1,role='king',facing=1):
 crown='<path d="M-25 -100L-30 -125L-13 -112L0 -134L14 -113L29 -127L25 -100Z" fill="#d7b57b"/>' if role=='king' else ''
 robe='#823e45' if role=='king' else '#a89b7d' if role=='prophet' else '#466172'
 extra='<path d="M55 -100V130" stroke="#c8b590" stroke-width="5"/>' if role=='soldier' else ''
 return f'''<g transform="translate({x} {y}) scale({s})"><ellipse cy="145" rx="65" ry="10" fill="#080e16" opacity=".5"/><path d="M-22 55L-30 138H-48L-30 20M20 55L32 136H49L33 20" fill="#17222d"/><path d="M-29 -55Q0 -73 31 -54L60 87Q0 110 -57 87Z" fill="{robe}"/><path d="M-30 -48L-51 24M29 -48L49 26" stroke="{robe}" stroke-width="17" stroke-linecap="round"/><path d="M-47 26L-36 47M48 27L36 43" stroke="#b68a68" stroke-width="12" stroke-linecap="round"/><path d="M-11 -74V-51H12V-75" fill="#936647"/><ellipse cy="-92" rx="25" ry="32" fill="#b68a68"/><path d="M-25 -90Q-36 -139 6 -129Q35 -126 26 -85L16 -107Q-3 -98 -20 -110Z" fill="#24232b"/><path d="M-23 -82Q0 -71 23 -83L16 -56Q0 -45 -16 -57Z" fill="#3b3030"/><path d="M-15 -91h8m14 0h8" stroke="#33292a" stroke-width="3"/>{crown}{extra}</g>'''
def crown(x=650,y=310,s=1):
 return f'<g transform="translate({x} {y}) scale({s})"><path d="M-160 90L-192 -90L-98 -10L0 -128L99 -10L190 -90L158 90Z" fill="#ad884e" stroke="#e2c990" stroke-width="5"/><path d="M-157 64H157" stroke="#463c31" stroke-width="12"/><circle cy="3" r="20" fill="#81333c"/></g>'
def letter(x=640,y=300,s=1):
 return f'<g transform="translate({x} {y}) scale({s})"><path d="M-175 -120L175 -99L165 145L-184 130Z" fill="#d3c09a"/><path d="M-145 -83L-20 34L143 -71M-142 102L-35 16M128 109L32 20" fill="none" stroke="#9b865f" stroke-width="3"/><circle cy="30" r="35" fill="#893a40"/><path d="M-14 39L-18 17L0 29L17 17L13 39Z" fill="#c9756a"/></g>'
def sheep(x,y,s=1):
 return f'<g transform="translate({x} {y}) scale({s})"><path d="M-34 16L-38 57M26 17L31 56" stroke="#493f39" stroke-width="10"/><ellipse rx="57" ry="35" fill="#d9ccad"/><circle cx="-32" cy="-17" r="23" fill="#e3d8bb"/><circle cx="4" cy="-22" r="22" fill="#e3d8bb"/><ellipse cx="50" cy="-2" rx="21" ry="29" fill="#534b43"/><circle cx="55" cy="-8" r="3" fill="#e3d8bb"/></g>'
def art(kind):
 bg='<rect width="1280" height="720" fill="url(#sky)"/><circle cx="1000" cy="120" r="360" fill="#d7b57b" opacity=".035"/><path d="M0 515Q340 410 640 510T1280 465V720H0Z" fill="#142431"/><path d="M0 612Q350 500 670 604T1280 550V720H0Z" fill="#0d1925"/>'
 city=''.join(f'<path d="M{x} 470V{260+(i%3)*40}H{x+80}V470Z" fill="#273a46"/><path d="M{x+30} 370v-45h22v45" fill="#111e2a"/>' for i,x in enumerate(range(100,1200,115)))
 if kind in ['lion','bear']:
  mane='<path d="M610 285L635 226L690 218L725 249L735 299L697 340L646 333Z" fill="#ae8250"/>' if kind=='lion' else '<circle cx="645" cy="245" r="24" fill="#73645a"/><circle cx="696" cy="245" r="24" fill="#73645a"/>'
  return bg+f'<g id="animal"><path d="M710 300Q910 231 1000 355L992 449L956 449L935 355L775 365L745 445H708Z" fill="{GOLD if kind=="lion" else "#73645a"}"/>{mane}<ellipse cx="668" cy="282" rx="43" ry="42" fill="#c39e6e"/><path d="M647 283h10m24 0h10" stroke="#252b2a" stroke-width="5"/><path d="M644 313l48 -5" stroke="#5a4a3b" stroke-width="4"/></g>'+figure(380,410,1,'shepherd')+'<path d="M325 411Q270 220 395 200" stroke="#ccb78e" stroke-width="5" fill="none"/>'
 if kind=='giant':return bg+figure(870,355,1.95,'soldier')+figure(365,468,.64,'shepherd')+'<path d="M320 475Q540 60 836 206" stroke="#e0bf80" stroke-width="3" stroke-dasharray="7 15" fill="none"/><circle id="stone" cx="836" cy="206" r="9" fill="#e5cba0"/>'
 if kind=='spear':return bg+figure(865,410,1.13)+figure(335,410,.9,'shepherd')+'<g id="spear"><path d="M1050 230L220 365" stroke="#cbb181" stroke-width="7"/><path d="M220 365L265 340L265 372Z" fill="#d8d7c7"/></g>'
 if kind in ['king','throne']:
  return bg+'<path d="M470 490V195Q640 100 810 195V490Z" fill="#293945" stroke="#ae8b58" stroke-width="5"/><path d="M440 490H840V555H440Z" fill="#534436"/>'+figure(640,365,1.15)
 if kind in ['palace','roof','bath']:
  return bg+city+'<circle cx="955" cy="140" r="44" fill="#d9c8a4" opacity=".75"/><path d="M70 490H1210V610H70Z" fill="#364651"/><path d="M80 489V414H125V489M240 489V414H285V489M400 489V414H445V489" stroke="#9a977f" stroke-width="13"/>'+figure(380,352,.87)+('<path d="M805 377V230Q940 106 1080 230V377Z" fill="#526270"/><path d="M831 232Q900 310 866 381M1054 233Q990 305 1020 381" fill="#c6b89c"/><ellipse cx="942" cy="328" rx="30" ry="42" fill="#263642"/>' if kind=='bath' else '')
 if kind in ['army','battle','death']:
  units=''.join(figure(250+i*145,365+(i%2)*30,.65,'soldier') for i in range(6))
  if kind=='death':units='<path d="M620 227L671 260L669 413L620 460L570 411L567 260Z" fill="#526773" stroke="#bfa476" stroke-width="5"/><path d="M580 544L780 318" stroke="#c0b18c" stroke-width="7"/>'
  return bg+units+'<path d="M140 120V500M140 135L270 174L140 230" stroke="#977b53" stroke-width="5" fill="#74333c"/>'
 if kind in ['letter','message','sealed']:return bg+letter()+('<path id="slash" d="M472 170L820 469" stroke="#883743" stroke-width="9"/>' if kind=='sealed' else '')
 if kind=='delivery':return bg+figure(350,410,1.1)+figure(920,410,1.1,'soldier')+letter(640,340,.48)
 if kind=='choice':return bg+'<path d="M640 620V415L350 202M640 415L940 202" stroke="#b89b6b" stroke-width="16" fill="none"/><path d="M278 145H432V232H278Z" fill="#bca77b"/><path d="M870 145H1024V232H870Z" fill="#833943"/>'+figure(640,475,.55)
 if kind=='loyalty':return bg+'<path d="M640 90V590" stroke="#bfa06d" opacity=".45"/>'+figure(365,370,1.3,'soldier')+figure(915,370,1.3)
 if kind=='stairs':return bg+''.join(f'<path id="step-{i}" d="M{200+i*120} {190+i*43}h120v{360-i*43}h-120Z" fill="{["#ae936e","#a08362","#8d7056","#785a4b","#654843","#58383d","#442d37"][i]}"/>' for i in range(7))+figure(340,240,.43)
 if kind in ['shadow','mirror','desire']:
  return bg+'<path d="M650 602L1010 87L1230 556Z" fill="#833943" opacity=".3"/><ellipse cx="790" cy="313" rx="204" ry="246" fill="#0a1420" stroke="#a98c5a" stroke-width="7"/>'+figure(795,360,1.2)+figure(360,400,1.1,'shepherd')
 if kind=='wedding':return bg+figure(565,400,1.05)+'<path d="M760 280Q835 290 850 505H670Q691 310 733 287Z" fill="#b4a88f"/><ellipse cx="755" cy="247" rx="26" ry="34" fill="#aa7f5e"/><path d="M721 250Q716 190 760 199Q801 200 791 273Z" fill="#514a47"/>'
 if kind in ['nathan','accuse']:return bg+figure(385,405,1.18,'prophet')+figure(905,405,1.18)+('<path id="point" d="M422 342L727 290" stroke="#b99a75" stroke-width="18" stroke-linecap="round"/>' if kind=='accuse' else '')
 if kind=='flock':return bg+''.join(sheep(290+i*140,330+(i%2)*120,.78) for i in range(6))
 if kind=='lamb':return bg+sheep(710,405,1.7)+figure(365,367,1,'shepherd')
 if kind=='taken':return bg+sheep(790,370,1.4)+'<path d="M480 280Q660 238 822 348" stroke="#873b42" stroke-width="35" fill="none"/>'+figure(330,410,.7,'shepherd')
 if kind=='crown':return bg+crown()
 if kind in ['prayer','heart']:
  return bg+'<path d="M780 50L340 630H1120Z" fill="#d8b981" opacity=".07"/>'+figure(495,395,1.05,'shepherd')+('<path id="heart" d="M845 415C590 250 775 160 845 268C925 151 1105 262 845 415Z" fill="#ba8f64"/>' if kind=='heart' else crown(827,500,.33))
 if kind=='doors':return bg+'<path d="M380 570V155Q640 20 900 155V570Z" fill="#0b1420" stroke="#6d7778" stroke-width="14"/><path d="M640 97V570" stroke="#b89861" stroke-width="5"/>'+figure(640,459,.58,'shepherd')
 return bg+crown()
