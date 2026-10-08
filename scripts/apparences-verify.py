"""Verify the delivered HyperFrames MP4, never an intermediate render."""
import json,re,subprocess,hashlib
from pathlib import Path
import numpy as np
W=Path('.mindstudio/apparences-work');P=Path('.mindstudio/studio')/json.loads((W/'project.json').read_text())['id'];video=P/'delivery.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
v=next(x for x in probe['streams'] if x['codec_type']=='video');a=next(x for x in probe['streams'] if x['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'],a['codec_name'])==(1920,1080,'24/1','h264','aac')
assert 522.364833<=float(v['duration'])<=522.364833+1/24+.001
assert abs(float(a['duration'])-522.364833)<.025
levels=subprocess.run(['ffmpeg','-hide_banner','-i',str(video),'-vn','-af','volumedetect','-f','null','-'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True,check=True).stderr
(W/'final-level.log').write_text(levels)
mean=float(re.search(r'mean_volume: ([-\d.]+)',levels)[1]);peak=float(re.search(r'max_volume: ([-\d.]+)',levels)[1]);assert peak<0
def decode(p):return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ac','1','-ar','24000','pipe:1']),dtype='<f4')
x=decode(video);y=decode(P/'narration.wav');n=min(len(x),len(y));x=x[:n];y=y[:n];corr=float(np.corrcoef(x,y)[0,1]);gain=float(np.dot(x,y)/np.dot(y,y));residual=x-y*gain;assert corr>.9
residualDb=float(20*np.log10(np.sqrt(np.mean(residual**2))));assert residualDb>-50
q=json.loads((P/'quality-report.json').read_text());q.update(exportComplete=True,export={'resolution':[1920,1080],'fps':24,'videoCodec':v['codec_name'],'audioCodec':a['codec_name'],'videoDuration':float(v['duration']),'audioDuration':float(a['duration']),'bytes':video.stat().st_size,'sha256':hashlib.sha256(video.read_bytes()).hexdigest()},mixedAudio={'meanDb':mean,'peakDb':peak,'clippingDetected':False,'narrationCorrelation':corr,'nonVoiceResidualRmsDb':residualDb},renderProfile='HyperFrames native parallel screenshot streaming, four workers; experimental fast capture disabled; avoids temporary disk frame storage.')
(P/'quality-report.json').write_text(json.dumps(q,ensure_ascii=False,indent=2));(W/'final-probe.json').write_text(json.dumps(probe,indent=2))
for label,t in [('opening',1),('host',43),('choice',100.8),('messages',135),('reconstruction',324.7),('end',522.2)]:
 subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t),'-i',str(video),'-frames:v','1',str(W/f'final-{label}.png')],check=True)
print(json.dumps({'export':q['export'],'mixedAudio':q['mixedAudio']},ensure_ascii=False))
