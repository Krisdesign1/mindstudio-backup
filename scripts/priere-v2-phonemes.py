"""French visemes estimated within real aligned word boundaries, gated by master audio.
This is stylized lip animation, not a phonetic forced alignment or a real-person avatar.
"""
import json,re,subprocess,unicodedata
from pathlib import Path
import numpy as np
from scipy.io.wavfile import read
ROOT=Path(__file__).resolve().parent.parent;W=ROOT/'.mindstudio/priere-v2-work';W.mkdir(exist_ok=True)
words=json.loads((ROOT/'.mindstudio/priere-v2-work/aligned-words.json').read_text())
sr,samples=read('/Users/user/Downloads/Est-ce_que_Dieu_t__coute_mieux_quand_tu_cries___480b19ec74.wav');scale=np.iinfo(samples.dtype).max if np.issubdtype(samples.dtype,np.integer) else 1; samples=samples.astype(float)/scale
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
    cs=[c for c in unicodedata.normalize('NFD',cache[key]) if c.isalpha() and c not in 'ˈˌːˑ']
    if not cs:continue
    weights=[1.35 if shape(c) in ('open','round','wide') else .7 for c in cs]
    total=sum(weights);t=w['start'];dur=max(0,w['end']-t)
    for c,weight in zip(cs,weights):
        end=t+dur*weight/total
        if end-t>.008:phones.append(dict(start=t,end=end,phoneme=c,shape=shape(c),word=w['text']))
        t=end
(W/'ipa-cache.json').write_text(json.dumps(cache,ensure_ascii=False))
# Targets follow phoneme boundaries rather than a coarse 12 Hz grid.
# A phoneme is estimated inside an aligned word, never claimed as forced alignment.
frames=[dict(time=0.0,shape='closed',energy=0,phoneme='',word='')]
for j,ph in enumerate(phones):
 e=energy((ph['start']+ph['end'])/2)
 frames.append(dict(time=round(ph['start'],6),end=round(ph['end'],6),shape=ph['shape'] if e>.003 else 'closed',energy=round(e,5),phoneme=ph['phoneme'],word=ph['word']))
 following=phones[j+1]['start'] if j+1<len(phones) else 531.537042
 if following-ph['end']>.055:
  frames.append(dict(time=round(ph['end'],6),shape='closed',energy=0,phoneme='',word=''))
frames.sort(key=lambda f:f['time'])
(W/'lip-sync.json').write_text(json.dumps(dict(method='French IPA estimated inside real aligned words; phoneme-boundary targets and explicit silence closures; not exact phonetic alignment',phonemes=phones,frames=frames),ensure_ascii=False))
print(json.dumps(dict(words=len(words),phones=len(phones),mouthTargets=len(frames),silentTargets=sum(f['shape']=='closed' for f in frames))))
