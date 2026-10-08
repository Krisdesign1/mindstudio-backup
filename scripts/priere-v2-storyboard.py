"""Editorial sequence map authored from the whole script, not keyword-selected templates."""
import json,math
from pathlib import Path
W=Path('.mindstudio/priere-v2-work');ps=json.loads((W/'paragraphs.json').read_text());D=531.537042
# Paragraph groups: visual action, short on-screen idea, host present, narrative reason.
rows=[
(0,1,'question','Le volume ou le cœur ?',True,'Accroche adressée au spectateur ; révéler le contraste voix/cœur.'),
(2,3,'debate','Un débat, pas une guerre',True,'RDC : opinions représentées par des bulles neutres, aucune fausse archive.'),
(4,5,'expressions','Plusieurs manières de prier',True,'Dérouler successivement posture debout, mains levées, larmes et chant.'),
(6,9,'contrast','Ferveur ≠ agitation',True,'La présentatrice distingue deux situations humaines, ouvrir la Bible.'),
(10,12,'bridge','Regarder le cœur',True,'Relier les communautés sans caricature ; revenir à une question personnelle.'),
(13,15,'scripture','Hébreux 5 · Cris et larmes',True,'Livre ouvert et gestes de supplication ; pas de portrait parlant de Jésus.'),
(16,19,'comfort','L’émotion n’est pas une faute',True,'Une amie accueille une personne émue ; geste de réconfort.'),
(20,22,'pain','Une douleur réelle',False,'Scène intime : tension, mains vers la poitrine, puis relâchement.'),
(23,26,'contrast','Fort ne signifie pas plus spirituel',True,'Distinguer expression sonore et attention intérieure sans hiérarchie de dignité.'),
(27,28,'imitation','Une habitude peut devenir une règle',True,'Groupe : une personne copie les gestes puis interroge son propre geste.'),
(29,32,'thought','Dieu connaît tes pensées',True,'Gros plan présentatrice ; niveau sonore disparaît et pensée reste.'),
(33,37,'retreat','Le secret et l’intimité',False,'Chemin vers un lieu isolé ; retirer visuellement foule et microphone.'),
(38,39,'two-prayers','Deux prières sincères',True,'Deux personnes, une calme et une expressive, même attention portée au cœur.'),
(40,43,'heart','Ce qui se passe en nous',True,'Fille dans un décor humain : question individuelle puis communauté.'),
(44,46,'scripture','1 Corinthiens 14',True,'Texte contextuel et livre ; révéler chant, enseignement et rassemblement.'),
(47,51,'order','Édification et ordre',True,'Une personne parle ; les autres écoutent ; passer le tour de parole.'),
(52,55,'assembly','L’ordre laisse entendre',False,'Réactions décalées d’une assemblée attentive, gestes contrôlés.'),
(56,60,'turn-taking','Ferveur / désordre',True,'Deux exemples d’écoute, montrer obstruction puis rétablissement du dialogue.'),
(61,63,'respect','Respecter celui qui prie autrement',False,'Deux croyants se regardent, baissent les mains et se rapprochent.'),
(64,66,'whisper','Seigneur, aide-moi.',True,'Présentatrice proche, atmosphère intime ; épaules détendues.'),
(67,68,'gratitude','Aucune formule magique',True,'Expressions humaines : gratitude puis douleur ; pas d’effet magique.'),
(69,72,'carmel-crowd','Le mont Carmel',False,'Reconstitution biblique : groupe, autel de pierres et attente, costumes historiques.'),
(73,75,'carmel-elijah','Celui à qui la prière s’adresse',False,'Élie illustré en retrait, posture simple ; aucun faux discours synchrone.'),
(76,79,'source','La puissance vient de Dieu',True,'Retour à la présentatrice et au livre ; barrer le lien automatique volume/réponse.'),
(80,83,'balance','Ne pas tomber dans l’autre extrême',True,'Revenir aux deux prières ; écarter une conclusion simpliste.'),
(84,86,'emotion','Une foi qui connaît l’émotion',False,'Montage larmes, joie et mains ouvertes, personnes différentes.'),
(87,88,'stage','Relation ou spectacle ?',True,'Distinguer une scène éclairée de la même personne dans l’intimité.'),
(89,91,'mirror','Pourquoi est-ce que je prie ainsi ?',True,'Présentatrice pose la question ; personnage secondaire observe son attitude.'),
(92,95,'remove-props','Sans clavier. Sans micro. Sans foule.',True,'Retirer successivement les supports visuels sur les mots exacts.'),
(96,101,'secret','Dieu et toi',False,'Salle qui se vide ; personnage reste dans un espace calme et chaleureux.'),
(102,105,'distracted','Calme ne signifie pas profondeur',True,'Personne silencieuse mais distraite ; revenir à l’attention intérieure.'),
(106,107,'phone','Silencieux… et distrait',False,'Regard vers un téléphone, puis appareil posé et regard recentré.'),
(108,112,'connection','Se rapprocher de Dieu · Construire les autres',True,'Deux actions complémentaires : prière intime et écoute d’autrui.'),
(113,116,'community','Ordre et ferveur',True,'Montrer écoute, retenue puis spontanéité ; gestes individualisés.'),
(117,122,'pillars','Plus de maturité',True,'Quatre associations illustrées : ferveur/ordre, liberté/discernement, émotion/profondeur, feu/édification.'),
(123,126,'answer','Dieu n’a pas besoin que tu cries',True,'Réponse face caméra, cadrage rapproché et pose calme.'),
(127,129,'permission','Exprime-toi sincèrement',True,'Accompagner les formes de prière sans jugement ; fille présente et articulée.'),
(130,131,'meter-heart','Il regarde ton cœur',True,'Sonomètre mis de côté ; attention recentrée sur la personne.'),
(132,133,'peace','Compréhension, paix et ordre',True,'Tour de parole, accueil, gestes de respect ; fille dans le décor.'),
(134,137,'seek','Vérité · Intimité · Dieu',True,'Trois révélations sobres synchronisées, garder la présentatrice visible.'),
(138,142,'no-competition','Sans compétition. Sans spectacle.',True,'Montrer les deux personnes sans classement ni jugement.'),
(143,144,'unity','Sincères, même différents',False,'Groupe aux poses et identités distinctes ; un même espace partagé.'),
(145,150,'audience','Et dans ta vie de prière ?',True,'La présentatrice interroge le spectateur avec regard caméra.'),
(151,153,'choices','Volume ? Émotion ? Sincérité ?',True,'Trois options lisibles révélées sur les vrais mots.'),
(154,156,'reconcile','Plus de respect les uns pour les autres',True,'Dialogue constructif et rapprochement, sans foule uniforme.'),
(157,158,'closing','Davantage de profondeur',True,'Conclusion rapprochée, geste posé et silence final.'),
]
shots=[]
for g,(lo,hi,kind,title,host,intention) in enumerate(rows):
 a=0 if lo==0 else ps[lo]['start'];b=ps[hi+1]['start'] if hi+1<len(ps) else D
 # Cuts on existing phrase boundaries, merging tiny fragments; long phrases evolve in the same shot.
 anchors=[a];last=a
 for j in range(lo+1,hi+1):
  t=ps[j]['start']
  if t-last>=3.5 and b-t>=2.8:anchors.append(t);last=t
 anchors.append(b)
 for k,(st,en) in enumerate(zip(anchors,anchors[1:])):
  shots.append(dict(start=st,end=en,kind=kind,title=title,showTitle=k==0,host=host,layout=['left','right','embedded','close'][g%4] if host else 'full',pose=['open','rest','point'][g%3],emotion='sad' if kind in ('pain','whisper','comfort') else 'calm',group=g,variation=k,paragraphRange=[lo,hi],passage='\n\n'.join(p['text'] for p in ps[lo:hi+1]),intention=intention,historical=kind.startswith('carmel'),chapter=title))
assert rows[0][0]==0 and rows[-1][1]==len(ps)-1
assert all(x[1]+1==y[0] for x,y in zip(rows,rows[1:]))
(W/'storyboard-plan.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));print(len(shots),'plans ; présentatrice',round(sum(s['end']-s['start'] for s in shots if s['host']),1),'secondes ;',len(rows),'séquences conçues.')
