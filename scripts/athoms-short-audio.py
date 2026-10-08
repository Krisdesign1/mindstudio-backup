"""Local source-preserving word timing and original score for the Athom's Short.

Only the project owned by this script is written. No TTS or remote service.
Usage: python3 scripts/athoms-short-audio.py align|sound
"""
from pathlib import Path
import difflib
import hashlib
import json
import math
import re
import shutil
import subprocess
import sys
import unicodedata
import numpy as np
from scipy.io.wavfile import read, write

ROOT = Path(__file__).resolve().parent.parent
PROJECT = ROOT / '.mindstudio/studio/free-4977ba0f-5a3c-4cd9-897d-473fe135d3f9'
SOURCE = Path('/Users/user/Downloads/Tu_connais_Athom_s_Mbuma__53b76ed49f.wav')
DURATION = 1582717 / 24000

def save(name, value):
    (PROJECT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def norm(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if c.isalnum())

def timefmt(t):
    ms = round(t * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

def balance(words, width=31):
    strings = [w['text'] for w in words]
    joined = ' '.join(strings)
    if len(joined) <= width:
        return [joined]
    choices = [(' '.join(strings[:i]), ' '.join(strings[i:])) for i in range(1, len(strings))]
    choices = [p for p in choices if max(map(len, p)) <= width]
    if not choices:
        return None
    return list(min(choices, key=lambda p: abs(len(p[0]) - len(p[1]))))

def grouped_recognition(recognized):
    grouped=[]
    for i,w in enumerate(recognized):
        text=w['text'].lstrip()
        if grouped and text.startswith(("'",'’','-')):
            prior=grouped[-1]
            prior['text']+=text
            prior['end']=w['end']
            prior['rawIndices'].append(i)
            prior['probability']=min(prior.get('probability',1),w.get('probability',1))
        else:grouped.append({**w,'rawIndices':[i]})
    return grouped

def align():
    from faster_whisper import WhisperModel
    PROJECT.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE, PROJECT / 'narration-original.wav')
    transcript = (PROJECT / 'original-transcription.txt').read_text()
    paragraphs = [line.strip() for line in transcript.splitlines() if line.strip()]
    supplied = [{'text': word, 'phrase': i} for i, line in enumerate(paragraphs) for word in line.split()]
    if not (PROJECT / 'recognized-words.json').exists():
        model = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4, local_files_only=True)
        segments, info = model.transcribe(str(SOURCE), language='fr', word_timestamps=True,
            vad_filter=False, condition_on_previous_text=False, beam_size=5,
            initial_prompt='Athom’s Mbuma. Dieu. Amen.')
        recognized = []
        segment_data = []
        for segment in segments:
            ws = [{'text': w.word.strip(), 'start': w.start, 'end': w.end, 'probability': w.probability} for w in segment.words or []]
            segment_data.append({'start': segment.start, 'end': segment.end, 'text': segment.text, 'words': ws})
            recognized.extend(ws)
            print(f'{segment.end:6.2f} {segment.text}', flush=True)
        save('recognized-segments.json', segment_data)
        save('recognized-words.json', recognized)
        save('recognition-info.json', {'model': 'faster-whisper small local', 'language': info.language, 'duration': info.duration})
    else:
        recognized = json.loads((PROJECT / 'recognized-words.json').read_text())
    recognized=grouped_recognition(recognized)
    save('recognized-grouped-words.json',recognized)
    a = [norm(w['text']) for w in supplied]
    b = [norm(w['text']) for w in recognized]
    matcher = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    matches = {}
    substitutions = {}
    diffs = []
    for tag, lo, hi, rl, rh in matcher.get_opcodes():
        if tag == 'equal':
            for i in range(hi - lo):
                matches[lo+i] = rl+i
        else:
            diffs.append({'kind': tag, 'provided': ' '.join(w['text'] for w in supplied[lo:hi]),
                'recognized': ' '.join(w['text'] for w in recognized[rl:rh]), 'providedRange': [lo, hi],
                'recognizedRange': [rl, rh],
                'time': recognized[rl]['start'] if rl < len(recognized) else DURATION})
            if tag=='replace' and hi-lo==rh-rl:
                for j in range(hi-lo):substitutions[lo+j]=rl+j
    if len(matches) / len(supplied) < .7:
        raise RuntimeError('Too few anchors; do not invent an alignment.')
    aligned = []
    for i, w in enumerate(supplied):
        if i in matches:
            rec = recognized[matches[i]]
            aligned.append({**w, 'start': rec['start'], 'end': rec['end'], 'timing': 'asr-word', 'recognizedText': rec['text'], 'recognizedRawIndices':rec['rawIndices']})
        elif i in substitutions:
            rec=recognized[substitutions[i]]
            aligned.append({**w,'start':rec['start'],'end':rec['end'],'timing':'asr-substitution-text-preserved',
                'recognizedText':rec['text'],'recognizedRawIndices':rec['rawIndices']})
        else:
            before = max((k for k in matches if k < i), default=-1)
            after = min((k for k in matches if k > i), default=len(supplied))
            lo = recognized[matches[before]]['end'] if before >= 0 else 0
            hi = recognized[matches[after]]['start'] if after < len(supplied) else DURATION
            count = after - before - 1
            step = max(0, hi - lo) / count
            if not norm(w['text']):
                aligned.append({**w,'start':round(lo,3),'end':round(lo,3),'timing':'punctuation-not-spoken'})
            else:
                aligned.append({**w, 'start': round(lo + step * (i-before-1), 3),
                    'end': round(lo + step * (i-before), 3), 'timing': 'interpolated-between-word-anchors'})
    # Source-energy boundary review of the clearly isolated final "Amen".
    # Small places it before the final pause, medium places only its second syllable.
    # Both agree on the word; measured preceding and final quiet boundaries bracket it.
    for w in aligned:
        if w['phrase']==23 and norm(w['text'])=='amen':
            w.update(start=65.393875,end=65.800333,timing='asr-word-with-measured-isolated-speech-boundaries',
                timingReview='Bracketed by source silences 65.202500–65.393875 and 65.800333–65.946542; ASR agrees final word is Amen.')
    # Whisper sometimes spans contractions differently; corrections stay explicit.
    save('aligned-words.json', aligned)
    save('alignment-report.json', {'exactAnchorRatio': len(matches)/len(supplied), 'words': len(supplied),
        'differences': diffs, 'transcriptionRewritten': False,
        'method': 'Local French word ASR with exact supplied text; unmatched word timings interpolated between measured neighboring anchors.',
        'limits': 'Word timing is estimated by Whisper, not phonetic alignment. Differences below require comparison with the source; provided text is preserved.'})
    phrases = []
    for i, text in enumerate(paragraphs):
        ws = [w for w in aligned if w['phrase'] == i]
        phrases.append({'index': i, 'text': text, 'start': ws[0]['start'], 'end': ws[-1]['end'], 'words': ws})
    save('phrase-timings.json', phrases)
    cues = []
    planned_groups={6:[5,13,17],11:[6,13],14:[6,12]}
    for phrase in phrases:
        ws = phrase['words']
        start = 0
        while start < len(ws):
            candidates = []
            for end in range(start+1, min(len(ws), start+10)+1):
                subset = ws[start:end]
                lines = balance(subset)
                if not lines:
                    break
                duration = subset[-1]['end'] - subset[0]['start']
                # Avoid dangling prepositions/pronouns, while allowing coherent short sentences.
                penalty = abs(duration-1.9) * 3 + abs(len(subset)-6) * .13
                if duration < .8: penalty += 9
                if norm(subset[-1]['text']) in {'de', 'du', 'des', 'que', 'qui', 'le', 'la', 'les', 'une', 'un', 'ce', 'pour', 'dans', 'en', 'a', 'et', 'mais', 'son','ne'}: penalty += 8
                if end == len(ws): penalty -= 1
                if end < len(ws) and len(ws)-end < 3: penalty += 6
                if subset[-1]['text'].endswith((',', '.', '…', '?', ':')): penalty -= 1.5
                candidates.append((penalty, end, lines))
            if not candidates:
                raise RuntimeError('Caption contains a word too wide.')
            if phrase['index'] in planned_groups:
                end=next(bound for bound in planned_groups[phrase['index']] if bound>start)
                lines=balance(ws[start:end])
                if not lines:raise RuntimeError('Planned caption group too wide.')
            else:
                _, end, lines = min(candidates)
            subset = ws[start:end]
            cue_end = subset[-1]['end']
            next_start = ws[end]['start'] if end < len(ws) else (phrases[phrase['index']+1]['start'] if phrase['index']+1 < len(phrases) else DURATION)
            cue_end = min(next_start-.035, max(cue_end+.15, subset[0]['start']+.85))
            cues.append({'start': subset[0]['start'], 'end': max(cue_end, subset[-1]['end']), 'lines': lines,
                'text': '\n'.join(lines), 'words': subset, 'phrase': phrase['index']})
            start = end
    # Repeated short encouragements are read naturally as a combined two-line cue.
    merged = []
    i = 0
    while i < len(cues):
        cue = cues[i]
        if i+1 < len(cues) and cue['end']-cue['start'] < .9 and cues[i+1]['start']-cue['end'] < .45:
            combined = cue['words'] + cues[i+1]['words']
            lines = balance(combined)
            if lines:
                merged.append({**cue, 'end': cues[i+1]['end'], 'lines': lines, 'text': '\n'.join(lines), 'words': combined})
                i += 2
                continue
        merged.append(cue)
        i += 1
    save('captions.json', {'cues': merged})
    (PROJECT / 'paroles.srt').write_text('\n\n'.join(f'{i+1}\n{timefmt(c["start"])} --> {timefmt(c["end"])}\n{c["text"]}' for i,c in enumerate(merged))+'\n')
    source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    save('audio-source.json', {'source': str(SOURCE), 'preservedAs': 'narration-original.wav', 'sha256': source_hash,
        'duration': DURATION, 'samples': 1582717, 'sampleRate': 24000, 'channels': 1, 'sourceCodec': 'PCM signed 24-bit',
        'noTTS': True, 'noNarrationEdits': True, 'captionCues': len(merged), 'wordCount': len(aligned)})
    print(json.dumps({'alignmentAvailable': True, 'duration': DURATION, 'phrases': len(phrases), 'words': len(aligned), 'anchorRatio': len(matches)/len(supplied), 'differences': diffs}, ensure_ascii=False), flush=True)

