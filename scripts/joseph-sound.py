"""Quiet original synthetic ambience and door accents; no external media or generated voice."""
from pathlib import Path
import json,numpy as np
from scipy.io.wavfile import write
from scipy.signal import butter,sosfilt
root=Path(__file__).resolve().parent.parent;p=root/'.mindstudio/studio'/json.loads((root/'.mindstudio/joseph-work/project.json').read_text())['id'];D=105.593292;sr=24000;t=np.arange(round(D*sr))/sr;rng=np.random.default_rng(13)
noise=sosfilt(butter(2,350,fs=sr,output='sos'),rng.normal(size=len(t)));noise/=max(abs(noise))
y=noise*.007
pad=sum(np.sin(2*np.pi*f*t+np.sin(t*.13)*.03)/len([110,164.81,220]) for f in [110,164.81,220])*.008
level=np.ones_like(t)
for a,b in [(50,62),(65,67)]:
 fade=np.minimum(np.clip((t-a)/.8,0,1),np.clip((b-t)/.8,0,1));level*=1-.96*fade
y+=pad*level
for at in [21.3,51,74.4]:
 z=np.maximum(0,t-at);env=np.exp(-z*16)*(t>=at)*(z<1)
 y+=env*(.025*np.sin(2*np.pi*62*z)+.02*noise)
y*=np.minimum(np.clip(t/2,0,1),np.clip((D-t)/1,0,1))
write(p/'ambiance.wav',sr,np.int16(np.clip(y,-1,1)*32767))
