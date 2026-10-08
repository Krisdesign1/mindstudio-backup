"""Reusable vector rig: exact Humilité V2 host head, articulated body and hands.

Placement wrappers are separate from local joint rotations. All rotation groups
start at local (0,0); the film writes SVG transform attributes, not CSS origins.
"""
import importlib.util
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('humilite_reference', Path(__file__).with_name('humilite-v2-art.py'))
reference = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reference)
DEFS = reference.DEFS + '''<defs>
<linearGradient id="hostcoat" x2="1" y2="1"><stop stop-color="#d79575"/><stop offset=".5" stop-color="#b97558"/><stop offset="1" stop-color="#824936"/></linearGradient>
<linearGradient id="actorcoat" x2="1" y2="1"><stop stop-color="#657fa4"/><stop offset="1" stop-color="#304467"/></linearGradient>
</defs>'''

def head(pid, gender='f', emotion='calm', host=True):
    original = ET.fromstring(reference.person(pid,0,0,gender=gender,emotion=emotion))
    element = next(e for e in original if e.attrib.get('id') == pid+'-head')
    # Secondary identities deliberately differ. The host face remains untouched.
    if not host:
        for e in element.iter():
            if e.get('fill') == 'url(#skin)': e.set('fill', '#a57557' if gender=='m' else '#c28a65')
        if gender=='f':
            for e in list(element):
                if e.tag=='ellipse' and e.get('cy')=='-151': element.remove(e)
            extra=ET.fromstring('<path d="M-93-85Q-120-158-10-170Q101-170 103-50L80-105Q0-130-65-75Z" fill="#5a382d"/>')
            element.append(extra)
    return ET.tostring(element,encoding='unicode')

def hand(pid, side, pose='rest'):
    # Palm + four fingers + a thumb: five digits; rounded caps, real knuckles.
    fingers=''
    for i,(x,length) in enumerate([(-16,28),(-5,36),(6,34),(16,26)]):
        angle=0 if pose in ('open','question','point') else [12,8,-5,-10][i]
        if pose=='point' and i>0: length=14
        if pose=='hold': angle=[25,12,-15,-26][i]; length*=.68
        fingers+=f'<g transform="translate({x} 14)"><g id="{pid}-{side}-finger-{i}" transform="rotate({angle})"><path d="M0 0L0 {length}" stroke="#b77956" stroke-width="10" stroke-linecap="round"/><path d="M-3 8H3" stroke="#926044" stroke-width="1.5" opacity=".35"/></g></g>'
    thumb='<g transform="translate(-21 5)"><g id="'+pid+'-'+side+'-thumb"><path d="M0 0Q-18 8-23 25" fill="none" stroke="url(#skin)" stroke-width="12" stroke-linecap="round"/></g></g>'
    return f'<g id="{pid}-{side}-palm"><path d="M-24-5Q0-15 24-5L23 22Q17 34-2 34Q-22 31-23 15Z" fill="url(#skin)"/><path d="M-16 5Q0 13 17 3M-13 21Q0 14 10 23" fill="none" stroke="#87543a" stroke-width="1.8" opacity=".42"/>{fingers}{thumb}</g>'

def arm(pid,side,coat,angles=(0,0,0),pose='rest'):
    sign=-1 if side=='left' else 1
    a,b,c=angles
    # A zero-width vertical path cannot use an objectBoundingBox gradient as
    # stroke in Chromium: use a solid fabric tone, then authored seam/light.
    sleeve='#b97558' if coat=='url(#hostcoat)' else '#526b8e'
    return f'''<g transform="translate({sign*135} 184)"><g id="{pid}-{side}-shoulder" transform="rotate({a})">
    <path data-sleeve="{pid}" d="M0 0L0 115" fill="none" stroke="{sleeve}" stroke-width="58" stroke-linecap="round"/>
    <path d="M{sign*15} 11L{sign*15} 97" fill="none" stroke="#3f332f" stroke-width="2" opacity=".22"/>
    <g transform="translate(0 115)"><g id="{pid}-{side}-elbow" transform="rotate({b})"><path data-sleeve="{pid}" d="M0 0L0 108" fill="none" stroke="{sleeve}" stroke-width="48" stroke-linecap="round"/><path d="M-21 88L21 88" stroke="#f4ead5" stroke-width="11"/>
    <g transform="translate(0 119)"><g id="{pid}-{side}-wrist" transform="rotate({c})">{hand(pid,side,pose)}</g></g></g></g></g></g>'''

