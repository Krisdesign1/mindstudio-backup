"""Compose a discreet local instrumental bed; HyperFrames performs the final mix."""
import json
from pathlib import Path
import numpy as np
from scipy.io.wavfile import read,write
ROOT=Path(__file__).resolve().parent.parent
p=ROOT/'.mindstudio/studio'/json.loads((ROOT/'.mindstudio/humilite-work/project.json').read_text())['id']
D=350.590083;sr=24000;t=np.arange(round(D*sr))/sr
y=np.zeros_like(t)
chords=[[130.81,164.81,196],[110,130.81,164.81],[87.31,130.81,174.61],[98,146.83,196]]
for k,a in enumerate(np.arange(0,D,24)):
    z=t-a;env=np.minimum(np.clip(z/3,0,1),np.clip((28-z)/4,0,1))
    y+=sum(np.sin(2*np.pi*f*z+.025*np.sin(z*.15)) for f in chords[k%4])/3*env*.005
# Voice-sensitive ducking based on actual master amplitude, without modifying the master.
vs,v=read(p/'narration.wav');v=v.astype(float)
if v.ndim>1:v=v.mean(axis=1)
v/=max(1,np.max(abs(v)));step=max(1,int(vs*.2))
rms=np.array([np.sqrt(np.mean(v[j:j+step]**2)) for j in range(0,len(v),step)])
duck=np.interp(t,np.arange(len(rms))*.2,np.clip(1-rms*3,.28,1))
markers=json.loads((p/'director-markers.json').read_text())
for m in markers:
    if m['name'] in ['LISTEN','RECOGNIZE','HONOR']:
        z=t-m['time'];env=np.exp(-np.maximum(z,0)*6)*(z>=0)*(z<1)
        y+=.008*env*np.sin(2*np.pi*523.25*z)
    if m['name'] in ['FINAL_QUESTION','JOHN_13','IDENTITY_STABLE']:
        q=t-m['time'];duck*=1-.75*np.minimum(np.clip(q/.5,0,1),np.clip((8-q)/1,0,1))
y*=duck*np.minimum(np.clip(t/2,0,1),np.clip((D-t)/4,0,1))
y*=10**(18/20)
write(p/'music.wav',sr,(np.clip(y,-1,1)*32767).astype(np.int16))
print(json.dumps({'peak':float(max(abs(y))),'duration':len(y)/sr}))
