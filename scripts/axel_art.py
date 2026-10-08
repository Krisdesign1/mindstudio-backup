"""Editorial SVG illustrations, deliberately symbolic rather than fabricated archives."""
import html
INK='#101923'; GOLD='#e7b969'; BLUE='#76bbc5'; PAPER='#ede8dc'; RED='#d77d74'
def txt(x,y,s,size=26,color=PAPER):return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,sans-serif" font-size="{size}" font-weight="600">{html.escape(s)}</text>'
def line(x,y,a,b,color=GOLD):return f'<path d="M{x} {y}L{a} {b}" stroke="{color}" stroke-width="3" fill="none"/>'
def person(x,y,scale=1):return f'<g transform="translate({x} {y}) scale({scale})"><circle cy="-42" r="19" fill="{BLUE}"/><path d="M-34 60V-3Q0-29 34-3V60Z" fill="#426375"/></g>'
def art(kind):
 s=''
 if kind=='journey':
  s='<path d="M200 390Q380 90 680 260" stroke="#e7b969" stroke-width="4" stroke-dasharray="9 9" fill="none"/>'
  for x,y,t in [(190,390,'CÔTE D’IVOIRE'),(680,260,'FRANCE')]:s+=f'<circle cx="{x}" cy="{y}" r="14" fill="{GOLD}"/>'+txt(x-90,y+55,t,22)
 elif kind=='train':
  s=f'<rect x="130" y="120" width="660" height="365" rx="30" fill="#263949" stroke="{BLUE}" stroke-width="3"/>'
  for x in [160,380,600]:s+=f'<rect x="{x}" y="153" width="155" height="120" rx="14" fill="#101923"/><path d="M{x} 220l155 -40" stroke="#567a8c" stroke-width="3"/>'
  s+=person(360,355,1.3)+person(570,355,1.3)+line(160,445,760,445)+txt(185,315,'RER',23,BLUE)
 elif kind=='phone':
  s=f'<rect x="325" y="90" width="270" height="430" rx="32" fill="#263949" stroke="{BLUE}" stroke-width="3"/><rect x="345" y="130" width="230" height="330" rx="8" fill="{INK}"/><circle cx="460" cy="490" r="10" fill="{BLUE}"/>'+txt(370,205,'UN MESSAGE',20)+txt(370,250,'UNE RENCONTRE',17)+txt(380,330,'JÉSUS',38,GOLD)
 elif kind=='home':
  s=f'<path d="M155 260L460 75L765 260" stroke="{GOLD}" stroke-width="7" fill="none"/><path d="M190 255V500H730V255" stroke="{BLUE}" stroke-width="4" fill="none"/><rect x="290" y="355" width="345" height="90" rx="25" fill="#456072"/><path d="M280 450H645" stroke="{GOLD}" stroke-width="10"/>'+person(400,350,.65)+person(515,350,.65)
 elif kind=='network':
  points=[(460,280),(190,170),(730,150),(175,435),(730,420),(450,495)]
  for x,y in points[1:]:s+=line(460,280,x,y,BLUE)
  for i,(x,y) in enumerate(points):s+=f'<circle cx="{x}" cy="{y}" r="{57 if i==0 else 35}" fill="#263949" stroke="{GOLD}" stroke-width="3"/>'
  s+=txt(429,288,'MFD',24)
 elif kind in ['church','mic']:
  if kind=='church':s=f'<path d="M150 240L455 85L760 240V480H150Z" fill="#263949" stroke="{BLUE}" stroke-width="3"/><path d="M455 125V210M425 158H485" stroke="{GOLD}" stroke-width="7"/><path d="M395 480V335Q455 270 515 335V480" fill="{INK}"/>'
  else:s=f'<rect x="405" y="100" width="110" height="235" rx="55" fill="#426375" stroke="{BLUE}" stroke-width="4"/><path d="M365 270V295Q365 385 460 385Q555 385 555 295V270M460 385V490M375 490H545" stroke="{GOLD}" stroke-width="6" fill="none"/>'
 elif kind=='document':
  s=f'<path d="M260 85H585L665 165V505H260Z" fill="{PAPER}"/><path d="M585 85V165H665" fill="#c7bdab"/>'
  for y,w in [(220,260),(265,220),(310,280),(355,185)]:s+=f'<rect x="310" y="{y}" width="{w}" height="7" fill="#64747b"/>'
  s+=txt(307,440,'DÉCLARATION',25,'#32444b')
 elif kind=='noise':
  for i,(x,y) in enumerate([(120,120),(380,185),(640,100),(170,360),(525,395)]):
   s+=f'<g class="piece"><rect x="{x}" y="{y}" width="210" height="85" rx="13" fill="#263949" stroke="#49616f"/><path d="M{x+25} {y+28}h145M{x+25} {y+51}h95" stroke="{BLUE}" stroke-width="5"/></g>'
  s+=f'<circle cx="465" cy="300" r="105" fill="{INK}" stroke="{GOLD}" stroke-width="4"/>'+txt(431,333,'?',100,GOLD)
 elif kind=='ripples':
  for r in [70,145,220]:s+=f'<circle class="piece" cx="460" cy="300" r="{r}" fill="none" stroke="{BLUE}" stroke-width="2" opacity=".65"/>'
  s+=person(460,300,1.1)+txt(100,100,'FAMILLE',22)+txt(650,240,'ÉGLISE',22)+txt(100,480,'CONFIANCE',22)
 elif kind=='guardrails':
  for i,(a,b) in enumerate([('LIMITES','Le pouvoir a des limites'),('TRANSPARENCE','Les actes peuvent être examinés'),('CORRECTION','Quelqu’un doit pouvoir dire non')]):
   y=110+i*135;s+=f'<g class="piece"><rect x="100" y="{y}" width="720" height="103" rx="10" fill="#263949"/><rect x="100" y="{y}" width="5" height="103" fill="{GOLD}"/>'+txt(130,y+40,a,26)+txt(130,y+75,b,21,BLUE)+'</g>'
 elif kind=='balance':
  s=line(460,135,460,490)+line(200,210,720,210)+line(240,210,195,385)+line(240,210,285,385)+line(680,210,635,385)+line(680,210,725,385)+f'<path d="M170 385Q240 470 310 385ZM610 385Q680 470 750 385Z" fill="#426375"/>'+txt(168,175,'GRÂCE',27)+txt(556,175,'RESPONSABILITÉ',25)+line(370,490,550,490)
 elif kind=='foundation':
  s=f'<path d="M230 430L460 95L690 430Z" fill="#263949" stroke="{BLUE}" stroke-width="3"/><path d="M460 95L440 260L485 315L460 430" stroke="{RED}" stroke-width="6" fill="none"/><rect x="180" y="460" width="560" height="30" fill="{GOLD}"/>'+txt(230,545,'SUR QUOI REPOSE TA FOI ?',25)
 elif kind=='mirror':
  s=f'<ellipse cx="460" cy="290" rx="170" ry="215" fill="#263949" stroke="{GOLD}" stroke-width="5"/>'+person(460,340,2)+f'<path d="M335 375L565 160" stroke="{BLUE}" stroke-width="3" opacity=".5"/>'
 elif kind=='cross':s=f'<path d="M460 100V480M295 245H625" stroke="{GOLD}" stroke-width="18"/>'+f'<circle cx="460" cy="290" r="215" fill="none" stroke="{BLUE}" opacity=".3"/>'
 return '<svg viewBox="0 0 920 600" aria-label="Illustration symbolique">'+s+'</svg>'
