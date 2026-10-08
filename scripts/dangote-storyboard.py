import json,re
from pathlib import Path
W=Path('.mindstudio/dangote-work');ps=json.loads((W/'paragraphs.json').read_text());words=json.loads((W/'aligned-words.json').read_text());D=382.997083
rows='''0|factory|Aliko Dangote
1|cement|Cimenteries
2|factory|Usines
3|refinery|Raffinerie
4|map|Plusieurs pays africains
5|host|Avant les milliards…
6|question|Une rencontre racontée
7|airport|Nigeria · Un aéroport
8|airport|Fin des années 1970
9|arrivals|Benson Idahosa · T. L. et Daisy Osborn
10|airport|Destination Lagos
11|full|L’avion est complet
13|full|Toutes les places occupées
14|request|Céder deux sièges ?
15|still|Personne ne bouge
17|rise|Un jeune homme se lève
18|assistant|Son assistant aussi
20|exit|Ils récupèrent leurs affaires
21|meeting|Une question inattendue
22|meeting|« Quel est ton nom ? »
23|meeting|Un jeune commerçant
24|trade|Aliko Dangote
25|host|Pas encore l’industriel connu
26|trade|Un entrepreneur qui développe son activité
27|blessing|Une bénédiction, selon le récit
28|blessing|Une parole tournée vers l’avenir
29|exit|Il quitte l’avion
30|boarding|Les places libérées
31|host|L’histoire aurait pu s’arrêter là
32|timeline|Des décennies plus tard
33|factory|Le nom Dangote
34|cement|Ciment
35|sugar|Sucre
36|factory|Industrie
37|fertilizer|Fertilisants
38|energy|Énergie
39|refinery|Raffinage
40|construction|Des projets gigantesques
41|blessing|La rencontre revient dans les mémoires
43|host|Mais attention à la conclusion
44|question|La leçon qu’il ne faut pas manquer
45|comparison|Une prière… et tout serait automatique ?
46|host|Une leçon plus profonde
47|question|Même si le récit est exact…
48|waiting|Il n’a pas attendu sans agir
49|trade|Faire du commerce
50|construction|Construire
51|invest|Investir
52|risk|Prendre des risques
53|plan|Développer ses activités
54|factory|Du commerce à l’industrie
55|timeline|Des décennies de cheminement
56|host|Voici ce que l’histoire enseigne
57|comparison|La bénédiction ne remplace pas le travail
58|discipline|La discipline reste nécessaire
59|plan|Les décisions aussi
60|calendar|Une promesse n’est pas immédiate
61|encourage|Une parole sur une vie
62|learn|Des années de préparation
63|plan|Des choix
64|work|Des sacrifices
65|risk|Des échecs
66|learn|Des apprentissages
67|door|Des opportunités
68|calendar|Et du temps
70|host|Un détail essentiel
71|meeting|Avant même de donner son nom…
72|rise|Il aurait posé un acte
73|empty|Céder sa place
74|give-seat|Perdre un avantage immédiat
75|host|Rester prudent sur les détails
76|door|La générosité ouvre des portes
77|encourage|Une rencontre peut compter
78|host|On ne sait pas laquelle
79|help|Faire ce qui est juste
80|question|Sans attendre une récompense
81|refusal|Et s’il avait refusé ?
83|refusal|« J’ai payé mon billet »
85|still|« Je ne bouge pas »
86|empty|Une autre histoire possible
88|rise|Mais selon le récit, il s’est levé
89|empty|Il a donné sa place
90|blessing|Quelques secondes plus tard…
91|blessing|Des paroles encore racontées
92|host|Et celui qui a béni ?
93|timeline|1998 · Selon le récit
94|refinery|Il n’a pas vu toute l’ampleur
95|host|Le résultat peut venir plus tard
96|calendar|Bénir sans voir la suite
97|encourage|Encourager aujourd’hui
98|timeline|Sans connaître les vingt prochaines années
99|blessing|Prier pour quelqu’un
100|help|Aider quelqu’un
101|door|Ouvrir une porte
102|advice|Donner un conseil
103|encourage|Prononcer une parole d’encouragement
104|walk|Puis continuer son chemin
105|calendar|Une parole peut rester des années
106|host|La leçon n’est pas…
107|question|« Trouver quelqu’un qui me rendra riche »
108|type|Non.
109|host|Ne réduisons pas le message
110|question|La vraie question
111|host|Que fais-tu après la parole ?
112|waiting|Attendre…
113|construction|…ou construire ?
114|comparison|La bénédiction remplace-t-elle le travail ?
115|host|Une responsabilité aussi
116|timeline|Entre la parole et l’accomplissement
118|work|Des années de travail invisible
119|waiting|C’est là que certains abandonnent
120|comparison|La prophétie… sans le processus ?
122|comparison|La bénédiction… sans la discipline ?
124|comparison|Le résultat… sans les années ?
126|host|Une histoire fascinante
128|blessing|Pas seulement les paroles dans l’avion
129|construction|Mais les années qui ont suivi
130|host|Une parole indique une destination
131|walk|Il faut encore marcher.'''
chapterStarts={0:'Avant les milliards',7:'Une rencontre rapportée',15:'Le siège cédé',25:'Le jeune commerçant',32:'Des décennies plus tard',44:'Ne pas manquer la leçon',49:'Du commerce à l’industrie',57:'Parole et responsabilité',61:'Le temps de préparation',70:'La générosité',81:'Et s’il avait refusé ?',92:'Encourager sans voir la suite',106:'La vraie question',116:'Le travail invisible',126:'La destination et le chemin'}
rs=[(int(n),k,t) for n,k,t in (r.split('|') for r in rows.splitlines())];shots=[]
for j,(n,k,title) in enumerate(rs):
 e=rs[j+1][0] if j+1<len(rs) else len(ps);a=0 if j==0 else ps[n]['start'];b=ps[e]['start'] if e<len(ps) else D
 historical=(7<=n<=30) or (71<=n<=74) or (81<=n<=91) or n in (41,128)
 shots.append(dict(start=a,end=b,kind=k,title=title,paragraph=n,chapter=chapterStarts[max(x for x in chapterStarts if x<=n)],narration=' '.join(p['text'] for p in ps[n:e]),historical=historical,showTitle=k in ('host','type','question','comparison') or n in (0,7,8,9,10,12,14,24,32,34,35,36,37,38,39,57,93,131)))
