from faster_whisper import WhisperModel
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / ".mindstudio" / "dena-shorts-work"
WORK.mkdir(parents=True, exist_ok=True)
AUDIO = Path("/Users/user/Downloads/Tu_connais_Dena_Mwana__mais_connais-tu_vraiment_son_histoire___e4b720c314.wav")

model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
segments, info = model.transcribe(
    str(AUDIO), language="fr", word_timestamps=True, vad_filter=False,
    condition_on_previous_text=False, beam_size=5,
)
out = []
for segment in segments:
    out.append({
        "start": segment.start,
        "end": segment.end,
        "text": segment.text,
        "words": [
            {"text": word.word, "start": word.start, "end": word.end}
            for word in (segment.words or [])
        ],
    })
    print(f"{segment.end:6.2f} {segment.text}", flush=True)
(WORK / "transcript.json").write_text(json.dumps(out, ensure_ascii=False, indent=2))
print(json.dumps({"language": info.language, "duration": info.duration, "segments": len(out)}))
