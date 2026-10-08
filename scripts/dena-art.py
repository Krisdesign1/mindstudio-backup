"""Native vector cast and sets for the Dena response film. No bitmap assets."""
DEFS='''<defs>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#bd825e"/><stop offset=".48" stop-color="#a76547"/><stop offset="1" stop-color="#713f32"/></linearGradient>
<linearGradient id="neck"><stop stop-color="#875039"/><stop offset="1" stop-color="#b57751"/></linearGradient>
<linearGradient id="hair"><stop stop-color="#101b20"/><stop offset=".5" stop-color="#283234"/><stop offset="1" stop-color="#101719"/></linearGradient>
<linearGradient id="blue" x2="1" y2="1"><stop stop-color="#d6e5e8"/><stop offset=".4" stop-color="#4b788c"/><stop offset="1" stop-color="#183a50"/></linearGradient>
<linearGradient id="sage" x2="1" y2="1"><stop stop-color="#c2c9a8"/><stop offset="1" stop-color="#56685b"/></linearGradient>
<linearGradient id="room" x2="1" y2="1"><stop stop-color="#efe5d1"/><stop offset=".65" stop-color="#c8b89a"/><stop offset="1" stop-color="#9e937f"/></linearGradient>
<linearGradient id="light"><stop stop-color="#fff4ca" stop-opacity=".8"/><stop offset="1" stop-color="#fff4ca" stop-opacity="0"/></linearGradient>
<radialGradient id="cheek"><stop stop-color="#d09871" stop-opacity=".6"/><stop offset="1" stop-color="#c38964" stop-opacity="0"/></radialGradient>
<pattern id="fabric" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M0 35Q35 0 70 35Q35 70 0 35M35 0Q0 35 35 70Q70 35 35 0" stroke="#d9e7e8" fill="none" stroke-width="3" opacity=".55"/><circle cx="35" cy="35" r="6" fill="#e0e8dc" opacity=".7"/></pattern>
</defs>'''

