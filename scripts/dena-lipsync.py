"""Audio-driven stylized lipsync: French pronunciation estimated inside aligned words.
Not a forced phoneme aligner. Original audio is never synthesized or replaced.
"""
import json,subprocess,re,math,array,shutil
from pathlib import Path
root=Path(__file__).resolve().parent.parent
work=root/'.mindstudio/dena-work'
p=root/'.mindstudio/studio'/json.loads((work/'project.json').read_text())['id']
words=json.loads((work/'aligned.json').read_text())['words']
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p/'narration.mp3'),'-f','f32le','-ac','1','-ar','16000','-'])
samples=array.array('f',raw)
def rms(t):
 a=max(0,int((t-.015)*16000));b=min(len(samples),int((t+.015)*16000))
 return math.sqrt(sum(v*v for v in samples[a:b])/max(1,b-a))
def category(c):
 if c in 'mbp':return 'closed'
 if c in 'fv':return 'teeth'
 if c in 'ouɔøywɥœ':return 'round'
 if c in 'aɑɛæ':return 'open'
 if c in 'ieɪj':return 'wide'
 return 'small'
phonemes=[]
for w in words:
 ipa=subprocess.check_output(['espeak','-q','--ipa','-v','fr',w['text']],text=True).strip()
 chars=[c for c in ipa if c.isalpha() and c not in 'ː']
 if not chars:continue
 weights=[1.4 if category(c) in ['open','round','wide'] else .8 for c in chars]
 total=sum(weights);t=w['start'];dur=w['end']-t
 for c,weight in zip(chars,weights):
  end=t+dur*weight/total;phonemes.append(dict(start=t,end=end,phoneme=c,shape=category(c)));t=end
shapes={'closed':(34,1),'teeth':(34,5),'round':(18,19),'open':(33,23),'wide':(42,10),'small':(28,8)}
def path(rx,ry,cy=65):
 # Identical commands across poses permit deterministic GSAP path interpolation.
 return f'M{-rx} {cy} C{-rx} {cy-ry*.65} {-rx*.55} {cy-ry} 0 {cy-ry} C{rx*.55} {cy-ry} {rx} {cy-ry*.65} {rx} {cy} C{rx} {cy+ry*.7} {rx*.55} {cy+ry} 0 {cy+ry} C{-rx*.55} {cy+ry} {-rx} {cy+ry*.7} {-rx} {cy} Z'
old='<path d="M-42 64Q-18 46 0 56Q18 46 43 61Q17 85-10 79Q-29 75-42 64" fill="#713d35"/><path d="M-35 63Q0 68 35 61" fill="none" stroke="#d79c80" stroke-width="3"/>'
board=json.loads((p/'storyboard.json').read_text());enabled={0,1,6,7,8,9,10};fps=24;tracks=[]
backup=work/'before-lipsync';backup.mkdir(exist_ok=True)
for i,shot in enumerate(board):
 if i not in enabled:continue
 file=p/'compositions'/f"{shot['id']}.html"
 original=backup/file.name
 if not original.exists():shutil.copy(file,original)
 s=original.read_text()
 match=re.search(r'<path[^>]*d="M-42 64Q[^"]*"[^>]*/>\s*<path[^>]*d="M-35 63Q[^"]*"[^>]*/>',s)
 assert match,file
 mouth=f'<g id="dena-mouth-{i}" data-speaker="dena"><path id="lip-{i}" d="{path(34,4)}" fill="#865047"/><path id="cavity-{i}" d="{path(32,1)}" fill="#371d20"/><path id="teeth-{i}" d="M-25 61Q0 64 25 61L23 65Q0 68-23 65Z" fill="#ead8bd" opacity="0"/></g>'
 s=s[:match.start()]+mouth+s[match.end():]
 start,end=shot['start'],shot['end'];timeline=''
 timeline+=f"tl.set('#lip-{i}',{{attr:{{d:{json.dumps(path(34,4))}}}}},0);tl.set('#cavity-{i}',{{attr:{{d:{json.dumps(path(32,1))}}}}},0);tl.set('#teeth-{i}',{{opacity:0}},0);"
 for f in range(math.ceil((end-start)*fps)):
  t=start+f/fps;ph=next((v for v in phonemes if v['start']<=t<v['end']),None);energy=rms(t)
  shape=ph['shape'] if ph and energy>.005 else 'closed'
  rx,ry=shapes[shape]
  if shape!='closed':ry*=max(.45,min(1.15,energy/.065))
  at=round(f/fps,6);dur=min(1/fps-.00001,end-start-at)
  timeline+=f"tl.to('#lip-{i}',{{attr:{{d:{json.dumps(path(rx+3,ry+3))}}},duration:{dur},ease:'none'}},{at});"
  timeline+=f"tl.to('#cavity-{i}',{{attr:{{d:{json.dumps(path(rx,ry))}}},duration:{dur},ease:'none'}},{at});"
  timeline+=f"tl.to('#teeth-{i}',{{opacity:{.85 if shape in ['wide','teeth'] else 0},duration:{dur},ease:'none'}},{at});"
  tracks.append(dict(time=round(t,4),scene=shot['id'],shape=shape,energy=round(energy,4)))
 s=s.replace('window.__timelines=window.__timelines||{};',timeline+'window.__timelines=window.__timelines||{};')
 file.write_text(s)
(p/'lip-sync.json').write_text(json.dumps(dict(method='French pronunciation estimated inside aligned words; original audio RMS gating, 24fps',phonemes=phonemes,frames=tracks),ensure_ascii=False))
notes=p/'notes-montage.md';txt=notes.read_text();marker='\n## Synchronisation labiale'
notes.write_text(txt.split(marker)[0]+marker+'\n\nSeule Dena est animée sur les plans où elle apparaît. Formes de lèvres françaises estimées à partir des mots alignés ; énergie audio mesurée pour moduler l’ouverture et fermer la bouche dans les silences. Cette animation stylisée ne constitue pas un alignement phonétique exact. Poses et minutages conservés dans lip-sync.json ; GSAP anime directement les tracés SVG. Fally Ipupa et Sephora ne parlent pas sur cette piste.\n')
print(json.dumps({'animatedScenes':len(enabled),'frames':len(tracks),'phonemes':len(phonemes),'closedFrames':sum(v['shape']=='closed' for v in tracks)}))
