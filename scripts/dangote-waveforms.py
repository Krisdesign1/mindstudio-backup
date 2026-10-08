"""Precompute HF v2 waveform cache from real decoded media for local Studio."""
import json,subprocess,math
from pathlib import Path
import numpy as np
R=Path(__file__).resolve().parent.parent;P=R/'.mindstudio/studio'/json.loads((R/'.mindstudio/dangote-work/project.json').read_text())['id'];C=P/'.waveform-cache';C.mkdir(exist_ok=True)
for name in ['narration','music','ambience','ui','foley','transitions','impacts']:
 p=P/(name+'.wav');data=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-af','atrim=start_sample=1152','-f','f32le','-ac','1','-ar','4000','-vn','pipe:1']);x=np.frombuffer(data,dtype='<f4');edges=np.floor(np.arange(4001)*len(x)/4000).astype(int);peaks=[float(np.max(abs(x[edges[i]:edges[i+1]]))) for i in range(4000)];mx=max(max(peaks),.001);peaks=[v/mx for v in peaks];st=p.stat();key=f'v2_{p.name}_{st.st_size}-{math.floor(st.st_mtime_ns/1000000+.5)}.json';(C/key).write_text(json.dumps(peaks))
print('7 real waveform caches prepared')