def sound():
    sr, original = read(PROJECT / 'narration-original.wav')
    original = original.astype(np.float32) / np.iinfo(original.dtype).max
    if original.ndim > 1: original = original.mean(axis=1)
    n = len(original)
    t = np.arange(n, dtype=np.float32) / sr
    step = round(sr*.08)
    rms = np.array([np.sqrt(np.mean(original[j:j+step]**2)) for j in range(0,n,step)])
    # Duck the music only, never alter the performance or source file.
    duck = np.interp(t, np.arange(len(rms))*.08, np.clip(1-rms*4.5,.38,1)).astype(np.float32)
    fade = np.minimum(np.clip(t/1.3,0,1), np.clip((DURATION-t)/2.5,0,1))
    music = np.zeros(n,dtype=np.float32)
    progressions = [ [130.813,164.814,195.998,246.942], [110,130.813,164.814,195.998],
        [87.307,130.813,174.614,220], [97.999,146.832,195.998,246.942],
        [110,164.814,220,261.626], [130.813,195.998,261.626,329.628] ]
    def add(time, duration, fn):
        st = round(time*sr); count = min(round(duration*sr),n-st)
        if count <= 0:return
        z = np.arange(count,dtype=np.float32)/sr
        music[st:st+count] += fn(z)
    # Six long harmonic stages, no small repeating loop; piano accents vary in register/timing.
    for i,(at,chord) in enumerate(zip([0,11,22,33,44,55], progressions)):
        depth = [.020,.018,.015,.017,.022,.024][i]
        add(at,14,lambda z,c=chord,g=depth: sum(np.sin(2*np.pi*f*z+.06*np.sin(2*np.pi*.14*z))+.1*np.sin(4*np.pi*f*z) for f in c)/4 * g * np.minimum(np.clip(z/2.4,0,1),np.clip((14-z)/3.3,0,1)))
        for j in range(4):
            pitch = chord[(j*3+i)%4] * (2 if (i+j)%3 else 4)
            offset = [1.6,4.7,7.9,10.1][j] + .2*(i%2)
            add(at+offset,4,lambda z,f=pitch,g=depth: (np.sin(2*np.pi*f*z)+.2*np.sin(2*np.pi*f*2.01*z)+.08*np.sin(2*np.pi*f*3.98*z))*np.exp(-z*1.45)*np.clip(z/.008,0,1)*g*1.3)
    music *= duck*fade*2.2
    rng = np.random.default_rng(20261007)
    effects = np.zeros(n,dtype=np.float32)
    events=[]
    phrases=json.loads((PROJECT/'phrase-timings.json').read_text())
    def event(at,kind,level=.016,dur=.3):
        st=round(at*sr); count=min(round(dur*sr),n-st); z=np.arange(count)/sr
        if kind=='page':
            noise=rng.normal(0,1,count); smooth=np.convolve(noise,np.ones(7)/7,mode='same')
            sig=smooth*np.sin(np.pi*z/dur)**2
        elif kind=='fabric':
            noise=rng.normal(0,1,count); smooth=np.convolve(noise,np.ones(15)/15,mode='same')
            sig=smooth*np.sin(np.pi*z/dur)**2
        elif kind=='step':
            sig=(np.sin(2*np.pi*95*z)*.6+rng.normal(0,.25,count))*np.exp(-z*25)*np.clip(z/.01,0,1)
        elif kind=='wood':
            sig=(np.sin(2*np.pi*178*z)+.32*np.sin(2*np.pi*327*z)+.15*rng.normal(0,1,count))*np.exp(-z*34)*np.clip(z/.002,0,1)
        elif kind=='gentle-tone':
            sig=(np.sin(2*np.pi*523.251*z)+.36*np.sin(2*np.pi*1046.502*z))*np.exp(-z*5)*np.minimum(np.clip(z/.04,0,1),np.clip((dur-z)/.10,0,1))
        else:raise ValueError(kind)
        effects[st:st+count] += sig*level
        events.append({'time':round(at,3),'kind':kind,'duration':dur,'peakScale':level,'source':'original deterministic local synthesis'})
    # Actual native storyboard contact cues supplied by the assembly agent.
    event(23.3,'fabric',.017,.55)
    event(30.2,'page',.021,.38)
    event(31.8,'wood',.016,.18)
    event(52.42,'step',.024,.24)
    event(65.2,'gentle-tone',.012,.60)
    for name,track in [('music',music),('effects',effects)]:
        write(PROJECT/(name+'.wav'),sr,(np.clip(track,-.95,.95)*32767).astype(np.int16))
    # Source silence diagnostic prevents blindly piling music on an audible preexisting bed.
    quiet = rms[rms < .0002]
    diagnostics = {'sourcePeakDb': float(20*np.log10(max(np.max(np.abs(original)),1e-9))),
        'sourceRmsDb':float(20*np.log10(max(np.sqrt(np.mean(original**2)),1e-9))),
        'nearSilentWindows':len(quiet),'windows':len(rms),'silentWindowThresholdDb':-73.98,
        'nearSilentFraction':len(quiet)/len(rms),
        'inference':'Near-silent gaps and speech-only recognition suggest no continuous musical bed; this is an analysis inference, not an isolated-stem guarantee.'}
    mixed=original+music+effects
    save('sound-design.json', {'duration':DURATION, 'sampleRate':sr, 'sourceUnchanged':True,
        'music':'Original six-stage evolving pad and piano, locally synthesized; no vocals/no external assets.',
        'musicRmsDb':float(20*np.log10(np.sqrt(np.mean(music**2)))), 'musicPeakDb':float(20*np.log10(np.max(np.abs(music)))),
        'musicAppliedVolume':1, 'narrationSuggestedVolume':1,'effectsSuggestedVolume':1,
        'linearMixPeakDb':float(20*np.log10(np.max(np.abs(mixed)))),
        'linearMixRmsDb':float(20*np.log10(np.sqrt(np.mean(mixed**2)))),
        'linearMixClippedSamples':int(np.sum(np.abs(mixed)>=1)),
        'duck':'Music only: 80 ms RMS analysis, floor 0.38, interpolated gain. Narration untouched.',
        'fades':{'in':1.3,'out':2.5}, 'events':events,'diagnostics':diagnostics,
        'mixLimits':'Listen and measure final AAC output. Effect contacts must match root storyboard; synthesis does not claim live recorded foley.'})
    print(json.dumps({'soundReady':True,'events':events,'diagnostics':diagnostics,'musicRmsDb':float(20*np.log10(np.sqrt(np.mean(music**2))))},ensure_ascii=False))

