"""Build a documentary-style, audio-led HyperFrames project, preserving editable clips."""
import json,uuid,html,shutil,datetime
from pathlib import Path
from axel_art import art
root=Path(__file__).resolve().parent.parent;work=root/'.mindstudio/axel-work';data=json.loads((work/'aligned.json').read_text());duration=319.981167
key='free-'+str(uuid.uuid4());p=root/'.mindstudio/studio'/key;p.mkdir(parents=True);(p/'compositions').mkdir()
for src,dst in [(Path('/Users/user/Downloads/ma_narration_7972037d6a.wav'),'narration.wav'),(root/'node_modules/gsap/dist/gsap.min.js','gsap.min.js'),(work/'transcription.txt','transcription.txt')]:shutil.copy(src,p/dst)
meta=dict(id=key,name='Axel Lévi · Foi, vérité et responsabilité',createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat());(p/'mindstudio-project.json').write_text(json.dumps(meta));(work/'project.json').write_text(json.dumps(meta))
# Paragraph boundaries are matched to the supplied audio. Titles are editorial summaries, not quotations.
beats=[
(0,'number','19','ANS','Son témoignage'),(1,'network','DU TÉMOIGNAGE','AU MINISTÈRE','Le parcours'),(2,'date','SEPTEMBRE','2026','La rupture'),(3,'document','ÉCARTÉ','DE SES FONCTIONS','Décision de MFD'),(4,'document','L’ADULTÈRE','RECONNU','Déclaration d’Axel Lévi'),(5,'question','COMMENT','EN ARRIVER LÀ ?','La question'),(6,'rewind','REVENONS','AU DÉBUT','Le parcours'),
(7,'journey','DEUX PAYS','UN PARCOURS','Selon sa biographie'),(8,'church','S’ÉLOIGNER','DE L’ÉGLISE','Selon son témoignage'),(9,'words','UNE VIE','SANS PAIX','Selon son témoignage'),(11,'phone','UN MESSAGE','INATTENDU','Selon son témoignage'),(14,'cross','IL PARLE','DE JÉSUS','Selon son témoignage'),(16,'train','UNE RENCONTRE','DANS LE RER','Représentation symbolique'),(18,'mirror','LE POINT','DE BASCULE','Selon son témoignage'),(20,'quote','PEUT-ÊTRE','MOI AUSSI','Selon son témoignage'),(21,'church','LE RETOUR','À LA FOI','Selon son témoignage'),
(22,'rewind','LE PARCOURS','S’ACCÉLÈRE','Repères biographiques'),(23,'date','NOVEMBRE','2016','Consécration au ministère'),(24,'date','22 JANVIER','2017','Fondation de MFD'),(25,'home','DANS LE SALON','DE SA MÈRE','Les débuts'),(26,'network','UNE ÉGLISE','QUI GRANDIT','Selon la biographie citée'),(27,'phone','UNE AUDIENCE','QUI S’ÉLARGIT','Le ministère public'),(28,'mic','PRÊCHER','ENSEIGNER · CHANTER','Le ministère public'),(29,'question','LE CONTRASTE','QUI INTERROGE','Analyse'),(30,'mirror','LE PASSÉ','REVIENT AU CENTRE','Analyse'),
(31,'noise','LES RÉSEAUX','S’EMBALLENT','Septembre 2026'),(33,'distinction','DISTINGUER','LES INFORMATIONS','Point de méthode'),(34,'document','27 SEPTEMBRE','SUSPENSION','Selon Axel Lévi'),(35,'document','DESTITUTION','ANNONCÉE PAR MFD','Décision interne de l’église'),(36,'mic','IL PREND','LA PAROLE','Déclaration d’Axel Lévi'),(37,'document','ADULTÈRE','RECONNU','Ce qu’il reconnaît'),(38,'document','DES RELATIONS','RECONNUES','Ce qu’il reconnaît'),(39,'quote','IL AFFIRME','LE CONSENTEMENT','Sa position déclarée'),(40,'quote','IL NIE','LES VIOLENCES','Sa position déclarée'),(41,'distinction','ACCUSATIONS','NON ÉTABLIES','À la date du récit'),
(42,'question','POURQUOI','AUTANT DE RÉACTIONS ?','Analyse'),(44,'mic','UN LEADER','SPIRITUEL','La confiance'),(45,'ripples','LES CONSÉQUENCES','DÉPASSENT UN HOMME','Famille · Église · Fidèles'),(46,'question','UNE QUESTION','PLUS PROFONDE','Analyse'),(48,'cross','UNE ANCIENNE VIE','LAISSÉE DERRIÈRE ?','Le sens du témoignage'),(49,'mirror','UNE VICTOIRE','DÉFINITIVE ?','Analyse'),(50,'question','AU-DELÀ','D’UN SEUL HOMME','La question de fond'),(53,'question','UN COMBAT','TERMINÉ POUR TOUJOURS ?','Réflexion'),(54,'statement','TÉMOIGNAGE','≠ INVINCIBILITÉ','Réflexion'),(55,'statement','TITRE','≠ IMMUNITÉ','Réflexion'),(56,'church','GRANDE ÉGLISE','≠ RESPONSABILITÉ','Réflexion'),(57,'guardrails','LE POUVOIR','A BESOIN DE LIMITES','Limites · Transparence · Correction'),
(58,'document','IL DEMANDE','PARDON','Selon sa déclaration'),(59,'balance','LE PARDON','ET LES CONSÉQUENCES','Deux réalités distinctes'),(60,'balance','REPENTANCE','ET RESPONSABILITÉ','Deux réalités compatibles'),(62,'question','COMMENT','RESTAURER ?','Réflexion'),(63,'statement','PROTÉGER','SON IMAGE ?','Une question'),(64,'statement','FAIRE','COMME SI DE RIEN ?','Une question'),(65,'statement','CONDAMNER','DÉFINITIVEMENT ?','Une question'),(66,'balance','GRÂCE · VÉRITÉ','CONSÉQUENCES','Tenir les trois ensemble'),(67,'foundation','AU-DELÀ','D’AXEL LÉVI','Le fondement de la foi'),(69,'mic','UN PRÉDICATEUR','PEUT TOMBER','Réflexion'),(70,'mic','UN CHANTRE','PEUT TOMBER','Réflexion'),(71,'church','UN PASTEUR','PEUT TOMBER','Réflexion'),(72,'document','RECHERCHER','LA VÉRITÉ','Une exigence'),(73,'guardrails','PARLER','DE RESPONSABILITÉ','Une exigence'),(74,'distinction','LES RÉSEAUX','NE SONT PAS UN TRIBUNAL','Accusations non établies'),(75,'cross','RETIENS','CECI','La conclusion'),(76,'foundation','LA FOI','AU-DELÀ D’UN HOMME','La conclusion'),(77,'mirror','MÊME CELUI','QUI T’A APPRIS…','La conclusion'),(78,'question','LA QUESTION','À SE POSER','Pour réfléchir'),(81,'guardrails','QUI PEUT','LUI DIRE NON ?','La responsabilité du leadership')]
starts=[];t=0
for s in data['scenes']:starts.append(t);t+=s['duration']
css='''*{box-sizing:border-box}html,body{margin:0;background:#101923;color:#ede8dc;font-family:Arial,sans-serif}.frame{position:relative;width:1280px;height:720px;overflow:hidden}.grain{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 35%,#29445177,transparent 70%)}.meta{position:absolute;left:64px;top:40px;font-size:13px;letter-spacing:2px;color:#76bbc5}.copy{position:absolute;left:64px;top:235px;width:485px;z-index:2}.copy h1{font-size:49px;line-height:1.08;margin:0 0 18px;letter-spacing:-1.7px;overflow-wrap:break-word}.copy h2{font-size:31px;line-height:1.2;margin:0;color:#e7b969;font-weight:500}.art{position:absolute;left:550px;top:145px;width:680px;height:445px}.art svg{width:100%;height:100%}.tag{position:absolute;left:64px;top:570px;font-size:15px;color:#aebdc4}.rule{position:absolute;left:64px;top:197px;width:66px;height:3px;background:#e7b969}.big .copy{top:210px;width:1135px}.big h1{font-size:92px;max-width:1135px}.big h2{font-size:52px;max-width:1100px}.big .tag{top:520px}.paper{background:#ede8dc;color:#101923}.paper .grain{opacity:.15}.paper .copy h2{color:#795726}.paper .meta,.paper .tag{color:#43626b}.caption{position:absolute;left:125px;right:125px;bottom:25px;text-align:center;z-index:100;color:white;font-size:27px;line-height:1.3;text-shadow:0 2px 4px #000}.caption span{background:#080e15e8;box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:4px 12px;border-radius:4px}.footer{position:absolute;right:64px;top:42px;font-size:12px;color:#7f929d;letter-spacing:2px}.cards{display:flex;gap:22px;position:absolute;left:64px;top:320px}.card{width:365px;padding:30px 24px;background:#243440;border-top:3px solid #76bbc5;font-size:28px;line-height:1.25}.card small{display:block;font-size:19px;color:#b9c6cc;margin-top:15px}'''
mounts=[];board=[]
for i,(idx,kind,title,sub,tag) in enumerate(beats):
 a=starts[idx];b=starts[beats[i+1][0]] if i+1<len(beats) else duration;d=b-a;cid=f'scene-{i+1:02}'
 big=kind in ['number','date','question','rewind','words','quote','statement','distinction'];paper=kind in ['date','rewind']
 visual=art(kind) if not big else ''
 body=f'<div class="grain"></div><div class="meta">AXEL LÉVI / FOI & RESPONSABILITÉ</div><div class="footer">RÉCIT DOCUMENTAIRE</div><div class="rule"></div><div id="copy-{i}" class="copy"><h1>{html.escape(title)}</h1><h2>{html.escape(sub)}</h2></div><div id="art-{i}" class="art">{visual}</div><div class="tag">{html.escape(tag)}</div>'
 if kind=='distinction':
  body=body.replace('class="copy"','class="copy" style="top:125px"').replace('<h2>','<h2 style="font-size:35px">')
  body+='<div class="cards"><div class="card">RECONNU<small>Les déclarations de l’intéressé</small></div><div class="card">ANNONCÉ<small>Les décisions de l’institution</small></div><div class="card">NON ÉTABLI<small>Les accusations qui circulent</small></div></div>'
 script=f"const tl=gsap.timeline({{paused:true}});tl.fromTo('#copy-{i}',{{opacity:0,y:18}},{{opacity:1,y:0,duration:.35,ease:'power2.out'}},.03);tl.fromTo('#art-{i}',{{scale:.97,x:16}},{{scale:1.025,x:0,duration:{d},ease:'none'}},0);"
 if visual:script+=f"tl.fromTo('#art-{i} .piece',{{opacity:.25}},{{opacity:1,duration:.4,stagger:.25}},.15);"
 script+=f"window.__timelines=window.__timelines||{{}};window.__timelines['{cid}']=tl;"
 (p/'compositions'/f'{cid}.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>{css.replace(".frame{","#"+cid+"{").replace(".big ","#"+cid+".big ").replace(".paper{","#"+cid+".paper{").replace(".paper ","#"+cid+".paper ")}</style></head><body><main id="{cid}" class="frame {"big" if big else ""} {"paper" if paper else ""}" data-composition-id="{cid}" data-start="0" data-duration="{d}" data-width="1280" data-height="720">{body}</main><script>{script}</script></body></html>')
 mounts.append(f'<div class="clip" id="clip-{i}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{a}" data-duration="{d}" data-track-index="0" style="position:absolute;inset:0"></div>');board.append(dict(id=cid,start=a,end=b,title=title+' '+sub,visual=kind))