def person(who='dena',x=540,y=970,s=1,full=False):
 male=who=='fally';young=who=='sephora'
 hairback='<path d="M-166-125C-246-106-257 14-245 138C-236 221-279 313-250 384L245 384C274 264 220 188 230 82C247-65 197-168 89-192C-8-227-131-202-166-125Z" fill="url(#hair)"/>' if not male else ''
 torso='M-300 460L-275 225Q-262 172-94 150L0 200L94 150Q262 172 275 225L300 460Z'
 color='url(#blue)' if who=='dena' else 'url(#sage)' if young else '#374e54'
 legs='<path d="M-160 420L-130 775H-35L-15 455L30 775H125L160 420Z" fill="#334a49"/><path d="M-130 760Q-188 789-155 811H-30V760M30 760V811H172Q190 790 125 760Z" fill="#213a3c"/>' if full else ''
 if not full:torso=torso.replace('460','950')
 sleeve = '#4f7882' if who=='dena' else '#65796b' if young else '#374e54'
 arms = f'''<g class="left-arm" transform="translate(-248 235)"><path d="M110 0Q40 70 18 185" stroke="{sleeve}" stroke-width="62" fill="none" stroke-linecap="round"/><path d="M18 185Q8 223-8 255" stroke="#9b6247" stroke-width="30" fill="none" stroke-linecap="round"/><g class="left-hand" transform="translate(-10 268)"><path d="M-27-9Q-32-31-17-34L-7-13L-4-40Q5-50 10-31L13-9L27-29Q43-33 36-13L25 18Q3 34-18 20Z" fill="url(#skin)"/><path d="M-16 9Q2 17 20 10" fill="none" stroke="#744430" stroke-width="3"/></g></g><g class="right-arm" transform="translate(248 235)"><path d="M-110 0Q-40 70-18 185" stroke="{sleeve}" stroke-width="62" fill="none" stroke-linecap="round"/><path d="M-18 185Q-8 223 8 255" stroke="#9b6247" stroke-width="30" fill="none" stroke-linecap="round"/><g class="right-hand" transform="translate(10 268)"><path d="M27-9Q32-31 17-34L7-13L4-40Q-5-50-10-31L-13-9L-27-29Q-43-33-36-13L-25 18Q-3 34 18 20Z" fill="url(#skin)"/><path d="M16 9Q-2 17-20 10" fill="none" stroke="#744430" stroke-width="3"/></g></g>'''
 o=f'<g class="character {who}" transform="translate({x} {y}) scale({s})"><g class="body">{legs}{hairback}{arms}<path d="{torso}" fill="{color}"/>'
 if who=='dena':o+=f'<path d="{torso}" fill="url(#fabric)"/>'
 o+='<path d="M-60 68L-70 158Q0 233 70 158L60 68Z" fill="url(#neck)"/><path d="M-62 121Q0 156 61 120L60 86H-60Z" fill="#552e26" opacity=".23"/>'
 o+='<path d="M-124-34Q-160-61-153-12Q-148 22-122 22M124-34Q160-61 153-12Q148 22 122 22" fill="#955b41"/>'
 o+='<path d="M-126-87C-114-155-60-172 0-169C69-174 117-137 129-77L122 21C116 80 68 127 0 137C-63 127-113 82-122 20Z" fill="url(#skin)"/>'
 o+='<ellipse cx="-66" cy="33" rx="65" ry="42" fill="url(#cheek)"/><path d="M103-91Q146-29 112 50Q81 106 37 124Q100 74 91 16Z" fill="#6b392e" opacity=".2"/>'
 # Eye whites deliberately subdued, full pupils, brows and upper lids.
 for ex in [-62,62]:
  o+=f'<path d="M{ex-28}-28Q{ex}-45 {ex+27}-26Q{ex}-12 {ex-28}-28" fill="#e1c7a6"/><ellipse cx="{ex+3}" cy="-28" rx="10" ry="11" fill="#241d1a"/><circle cx="{ex+6}" cy="-31" r="3" fill="#f5e3c3"/><path d="M{ex-28}-28Q{ex}-46 {ex+28}-26" fill="none" stroke="#392522" stroke-width="5" stroke-linecap="round"/><path d="M{ex-30}-59Q{ex}-73 {ex+28}-55" fill="none" stroke="#342725" stroke-width="9" stroke-linecap="round"/>'
 o+='<path d="M5-27Q-6 9-9 22Q1 34 18 23" fill="none" stroke="#794330" stroke-width="5" stroke-linecap="round"/><path d="M-42 64Q-18 46 0 56Q18 46 43 61Q17 85-10 79Q-29 75-42 64" fill="#713d35"/><path d="M-35 63Q0 68 35 61" fill="none" stroke="#d79c80" stroke-width="3"/><path d="M-26 90Q0 98 29 87" fill="none" stroke="#d19870" stroke-width="3" opacity=".6"/>'
 if male:
  o+='<path d="M-131-60Q-157-159-70-185Q30-208 117-155Q148-122 128-57L100-104Q22-91-53-130L-110-94Z" fill="#182222"/><path d="M-118 19Q-91 63-53 58L-43 79Q0 101 43 76L54 58Q92 59 120 13Q116 99 0 144Q-110 107-118 19Z" fill="#26302e"/><path d="M-40 48Q0 34 40 48L34 58Q0 49-36 61Z" fill="#26302e"/><path d="M-78 149L-125 163L-44 285L0 207L44 285L125 163L78 149L0 196Z" fill="#abc1ba"/>'
 elif young:
  o+='<ellipse cx="37" cy="-191" rx="87" ry="62" fill="#182327"/><path d="M-130-48Q-171-166-56-194Q89-224 139-108L130-41Q105-134 20-133Q-66-126-130-48Z" fill="url(#hair)"/><path d="M-91-125Q-25-185 81-150M-115-93Q-54-165 60-163" stroke="#465050" opacity=".6" stroke-width="3" fill="none"/><circle cx="-139" cy="19" r="9" fill="#e4cd8b"/><circle cx="139" cy="19" r="9" fill="#e4cd8b"/><path d="M-70 162Q0 216 70 162" stroke="#e6d6a8" fill="none" stroke-width="5"/>'
 else:
  o+='<path d="M0-173Q-45-207-115-164Q-207-134-175-38Q-149 31-183 113Q-226 206-175 320L-114 287Q-159 188-125 102Q-92 11-129-70Q-105-133 0-173Z" fill="url(#hair)"/><path d="M0-173Q55-208 132-152Q207-111 170-22Q145 52 190 141Q226 233 170 334L120 300Q167 194 129 102Q99 24 129-70Q92-139 0-173Z" fill="url(#hair)"/>'
  for x0 in [-1,1]:
   o+=f'<path d="M {x0*53} -165 Q {x0*184} -134 {x0*151} -30 Q {x0*127} 45 {x0*165} 135 Q {x0*191} 207 {x0*158} 285" fill="none" stroke="#536064" stroke-width="5" opacity=".4"/>'
  o+='<ellipse cx="-137" cy="35" rx="15" ry="23" fill="none" stroke="#dec78c" stroke-width="6"/><ellipse cx="137" cy="35" rx="15" ry="23" fill="none" stroke="#dec78c" stroke-width="6"/><path d="M-66 156Q0 246 66 156M-72 168Q0 277 72 168" fill="none" stroke="#dac58d" stroke-width="4"/><circle cx="0" cy="231" r="8" fill="#e6d7ab"/>'
 o+='<path d="M-240 237Q-204 330-207 456M240 237Q204 330 207 456" stroke="#233d43" stroke-width="6" opacity=".3" fill="none"/></g></g>'
 return o

