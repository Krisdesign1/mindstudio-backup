import json,re,shutil
from pathlib import Path
w=Path('.mindstudio/priere-v2-work');p=Path('.mindstudio/studio')/json.loads((w/'project.json').read_text())['id'];d=w/'review';d.mkdir(exist_ok=True);(d/'compositions').mkdir(exist_ok=True);D=41.22
for f in ['narration.wav','music.wav','ambience.wav','ui.wav','foley.wav','transitions.wav','impacts.wav','gsap.min.js']:shutil.copy(p/f,d/f)
for f in (p/'compositions').glob('*.html'):shutil.copy(f,d/'compositions'/f.name)
s=(p/'index.html').read_text();s=re.sub(r'<div class="clip" id="clip-\d+"[^>]*data-start="([\d.]+)"[^>]*></div>',lambda m:m[0] if float(m[1])<D else '',s);s=s.replace('531.537042',str(D));(d/'index.html').write_text(s)
c=(d/'compositions/captions.html').read_text();c=re.sub(r'<div id="caption-\d+"[^>]*data-start="([\d.]+)".*?</div>',lambda m:m[0] if float(m[1])<D else '',c);c=c.replace('531.537042',str(D));(d/'compositions/captions.html').write_text(c)
