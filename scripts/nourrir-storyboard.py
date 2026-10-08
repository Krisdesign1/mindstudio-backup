"""Narrative map: new concrete scenes for each argument and decision."""
import json
from pathlib import Path
W=Path('.mindstudio/nourrir-work');D=546.623583
ps=json.loads((W/'paragraphs.json').read_text())
rows=[
(0,4,'opening','Tu veux changer… et tu retombes',True,'Prière intime puis boucle de la rechute : personne assise, téléphone à distance.'),
(5,7,'question','Pourquoi je recommence ?',True,'Présentatrice interroge, nom Athom’s mentionné sans lui attribuer une voix fictive.'),
(8,10,'dogs','Deux chiens',False,'Illustration de la parabole : chiens blanc et noir séparés, sans violence.'),
(11,12,'dogs-feed','Celui qu’on nourrit',False,'Un bol plein, un bol vide : contraste des forces préparées avant le combat.'),
(13,17,'forces','Chair / esprit',True,'La présentatrice interprète la métaphore ; aucun lien entre couleur et dignité humaine.'),
(18,21,'feed','Ce qui réveille l’habitude',False,'Un écran présente des contenus neutres qui s’accumulent ; rien d’explicite.'),
(22,25,'chat','Les mêmes conversations',True,'Messages et contenus répétés, personnage pris dans une routine.'),
(26,30,'pray','Une décision à ta place ?',True,'Prière sincère et décision personnelle : cadrage intime puis ouvert.'),
(31,34,'question','Qu’est-ce qui la rend plus forte ?',True,'Question pédagogique ; révéler nourrir, fermer, parler.'),
(35,38,'feed','Une vidéo. Puis une autre.',False,'Accumulation de cartes vidéo, progression perceptible.'),
(39,43,'relationships','Ce qui devient normal',True,'Trois interlocuteurs, réactions différentes ; continuité de l’influence.'),
(44,48,'bible','Nourrir la vie intérieure',True,'Livre ouvert, lecteur et prière, sans citation inventée.'),
(49,52,'habits','Ce que tu nourris prend de la force',True,'Deux plantes, deux rythmes de croissance ; métaphore distincte des chiens.'),
(53,58,'routine','La résistance se prépare avant',False,'Livre accessible et téléphone posé : environnement quotidien préparé.'),
(59,61,'leave','Parfois, il faut fuir',True,'Personnage choisit une sortie ouverte ; aucun glissement des pieds.'),
(62,65,'limits','Connaître ses limites',True,'Présentatrice distingue force et sagesse devant une limite visible.'),
(66,70,'couple','Ne pas recréer la même situation',False,'Deux adultes dans un lieu quotidien, retenue et distance, aucun contenu intime.'),
(71,72,'leave','Fuir peut être une victoire',True,'La porte ouverte représente la sortie ; geste d’orientation sans marche simulée.'),
(73,73,'delete','Supprimer ce numéro',False,'Gros plan du contact et action supprimer, interface fictive.'),
(74,74,'unfollow','Ne plus suivre',False,'Un compte neutre, choix de désabonnement explicite.'),
(75,76,'block','Une décision plus claire',True,'Conversation interrompue : le contrôle revient à la personne.'),
(77,79,'talk','Parler à quelqu’un',True,'Un interlocuteur accueille une confidence, regard dirigé vers celui qui parle.'),
(80,84,'cycle','Le cycle du secret',False,'La personne reste seule ; boucle visible et posture tendue.'),
(85,87,'image','L’image que les autres voient',False,'Masque figuratif séparé du visage ; révéler la personne et non la condamner.'),
(88,92,'integrity','Intégrité / réputation',True,'Question posée calmement ; retirer partiellement le masque symbolique.'),
(93,97,'help','Un accompagnement fiable',False,'Échange entre deux personnes avec écoute, main ouverte et réaction décalée.'),
(98,103,'trust','Choisir une personne. Puis parler.',True,'Confidence individuelle, pas une exposition publique ; espace accueillant.'),
(104,110,'thought','La bataille des pensées',True,'Une pensée apparaît avant l’action ; personnage observe cette pensée.'),
(111,117,'thought-door','Laisser passer… ou inviter',False,'Pensée devant une porte ; choix visible entre l’accueillir et la laisser dehors.'),
(118,121,'select','Je ne vais pas nourrir ça',True,'Présentatrice puis personnage posent une limite claire.'),
(122,124,'phone','Ce que tu consommes compte',True,'Contenu neutre à l’écran, attention visuelle guidée.'),
(125,128,'influence','Regarder. Écouter. Fréquenter.',False,'Interactions humaines et orientations du regard, sans personnages copiés au même rythme.'),
(129,133,'choose','Deviens sélectif',True,'Trois choix concrets, apparitions progressives et gestes limités.'),
(134,134,'groups','Quitter ce groupe',False,'Choix explicite dans une interface de groupe fictive.'),
(135,136,'unfollow','Une relation n’est pas une obligation',True,'Présentatrice près d’un compte et d’un choix visible.'),
(137,140,'relationships','Est-ce que cette relation m’aide ?',True,'Deux attitudes différentes ; question sans caricature des personnes.'),
(141,149,'image','Garder les causes, perdre les conséquences ?',True,'Contraste entre image préservée et réalité, sans accusation particulière.'),
(150,153,'block','La liberté demande des choix',True,'Suppression, sortie et blocage : décisions représentées sobrement.'),
(154,156,'routine','Changer la routine. Demander de l’aide.',False,'Livre, téléphone au repos et changement de priorité quotidienne.'),
(157,157,'close-door','Certaines portes doivent se fermer',False,'Porte qui se ferme, pas une personne rejetée.'),
(158,160,'answer','Regarder honnêtement, sans se condamner',True,'Regard caméra et geste apaisant ; évite un ton humiliant.'),
(161,165,'phone','Qu’est-ce qui alimente ton combat ?',True,'Examiner les entrées : téléphone, conversation et habitudes.'),
(166,170,'action','Aujourd’hui',True,'Une action lisible maintenant, sans compteur ni urgence artificielle.'),
(171,174,'call','Supprimer. Quitter. Appeler.',False,'Contact fiable et appel, continuité vers l’aide.'),
(175,178,'bible','Des décisions répétées',True,'Bible rouverte, prière et répétition de choix quotidiens.'),
(179,182,'restart','Une rechute n’est pas la fin',True,'Personne se redresse dans une pose stable ; dignité préservée.'),
(183,187,'environment','Apprendre. Changer. Demander de l’aide.',False,'Nouvelle organisation du quotidien, pas un décor abstrait interchangeable.'),
(188,194,'forces','La force de ce qu’on nourrit',True,'Retour intentionnel à la parabole initiale, réponse à la promesse d’ouverture.'),
(195,198,'unfollow','Une décision que personne ne voit',False,'Petit geste sur un compte, importance sans effet spectaculaire.'),
(199,200,'close-door','Une porte fermée. Une personne appelée.',True,'Limite claire et lien à l’aide, aucun geste punitif.'),
(201,202,'bible','Une Bible rouverte. Une prière sincère.',False,'Livre et espace calme, respiration du montage.'),
(203,205,'daily','Une décision. Puis une autre.',True,'Croissance progressive ; présenter un processus et non un miracle garanti.'),
(206,210,'question','Qu’est-ce que tu continues à nourrir ?',True,'Question finale adressée à soi avant les commentaires.'),
(211,213,'closing','Choisis une action concrète',True,'Conclusion accueillante, continuité du personnage récurrent et fin propre.'),
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
  s.append(dict(start=st,end=en,kind=kind,title=title,showTitle=v==0,host=host,layout=['left','right','close','embedded'][(g+v)%4] if host else 'full',pose=['open','rest','point'][(g+v)%3],emotion='sad' if kind in ('opening','cycle','pray') else 'calm',group=g,variation=v,paragraphRange=[lo,hi],passage='\n\n'.join(p['text'] for p in ps[lo:hi+1]),intention=intention,historical=False,chapter=title))
(W/'storyboard-plan.json').write_text(json.dumps(s,ensure_ascii=False,indent=2))
print(len(rows),'séquences',len(s),'plans ; présentatrice',round(sum(x['end']-x['start'] for x in s if x['host']),1),'secondes')