def room(studio=False):
 out='<rect width="1080" height="1920" fill="url(#room)"/><path d="M75 1420V330Q75 70 345 70Q615 70 615 330V1420Z" fill="#f3e9d3"/><path d="M115 1250V350Q115 120 345 120Q575 120 575 350V1250Z" fill="#b4c7c1"/><path d="M345 120V1250M115 600H575" stroke="#e9ddc3" stroke-width="18"/><path d="M100 250L960 670L1080 1400L90 1250Z" fill="url(#light)" opacity=".35"/><rect x="740" y="440" width="235" height="390" rx="115" fill="#c0ad8c" stroke="#dfc9a7" stroke-width="12"/><path d="M740 730Q858 560 975 730" fill="#a9aa90"/><path d="M0 1360Q530 1210 1080 1400V1920H0Z" fill="#b8aa91"/><path d="M790 1440L845 1160H925L970 1440Z" fill="#82785e"/>'
 for x,y,r in [(815,1040,-30),(936,995,30),(851,890,-20),(920,810,20)]:out+=f'<ellipse cx="{x}" cy="{y}" rx="39" ry="105" fill="#617767" transform="rotate({r} {x} {y})"/>'
 out+='<path d="M888 1230V750" stroke="#626c55" stroke-width="10"/>'
 if studio:out+='<g opacity=".65"><rect x="810" y="650" width="75" height="160" rx="38" fill="#30474b"/><path d="M792 730V780Q845 900 902 780V730M846 837V1160M793 1160H900" fill="none" stroke="#53665e" stroke-width="10"/></g>'
 return out

def pathscene():
 return '<rect width="1080" height="1920" fill="#e9dfc3"/><circle cx="550" cy="530" r="265" fill="#f8edcd"/><path d="M0 850Q210 590 450 845Q790 590 1080 730V1920H0Z" fill="#a6b3a0"/><path d="M0 1140Q530 720 1080 1050V1920H0Z" fill="#758e7d"/><path d="M525 880Q400 1270 0 1920H1080Q750 1200 560 880Z" fill="#d2c39e"/><path d="M536 887Q525 1300 470 1920" fill="none" stroke="#e8d8af" stroke-width="24" opacity=".6"/>'
