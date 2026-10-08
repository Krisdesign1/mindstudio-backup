import { loadFootballFilm, saveFootballFilm, prepareFootballFilm } from '../lib/services/football-film';
async function main(){
 const film=await loadFootballFilm('moloto');
 const copy=[
 ['LA TRANSMISSION','Une voix touche. Une vision demeure.','Avant la reconnaissance, il y a ceux qui ouvrent le chemin.'],
 ['LE MENTOR','Alain Moloto.','Derrière les chants, une vision qui dépasse une carrière.'],
 ['LES ORIGINES','D’un lieu à une vocation.','Kisangani · Kinshasa · théâtre · composition'],
 ['LA CONVICTION','La musique au service de plus grand.','Le chant devient un moyen de transmettre.'],
 ['LA COMMUNAUTÉ','GAËL','Groupe Adorons l’Éternel'],
 ['LE SENS','Former. Transmettre. Restaurer.','Une culture d’adoration, au-delà des chansons.'],
 ['L’APPRENTISSAGE','Avant les grandes scènes.','Athom’s Mbuma apprend et progresse.'],
 ['L’ÉCOLE','Apprendre pour mieux former.','Ce que l’on reçoit prépare ce que l’on donnera.'],
 ['LES ANNÉES','Observer. Chanter. Servir.','La transmission se construit dans la durée.'],
 ['LE REGARD','On voit la scène.','On voit moins les années qui l’ont rendue possible.'],
 ['DANS L’OMBRE','Recevoir une vision.','Avant de pouvoir la porter soi-même.'],
 ['L’EXIGENCE','Le soin fait partie du service.','Les mots, la communication, la qualité du travail.'],
 ['LE DÉPART','2013','Une voix s’éteint. La question de la continuité demeure.'],
 ['LE TOURNANT','Que devient la vision ?','Le départ du fondateur ne doit pas devenir la fin de l’œuvre.'],
 ['LA RESPONSABILITÉ','Le flambeau change de mains.','Athom’s Mbuma prend la coordination de GAËL Ministries.'],
 ['LA FIDÉLITÉ','Protéger ce qui a été transmis.','Continuer la vision reçue.'],
 ['LA MISSION','Ne pas laisser mourir.','Parfois, continuer est déjà une mission immense.'],
 ['LA MÉTAPHORE','Ce qui porte la maison.','La fondation se voit moins. Elle soutient tout.'],
 ['L’INVISIBLE','Conseils. Corrections. Apprentissage.','Sous ce que l’on admire, il y a ce que quelqu’un a transmis.'],
 ['L’HÉRITAGE','Au-delà des albums.','Des personnes formées. Une vision qui continue.'],
 ['LE LEADERSHIP','Préparer ceux qui continueront.','La réussite se mesure aussi à ce qui existe après nous.'],
 ['LA QUESTION','Que continuerait-il grâce à toi ?','Une œuvre, une idée… ou une personne que tu as formée ?'],
 ['TRANSMETTRE','Permettre à un autre d’aller plus loin.','Déposer une vision, pas seulement un savoir.'],
 ['À TON TOUR','Qui continue à vivre dans ce que tu transmets ?','Raconte en commentaire la personne qui a marqué ta foi ou ta vie.']
 ];
 film.soundtrack={music:.22,effects:.18};
 film.scenes=film.scenes.map((s,i)=>({...s,kicker:copy[i][0],statement:copy[i][1],support:copy[i][2],transitionStyle:[2,4,9,14,17,20].includes(i)?'wipe':'fade',intent:copy[i][2]}));
 await saveFootballFilm(film,'moloto');const job=await prepareFootballFilm(film,'moloto');console.log(JSON.stringify(job));
}
void main();
