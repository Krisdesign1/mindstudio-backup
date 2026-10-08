"""Offline speech recognition. Only local media and cached Whisper weights are used."""
import json, os, sys, time, uuid, signal
from pathlib import Path
source_id=str(uuid.UUID(sys.argv[1]))
root=Path(__file__).resolve().parent.parent
folder=root/'.mindstudio'/'media'/source_id
state=folder/'transcription.json'
lock=folder/'transcription.lock'
started=time.time()
def write(status,progress=0,**extra):
    import datetime
    data=dict(sourceId=source_id,status=status,progress=progress,updatedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),segments=[])
    data.update(extra)
    tmp=folder/'transcription.tmp'
    tmp.write_text(json.dumps(data,ensure_ascii=False));tmp.replace(state)
def timeout_handler(*_):
    raise RuntimeError('La transcription a dépassé 30 minutes.')
signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(1800)
try:
    write('loading')
    from faster_whisper import WhisperModel
    metadata=json.loads((folder/'metadata.json').read_text())
    model=WhisperModel(os.environ.get('MOTION_WHISPER_MODEL','small'),device='cpu',compute_type='int8',cpu_threads=4,local_files_only=True)
    write('transcribing',1)
    segments,info=model.transcribe(str(folder/('source.wav' if metadata.get('kind')=='audio' else 'source.mp4')),beam_size=5,vad_filter=True,condition_on_previous_text=False,word_timestamps=True)
    result=[]
    words=[]
    for segment in segments:
        text=segment.text.strip()
        if text and segment.end>segment.start and segment.start<metadata['duration']:
            result.append(dict(start=max(0,segment.start),end=min(metadata['duration'],segment.end),text=text[:4000]))
        for word in segment.words or []:
            start=max(0,word.start);end=min(metadata['duration'],word.end)
            if word.word.strip() and end>start:
                words.append(dict(text=word.word.strip()[:160],start=start,end=end))
        if time.time()-started>1800:raise RuntimeError('La transcription a dépassé 30 minutes.')
        write('transcribing',min(99,round(segment.end/metadata['duration']*100)))
    if not result:raise RuntimeError('Aucune parole détectée. Le fichier contient peut-être uniquement de la musique ou du silence.')
    write('completed',100,segments=result,words=words[:4000],language=info.language)
except Exception as error:
    message=str(error)
    if isinstance(error,ImportError):message='Le moteur local faster-whisper est absent du Python configuré.'
    elif 'local' in message.lower() or 'snapshot' in message.lower():message='Le modèle Whisper local est introuvable. Configurez MOTION_WHISPER_MODEL avec un modèle installé.'
    write('failed',error=message[:350])
finally:
    signal.alarm(0)
    try:lock.unlink()
    except FileNotFoundError:pass
