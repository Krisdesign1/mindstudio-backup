import json,re
from pathlib import Path
W=Path('.mindstudio/priere-work');ps=json.loads((W/'paragraphs.json').read_text());D=531.537042
shots=[];chapters=[]
def choose(t,i):
 s=t.lower()
 if 'carmel' in s or 'baal' in s or 'élie' in s:return 'carmel'
 if any(x in s for x in ['hébreux','corinthiens','bible','paul','enseignement']):return 'bible'
 if any(x in s for x in ['cœur','sincér','profondeur']):return 'heart' if i%3==0 else 'quiet'
 if any(x in s for x in ['volume','décibel','sonomètre','sourd','bruit']):return 'volume' if i%3==0 else 'assembly'
 if any(x in s for x in ['silenc','secret','intimité','isolés','sans foule','sans micro']):return 'secret' if i%3==0 else 'quiet'
 if any(x in s for x in ['larme','douleur','pleur','aide-moi']):return 'tears' if i%2 else 'pray'
 if any(x in s for x in ['cri','force','ferveur','expressive','émotion','chante']):return 'raised' if i%2 else 'pray'
 if any(x in s for x in ['ensemble','assemblée','communauté','église','ordre','croyants','célébration']):return 'order' if i%2 else 'assembly'
 if '?' in s:return 'host'
 return ['listen','quiet','host','pray'][i%4]
for i,p in enumerate(ps):
 a=0 if i==0 else p['start'];b=ps[i+1]['start'] if i+1<len(ps) else D
 k=choose(p['text'],i)
 title=''
 for phrase,label in [('Dieu est-il sourd','Dieu entend aussi le silence'),('L’ordre.','L’ordre'),('C’est Dieu.','C’est Dieu'),('Il regarde ton cœur','Il regarde ton cœur'),('Cherche Dieu','Cherche Dieu'),('plus de maturité','Plus de maturité'),('deux choses','Édification et ordre'),('Pas simplement moins de bruit','Davantage de profondeur')]:
  if phrase.lower() in p['text'].lower():title=label
 if i==0:k='host';title='Dieu t’écoute mieux\nquand tu cries ?'
 if i==len(ps)-1:k='host';title='Davantage de profondeur'
 if k=='host' and not title:title=''
 if 240<a<264:k='carmel'
 if i>=len(ps)-2:k='host';title='Davantage de profondeur'
 count=max(1,int((b-a)/6)+1)
 for part in range(count):
  st=a+(b-a)*part/count;en=a+(b-a)*(part+1)/count
  kk=k if part==0 else ('listen' if k=='host' else 'quiet' if k in ('assembly','order') else k)
  shots.append(dict(start=st,end=en,kind=kk,title=title if part==0 else '',showTitle=bool(title) and part==0,hostLayout=['right','left','close'][i%3],pose='open' if i%3 else 'rest',emotion='sad' if kk in ('tears','pray') else 'calm',historical=kk=='carmel',chapter='Prière et sincérité',intention=p['text'],paragraph=i))
for phrase,label in [('Est-ce que Dieu','Ouverture'),('La Bible ne présente','Des expressions diverses'),('Mais voici l’autre','Volume et sincérité'),('Dans 1 Corinthiens','Édification et ordre'),('mont Carmel','Le mont Carmel'),('Et peut-être que le débat','Examiner son cœur'),('Alors revenons','Réponse et application'),('Alors j’aimerais terminer','Question au public')]:
 p=next((p for p in ps if phrase.lower() in p['text'].lower()),None)
 if p:chapters.append([p['start'],label])
(W/'storyboard-plan.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));(W/'chapters.json').write_text(json.dumps(chapters,ensure_ascii=False));print(len(shots),'plans')