def measure():
    PROJECT.mkdir(parents=True,exist_ok=True)
    sr,signal=read(SOURCE)
    signal=signal.astype(np.float32)/np.iinfo(signal.dtype).max
    if signal.ndim>1:signal=signal.mean(axis=1)
    hop=round(.02*sr)
    samples=[{'time':round(i/sr,3),'rms':round(float(np.sqrt(np.mean(signal[i:i+hop]**2))),7),
        'peak':round(float(np.max(np.abs(signal[i:i+hop]))),7)} for i in range(0,len(signal),hop)]
    save('audio-envelope.json',{'source':'narration-original.wav','step':.02,'purpose':'Measured audio gating only; not phoneme or mouth-shape inference.','samples':samples})
    log=subprocess.run(['ffmpeg','-hide_banner','-i',str(SOURCE),'-af','silencedetect=noise=-35dB:d=0.08','-f','null','-'],capture_output=True,text=True,check=True).stderr
    intervals=[]; pending=0
    for line in log.splitlines():
        if 'silence_start:' in line:pending=float(line.split('silence_start:')[-1].strip())
        if 'silence_end:' in line:
            end=float(line.split('silence_end:')[-1].split('|')[0].strip())
            intervals.append({'start':pending,'end':end,'duration':round(end-pending,6)})
    save('silences.json',{'thresholdDb':-35,'minimumDuration':.08,'duration':DURATION,'intervals':intervals,
        'limits':'Energy-based measured quiet intervals, not linguistic pause labels. Soft unvoiced consonants may cross the threshold; gate conservatively.'})
    (PROJECT/'silencedetect.log').write_text(log)
    print(json.dumps({'measurementReady':True,'silences':len(intervals),'envelopeSamples':len(samples),'duration':DURATION}))

def review():
    from faster_whisper import WhisperModel
    model=WhisperModel('medium',device='cpu',compute_type='int8',cpu_threads=4,local_files_only=True)
    segments,info=model.transcribe(str(SOURCE),language='fr',word_timestamps=True,vad_filter=False,
        condition_on_previous_text=False,beam_size=5,initial_prompt='Athom’s Mbuma. Dieu. Amen.')
    result=[]
    for segment in segments:
        result.append({'start':segment.start,'end':segment.end,'text':segment.text,
            'words':[{'text':w.word.strip(),'start':w.start,'end':w.end,'probability':w.probability} for w in segment.words or []]})
        print(f'{segment.end:6.2f} {segment.text}',flush=True)
    save('recognition-medium-review.json',{'model':'faster-whisper medium existing local cache','segments':result})

if __name__ == '__main__':
    {'align':align,'sound':sound,'measure':measure,'review':review}[sys.argv[1] if len(sys.argv)>1 else 'align']()
