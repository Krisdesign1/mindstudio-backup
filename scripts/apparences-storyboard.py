import json,re
from pathlib import Path
W=Path('.mindstudio/apparences-work');ps=json.loads((W/'paragraphs.json').read_text());words=json.loads((W/'aligned-words.json').read_text());D=522.364833
rows='''0|public|Axel et Laurine Lévi
1|fracture|
2|apology|
3|host|Comprendre, sans se réjouir
4|question|Sauver les apparences ?
6|wedding|
7|type|22 ans
8|parents|
9|pressure|
10|image|
11|parents|
12|preach|
13|responsibility|
14|private|
15|host|Appelé ne signifie pas prêt
18|responsibility|
19|fracture|
20|trust|Selon leur confession
21|private|
22|talk|
23|talk|
24|fracture|
25|distance|
26|private|
27|alone|
28|trust|
29|image|
30|camera|
31|preach|
32|community|
33|responsibility|
34|public|
35|host|Sauver la face
37|community|
38|private|
39|image|Les apparences enferment
40|camera|
41|public|
42|pressure|
43|question|Que vont-ils penser ?
46|distance|
47|family|
48|silence|
49|identity|
50|private|
51|host|La peur de parler
52|counsel|
53|distance|
54|type|Peur. Honte. Orgueil.
57|question|Qui peut t’aider ?
59|counsel|
60|distance|
61|host|Demander de l’aide assez tôt
62|help|
63|preach|
64|alone|
65|counsel|
66|empty|
67|community|
68|family|
69|apology|
70|community|
71|host|Le talent ne remplace pas le caractère
73|faith|
74|private|
75|host|Distinguer le message du messager
76|faith|
77|comparison|Message et messager
78|silence|
79|faith|
80|empty|
81|empty|
82|faith|Christ reste Christ
83|host|La restauration
84|talk|
85|empty|
86|choice|
87|type|Tout oublier immédiatement ?
89|type|Une vie définitivement terminée ?
91|host|Éviter les deux extrêmes
92|comparison|Pardon ≠ absence de conséquences
93|comparison|Conséquences ≠ fin de la restauration
94|counsel|
95|apology|
96|calendar|
97|camera|
98|feed|
99|repair|
100|talk|
101|feed|
102|host|Viral ne signifie pas vrai
103|apology|
104|comparison|Reconnu / contesté / non vérifié
105|type|Ne pas inventer
106|question|Et s’ils avaient parlé plus tôt ?
108|fracture|
109|calendar|
110|community|
111|host|Nous ne connaissons pas cette réponse
112|help|
113|feed|
114|question|Comment en arriver là ?
115|host|Et moi, qu’est-ce que je cache ?
117|private|
118|pressure|
119|type|« Je vais gérer seul. »
121|alone|
122|host|« J’ai besoin d’aide. »
124|image|« Tout va bien. »
126|help|
127|talk|
128|support|
129|counsel|
130|counsel|
131|image|
132|family|
133|host|Protéger ce que nous sommes
134|identity|
135|comparison|Ton image n’est pas ton âme
136|comparison|Ton titre n’est pas ton identité
137|comparison|Ton ministère n’est pas ton mariage
138|comparison|Tes abonnés ne sont pas ta famille
139|help|La guérison avant la réputation
140|host|Que choisirais-tu ?
142|camera|Sauver les apparences ?
143|help|Ou commencer à guérir ?
144|empty|
145|duration|
146|silence|
147|empty|
148|private|
149|talk|
150|host|« J’ai besoin d’aide. »
152|help|'''
chapters={0:'L’image publique et la vie privée',6:'Jeunes parents et responsabilités',19:'La confiance fragilisée',30:'Sauver les apparences',51:'La peur de demander de l’aide',63:'La responsabilité humaine',71:'Le message et le caractère',83:'Restaurer dans la durée',101:'Viralité et vérité',113:'La question personnelle',126:'Parler avant de s’effondrer',140:'Choisir la guérison'}
rs=[(int(n),k,t) for n,k,t in (r.split('|') for r in rows.splitlines())];shots=[]
for j,(n,k,title) in enumerate(rs):
 e=rs[j+1][0] if j+1<len(rs) else len(ps);a=0 if j==0 else ps[n]['start'];b=ps[e]['start'] if e<len(ps) else D
 shots.append(dict(start=a,end=b,kind=k,title=title,paragraph=n,chapter=chapters[max(x for x in chapters if x<=n)],historical=k!='host' and n<113,showTitle=bool(title)))
# Long semantic passages evolve at an actual connector/idea, never on a periodic clock.
for s in list(shots):
 if s['end']-s['start']<7:continue
 local=[w for w in words if s['start']+2<w['start']<s['end']-2]
 anchor=next((w['start'] for w in local if w['text'].lower().strip(',') in ('mais','pourtant','et','parce','alors','responsables','conjoint','famille')),None)
 if anchor is None:continue
 alternative={'public':'camera','pressure':'private','responsibility':'parents','comparison':'identity','host':'talk','private':'alone','image':'camera','community':'family','faith':'empty'}.get(s['kind'],'talk')
 nxt=dict(s,start=anchor,kind=alternative,title='',showTitle=False);s['end']=anchor;shots.insert(shots.index(s)+1,nxt)
for i,s in enumerate(shots):
 s['narration']=' '.join(w['text'] for w in words if s['start']<=w['start']<s['end']);s['hostLayout']=['right','close','left'][sum(x['kind']=='host' for x in shots[:i])%3];s['pose']='point' if '?' in s['title'] else 'rest' if s['paragraph'] in (3,51,111,140) else 'listen' if i%3==0 else 'open';s['emotion']='sad' if s['kind'] in ('fracture','distance','alone','private','trust') else 'calm';s['intention']='Illustration symbolique, pas une archive ni une preuve. '+s['narration']
(W/'storyboard-plan.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(W/'chapters.json').write_text(json.dumps([(0 if n==0 else ps[n]['start'],t) for n,t in chapters.items()],ensure_ascii=False));print(json.dumps(dict(shots=len(shots),maxDuration=max(s['end']-s['start'] for s in shots))))
