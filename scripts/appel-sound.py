"""Original low-key score and sparse contextual sound design; all seven tracks mixed by HF."""
import json
from pathlib import Path
import numpy as np
from scipy.io.wavfile import read,write
R=Path(__file__).resolve().parent.parent;P=R/'.mindstudio/studio'/json.loads((R/'.mindstudio/appel-work/project.json').read_text())['id'];D=345.708875;sr=24000;t=np.arange(round(D*sr))/sr
vs,v=read(P/'narration.wav');scale=np.iinfo(v.dtype).max if np.issubdtype(v.dtype,np.integer) else 1;v=v.astype(float)/scale
if v.ndim>1:v=v.mean(axis=1)
step=int(vs*.2);rms=np.array([np.sqrt(np.mean(v[j:j+step]**2)) for j in range(0,len(v),step)]);duck=np.interp(t,np.arange(len(rms))*.2,np.clip(1-rms*3,.42,1))
chords=[[220,261.63,329.63],[174.61,220,349.23],[196,246.94,392],[164.81,246.94,329.63]];music=np.zeros_like(t)
for i,a in enumerate(np.arange(0,D,16)):
 z=t-a;env=np.minimum(np.clip(z/2,0,1),np.clip((20-z)/4,0,1));music+=sum(np.sin(2*np.pi*f*z+.03*np.sin(z*.2))+.14*np.sin(2*np.pi*f*2*z) for f in chords[i%4])/3*env*.043
 # Gentle piano-like arpeggio instead of the old single low-frequency drone.
 for j,f in enumerate(chords[i%4]*2):
  q=t-a-j*2.2-1;en=np.exp(-np.maximum(q,0)*1.5)*np.minimum(np.clip(q/.025,0,1),1)*(q<4);music+=.020*en*(np.sin(2*np.pi*f*q)+.22*np.sin(2*np.pi*2*f*q)+.1*np.sin(2*np.pi*3*f*q))
shots=json.loads((P/'storyboard.json').read_text());accent=[s['start'] for s in shots if s['kind']=='type'];
for a in accent:
 q=t-a;duck*=1-.45*np.minimum(np.clip(q/.3,0,1),np.clip((3-q)/.8,0,1))
fade=np.minimum(np.clip(t/1.5,0,1),np.clip((D-t)/3,0,1));music*=duck*fade*10**(.2)
rng=np.random.default_rng(15);amb=.0006*rng.normal(size=len(t));amb*=fade
tracks={'music':music,'ambience':amb,'ui':np.zeros_like(t),'foley':np.zeros_like(t),'transitions':np.zeros_like(t),'impacts':np.zeros_like(t)};events=[]
def event(track,a,kind,level=.025,duration=.7):
 st=int(a*sr);n=int(duration*sr);z=np.arange(n)/sr;env=np.sin(np.pi*np.minimum(z/duration,1))**2
 if kind=='tick':sig=np.sin(2*np.pi*660*z)*np.exp(-z*14)
 elif kind=='water':sig=rng.normal(size=n)*.4+np.sin(2*np.pi*(760*z+400*z*z))*.18
 elif kind=='cloth':sig=rng.normal(size=n)*.35
 elif kind=='swish':sig=rng.normal(size=n)*.3
 else:sig=np.sin(2*np.pi*110*z)*np.exp(-z*5)+.25*np.sin(2*np.pi*220*z)*np.exp(-z*7)
 tracks[track][st:st+n]+=sig[:len(t)-st]*env[:len(t)-st]*level;events.append(dict(track=track,time=a,kind=kind,level=level))
for s in shots:
 a=s['start'];k=s['kind']
 if k=='type' and a>5:event('ui',a,'tick',.04,.3)
 if k in ('blocked','blocked-two') and a<170:event('impacts',a,'impact',.038,.65)
 if k=='vision':event('transitions',a,'swish',.023,1.2)
 if k=='bible':event('foley',a,'cloth',.025,.5)
 if k=='phone':event('ui',a+.4,'tick',.035,.25)
 if k=='waiting':event('foley',a+.5,'tick',.025,.25)
for name,y in tracks.items():write(P/(name+'.wav'),sr,(np.clip(y,-.95,.95)*32767).astype(np.int16))
(P/'sound-design.json').write_text(json.dumps(dict(events=events,originalScore=True,voiceUnchanged=True,musicRmsDb=20*np.log10(np.sqrt(np.mean(music**2)))),indent=2));print(json.dumps(dict(events=len(events),musicRmsDb=20*np.log10(np.sqrt(np.mean(music**2))),peak=float(max(abs(music))))))