# Avoid orphan end-of-phrase flashes while preserving the master audio.
def words(c):return [w for l in c['lines'] for w in l]
def wrap(ws):
 lines=[[]]
 for w in ws:
  if lines[-1] and len(' '.join(x['text'] for x in lines[-1]+[w]))>44:lines.append([])
  lines[-1].append(w)
 return lines
cues=[]
for c in data['cues']:
 if cues and c['end']-c['start']<.7 and c['start']-cues[-1]['end']<.25:
  ls=wrap(words(cues[-1])+words(c))
  if len(ls)<=2:cues[-1]['end']=c['end'];cues[-1]['lines']=ls;continue
 cues.append(c)
for i,c in enumerate(cues):c['end']=min(max(c['end'],c['start']+.65),cues[i+1]['start'] if i+1<len(cues) else duration)
caps=[];srt=[]
def stamp(t):
 m=round(t*1000);return f'{m//3600000:02}:{m//60000%60:02}:{m//1000%60:02},{m%1000:03}'
for i,c in enumerate(cues):
 text='\n'.join(' '.join(w['text'] for w in l) for l in c['lines']);caps.append(f'<div id="caption-{i}" class="clip caption" data-start="{c["start"]}" data-duration="{c["end"]-c["start"]}" data-track-index="2"><span>{html.escape(text).replace(chr(10),"<br>")}</span></div>');srt.append(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{text}')
(p/'paroles.srt').write_text('\n\n'.join(srt)+'\n')
(p/'index.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{css}</style></head><body><main id="main" class="frame" data-composition-id="main" data-no-timeline data-start="0" data-duration="{duration}" data-width="1280" data-height="720">'+''.join(mounts)+''.join(caps)+f'<audio id="narration" class="clip" src="narration.wav" data-start="0" data-duration="{duration}" data-track-index="1" data-volume="1"></audio></main></body></html>')
(p/'storyboard.json').write_text(json.dumps(board,ensure_ascii=False,indent=2));(p/'alignment.json').write_text(json.dumps(data,ensure_ascii=False))
print(json.dumps(dict(**meta,scenes=len(board),captions=len(cues))))
