"""Symbolic B-roll, drawn as editable SVG. No documentary footage implied."""
def person(x,y,scale=1,pose='stand',color='#547d75',child=False):
    arms = {'pray':'M-65 70L-22 135L0 96L22 135L65 70','praise':'M-65 70L-105-28M65 70L105-28','help':'M-65 70L-98 138M65 70L125 95','stand':'M-65 70L-82 174M65 70L82 174'}[pose]
    return f'''<g transform="translate({x} {y}) scale({scale})"><path d="M-48 210L-43 320M48 210L43 320" stroke="#364d4e" stroke-width="35" stroke-linecap="round"/><path d="M-70 60Q0 20 70 60L60 220H-60Z" fill="{color}"/><path d="{arms}" fill="none" stroke="#a96e4e" stroke-width="23" stroke-linecap="round"/><rect x="-16" y="8" width="32" height="55" rx="12" fill="#a96e4e"/><ellipse cy="-20" rx="46" ry="60" fill="#b57a55"/><path d="M-47-35Q-55-100 0-88Q58-93 46-30L25-60Q0-47-28-60Z" fill="#322922"/><path d="M-24-17H-12M12-17H24" stroke="#352c25" stroke-width="5" stroke-linecap="round"/><path d="M-12 15Q0 22 12 15" fill="none" stroke="#754335" stroke-width="4"/></g>'''

def art(kind):
    base='<rect width="1080" height="1920" fill="#e7ddc6"/><circle cx="800" cy="610" r="390" fill="#f9edd4"/><path d="M0 1330Q540 1120 1080 1320V1920H0Z" fill="#c5c5ab"/>'
    detail=''
    if kind=='map':
        detail='<path d="M260 560L650 490L824 725L735 930L667 1080L555 1240L474 1180L433 1010L339 900L249 744Z" fill="#789287" stroke="#46685f" stroke-width="7"/>'
        for i,(x,y) in enumerate([(420,770),(600,910),(630,750),(540,1050)]):
            detail+=f'<g id="point-{i}"><circle cx="{x}" cy="{y}" r="28" fill="#d6ad60"/><circle cx="{x}" cy="{y}" r="54" fill="none" stroke="#d6ad60" stroke-width="4"/></g>'
        detail+='<path d="M420 770L600 910L630 750M600 910L540 1050" stroke="#e5cd94" stroke-width="5" fill="none" stroke-dasharray="10 12"/>'
    elif kind in ('youth','generation','prayer','worship','gospel'):
        if kind=='gospel': detail+='<rect x="110" y="1060" width="860" height="410" rx="25" fill="#506c65"/><path d="M540 630V1240" stroke="#bba577" stroke-width="10"/><ellipse cx="540" cy="620" rx="26" ry="50" fill="#344d49"/>'
        pose='pray' if kind=='prayer' else 'praise' if kind in ('worship','gospel','generation') else 'stand'
        for i,x in enumerate([245,540,825]):detail+=person(x,880 if kind=='gospel' else 950,1.15,pose,['#5f8277','#ae805c','#667a91'][i])
        if kind=='prayer':detail+='<ellipse cx="540" cy="1330" rx="370" ry="48" fill="#9aab8a"/>'
    elif kind=='baptism':
        detail='<rect x="80" y="1100" width="920" height="430" rx="90" fill="#759f9d"/>'+person(450,850,1.25,'pray','#eee7d3')+person(745,850,1.15,'help')+'<path d="M85 1200Q260 1140 445 1200T995 1200M100 1300Q260 1240 445 1300T980 1300" stroke="#d2eee0" stroke-width="12" fill="none"/><g id="water"><path d="M565 740Q530 860 585 934" stroke="#d2eee0" stroke-width="10" fill="none"/><circle cx="568" cy="945" r="10" fill="#d2eee0"/></g>'
    elif kind=='bible':
        detail=person(540,810,1.7,'pray')+'<g id="book"><path d="M180 1100Q375 1050 540 1130Q700 1050 900 1100V1370Q700 1310 540 1400Q370 1320 180 1370Z" fill="#fff2d5" stroke="#8a7556" stroke-width="9"/><path d="M540 1130V1400M230 1180L470 1210M230 1240L470 1270M610 1210L835 1180M610 1270L835 1240" stroke="#bcae89" stroke-width="7"/><path d="M540 1440V1530M505 1470H575" stroke="#bd9454" stroke-width="10"/></g>'
    elif kind in ('service','children'):
        detail=person(270,900,1.25,'help')+person(780,1060,.8 if kind=='children' else 1,'help','#bc956c')+'<g id="gift"><rect x="450" y="1030" width="170" height="150" rx="15" fill="#d4aa68"/><path d="M535 1030V1180M450 1080H620" stroke="#f4e3b2" stroke-width="12"/></g>'
        if kind=='children':detail+=person(885,1130,.65,'stand','#748da1')+'<path d="M180 1350H990" stroke="#879b87" stroke-width="9"/>'
    elif kind=='cinema':
        detail='<rect x="100" y="540" width="880" height="600" rx="15" fill="#324f4b"/><rect x="125" y="564" width="830" height="550" fill="#f4e5c6"/><path d="M535 685V975M425 790H645" stroke="#c8a565" stroke-width="22"/><path d="M65 1100L980 585V1140Z" fill="#fff2c4" opacity=".13"/>'
        for x in [260,540,820]:detail+=person(x,1260,.7,'stand')
        detail+='<g id="projector"><rect x="60" y="1050" width="145" height="95" rx="14" fill="#526961"/><circle cx="88" cy="1040" r="36" fill="#a9b6a2"/><circle cx="161" cy="1040" r="36" fill="#a9b6a2"/></g>'
    elif kind=='intimate':
        base='<rect width="1080" height="1920" fill="#d4d5bd"/><rect x="650" y="360" width="290" height="740" rx="145" fill="#fff0c9"/><path d="M795 380V1090M665 730H925" stroke="#c9c3a2" stroke-width="10"/><path d="M0 1480L1080 1120V1920H0Z" fill="#adb69d"/>'
        detail=person(500,1070,1.6,'pray','#567d74')+'<path d="M30 1470H950" stroke="#849982" stroke-width="8"/>'
    return f'<svg viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">{base}<g id="illustration">{detail}</g></svg>'
