"""Native SVG stage assets for HyperFrames: one reusable Joseph, layered environments."""
import random
R=random.Random(19)
def joseph(x=970,y=690,s=1,seated=False,young=False,royal=False,back=False):
 robe='#d0bc94' if not royal else '#e4ddc3';skin='#b7875b';legs='M-52 95L-72 275L-18 277L12 132L37 275L88 275L63 92Z' if not seated else 'M-55 90L-127 205L-55 242L19 181L108 232L133 194L63 90Z'
 face='' if back else '<path d="M-29 -105Q-13 -117 -3 -107M10 -108Q23 -118 35 -106" stroke="#32281f" stroke-width="5" fill="none"/><path d="M4 -105L-3 -78L12 -76" stroke="#866044" stroke-width="4" fill="none"/><path d="M-14 -57Q4 -49 22 -58" stroke="#714830" stroke-width="4" fill="none"/>'
 beard='' if young or back else '<path d="M-44 -99Q-33 -59 -26 -43Q4 -12 35 -42L47 -95L26 -68Q6 -58 -19 -68Z" fill="#302820" opacity=".88"/>'
 return f'<g transform="translate({x} {y}) scale({s})"><ellipse cx="5" cy="286" rx="123" ry="20" fill="#000" opacity=".25"/><path d="{legs}" fill="#50473b"/><path d="M-74 273Q-28 260 -12 282L-13 297H-86Z M38 275Q70 264 99 283V296H35Z" fill="#322b23"/><path d="M-63 -20Q0 -46 70 -20L112 83L64 115L56 195Q0 220 -70 190L-60 104L-109 80Z" fill="{robe}"/><path d="M-62 -7L-20 96L-40 191M15 -21L45 88L32 194M-12 63L-2 189" fill="none" stroke="#9e8b6b" stroke-width="6" opacity=".7"/><path d="M-85 39L-111 129Q-110 150 -95 148L-68 84M84 36L112 124Q121 147 102 151L65 89" stroke="{skin}" stroke-width="23" stroke-linecap="round" fill="none"/><path d="M-29 -59L-25 -20L4 5L30 -23L26 -61Z" fill="{skin}"/><path d="M-53 -142Q-44 -193 10 -183Q64 -180 58 -115L49 -62Q10 -17 -31 -56Z" fill="{skin}"/><path d="M-52 -100Q-81 -153 -44 -188Q2 -217 50 -184Q81 -166 64 -102L40 -141Q13 -130 -14 -159L-38 -136Z" fill="#26251f"/>{beard}{face}<path d="M-67 94Q0 107 67 91" stroke="#675741" stroke-width="10" fill="none"/>'+ ('<path d="M-27 -27L1 15L35 -27" stroke="#b39854" stroke-width="14" fill="none"/>' if royal else '')+'</g>'
def man(x,y,s=1,king=False):
 return f'<g transform="translate({x} {y}) scale({s})"><path d="M-64 -2L-92 240H92L63 -2Z" fill="{"#b59c60" if king else "#797365"}"/><path d="M-35 -68V8L0 32L35 8V-68Z" fill="#a97c50"/><ellipse cy="-83" rx="48" ry="66" fill="#a97c50"/><path d="M-47 -81L-44 -142Q0 -162 43 -141L49 -82L28 -118H-25Z" fill="#2c2923"/>'+ ('<path d="M-55 -90L-72 -158L0 -202L72 -158L56 -90L34 -130H-33Z" fill="#b6a36d"/><path d="M0 -191V-117" stroke="#263d43" stroke-width="11"/>' if king else '')+'<path d="M-29 -83H-10M11 -83H30" stroke="#372b22" stroke-width="5"/><path d="M-12 -42H16" stroke="#654936" stroke-width="4"/></g>'
def stones():
 s=''
 for row in range(8):
  for col in range(11):
   x=col*210-(105 if row%2 else 0);y=row*135
   s+=f'<rect x="{x}" y="{y}" width="203" height="128" rx="9" fill="{R.choice(["#344044","#394449","#303b3f","#404849"])}" stroke="#222c31" stroke-width="4"/>'
 return s
