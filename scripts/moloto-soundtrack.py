"""Original restrained pad and transition sounds; no voice replacement or external music."""
import json, pathlib, wave
import numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
film=json.loads((root/'.mindstudio/films/moloto.json').read_text())
sr=24000; duration=film['source']['duration']; count=int(duration*sr)
music=np.zeros(count,dtype=np.float32); effects=np.zeros(count,dtype=np.float32)
starts=[]; cursor=0
for scene in film['scenes']: starts.append(cursor); cursor+=scene['duration']
# Sparse warm sustained chords with slow attacks, leaving the vocal midrange open.
chords=[[130.81,196,261.63],[110,164.81,220],[87.31,130.81,174.61],[98,146.83,196]]
for k,start in enumerate(np.arange(0,duration,12)):
 length=min(16,duration-start); t=np.arange(int(length*sr))/sr
 env=np.minimum(t/3,1)*np.minimum((length-t)/4,1)
 chord=sum(np.sin(2*np.pi*f*t+0.06*np.sin(2*np.pi*.12*t)) for f in chords[k%4])/3
 tone=chord*env*.24
 a=int(start*sr);music[a:a+len(tone)]+=tone.astype(np.float32)
# The death and absence section deliberately loses its musical bed, then returns.
for i in [12,13]:
 a=int(starts[i]*sr);b=int((starts[i]+film['scenes'][i]['duration'])*sr);music[a:b]*=.12
rng=np.random.default_rng(42)
for i in [0,2,4,9,14,17,20,23]:
 a=int(starts[i]*sr); length=min(int(.65*sr),count-a);t=np.arange(length)/sr
 noise=rng.standard_normal(length); noise=np.convolve(noise,np.ones(25)/25,mode='same')
 sound=(noise*.2+np.sin(2*np.pi*(420*t-180*t*t))*.035)*np.sin(np.pi*np.arange(length)/length)**2
 effects[a:a+length]+=sound.astype(np.float32)
# Quiet soft strikes at the transfer and foundation reveals.
for i in [14,15,17,18,23]:
 a=int((starts[i]+2)*sr); length=min(2*sr,count-a);t=np.arange(length)/sr
 effects[a:a+length]+=(.12*np.sin(2*np.pi*523.25*t)*np.exp(-t*4)*(1-np.exp(-t*80))).astype(np.float32)
for name,values in [('music-raw',music),('effects',effects)]:
 with wave.open(str(root/f'.mindstudio/films/moloto-{name}.wav'),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.clip(values,-1,1)*32767).astype('<i2').tobytes())
print('Original soundtrack and accents created',duration)
