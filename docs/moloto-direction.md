# Alain Moloto — version éditoriale enrichie

Projet : `/projects/alain-moloto-heritage`.

La narration originale de 359,78 secondes reste la timeline maître. Les 24 passages et les sous-titres conservent l’alignement existant. Aucun portrait ni image générée n’a été intégré.

## Direction

Ouverture typographique, alternance entre compositions éditoriales et grandes idées, repères du récit, entrées décalées, mouvements lents et balayages aux changements de partie. Le passage de 2013 est volontairement retenu. Le flambeau se déplace entre les personnages ; la maison s’efface pour révéler les fondations.

Les textes principaux, compléments, repères, transitions et volumes sont modifiables dans « Direction et rythme ». La narration est inchangée. Le volume zéro désactive une piste.

## Son

Deux pistes originales produites localement par `scripts/moloto-soundtrack.py` : une nappe harmonique discrète et quelques accents de transition. La nappe est réduite sous la parole avec un compresseur sidechain FFmpeg. Ce n’est pas le module spectral Voiceover Carve du nouveau Studio HyperFrames. L’export utilise trois pistes audio HyperFrames séparées ; l’aperçu synchronise ces pistes à la narration.

Les pistes sont conformées à l’audio actuel. En cas de remplacement de la narration ou de changement des repères de scène, reconstruire les pistes sonores.

## Références consultées

- https://hyperframes.heygen.com/prompting/motion
- https://hyperframes.heygen.com/studio/voiceover-carve
- Catalogue officiel : composant `kinetic-center-build`, installé et consulté dans `.mindstudio/moloto-reference`. Les animations du film sont une réalisation propre, pas une copie du composant.

Version locale HyperFrames : 0.8.81. La version précédente du projet et sa référence d’export sont conservées dans `.mindstudio/films/versions/`.

## Refonte illustrée — 30 septembre 2026

La version 4 remplace les illustrations et la direction précédentes par des personnages SVG originaux : Alain (barbe pleine, coiffure haute, tunique ivoire brodée) et Athom’s (cheveux courts, barbe courte, tunique bleue à motifs). Les scènes de formation sont des évocations éditoriales, pas des reconstitutions documentaires. Les références sont consultées pour le dessin ; aucune photographie n’est embarquée.

Références visuelles :
- https://actualite.cd/2021/08/02/rdc-8-ans-depuis-la-disparition-dalain-moloto
- https://emcitv.com/athoms-mbuma/

Décors : scène musicale, itinéraire schématique Kisangani–Kinshasa, répétition collective, table de travail, portrait commémoratif, maison en coupe, passage vers la relève. Les compositions 8, 12, 19 et 23 inversent le cadrage. La parole d’origine, les timecodes, les sous-titres et les textes éditables sont conservés. Les mouvements restent déterministes dans GSAP pour la lecture et le rendu HyperFrames.

Sauvegarde de la version précédente : `.mindstudio/films/versions/moloto-before-redesign/`. Les anciens exports sont conservés et ne sont plus présentés comme le rendu à jour.
