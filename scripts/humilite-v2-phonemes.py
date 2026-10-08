"""French visemes estimated within real aligned word boundaries, gated by master audio.
This is stylized lip animation, not a phonetic forced alignment or a real-person avatar.
"""
import json,re,subprocess,unicodedata
from pathlib import Path
import numpy as np
from scipy.io.wavfile import read
ROOT=Path(__file__).resolve().parent.parent;W=ROOT/'.mindstudio/humilite-v2';W.mkdir(exist_ok=True)
words=json.loads((ROOT/'.mindstudio/humilite-work/aligned-words.json').read_text())
sr,samples=read('/Users/user/Downloads/humi_010e7c67e0.wav');scale=np.iinfo(samples.dtype).max if np.issubdtype(samples.dtype,np.integer) else 1; samples=samples.astype(float)/scale
if samples.ndim>1:samples=samples.mean(axis=1)
def energy(t):
    a=max(0,int((t-.018)*sr));b=min(len(samples),int((t+.018)*sr))
    return float(np.sqrt(np.mean(samples[a:b]**2))) if b>a else 0
def shape(c):
    if c in 'bmp':return 'closed'
    if c in 'fv':return 'teeth'
    if c in 'ouɔøywɥœʊ':return 'round'
    if c in 'aɑɛæ':return 'open'
    if c in 'ieɪj':return 'wide'
    return 'small'
cache=json.loads((W/'ipa-cache.json').read_text()) if (W/'ipa-cache.json').exists() else {}
phones=[]
for w in words:
    key=re.sub(r'[^a-zà-ÿœ’\-]','',w['text'].lower())
    if key not in cache:cache[key]=subprocess.check_output(['espeak','-q','--ipa','-v','fr',key],text=True).strip()
    cs=[c for c in unicodedata.normalize('NFD',cache[key]) if c.isalpha()]
    if not cs:continue
    weights=[1.35 if shape(c) in ('open','round','wide') else .7 for c in cs]
    total=sum(weights);t=w['start'];dur=max(0,w['end']-t)
    for c,weight in zip(cs,weights):
        end=t+dur*weight/total
        if end-t>.008:phones.append(dict(start=t,end=end,phoneme=c,shape=shape(c),word=w['text']))
        t=end
(W/'ipa-cache.json').write_text(json.dumps(cache,ensure_ascii=False))
# 12 Hz mouth target sampling interpolated by GSAP at the 24 fps render cadence.
frames=[];idx=0
for t in np.arange(0,350.590083,1/12):
    while idx<len(phones) and phones[idx]['end']<=t:idx+=1
    ph=phones[idx] if idx<len(phones) and phones[idx]['start']<=t<phones[idx]['end'] else None
    e=energy(t);kind=ph['shape'] if ph and e>.006 else 'closed'
    frames.append(dict(time=round(float(t),6),shape=kind,energy=round(e,5),phoneme=ph['phoneme'] if ph else '',word=ph['word'] if ph else ''))
(W/'lip-sync.json').write_text(json.dumps(dict(method='eSpeak French IPA estimated inside aligned words; 36 ms master RMS window; silence gate; 12 Hz targets interpolated at 24 fps',phonemes=phones,frames=frames),ensure_ascii=False))
print(json.dumps(dict(words=len(words),phones=len(phones),mouthTargets=len(frames),silentTargets=sum(f['shape']=='closed' for f in frames))))
