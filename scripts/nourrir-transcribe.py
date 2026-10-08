import json,time
from pathlib import Path
from faster_whisper import WhisperModel
w=Path('.mindstudio/nourrir-work');model=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=4,local_files_only=True)
segments,info=model.transcribe('/Users/user/Downloads/ma_narration_9e25b51fcb.wav',language='fr',beam_size=5,vad_filter=True,condition_on_previous_text=False,word_timestamps=True)
a=[]
for s in segments:
 a.append(dict(start=s.start,end=s.end,text=s.text,words=[dict(text=x.word.strip(),start=x.start,end=x.end) for x in s.words or []]));(w/'speech.json').write_text(json.dumps(a,ensure_ascii=False));print(round(s.end,1),flush=True)
