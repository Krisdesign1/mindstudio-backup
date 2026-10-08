"""Download pinned V3 weights and prove a short CPU synthesis before enabling UI."""
import json, pathlib, time
ROOT = pathlib.Path(__file__).resolve().parent.parent
from huggingface_hub import snapshot_download
import torch, numpy as np, soundfile as sf
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
print('Imports OK', torch.__version__, flush=True)
torch.set_num_threads(6)
folder = ROOT / '.mindstudio/chatterbox-model'
snapshot_download('ResembleAI/chatterbox', revision='5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18', local_dir=folder,
                  allow_patterns=['ve.pt','t3_mtl23ls_v3.safetensors','s3gen.pt','grapheme_mtl_merged_expanded_v1.json','conds.pt','Cangjie5_TC.json'])
print('Poids téléchargés. Chargement CPU…', flush=True)
model=ChatterboxMultilingualTTS.from_local(folder, device='cpu', t3_model='v3')
start=time.monotonic()
with torch.inference_mode():
    result=model.generate('Bonjour. Ceci est un essai de narration en français.',language_id='fr',exaggeration=.4,cfg_weight=.5,temperature=.75).cpu().numpy().reshape(-1)
assert len(result)>24000 and np.isfinite(result).all() and np.max(np.abs(result))>1e-5
sf.write(ROOT/'.mindstudio/chatterbox-test.wav',result,model.sr,subtype='PCM_24')
print('Synthèse réelle terminée',len(result)/model.sr,'secondes audio',time.monotonic()-start,'secondes calcul',flush=True)
# Keep activation a separate step after inspecting the generated audio.
(ROOT/'.mindstudio/chatterbox-validation.json').write_text(json.dumps({'model':'Chatterbox Multilingual V3','torch':torch.__version__,'duration':len(result)/model.sr,'compute_seconds':time.monotonic()-start}))
