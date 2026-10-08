"""Ask installed models to author their own SVG/CSS; preserve raw responses."""
import json, pathlib, time, urllib.request
root = pathlib.Path(__file__).resolve().parent.parent
out = root / '.mindstudio/local-ai/illustrations'
out.mkdir(parents=True, exist_ok=True)
prompt = '''Crée toi-même une illustration animée du passage suivant : « Il est retourné chez son père pour retrouver une nouvelle vie. » Contexte : parabole du fils prodigue ; un fils adulte revient auprès de son père âgé après avoir gaspillé son héritage. Les personnages doivent rester distincts. Le père est un homme de la parabole, pas Dieu physiquement représenté.
Livrable : uniquement un document HTML complet et compact, sans Markdown. Dessine une vraie scène reconnaissable en SVG inline (viewBox 0 0 960 540), avec personnages, décor et action liés au passage. Anime-la avec CSS @keyframes sur 8 secondes en boucle. Choisis toi-même cadrage, couleurs et mouvements. Pas de simple carte de texte. Pas de JavaScript, image externe, police externe, URL, import, iframe ou dépendance. Le SVG remplit la fenêtre. Maximum 1400 tokens : privilégie un dessin fini et un document fermé. Commence par <!doctype html>.'''
for model in ['qwen2.5:1.5b', 'llama3.2:latest']:
    name = model.split(':')[0]
    print('START', model, flush=True)
    start = time.monotonic()
    body = {'model':model, 'messages':[{'role':'user','content':prompt}], 'stream':False,
            'options':{'temperature':0.3,'seed':42,'num_ctx':4096,'num_predict':1800,'num_thread':6}, 'keep_alive':0}
    try:
        req = urllib.request.Request('http://127.0.0.1:11434/api/chat', data=json.dumps(body).encode(), headers={'Content-Type':'application/json'})
        with urllib.request.urlopen(req, timeout=900) as response: result=json.load(response)
        raw=result['message']['content']
        record={'model':model,'prompt':prompt,'elapsed_seconds':round(time.monotonic()-start,2),'response':result}
        (out/(name+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2))
        # Strip only presentation fences, never repair or rewrite model code.
        html=raw.strip()
        if html.startswith('```'): html=html.split('\n',1)[1].rsplit('```',1)[0].strip()
        (out/(name+'.html')).write_text(html)
        print('DONE',model,record['elapsed_seconds'],result.get('done_reason'),len(html),flush=True)
    except Exception as exc: print('ERROR',model,str(exc),flush=True)
