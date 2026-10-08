"""Recompose the editable HyperFrames film for landscape YouTube delivery."""
import json,uuid,datetime,re,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
work=ROOT/'.mindstudio/humilite-work'
source=ROOT/'.mindstudio/studio'/json.loads((work/'project.json').read_text())['id']
cache=work/'landscape-project.json'
meta=json.loads(cache.read_text()) if cache.exists() else dict(id='free-'+str(uuid.uuid4()),name='L’humilité · La force qui sert · YouTube 16:9',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
cache.write_text(json.dumps(meta));p=ROOT/'.mindstudio/studio'/meta['id'];p.mkdir(exist_ok=True);(p/'compositions').mkdir(exist_ok=True)
(p/'mindstudio-project.json').write_text(json.dumps(meta))
for f in ['narration.wav','gsap.min.js','brief.txt','transcription.txt','paroles.srt','storyboard.json','director-markers.json','notes.md','rehearsal.html']:shutil.copy(source/f,p/f)
shutil.copy(work/'music-balanced.wav' if (work/'music-balanced.wav').exists() else source/'music.wav',p/'music.wav')
rehearsal=(p/'rehearsal.html').read_text().replace('video{height:90vh}','video{width:70vw;height:auto;max-height:85vh;object-fit:contain}')
(p/'rehearsal.html').write_text(rehearsal)
css='''*{box-sizing:border-box}html,body{margin:0;background:#233e35}#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(ellipse at 90% 15%,#3d5c4d,transparent 70%),#233e35}.visual{position:absolute;left:110px;top:70px;width:850px;height:850px;overflow:hidden;border-radius:28px;transform-origin:50% 56%}.visual svg{width:850px;height:850px;overflow:hidden}.title{position:absolute;left:1130px;right:110px;top:255px;margin:0;color:#fff0d5;font:600 76px/1.13 Georgia;overflow-wrap:break-word}.rule{width:100px;height:5px;background:#c7a461;margin-top:32px}.eyebrow{position:absolute;left:1130px;right:110px;top:145px;color:#d3bc88;font:24px Arial;letter-spacing:3px}.shade{display:none}.caption{position:absolute;left:220px;right:220px;bottom:58px;text-align:center;color:#fff8ea;font:44px/1.22 Arial;text-shadow:0 2px 6px #0007}.hero{position:absolute;left:1130px;right:110px;top:610px;color:#d5be89;font:48px/1.15 Georgia}.note{position:absolute;left:1130px;right:110px;bottom:210px;color:#d8ccb0;font:22px Arial}'''
for f in (source/'compositions').glob('*.html'):
    s=f.read_text();s=re.sub(r'<style>.*?</style>','<style>'+css+'</style>',s,flags=re.S)
    s=s.replace('data-width="1080" data-height="1920"','data-width="1920" data-height="1080"')
    s=s.replace('viewBox="0 0 1080 1920"','viewBox="0 450 1080 1080"')
    (p/'compositions'/f.name).write_text(s)
s=(source/'index.html').read_text().replace('width:1080px;height:1920px','width:1920px;height:1080px').replace('data-width="1080" data-height="1920"','data-width="1920" data-height="1080"')
(p/'index.html').write_text(s)
with (p/'notes.md').open('a') as f:f.write('\nVersion YouTube 16:9 : illustrations recomposées à gauche, titres à droite, sous-titres dans la marge inférieure. Audio et timings conservés.\n')
print(json.dumps(dict(id=meta['id'],project=str(p))))