def leg(pid,side,seated=False):
    sign=-1 if side=='left' else 1
    angle=-76 if seated else (-3 if side=='left' else 3)
    knee=76 if seated else -angle
    return f'''<g transform="translate({sign*53} 420)"><g id="{pid}-{side}-hip" transform="rotate({angle})"><path d="M0 0L0 125" stroke="#29384e" stroke-width="63" stroke-linecap="round"/><g transform="translate(0 125)"><g id="{pid}-{side}-knee" transform="rotate({knee})"><path d="M0 0L0 120" stroke="#29384e" stroke-width="55" stroke-linecap="round"/><g transform="translate(0 125)"><g id="{pid}-{side}-ankle"><path d="M-27-9L-27 31Q6 40 56 31L52 18L26-8Z" fill="#151d2c"/><path d="M-24 29H52" stroke="#e2ba7b" stroke-width="3"/></g></g></g></g></g></g>'''

POSES={
 'rest': [(4,-5,3),(-4,5,-3)],
 'explain': [(18,48,-28),(-24,-60,35)],
 'question': [(24,73,-55),(-24,-73,55)],
 'welcome': [(33,42,-30),(-33,-42,30)],
 'calm': [(18,35,-20),(-16,-54,38)],
 'chest': [(2,-10,0),(25,115,-20)],
 'point': [(3,0,0),(-68,-23,22)],
 'prayer': [(-16,-115,24),(16,115,-24)],
 'lap': [(-13,-57,24),(13,57,-24)],
 'work': [(-23,-53,50),(23,53,-50)],
}

def person(pid,x,y,scale=1,pose='rest',gender='f',host=True,seated=False,emotion='calm'):
    coat='url(#hostcoat)' if host else 'url(#actorcoat)'
    angles=POSES[pose]; handpose='open' if pose in ('explain','question','welcome','calm') else 'point' if pose=='point' else 'hold' if pose in ('prayer','work') else 'rest'
    legs=leg(pid,'left',seated)+leg(pid,'right',seated)
    torso=f'''<path d="M-153 188Q-134 143-55 132L0 162L55 132Q136 143 153 188L126 443Q0 469-126 443Z" fill="{coat}"/><path d="M-49 134L0 163L49 134L39 248H-39Z" fill="#f4e8ce"/><path d="M-54 134L-88 179L-40 279L0 163M54 134L88 179L40 279L0 163" fill="none" stroke="#e5b793" stroke-width="6" opacity=".6"/><path d="M-103 241L-89 423M104 241L89 423M0 288V445" fill="none" stroke="#4e3c35" stroke-width="3" opacity=".27"/><path d="M37 308H86V324H37Z" fill="#714b3b" opacity=".25"/><circle cx="7" cy="332" r="4" fill="#efca94"/><circle cx="7" cy="385" r="4" fill="#efca94"/>'''
    return f'''<g id="{pid}-placement" transform="translate({x} {y}) scale({scale})"><g id="{pid}-root">{legs}<g transform="translate(0 420)"><g id="{pid}-bust"><g transform="translate(0 -420)">{torso}{arm(pid,'left',coat,angles[0],handpose)}{arm(pid,'right',coat,angles[1],handpose)}<g transform="translate(0 125)"><g id="{pid}-neck"><g transform="translate(0 -125)">{head(pid,gender,emotion,host)}</g></g></g></g></g></g></g></g>'''

def athoms(pid,x,y,scale=1):
    raw=(ROOT/'.mindstudio/studio/free-athoms-character-v1/athoms-rig.svg').read_text()
    raw=re.sub(r'^.*?<svg[^>]*>','',raw,flags=re.S)
    raw=re.sub(r'</svg>\s*$','',raw)
    raw=raw.replace('athoms',pid)
    # A real person's illustration is silent under voice-over, never an imitation.
    raw=re.sub(r'<g id="'+pid+r'-mouth">.*?</g>',f'<g id="{pid}-mouth"><path d="M-24 66Q0 71 24 66" stroke="#48291f" stroke-width="5" fill="none" stroke-linecap="round"/></g>',raw,flags=re.S)
    return f'<g id="{pid}-placement" transform="translate({x} {y}) scale({scale})">{raw}</g>'

def prefix(svg,cid):
    ids=re.findall(r'id="([^"]+)"',svg)
    for value in sorted(set(ids),key=len,reverse=True):
        svg=svg.replace('id="'+value+'"','id="'+cid+'-'+value+'"').replace('url(#'+value+')','url(#'+cid+'-'+value+')')
    # Instance-specific pupil selectors.
    svg=re.sub(r'class="([^" ]+)-pupils"',lambda m:f'class="{cid}-{m[1]}-pupils"',svg)
    return svg