# Extend the longest descriptions through real phrase changes, not periodic clock cuts.
for paragraph,needle,kind,title in [(9,'accompagne','arrivals','T. L. Osborn et Daisy'),(14,'volontairement','request','Deux sièges pour ses invités'),(28,'que son entreprise','map','Au-delà des frontières'),(45,'automatiquement','waiting','Un résultat automatique ?'),(55,'de l’empire','factory','Le temps de construire'),(75,'le principe','door','Un principe de générosité')]:
 target=next((s for s in shots if s['paragraph']==paragraph),None)
 if not target or target['end']-target['start']<6:continue
 local=[w for w in words if target['start']<=w['start']<target['end']];text=' '.join(w['text'] for w in local).lower();token=needle.split()[0]
 anchor=next((w['start'] for w in local if w['text'].lower().strip('.,:;!?«»')==token and w['start']>target['start']+2),None)
 if anchor and target['end']-anchor>1.2:
  nxt=dict(target,start=anchor,kind=kind,title=title,showTitle=True);target['end']=anchor;shots.insert(shots.index(target)+1,nxt)
for i,s in enumerate(shots):
 s['narration']=' '.join(w['text'] for w in words if s['start']<=w['start']<s['end'])
 s['hostLayout']=['right','left','close'][sum(x['kind']=='host' for x in shots[:i])%3]
 s['pose']='point' if '?' in s['title'] else 'rest' if any(x in s['title'] for x in ['attention','prudent','attend','années']) else 'open'
 s['emotion']='tension' if s['kind']=='refusal' else 'sad' if s['kind'] in ('risk','waiting') else 'calm'
 s['intention']={'rise':'Montrer le choix de se lever pour céder sa place.','empty':'Montrer concrètement les deux sièges libérés.','refusal':'Illustrer une hypothèse explicitement présentée comme telle.','construction':'Montrer le chantier et le travail nécessaire au résultat.','host':'Relier les étapes et poser la question sans modifier le récit.','blessing':'Reconstitution symbolique du récit rapporté ; aucune archive ni citation ajoutée.'}.get(s['kind'],'Illustrer ce passage par une action, un objet ou un lieu pertinent : '+s['title'])
(W/'storyboard-plan.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(W/'chapters.json').write_text(json.dumps([(0 if n==0 else ps[n]['start'],t) for n,t in chapterStarts.items()],ensure_ascii=False))
print(json.dumps({'shots':len(shots),'maxDuration':max(s['end']-s['start'] for s in shots),'hostShots':sum(s['kind']=='host' for s in shots)}))
