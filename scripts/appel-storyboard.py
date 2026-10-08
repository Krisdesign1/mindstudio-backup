import json
from pathlib import Path
W=Path('.mindstudio/appel-work'); ps=json.loads((W/'paragraphs.json').read_text());D=345.708875
# Each row starts at a semantic paragraph, not an arbitrary periodic cut.
rows='''0|host|Appelé… mais à quoi ?
2|church-building|Ouvrir une église ?
3|phone|Un groupe. Une rencontre. Un projet.
4|host|Trois choses à distinguer
5|type|L’appel
6|type|La mission
7|compass|La direction
8|host|Connaître son appel
9|steps|Et le prochain pas ?
10|paul|Regarde Paul
12|seminar|Annoncer Jésus
13|host|Une mission claire
14|paul|Il veut avancer
15|blocked|Mais cette route se ferme
16|host|Ce n’était pas un péché
18|bible|Prêcher était une bonne chose
20|blocked|Actes 16 · Pas par là
21|blocked-two|Une autre route. Un autre refus.
23|host|Imagine sa question
25|paul|« Je ne comprends pas… »
27|blocked|Pourquoi m’empêcher d’avancer ?
29|host|Voici le principe
30|seminar|La bonne mission…
31|blocked|…au mauvais endroit
32|calendar|…au mauvais moment
33|compass|La direction reste à chercher
34|host|Cela change tout
35|internet|« Je suis appelé à enseigner »
38|church-building|Mais ouvrir une église ?
39|mentoring|Un cœur pour les jeunes
41|church-building|Mais créer ton ministère ?
42|prayer|Le don de la prière
44|phone|Mais créer ce groupe ?
45|seminar|Évangéliser, oui…
47|compass|Où ? Quand ? Avec qui ?
50|host|Et de quelle manière ?
51|type|Ne confonds pas les trois
55|host|L’appel · le domaine
56|seminar|La mission · ce que tu accomplis
57|compass|La direction · le prochain pas
59|paul|Où aller ? Que faire ?
61|mentoring|Avec qui ?
62|calendar|À quel moment ?
63|host|De quelle manière ?
64|host|L’appel peut être clair…
65|steps|…sans connaître la direction
66|power|Quand la passion s’emballe
67|church-copy|Ressembler à l’appel ne suffit pas
68|host|Ce n’est pas automatique
69|paul|Paul connaissait sa mission
71|waiting|Il devait pourtant attendre
73|blocked|« Pas là »
76|blocked-two|« Pas là non plus »
79|vision|Macédoine · Viens nous aider
80|destination|La direction devient claire
81|paul|La même mission
84|destination|Une autre destination
85|host|Pas un nouvel appel
87|compass|Une direction précise
88|host|Le but… et la forme
90|church-copy|La forme des autres ?
92|church-building|« Moi aussi, une église »
94|type|Pas forcément.
95|seminar|Pasteur
96|paul|Missionnaire
97|internet|Enseigner sur Internet
98|mentoring|Former cinq personnes
99|work|Servir dans une entreprise
100|host|Le même Dieu
102|compass|Des directions différentes
103|steps|Ne cours pas devant Dieu
104|host|Un refus n’est pas toujours définitif
106|calendar|Pas maintenant
108|blocked|Pas là
110|compass|Pas comme ça
111|host|« C’est bien » ne suffit pas
113|bible|Même Paul devait discerner
115|type|Activité ≠ obéissance
116|seminar|Un séminaire
117|church-building|Une église
118|internet|Une chaîne
119|phone|Un groupe de prière
120|build|Une œuvre
121|host|Toutes de bonnes choses
122|type|Mais la vraie question…
125|host|Est-ce ce que Dieu demande maintenant ?
126|work|Très occupé pour Dieu…
127|compass|…loin de sa direction ?
128|prayer|Une prière de maturité
129|host|« Tu connais mon appel »
131|power|Sans courir par impulsion
132|compass|Montre-moi où
133|calendar|Montre-moi quand
134|steps|Montre-moi comment
135|waiting|Et s’il faut attendre…
136|prayer|J’attendrai.
137|host|Mieux vaut attendre sa direction
138|blocked|Que courir dans la mauvaise
139|host|Et toi ?
140|compass|D’où vient ton prochain pas ?
141|church-copy|Direction… ou supposition ?
142|type|L’appel. La mission.
144|host|Et maintenant…
145|steps|Cherche sa direction.'''
chapters={0:'Appelé… mais à quoi ?',4:'Trois repères',10:'Les routes de Paul',29:'Le bon projet, la bonne direction',35:'Tes projets de ministère',51:'Appel · Mission · Direction',64:'La passion et le discernement',69:'Les portes fermées',79:'La Macédoine',85:'Le but et la forme',95:'Plusieurs formes de service',103:'Pas maintenant · Pas là · Pas comme ça',115:'Activité et obéissance',122:'La vraie question',128:'Une prière de maturité',139:'Ton prochain pas'}
rs=[(int(a),k,t) for a,k,t in (line.split('|') for line in rows.splitlines())];shots=[]
for j,(n,k,title) in enumerate(rs):
 endn=rs[j+1][0] if j+1<len(rs) else len(ps)
 a=0 if j==0 else ps[n]['start'];b=ps[endn]['start'] if endn<len(ps) else D
 shots.append(dict(start=a,end=b,kind=k,title=title,chapter=chapters[max(c for c in chapters if c<=n)],narration=' '.join(x['text'] for x in ps[n:endn]),intention='Illustrer l’idée prononcée, préserver la lisibilité et le rythme du récit.'))
(W/'storyboard-plan.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(W/'chapters.json').write_text(json.dumps([(0 if n==0 else ps[n]['start'],c) for n,c in chapters.items()],ensure_ascii=False))
print(len(ps),len(shots),max(s['end']-s['start'] for s in shots))
