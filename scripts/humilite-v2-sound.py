"""Original low-key score and sparse contextual sound design; all seven tracks mixed by HF."""
import json
from pathlib import Path
import numpy as np
from scipy.io.wavfile import read,write
R=Path(__file__).resolve().parent.parent;P=R/'.mindstudio/studio'/json.loads((R/'.mindstudio/humilite-v2/project.json').read_text())['id'];D=350.590083;sr=24000;t=np.arange(round(D*sr))/sr
vs,v=read(P/'narration.wav');scale=np.iinfo(v.dtype).max if np.issubdtype(v.dtype,np.integer) else 1;v=v.astype(float)/scale
if v.ndim>1:v=v.mean(axis=1)
step=int(vs*.2);rms=np.array([np.sqrt(np.mean(v[j:j+step]**2)) for j in range(0,len(v),step)]);duck=np.interp(t,np.arange(len(rms))*.2,np.clip(1-rms*3,.42,1))
chords=[[261.63,329.63,392],[220,261.63,329.63],[174.61,261.63,349.23],[196,293.66,392]];music=np.zeros_like(t)
for i,a in enumerate(np.arange(0,D,16)):
 z=t-a;env=np.minimum(np.clip(z/2,0,1),np.clip((20-z)/4,0,1));music+=sum(np.sin(2*np.pi*f*z+.03*np.sin(z*.2))+.14*np.sin(2*np.pi*f*2*z) for f in chords[i%4])/3*env*.043
 # Gentle piano-like arpeggio instead of the old single low-frequency drone.
 for j,f in enumerate(chords[i%4]*2):
  q=t-a-j*2.2-1;en=np.exp(-np.maximum(q,0)*1.5)*np.minimum(np.clip(q/.025,0,1),1)*(q<4);music+=.020*en*(np.sin(2*np.pi*f*q)+.22*np.sin(2*np.pi*2*f*q)+.1*np.sin(2*np.pi*3*f*q))
for a in [18.76,62.16,81.08,129.72,198.72,255.66,265.8,280.16,318.46]:
 q=t-a;duck*=1-.55*np.minimum(np.clip(q/.3,0,1),np.clip((3-q)/.8,0,1))
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
for a in [255.66,265.8,280.16]:event('ui',a,'tick',.075,.35)
for a in [50.4,56.9]:event('foley',a,'cloth',.045,.9)
for a in [51.4,58.6]:event('foley',a,'water',.025,1.1)
for a in [129.72,168.66]:event('foley',a,'cloth',.026,.5)
for a in [165.92,250.22]:event('transitions',a,'swish',.026,.5)
for a in [18.76,339.82]:event('impacts',a,'impact',.065,.7)
for name,y in tracks.items():write(P/(name+'.wav'),sr,(np.clip(y,-.95,.95)*32767).astype(np.int16))
(P/'sound-design.json').write_text(json.dumps(dict(events=events,originalScore=True,voiceUnchanged=True,musicRmsDb=20*np.log10(np.sqrt(np.mean(music**2)))),indent=2));print(json.dumps(dict(events=len(events),musicRmsDb=20*np.log10(np.sqrt(np.mean(music**2))),peak=float(max(abs(music))))))
