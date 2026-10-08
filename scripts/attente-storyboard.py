"""Narrative map for the waiting-season film."""
import json
from pathlib import Path

W=Path('.mindstudio/attente-work');D=516.9355
ps=json.loads((W/'paragraphs.json').read_text())
rows=[
(0,4,'opening','Pourquoi Dieu te fait-il attendre ?',True,'Présentatrice dans une chambre nocturne ; prière, silence et attente concrète.'),
(5,9,'comparison','Quand les autres avancent',False,'Deux trajectoires visibles : une porte s’ouvre, l’autre personne attend sans caricature.'),
(10,14,'clock','Le silence fait mal',True,'Horloge, regard et respiration ; la puissance de Dieu n’est pas niée.'),
(15,18,'joseph-dream','Joseph : la promesse',False,'Reconstitution biblique illustrée : jeune Joseph, ciel étoilé, puis rupture narrative.'),
(19,23,'joseph-prison','Une attente qui forme',False,'Joseph en prison, posture digne et lumière croissante ; aucune fausse archive.'),
(24,26,'hidden-work','Dieu peut agir hors de ton regard',True,'Présentatrice devant une scène à plusieurs couches dont une partie reste cachée.'),
(27,29,'suffering','La souffrance reste une épreuve',True,'Quatre situations sobres : injustice, trahison, maladie et perte, sans prétendre que Dieu les cause.'),
(30,35,'david','David : attendre sans prendre de force',False,'Reconstitution biblique illustrée : onction, refuge et choix de retenue.'),
(36,45,'responsibility','Prêt à recevoir… prêt à porter ?',True,'Poste, relation et influence associés à leurs responsabilités et protections.'),
(46,55,'honest-pain','Tu peux croire et pleurer',True,'Présentatrice assise, émotion retenue, prière honnête et calendrier hors contrôle.'),
(56,62,'lazarus','Lazare : si Tu avais été là',False,'Reconstitution biblique illustrée centrée sur Marthe et Marie et leur douleur.'),
(63,71,'timing','Ils doutent du timing',True,'Horloge suspendue, questions successives, regard caméra et silence lisible.'),
(72,79,'whole-story','Retard ne veut pas dire abandon',False,'Vue élargie : personnes, conséquences, maturité et portes ouvertes ou fermées.'),
(80,88,'honesty','1 · Sois honnête avec Dieu',True,'Prière sans masque ; paroles, larmes et questions restent orientées vers Dieu.'),
(89,94,'life-moving','2 · Ne mets pas toute ta vie en pause',True,'Vie quotidienne active malgré le manque : apprentissage, service et soin.'),
(95,100,'work-grow','Continue à apprendre, servir, construire',False,'Trois actions concrètes progressent pendant que l’horloge continue.'),
(101,109,'pressure-choice','3 · Ne fabrique pas une réponse',True,'Carrefour de décisions : relation forcée, occasion douteuse, retour et compromis.'),
(110,114,'community','4 · Entoure-toi',False,'Petit cercle de soutien : écoute, prière, encouragement sans fausse prophétie.'),
(115,121,'movement','Attendre n’est pas rester immobile',True,'Présentatrice distingue action fidèle, aide demandée et contrôle abandonné.'),
(122,128,'control','Responsabilité / contrôle',False,'Deux zones : ce que la personne peut préparer et les portes qu’elle ne peut forcer.'),
(129,136,'no-false-promise','Pas de date inventée',True,'Calendrier sans date promise ; trois vérités affichées avec sobriété.'),
(137,139,'simple-prayer','Une prière simple',True,'Gros plan apaisé ; la phrase essentielle apparaît sans grand effet.'),
(140,146,'protect-heart','Protège ton cœur',False,'Cœur protégé de l’amertume, de la peur et d’une vision déformée de Dieu.'),
(147,153,'closed-doors','Un jour, tu verras autrement',True,'Portes fermées et chemin alternatif éclairé ; aucune issue particulière garantie.'),
(154,161,'growth','Tu es encore en train de devenir',False,'Croissance visible en trois étapes, de la graine à l’arbre enraciné.'),
(162,165,'closing','Choisis ce que cette saison fera de toi',True,'Présentatrice à l’aube ; protection de la personne qui recevra la réponse.'),
]
assert rows[0][0]==0 and rows[-1][1]==len(ps)-1
assert all(a[1]+1==b[0] for a,b in zip(rows,rows[1:]))
s=[]
for g,(lo,hi,kind,title,host,intention) in enumerate(rows):
 a=0 if lo==0 else ps[lo]['start'];b=ps[hi+1]['start'] if hi+1<len(ps) else D
 cuts=[a]
 for j in range(lo+1,hi+1):
  t=ps[j]['start']
  if t-cuts[-1]>=3.5 and b-t>=2.8:cuts.append(t)
 cuts.append(b)
 for v,(st,en) in enumerate(zip(cuts,cuts[1:])):
  historical=kind in ('joseph-dream','joseph-prison','david','lazarus')
  # Keep the recurring face, but break the static presenter rhythm with full-scene inserts.
  host_plan=host and (kind=='simple-prayer' or v%2==0)
  rehook=v==0 or (v>0 and v%4==0)
  s.append(dict(start=st,end=en,kind=kind,title=title,showTitle=rehook,host=host_plan,layout=['left','right','close','embedded'][(g+v)%4] if host_plan else 'full',pose=['open','rest','point'][(g+v)%3],emotion='sad' if kind in ('opening','honest-pain','simple-prayer') else 'calm',group=g,variation=v,paragraphRange=[lo,hi],passage='\n\n'.join(p['text'] for p in ps[lo:hi+1]),intention=intention,historical=historical,chapter=title,rehook=rehook and v>0))
(W/'storyboard-plan.json').write_text(json.dumps(s,ensure_ascii=False,indent=2))
print(len(rows),'séquences',len(s),'plans ; présentatrice',round(sum(x['end']-x['start'] for x in s if x['host']),1),'secondes')
