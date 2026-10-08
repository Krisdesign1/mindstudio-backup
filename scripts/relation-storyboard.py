"""Cuts follow meaning and real word boundaries; no periodic five-second slicing."""
import json,re
from pathlib import Path
W=Path('.mindstudio/relation-work');ps=json.loads((W/'paragraphs.json').read_text());words=json.loads((W/'aligned-words.json').read_text());D=426.353042
rows='''0|couple|Elle pensait construire sa vie
1|grief|
2|distance|
3|host|Elle appelait ça de l’amour
5|wedding|
6|serve|
7|student|
9|meet|
10|numbers|
11|couple|
12|support|
13|job|
14|budget|
15|give|
16|host|Au début, elle voulait aider
17|encourage|
19|money|
21|projects|
22|work|
23|couple|
24|alone|
25|orbit|
27|budget|Ses besoins
29|family|Sa famille
30|projects|Ses projets
31|money|Son argent
32|identity|
33|distance|
35|host|Un choix douloureux
36|hospital|
37|operation|
38|pressure|
39|conversation|
40|question|Selon lui : le risque de prison
41|choice|
44|give|
45|loan|
46|withdraw|
47|family|
48|refuse|
49|money|
50|silence|
51|grief|
52|host|La culpabilité
53|alone|
54|messages|
56|question|Il y aurait une autre femme
57|messages|
58|notification|
59|alone|
60|mirror|
61|distance|
62|host|Le déclic dépasse l’infidélité
63|identity|
64|mirror|
65|isolation|
67|family|
68|friends|
69|conversation|
70|host|« Fais attention. »
71|orbit|
72|question|Amour ou dépendance ?
74|family|
75|choice|
76|argument|
77|identity|
79|comparison|Sacrifier ≠ disparaître
81|couple|
82|free-talk|
84|family|
85|friends|
86|boundaries|
87|faith|
88|journal|
89|orbit|
90|isolation|
91|host|S’arrêter. Regarder.
92|recognize|
93|mirror|
94|give|
96|support|
97|alone|
98|identity|
99|recognize|
101|host|Ce qui paraît normal de l’intérieur
102|prison|
104|journal|
106|calendar|
107|support|« Il traverse une mauvaise période. »
108|alone|« Il va changer. »
109|couple|« C’est parce qu’il m’aime. »
110|calendar|« Je dois juste être plus patiente. »
111|messages|« Ce n’est pas si grave. »
112|calendar|
114|host|Ne pas expliquer l’inacceptable
116|isolation|
117|distance|
118|free-talk|
120|host|Les proches n’ont pas toujours raison
121|boundaries|
122|question|L’isolement : un signal à examiner
123|isolation|
124|alone|
125|phone|
126|host|Après le départ
127|exit|
128|alone|
130|grief|
132|distance|
133|apology|
134|rebuild|
135|host|Partir n’efface pas les conséquences
137|door|
138|repair|
139|rebuild|
140|apology|
141|recognize|
142|walk|
143|identity|
145|host|Qu’est-ce qui a changé dans ta vie ?
146|journal|
147|recognize|
148|friends|
149|faith|
150|free-talk|
151|boundaries|
152|journal|
153|mirror|
155|give|
156|alone|
157|host|Une autre question à se poser
158|question|« Est-ce que cette personne m’aime ? »
160|host|Que produit cette relation dans ta vie ?
162|couple|
163|comparison|Sacrifice ≠ disparition de soi
166|couple|
167|family|
168|faith|
169|boundaries|
170|recognize|
172|host|À quel moment l’amour devient-il une prison ?
174|door|'''
chapters={0:'L’amour et ce qui disparaît',5:'La rencontre',12:'Aider et soutenir',24:'Tout passe avant elle',35:'Le choix douloureux',50:'Deuil et révélation',62:'Le déclic',72:'Amour et dépendance',81:'Les deux personnes existent',92:'Regarder autrement',114:'Examiner l’isolement',126:'Reconstruire',145:'Les questions à se poser',163:'Sacrifice et identité'}
rs=[(int(n),k,t) for n,k,t in (r.split('|') for r in rows.splitlines())];shots=[]
for j,(n,k,title) in enumerate(rs):
 e=rs[j+1][0] if j+1<len(rs) else len(ps);a=0 if j==0 else ps[n]['start'];b=ps[e]['start'] if e<len(ps) else D
 shots.append(dict(start=a,end=b,kind=k,title=title,paragraph=n,chapter=chapters[max(x for x in chapters if x<=n)],narration=' '.join(p['text'] for p in ps[n:e]),historical= k!='host' and n<72,showTitle=bool(title)))
# Separate the opening's longer reported consequences and explanatory phrases at real words.
splits=[(2,'famille','distance',''),(2,'l’homme','messages',''),(74,'toutes','isolation',''),(75,'détriment','budget',''),(78,'identité','mirror',''),(91,'regarder','recognize',''),(115,'inacceptable','messages',''),(123,'personne','phone',''),(136,'conséquences','repair',''),(138,'plusieurs','calendar',''),(156,'reste','mirror',''),(162,'reste','isolation','')]
for paragraph,needle,kind,title in splits:
 candidates=[s for s in shots if s['paragraph']==paragraph]
 for target in candidates:
  if target['end']-target['start']<5.8:continue
  local=[w for w in words if target['start']<=w['start']<target['end']]
  anchor=next((w['start'] for w in local if needle in w['text'].lower() and w['start']>target['start']+1.4 and target['end']-w['start']>1.3),None)
  if anchor:
   nxt=dict(target,start=anchor,kind=kind,title=title,showTitle=bool(title));target['end']=anchor;shots.insert(shots.index(target)+1,nxt);break
for i,s in enumerate(shots):
 s['narration']=' '.join(w['text'] for w in words if s['start']<=w['start']<s['end'])
 s['hostLayout']=['right','close','left'][sum(x['kind']=='host' for x in shots[:i])%3]
 s['pose']='point' if '?' in s['title'] else 'rest' if s['paragraph'] in (35,52,62,114,135) else 'open'
 s['emotion']='sad' if s['kind'] in ('grief','alone','distance','hospital','pressure','mirror','isolation') or s['paragraph'] in (35,52) else 'calm'
 s['intention']={'host':'La présentatrice relie les idées, sans se substituer à la femme du récit.','hospital':'Montrer le lieu d’attente et la gravité, sans image médicale sensationnaliste.','choice':'Montrer le dilemme rapporté sans ajouter de justification ni de causalité au décès.','messages':'Suggérer les conversations rapportées par des lignes abstraites, sans fabriquer de citation ou de preuve.','grief':'Laisser une respiration sobre au deuil, sans bruitage dramatique.','isolation':'Rendre visible l’éloignement des proches par des liens qui s’estompent.','repair':'Montrer la reconstruction progressive, pas une guérison instantanée.','boundaries':'Montrer une limite claire sans couper les liens sociaux.','door':'Une porte ouverte pour la dernière question, sans imposer de réponse.'}.get(s['kind'],'Montrer concrètement ce passage : '+s['narration'])
(W/'storyboard-plan.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(W/'chapters.json').write_text(json.dumps([(0 if n==0 else ps[n]['start'],t) for n,t in chapters.items()],ensure_ascii=False))
print(json.dumps({'shots':len(shots),'maxDuration':max(s['end']-s['start'] for s in shots),'hostShots':sum(s['kind']=='host' for s in shots)}))