STONE=stones()
def scene(kind):
 bg='';mg='';fg='';detail=''
 if kind in ['dream','pit','pit-pov','caravan','wrists']:
  bg='<rect width="1920" height="1080" fill="url(#sky)"/>'
  if kind=='dream':
   bg+=''.join(f'<circle cx="{R.randrange(1920)}" cy="{R.randrange(700)}" r="{R.choice([1,1,2])}" fill="#ded3b6" opacity=".6"/>' for _ in range(90))+'<path d="M0 800Q360 650 680 760T1370 750T1920 660V1080H0Z" fill="#263338"/>'
   mg=joseph(960,760,.85,young=True,back=True);fg='<path d="M0 1030Q350 880 760 1010T1920 950V1080H0Z" fill="#111d24"/>'
  elif kind.startswith('pit'):
   bg='<rect width="1920" height="1080" fill="#333633"/>'+STONE+'<ellipse cx="960" cy="150" rx="590" ry="175" fill="#bcb299"/>'
   if kind=='pit-pov':bg='<rect width="1920" height="1080" fill="#242c2d"/><ellipse cx="960" cy="490" rx="650" ry="410" fill="#bcb299"/>';mg=''.join(man(x,350,.6) for x in [600,880,1180,1400])
   else:mg=joseph(1000,770,.9)+''.join(man(x,170,.32) for x in [600,820,1150,1370])
   fg='<path d="M0 0H270L410 1080H0ZM1920 0H1640L1500 1080H1920Z" fill="#172428" opacity=".75"/>'
  elif kind=='caravan':
   bg+='<path d="M0 640Q450 425 1020 660T1920 590V1080H0Z" fill="#9c8664"/><path d="M0 830Q500 650 1200 870T1920 780V1080H0Z" fill="#756850"/>'
   mg=''.join(man(360+i*245,690,.6) for i in range(5))+joseph(1080,690,.66,young=True);fg='<path d="M0 980Q650 840 1200 1000T1920 940V1080H0Z" fill="#453f33"/>'
  else:mg='<path d="M460 150L790 740M1390 140L1070 745" stroke="#af8058" stroke-width="170" stroke-linecap="round"/><path d="M710 600Q950 720 1130 580M728 633Q940 753 1110 620M745 670Q930 790 1090 660" stroke="#705739" stroke-width="26" fill="none"/><path d="M930 660V1080" stroke="#8c7047" stroke-width="27"/>'
 elif kind in ['corridor','pharaoh','court','palace','payoff']:
  bg='<rect width="1920" height="1080" fill="#756249"/><path d="M0 1080L770 430H1150L1920 1080Z" fill="#a48b62"/><path d="M0 0L770 300H1150L1920 0Z" fill="#4b4338"/><rect x="770" y="300" width="380" height="400" fill="#3d3730"/>'
  for x in [180,450,1330,1620]:bg+=f'<path d="M{x} 0h100l-8 910h-84Z" fill="#b7a078"/><path d="M{x-32} 40h165v60h-165ZM{x-32} 850h165v60h-165Z" fill="#89734e"/>'
  if kind=='corridor':mg='<rect x="810" y="330" width="300" height="380" fill="#292b28" stroke="#b2935d" stroke-width="12"/>'+man(700,530,.5)+man(1220,530,.5)
  elif kind=='pharaoh':mg='<path d="M800 270H1250V900H800Z" fill="#645539"/>'+man(1030,530,1.35,king=True)
  else:mg=man(1150,510,.8,king=True)+joseph(840,690,.8,royal=True)+man(1430,620,.62)
  fg='<path d="M0 0H120V1080H0ZM1800 0H1920V1080H1800Z" fill="#3f382e"/>'
 else:
  bg='<rect width="1920" height="1080" fill="#29383f"/>'+STONE+'<path d="M1380 190V900H1730V190Q1555 35 1380 190Z" fill="#101d25"/><path id="light" d="M1430 190H1660L1870 1080H610Z" fill="#b1b7a3" opacity=".09"/><rect x="260" y="155" width="220" height="155" fill="#a5b6b1" opacity=".5"/>'
  mg=joseph(815,720,1.05,seated=True)
  if kind in ['reveal','meeting','departure']:detail='<g id="other">'+man(1320,610,.83)+'</g>'
  if kind=='door':mg='';fg='<g id="door"><rect x="630" y="75" width="660" height="1005" fill="#3c3b32" stroke="#131c20" stroke-width="30"/>'+''.join(f'<path d="M{x} 100V1080" stroke="#242b29" stroke-width="18"/>' for x in range(670,1290,100))+'<path d="M665 330H1250M665 850H1250" stroke="#1b2527" stroke-width="35"/></g>'
  elif kind not in ['question','time','meeting','reveal','departure']:fg='<g id="bars">'+''.join(f'<rect x="{x}" y="0" width="36" height="1080" fill="url(#iron)"/>' for x in [170,480,790,1100,1410,1720])+'</g>'
  if kind=='accused':fg+='<path d="M250 250L470 850H100L200 300ZM1570 220L1850 920H1430Z" fill="#0c171c" opacity=".8"/>'
 return bg,mg+detail,fg
DEFS='<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#152538"/><stop offset="1" stop-color="#9a8064"/></linearGradient><linearGradient id="iron"><stop stop-color="#172329"/><stop offset=".45" stop-color="#4d5552"/><stop offset="1" stop-color="#1b292e"/></linearGradient><radialGradient id="vignette"><stop offset=".4" stop-color="#081117" stop-opacity="0"/><stop offset="1" stop-color="#081117" stop-opacity=".65"/></radialGradient></defs>'
