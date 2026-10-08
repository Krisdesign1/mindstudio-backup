"""Improve short orphan subtitle cues without changing spoken word timing."""
import json, html, re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
work=root/'.mindstudio/david-work'
p=root/'.mindstudio/studio'/json.loads((work/'project.json').read_text())['id']
data=json.loads((work/'aligned.json').read_text())
def words(c): return [w for line in c['lines'] for w in line]
def lines(ws):
 result=[[]]
 for w in ws:
  if result[-1] and len(' '.join(x['text'] for x in result[-1]+[w]))>44: result.append([])
  result[-1].append(w)
 return result
cues=[]
for c in data['cues']:
 if c['end']-c['start']<.65 and cues and c['start']-cues[-1]['end']<.25:
  combined=lines(words(cues[-1])+words(c))
  if len(combined)<=2 and c['end']-cues[-1]['start']<6:
   cues[-1]['end']=c['end'];cues[-1]['lines']=combined;continue
 cues.append(c)
for i,c in enumerate(cues):
 if c['end']-c['start']<.65:
  c['end']=min(c['start']+.65,cues[i+1]['start'] if i+1<len(cues) else 339.441)
data['cues']=cues
(p/'alignment.json').write_text(json.dumps(data,ensure_ascii=False))
def text(c):return '\n'.join(' '.join(w['text'] for w in line) for line in c['lines'])
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(p/'paroles.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{text(c)}' for i,c in enumerate(cues))+'\n')
caps=''.join(f'<div id="caption-{i}" class="clip lyrics" data-start="{c["start"]}" data-duration="{c["end"]-c["start"]}" data-track-index="2">{html.escape(text(c)).replace(chr(10),"<br>")}</div>' for i,c in enumerate(cues))
s=(p/'index.html').read_text();s=re.sub(r'<div[^>]*id="caption-\d+"[^>]*>.*?</div>','',s,flags=re.S)
s=s.replace('<audio ',caps+'<audio ',1);(p/'index.html').write_text(s)
print(f'{len(cues)} readable cues')
