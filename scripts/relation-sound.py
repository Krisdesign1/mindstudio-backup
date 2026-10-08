"""Original evolving piano/pad score and sparse, locally synthesized object cues."""
import json
from pathlib import Path
import numpy as np
from scipy.io.wavfile import read,write
R=Path(__file__).resolve().parent.parent;W=R/'.mindstudio/relation-work';P=R/'.mindstudio/studio'/json.loads((W/'project.json').read_text())['id'];D=426.353042;sr=24000;N=round(D*sr)
vs,v=read(P/'narration.wav');v=v.astype(np.float32)/(np.iinfo(v.dtype).max if np.issubdtype(v.dtype,np.integer) else 1)
if v.ndim>1:v=v.mean(axis=1)
step=int(vs*.2);rms=np.array([np.sqrt(np.mean(v[j:j+step]**2)) for j in range(0,len(v),step)]);t=np.arange(N,dtype=np.float32)/sr;duck=np.interp(t,np.arange(len(rms))*.2,np.clip(1-rms*3,.40,1)).astype(np.float32)
shots=json.loads((P/'storyboard.json').read_text());music=np.zeros(N,dtype=np.float32);chords=[[146.83,174.61,220],[130.81,164.81,196],[116.54,146.83,174.61],[130.81,164.81,220]]
def add(a,duration,fn):
 st=int(a*sr);n=min(int(duration*sr),N-st)
 if n<=0:return
 z=np.arange(n,dtype=np.float32)/sr;music[st:st+n]+=fn(z)
for i,a in enumerate(np.arange(0,D,18)):
 chord=chords[i%4];depth=.028 if a<85 else .018 if a<150 else .027 if a<320 else .037
 add(a,22,lambda z,c=chord,g=depth:sum(np.sin(2*np.pi*f*z)+.1*np.sin(4*np.pi*f*z) for f in c)/3*g*np.minimum(np.clip(z/2.5,0,1),np.clip((22-z)/4,0,1)))
 for j,f in enumerate(chord*2):
  add(a+1+j*2.7,4,lambda z,f=f:.024*(np.sin(2*np.pi*f*2*z)+.18*np.sin(2*np.pi*f*4*z))*np.exp(-z*1.5)*np.clip(z/.015,0,1))
for s in shots:
 if s['kind'] in ('question','comparison','grief','silence'):
  a=s['start'];b=s['end'];st=int(a*sr);en=int(b*sr);z=t[st:en]-a;duck[st:en]*=1-.35*np.minimum(np.clip(z/.25,0,1),np.clip((b-a-z)/.7,0,1))
fade=np.minimum(np.clip(t/1.5,0,1),np.clip((D-t)/3,0,1));music*=duck*fade*2.4
rng=np.random.default_rng(32);tracks={'music':music,'ambience':rng.normal(0,.00055,N).astype(np.float32)*fade,'ui':np.zeros(N,dtype=np.float32),'foley':np.zeros(N,dtype=np.float32),'transitions':np.zeros(N,dtype=np.float32),'impacts':np.zeros(N,dtype=np.float32)};events=[]
def event(track,a,kind,level=.025,duration=.5):
 st=int(a*sr);n=min(int(duration*sr),N-st)
 if n<=0:return
 z=np.arange(n)/sr;env=np.sin(np.pi*np.minimum(z/duration,1))**2
 if kind=='tick':sig=np.sin(2*np.pi*720*z)*np.exp(-z*15)
 elif kind in ('case','paper'):sig=rng.normal(size=n)*.26
 elif kind=='step':sig=np.sin(2*np.pi*140*z)*np.exp(-z*12)+rng.normal(size=n)*.12*np.exp(-z*18)
 elif kind=='swish':sig=rng.normal(size=n)*.23
 elif kind=='door':sig=np.sin(2*np.pi*190*z)*np.exp(-z*9)
 else:sig=np.sin(2*np.pi*100*z)*np.exp(-z*5)
 tracks[track][st:st+n]+=sig*env*level;events.append(dict(track=track,time=a,kind=kind,level=level,duration=duration))
used={}
for s in shots:
 a=s['start'];k=s['kind'];used[k]=used.get(k,0)+1
 if k=='exit':event('foley',a+.45,'step',.035,.3)
 if k=='serve' and used[k]==1:event('foley',a+.25,'tick',.015,.18)
 if k in ('loan','journal','repair') and used[k]<3:event('foley',a+.4,'paper',.025,.4)
 if k in ('door','exit') and used[k]<3:event('foley',a+.6,'door',.022,.4)
 if k=='notification' and used[k]==1:event('ui',a+.3,'tick',.023,.3)
 if k=='comparison' and used[k]==1:event('ui',a,'tick',.022,.3)
 if k=='calendar' and used[k] in (1,3):event('transitions',a,'swish',.016,.5)
 # No impact or notification at the reported death; respect the silence.
for name,y in tracks.items():write(P/(name+'.wav'),sr,(np.clip(y,-.95,.95)*32767).astype(np.int16))
(P/'sound-design.json').write_text(json.dumps(dict(originalScore=True,voiceSourceUnchanged=True,events=events,musicRmsDb=float(20*np.log10(np.sqrt(np.mean(music**2))))),indent=2));print(json.dumps(dict(events=len(events),musicRmsDb=float(20*np.log10(np.sqrt(np.mean(music**2)))))))
