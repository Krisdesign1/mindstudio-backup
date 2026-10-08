"""Local-only narration worker. Original voice reference is never overwritten."""
import json, os, pathlib, re, sys, time, subprocess, random
ROOT = pathlib.Path(__file__).resolve().parent.parent
REVISION = '5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18'

def build_segments(text, limit=260):
    """Group short sentences so one paragraph does not become one model call."""
    units = []
    for paragraph in re.split(r'\n\s*\n', text.strip()):
        paragraph_units = []
        for sentence in re.split(r'(?<=[.!?…])\s+', paragraph.strip()):
            current = ''
            for word in sentence.split():
                if current and len(current) + len(word) + 1 > limit:
                    paragraph_units.append((current, False)); current = ''
                current = (current + ' ' + word).strip()
            if current:
                paragraph_units.append((current, False))
        if paragraph_units:
            paragraph_units[-1] = (paragraph_units[-1][0], True)
            units.extend(paragraph_units)

    segments, current, paragraph_end = [], '', False
    for unit, ends_paragraph in units:
        if current and len(current) + len(unit) + 1 > limit:
            segments.append((current, paragraph_end))
            current = ''
        current = (current + ' ' + unit).strip()
        paragraph_end = ends_paragraph
    if current:
        segments.append((current, paragraph_end))
    return segments

def main():
    job = ROOT / '.mindstudio/voice' / sys.argv[1]
    data = json.loads((job / 'request.json').read_text())
    started = data.get('startedAt', time.time())
    def status(state, **extra):
        temp = job / 'status.tmp'
        temp.write_text(json.dumps({'status': state, 'title': data.get('title', 'Ma narration'), 'pid': os.getpid(), 'updatedAt': time.time(), 'startedAt': started, 'elapsedSeconds': time.time()-started, **extra}, ensure_ascii=False))
        temp.replace(job / 'status.json')
    try:
        status('loading')
        import torch, numpy as np, soundfile as sf
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        torch.set_num_threads(6)
        model = ChatterboxMultilingualTTS.from_local(ROOT / '.mindstudio/chatterbox-model', device='cpu', t3_model='v3')
        options = data.get('settings', {})
        seed = options.get('seed', 42)
        random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
        segments = build_segments(data['text'])
        exaggeration = options.get('exaggeration', .4)
        status('loading', stage='preparing')
        model.prepare_conditionals(str(job / 'reference.wav'), exaggeration=exaggeration)
        chunks = []
        synthesis_started = time.time()
        for i, (text, paragraph_end) in enumerate(segments):
            status('generating', stage='synthesis', completed=i, total=len(segments), **({'estimatedRemaining': (time.time()-synthesis_started)/max(1, sum(len(t) for t,_ in segments[:i]))*sum(len(t) for t,_ in segments[i:])+3} if i else {}))
            with torch.inference_mode():
                audio = model.generate(text, language_id='fr', exaggeration=exaggeration, cfg_weight=options.get("cfg", .5), temperature=options.get("temperature", .75)).cpu().numpy().reshape(-1)
            if not len(audio) or not np.isfinite(audio).all(): raise ValueError('Audio invalide')
            chunks.append(audio)
            if i < len(segments)-1:
                pause = options.get('pause', .25)
                if options.get('naturalPauses', True):
                    pause *= 1.8 if paragraph_end else (1.25 if text.endswith(('?', '!', '…')) else 1)
                chunks.append(np.zeros(int(model.sr*pause), dtype=np.float32))
        status('generating', stage='finalizing', completed=len(segments), total=len(segments))
        audio = np.concatenate(chunks)
        sf.write(job / 'narration.wav', audio, model.sr, subtype='PCM_24')
        if options.get('normalize', True):
            subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(job/'narration.wav'),
                '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', str(model.sr), '-c:a', 'pcm_s24le',
                str(job/'normalized.wav')], check=True, timeout=120)
            (job/'normalized.wav').replace(job/'narration.wav')
        status('completed', duration=len(audio)/model.sr, kind=data.get('action', 'generate'))
    except Exception as exc:
        status('failed', error=str(exc)[:700])
        raise
if __name__ == '__main__': main()
