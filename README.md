# MindStudio Video

Studio vidéo local — interface Phase 1 et intégration HeyGen API v3. Next.js App Router, React, TypeScript strict, Lucide et validation Zod. Interface française sombre, responsive, avec styles CSS partagés.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://127.0.0.1:3000. Aucun compte ni clé API requis. Node.js 22 minimum pour le moteur HyperFrames.

## Sauvegarde privée GitHub

Le code est conservé dans le [dépôt privé de sauvegarde](https://github.com/Krisdesign1/mindstudio-backup). Les projets, audios, vidéos et autres fichiers locaux sont conservés séparément dans les archives complètes des releases : un simple clone ne les restaure pas. Voir les [instructions de téléchargement, vérification et restauration](docs/sauvegarde-github.md). Les secrets restent exclus ; cette sauvegarde est un instantané, pas une synchronisation automatique.

## Vérifier

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Fonctionnalités

- Dashboard et quatre projets de démonstration avec photographies locales.
- Création en mode automatique (script d’exemple) ou manuel, quatre formats et quatre templates.
- Éditeur avec compteur de mots, estimation de narration et suggestions locales modifiables.
- Sauvegarde automatique des projets dans localStorage, validation à la lecture, duplication et suppression confirmée.
- Scènes modifiables : texte, prompt, durée, transition, visuel, duplication, suppression et réorganisation par glisser-déposer ou boutons accessibles.
- Sélection de voix et vitesse ; écoute via la synthèse vocale du navigateur si disponible.
- Storyboard animé avec lecture/pause, scrubbing, plein écran, formats et styles de sous-titres.
- Timeline à quatre pistes, zoom, sélection de scène et activation visuelle des pistes prévues.
- Progression de rendu simulée, annulation et compteur de simulations par projet.
- Pages scripts, voix, médias, templates, historique et paramètres.
- Raccourcis : Espace (lecture), Cmd/Ctrl+S (sauvegarde), Cmd/Ctrl+Z (annuler les modifications hors champs texte).

## Connecter HeyGen

1. Obtenir une clé API dans le [dashboard HeyGen](https://app.heygen.com/developers).
2. Remplir `HEYGEN_API_KEY=` dans `.env.local` (fichier privé, ignoré par Git). Ne pas utiliser de variable `NEXT_PUBLIC_` pour cette clé.
3. Redémarrer `npm run dev`, puis ouvrir **Paramètres → Connexion HeyGen → Tester la connexion**.
4. Dans un projet, ouvrir **Voix** pour sélectionner une voix publique française ou privée compatible Starfish et générer un audio (5 000 caractères maximum).
5. Cliquer **Générer la vidéo**, choisir la narration du script ou celle des scènes, puis **Lancer la génération réelle**. Les formats pris en charge sont 16:9 et 9:16. Le mode simulation reste disponible séparément.

La clé et tous les appels authentifiés restent côté serveur. Le suivi reprend à l’ouverture du projet, toutes les 15 secondes, avec lecture et lien de téléchargement du résultat. Actualiser le résultat renouvelle les liens signés expirés. Les générations consomment les crédits du compte HeyGen.

## Limites actuelles

HeyGen Video Agent crée son propre montage à partir du texte et des indications visuelles. Les photos locales ne sont pas transférées ; les réglages de rythme, transitions et sous-titres servent de directions créatives et ne garantissent pas une reproduction exacte du storyboard. La voix off indépendante utilise le script et n’est pas injectée comme fichier dans Video Agent ; celui-ci reçoit l’identifiant de voix. Les clones professionnels utilisant l’API HeyGen Voice dédiée ne sont pas inclus ; les clones instantanés compatibles Starfish peuvent apparaître dans les voix privées.

Le script IA, l’aperçu storyboard et les pistes audio de la timeline restent des démonstrations. Pas encore de Supabase Auth, de base distante ou d’import de médias. Les projets restent dans le navigateur et l’origine utilisés.

Les routes HeyGen refusent les hôtes publics et les requêtes web provenant d’une autre origine. Cette version est mono-utilisateur sur la machine locale ; ne pas l’exposer via un proxy public. Il faudra intégrer une authentification et vérifier la propriété des projets avant un déploiement multi-utilisateur.

Les demandes vidéo utilisent un identifiant unique et un journal local `.mindstudio/requests` pour éviter la répétition d’une même soumission. Après une coupure réseau ou un timeout, vérifier le compte HeyGen avant toute nouvelle demande : une génération peut déjà être en cours. Ne pas effacer ce journal pendant une génération. Ce mécanisme ne déduplique pas deux demandes distinctes créées volontairement, ni les générations audio. Une interruption avant réception de l’identifiant de session nécessite de consulter HeyGen.

## Architecture

- `app/[[...slug]]/page.tsx` : point d’entrée des routes de la Phase 1.
- `components/studio.tsx` : navigation, dashboard, listes et création de projets.
- `components/editor.tsx` : éditeur, scènes, voix, aperçu et timeline.
- `components/ui.tsx` : dialogue accessible, statut et chargement.
- `app/globals.css` : design system et responsive.
- `lib/schemas/project.ts` : contrat Zod partagé et types inférés.
- `lib/services/mock.ts` : service local remplaçable par les futurs adapters.
- `lib/mock.test.ts` : invariants de persistance et découpage.

HeyGen est intégré dans `lib/services/heygen.ts`, `app/api/heygen/` et `components/heygen.tsx`. Les autres services restent à intégrer. Les variables attendues sont documentées dans `.env.example` ; `.env.local` est ignoré. Ne jamais mettre de clés dans du code client.

## Visuels

Photographies de démonstration téléchargées depuis Unsplash, stockées dans `public/images` : montagnes (`photo-1464822759023-fed622ff2c3b`), forêt (`photo-1441974231531-c6227db76b6e`), dunes (`photo-1509316785289-025f5b846b35`) et océan (`photo-1475924156734-496f6cac6ec1`). Police Inter via Google Fonts avec repli sur les polices système si hors ligne.

## Validation réalisée

- Lint ESLint, TypeScript strict, build de production et sept tests de logique et intégration avec réponses HeyGen simulées.
- Parcours Chrome : création automatique en 9:16, remplacement du script, découpage en trois scènes, modification de durée et de visuel, réorganisation et rechargement avec persistance vérifiée.
- Lecture du storyboard, simulation du rendu jusqu’à 100 %, annulation d’une modification, changement de format et de style de sous-titres.
- Inspection visuelle du dashboard et de l’éditeur sur desktop, et du dashboard à 390 px de largeur.
- Aucune erreur console observée pendant le parcours vérifié.

### Validation HeyGen

Contrats API v3, sélection de voix privées, génération audio, soumission vidéo, résultat final, erreurs 401/402/429, validation des formats, contrôle d’origine et déduplication des demandes testés sans appels payants. Les essais avec un vrai compte restent à effectuer après ajout de la clé.

Références officielles : [Video Agent](https://developers.heygen.com/docs/video-agent), [voix](https://developers.heygen.com/docs/voices/search-voices), [synthèse vocale](https://developers.heygen.com/docs/voices/speech).


## HyperFrames : habillage modifiable de vidéos existantes

Ouvrir **Motion design**, choisir une animation et importer sa vidéo. HyperFrames superpose des éléments graphiques au montage existant. Il ne génère ni voix, ni script, ni nouvelle séquence d’introduction. La vidéo source reste intacte, sa durée et son format sont conservés. Son audio est repris par défaut, avec réencodage lors de l’export.

Les 12 animations MindStudio peuvent être combinées sur des pistes séparées : texte cinétique, machine à écrire, masque, rebond, contour, logos typographiques, néon, bandeau et appel à l’action. Chaque élément permet de modifier texte, animation, début, durée, position X/Y, taille, couleur, opacité et visibilité. Les pistes peuvent être dupliquées, supprimées ou réordonnées. Les logos utilisent du texte ; l’import d’une image de logo n’est pas encore proposé.

L’aperçu est actualisé à chaque modification. Les réglages sont sauvegardés automatiquement dans le projet local et restent éditables après export. Annuler/rétablir conserve les 40 dernières modifications de la session. **Sauvegarder les réglages** télécharge un JSON ; **Reprendre des réglages sauvegardés** le recharge. Ce JSON référence la source conservée dans `.mindstudio/media` et n’inclut pas la vidéo. Pour déplacer le projet sur un autre ordinateur, réimporter également la source. Le MP4 exporté est aplati ; les modifications suivantes se font dans le projet, puis par un nouvel export.

L’export prend un instantané des réglages au lancement. Les modifications pendant un rendu restent sauvegardées mais concernent l’export suivant. Les anciennes compositions et leurs fichiers restent conservés dans `.mindstudio/hyperframes`.

Prérequis : Node.js 22+, FFmpeg/FFprobe et navigateur Chrome de rendu HyperFrames. Aucun compte ou clé HeyGen nécessaire pour l’habillage. Import MP4, MOV, M4V, WebM, MKV, AVI, MPG/MPEG et WMV : 500 Mo, dix minutes et 4096 pixels maximum par dimension, une piste vidéo et au plus une piste audio. Chaque original est conservé dans `.mindstudio/media/<id>/original.<extension>`. Les codecs incompatibles sont convertis localement par FFmpeg en H.264/AAC, avec normalisation de la rotation et des pixels. La préparation peut prendre plusieurs minutes (limite de 30 minutes). L’extension doit correspondre au conteneur réel. Jusqu’à 30 éléments. Export H.264/AAC à 24 images/s, 720p ou 1080p sans agrandir la source. Le moteur local nécessite un serveur Node persistant.

- `lib/schemas/motion-edit.ts` : source, pistes et validation des réglages.
- `components/hyperframes.tsx` : import, aperçu, timeline, édition et export.
- `lib/hyperframes/overlay-composition.ts` : composition GSAP sur vidéo source.
- `lib/services/motion-media.ts` : import local limité et validation FFprobe.
- `lib/services/motion-overlay.ts` : instantané de composition et recette éditable.
- `scripts/motion-overlay-smoke.ts` : contrôle d’export sur une vidéo de test.

Validation : 16 tests passent, lint, TypeScript et build vérifiés. Export réel de six secondes avec deux éléments superposés, H.264 et AAC ; durée conservée, copie source identique et audio comparé à l’original (corrélation 0,99989). Import HTTP local vérifié. Import multi-format vérifié sur huit fichiers réels : MOV, WebM, MKV, AVI, MPG, WMV, MP4 et M4V ; originaux identiques, sortie H.264/AAC et piste audio présentes (`scripts/video-import-smoke.ts`). L’import automatisé dans Chrome est bloqué par l’autorisation de fichiers de l’extension ; ce parcours navigateur reste à revérifier une fois cette autorisation activée.

Parcours Chrome vérifié : texte et minutage modifiés, valeurs conservées après rechargement, annulation avec restauration du texte précédent.

## Motion Studio : voix existante et scènes modifiables

Le studio propose trois zones : scènes à gauche, aperçu et séquence au centre, réglages **Contenu / Style / Timing** à droite. Les scènes disposent de 12 univers vectoriels, de trois compositions et de palettes modifiables. Texte, illustration, animation, couleur, position et horaires restent éditables, avec annuler/rétablir et sauvegarde locale.

L’import d’une vidéo avec audio lance automatiquement la reconnaissance vocale locale. Une fois les paroles reconnues, **Créer la vidéo** prépare des scènes couvrant toute la durée, calées sur les segments de voix. La source et son audio restent conservés. Le texte manuel est disponible dans **Corriger le texte ou utiliser un script**, comme solution de correction ou de remplacement ; cette option estime les durées selon le texte.

La reconnaissance utilise `faster-whisper`, sur CPU en int8, et un modèle déjà présent dans le cache local. Elle ne transmet pas la vidéo à HeyGen ni à un service externe et ne génère pas de voix. Configuration facultative : `MOTION_PYTHON` (défaut `python3`) et `MOTION_WHISPER_MODEL` (défaut `small`, nom mis en cache ou chemin local). Si le moteur ou ses poids sont absents, le studio affiche une erreur et conserve le script manuel. Aucun téléchargement automatique de poids n’est effectué. Le traitement est limité à 30 minutes.

Les illustrations sont des suggestions issues de mots clés dans les paroles reconnues ; ce n’est pas une compréhension sémantique complète ni une analyse des images. Les thèmes inconnus utilisent une composition abstraite. Vérifier les paroles et ajuster les visuels reste nécessaire. La découpe initiale couvre la source sans trous, avec 30 scènes maximum ; les modifications manuelles peuvent changer cette couverture.

Validation : 22 tests, dont couverture temporelle, conservation de la narration et refus d’une piste sans paroles reconnues. Test réel sur une vidéo française : reconnaissance des trois phrases avec leurs horaires, puis export réel de trois scènes animées en H.264/AAC. Durée conservée (9,791667 s), corrélation audio source/export de 0,99923. Changement de palette et annulation vérifiés dans Chrome. Script de reproduction : `node --conditions=react-server --import tsx scripts/speech-smoke.ts` (nécessite la fixture locale de test).

## Parcours audio-first

**Nouveau projet** commence maintenant par **Déposer le son → Analyser → Créer la vidéo**. Formats audio : MP3, WAV, M4A, AAC, FLAC, OGG, Opus, AIFF. Le bouton « Mon son est dans une vidéo » conserve l’import vidéo multiformat. Un fichier vidéo sans audio peut servir de clip dans une scène ; il ne suffit pas à démarrer ce parcours.

Le fichier original est conservé. L’audio seul est décodé localement en WAV PCM 48 kHz ; sa durée mesurée devient la timeline de la composition, sans vidéo intermédiaire et sans voix générée. Le format de sortie peut être horizontal, vertical ou carré. À 24 images/s, la durée du conteneur MP4 peut être arrondie de moins d’une image au-delà du son.

Whisper fournit désormais les horaires des mots. Les sous-titres sont groupés pour la lisibilité, respectent les pauses et surlignent le mot en cours. **Sous-titres** permet de modifier les mots et leurs débuts/fins pour la scène sélectionnée, ou de les masquer. Ces corrections ne modifient pas l’audio. Les horaires automatiques restent à vérifier.

Les scènes suivent la ponctuation reconnue, les pauses et les changements de thème détectés par mots clés ; elles ne sont plus découpées à intervalle fixe. Il s’agit d’heuristiques explicites, pas d’une compréhension complète des émotions ou des beats. Chaque scène conserve sa narration et une note d’intention visuelle modifiable. Limite : 30 scènes.

Dans **Contenu → Votre image, clip ou logo**, ajouter une image PNG/JPEG/WebP (25 Mo maximum, 4096 pixels par dimension) ou une vidéo compatible. Les clips sont muets et répétés sur la durée de leur scène ; le son maître reste inchangé. Le cadrage peut afficher le média entier ou remplir le cadre. Revenir à l’illustration restaure l’univers graphique du template. Les médias sont copiés dans chaque instantané d’export pour permettre des exports indépendants.

Validation audio-first : export réel de 9,633063 s de narration, 3 scènes, 22 mots horodatés, image et clip importés. Le MP4 final fait 9,666667 s (arrondi à 24 images/s) ; corrélation de l’audio avec la source : 0,99915. Images du rendu contrôlées, dont une scène avec clip en boucle. La nouvelle page de départ a été inspectée dans Chrome. L’automatisation de l’upload navigateur reste limitée par les permissions de fichiers de l’extension ; les imports, la transcription et le rendu ont été testés directement côté serveur.

Tests finaux : 26 tests automatisés, lint et build réussis. Huit formats audio réellement importés (MP3, WAV, M4A, AAC, FLAC, OGG, Opus, AIFF) via `scripts/audio-import-smoke.ts` ; import WAV également vérifié par HTTP local.

### Édition plein écran et textes libres

Le Motion Studio occupe toute la zone de la fenêtre du navigateur. **Modifier la transcription**, dans la barre supérieure, ouvre les passages de toutes les scènes et applique les corrections à la narration et aux sous-titres. Un remplacement conservant le nombre de mots garde les horaires ; ajouter ou retirer des mots répartit les horaires sur le passage existant et nécessite une vérification à l’écoute. Le titre à l’écran reste indépendant.

Dans **Contenu → Textes décoratifs et numérotation**, signature, chapitre, compteur, titre de carte, cartouche et symbole sont libres. Un champ vide masque le texte. Aucune signature « MOTION / STORY », aucun chapitre ou compteur n’est imposé dans les nouveaux aperçus/exports. Les anciens MP4 sont des instantanés : les réexporter pour appliquer ces changements.

**Style** propose cinq compositions (duo, affiche, éditorial, typographie, cinéma), trois univers graphiques et cinq mouvements du visuel. Le découpage automatique alterne les compositions et mouvements ; les projets existants restent modifiables sans recréer les scènes. 28 tests passent, dont correction de transcription et échappement des textes décoratifs.

### Six directions artistiques et comparaison

Dans **Style → Direction artistique**, choisir Typographie manifeste, Collage éditorial, Cinéma immersif, Schéma technique, Affiche graphique ou Citation minimaliste. Les familles changent la composition, les couleurs, la typographie et les mouvements. **Proposer trois variantes** affiche trois aperçus muets de la scène actuelle, puis trois autres propositions. Une source est nécessaire pour lire ces aperçus. Choisir une variante conserve narration, sous-titres, textes personnalisés, média et horaires ; annuler restaure les réglages précédents. Une composition typographique peut masquer un média sans le supprimer. Les styles restent des compositions déterministes personnalisables, pas une génération de médias. Validation : 30 tests et build réussis.

### Identité, storyboard et édition des titres

La barre supérieure du montage propose **Identité visuelle** (palette accent/fond/texte, police locale sans sérif/sérif/monospace, signature et trois styles de sous-titres). L’activation applique ces choix à toutes les scènes et aux variantes ; la désactivation retrouve les styles de scène sauvegardés. Aucun téléchargement de police n’est requis.

**Storyboard** rassemble narration, titre, intention visuelle, média et famille de chaque scène. Modifier le titre ou l’intention ne redécoupe pas la narration. Les commandes ouvrent le montage détaillé ou les trois variantes de la scène sélectionnée.

Dans l’aperçu principal, un double-clic sur un titre permet de le modifier. Entrée ou une perte de focus sauvegarde le texte dans le projet, avec annuler/rétablir. Les messages d’édition sont acceptés uniquement depuis l’iframe de prévisualisation du même site. Le rendu exporté ne contient pas ces commandes. Cette première édition directe concerne les titres ; le déplacement et le redimensionnement restent dans les réglages. Validation : 32 tests, dont application/désactivation de l’identité et compilation du script d’édition.

### Timeline audio et limites de scènes

Sous l’aperçu, la timeline affiche l’onde réelle calculée localement par FFmpeg (crêtes PCM, jusqu’à 6 000 points). Zoom de 1× à 12× avec défilement horizontal ; cliquer sur l’onde ou la règle déplace la lecture. Définir un début et une fin pour écouter en boucle, ou utiliser **Boucler la scène**. La boucle concerne uniquement l’aperçu et ne tronque pas l’export. Elle reste active lorsqu’une modification recharge l’aperçu pendant la session.

Les poignées entre scènes contiguës déplacent leur frontière commune : glisser ou utiliser les flèches gauche/droite par pas de 0,05 seconde. La durée totale et les horaires du son/sous-titres restent inchangés. Les scènes gardent au moins 0,2 seconde. Les éléments superposés ou séparés par un vide restent réglables dans **Timing**. Annuler restaure les limites précédentes.

**Timing → Transition visuelle** propose une coupe franche ou un fondu au fond, dont la durée est réglable (jusqu’à 2 secondes, limitée à la moitié de la scène). Ce fondu d’entrée/sortie est visuel : ce n’est pas un fondu audio ni un fondu croisé entre deux scènes. La piste source reste verrouillée.

### Sous-titres et export SRT

Dans **Sous-titres**, régler 20 à 48 caractères par ligne, une ou deux lignes et 3 à 12 mots par passage. Le découpage respecte les pauses et la ponctuation existante, équilibre les deux lignes et limite les passages à cinq secondes lorsque les horaires le permettent. Un mot isolé trop long reste entier dans le SRT ; l’aperçu peut le replier pour éviter un débordement. La ponctuation reconnue reste corrigeable dans les mots ou la transcription : le nettoyage des espaces n’invente pas de ponctuation.

Quatre styles sont disponibles : encadré, contour, éditorial et capsule. Un style explicitement choisi prend priorité sur le style de l’identité visuelle. La surbrillance du mot prononcé est facultative ; les mots importants saisis sont soulignés et renforcés en gras. Les corrections de transcription conservent ces réglages.

**Télécharger le SRT** exporte les corrections et le même découpage temporel, même si les sous-titres sont masqués dans le MP4. Le SRT conserve textes, lignes et horaires, sans les couleurs ni les animations. L’aperçu des passages dans ce panneau permet de vérifier les retours à la ligne. Validation : 37 tests, compilation et contrôle TypeScript.

### Film Mbappé créé depuis la transcription

Le menu **Film Mbappé** ouvre `/projects/mbappe-age-niveau`. Ce projet possède quinze scènes SVG originales conçues pour ce récit (terrain, joueur, protection, tactique, Monaco, pression, horloge et débat), animées par GSAP et exportées par HyperFrames. Le texte intégral fourni est conservé ; la version initiale dure 180,7 secondes, en 1280 × 720, 24 images/s, sans audio, conformément à la demande de travailler uniquement depuis la transcription.

L’éditeur permet de lire et parcourir le film, corriger les titres, les paragraphes et les légendes des dessins, ajuster les durées et l’accent, masquer les sous-titres, annuler et enregistrer. **Enregistrer** persiste dans `.mindstudio/films/mbappe.json`. L’export conserve un instantané `edit.json` et propose le MP4 après rendu ; le dernier rendu correspondant au projet sauvegardé est retrouvé après rechargement. Le SRT porte des horaires indicatifs répartis selon la longueur du texte. Il ne prétend pas être aligné sur une narration audio.

Cette réalisation est une composition dédiée à ce texte, pas encore un moteur automatique capable de concevoir n’importe quel récit. La géométrie des illustrations et leur chorégraphie restent éditables dans le code ; l’interface expose les textes, les durées et la couleur. Les propos du script n’ont pas été vérifiés indépendamment. Aucune archive réelle ni voix n’a été générée.

### Film Mourinho avec narration fournie

**Film Mourinho** ouvre `/projects/mourinho-arbitrage`, projet distinct de Mbappé. Douze scènes dédiées mettent en scène conférence, feuilles imprimées, carton rouge, comparaison des sanctions et débat. Les dessins de fautes sont explicitement des schémas, pas des captures du match. Le fichier `ma_narration_2cb7b94cc7.wav` est importé sans génération de voix ; ses 86,674583 secondes pilotent le montage et l’aperçu.

La reconnaissance locale fournit les horaires. Un alignement séquentiel réapplique l’orthographe du texte fourni ; les mots non reconnus sont interpolés entre les repères voisins. Le SRT conserve ces horaires et les pauses. La durée des scènes de ce projet est verrouillée dans l’interface pour préserver le son ; titres, transcription, légendes, accent et visibilité des sous-titres restent modifiables. Une correction conservant le nombre de mots conserve les horaires, sinon ils sont répartis dans le passage et doivent être revérifiés à l’écoute.

Sauvegarde dans `.mindstudio/films/mourinho.json`, source originale dans `.mindstudio/media/`, instantané et MP4 dans le dossier de rendu HyperFrames. Le lecteur d’aperçu utilise `audio.currentTime` comme horloge. Cette composition dédiée ne transforme pas encore automatiquement une transcription arbitraire en scènes.

### Reviens — narration spirituelle

Le projet **Reviens au Père**, `/projects/reviens-au-pere`, conserve la narration `ma_narration_d4bd4954ce.wav` (100,207875 secondes). Quatorze compositions illustrent la honte, la prière, les rechutes, le départ du fils prodigue, les pertes, la permanence du père et le retour. Maison éclairée, personnage, vase et chemin assurent la continuité, avec une palette terre et lumière et des mouvements plus lents. Les personnages représentent la parabole, sans images d’archive.

Les horaires proviennent de la reconnaissance locale, rapprochée du texte fourni. Les mots absents ou mal reconnus sont interpolés/corrigés ; la ponctuation française isolée est rattachée aux mots au lieu d’être supprimée. La voix originale reste intacte ; MP4 avec audio, SRT et projet éditable sont conservés dans leurs dossiers locaux. Textes, légendes et sous-titres sont modifiables depuis le projet. Validation : 43 tests, dont conservation de la ponctuation et compilation des quatorze scènes, contrôle TypeScript et lint.

### Studio HyperFrames complet

Dans un film éditorial, **Studio complet** ouvre `/studio/<film>` dans MindStudio.
La première ouverture crée un projet source persistant dans `.mindstudio/studio/<film>`
avec ses médias locaux. Les ouvertures suivantes réutilisent ces fichiers et le serveur
HyperFrames, sans régénérer le HTML ni écraser les modifications du Studio.

Le Studio officiel installé fournit ses panneaux Compositions, Assets, Code, Catalog,
Design, Layers, Variables, Timeline et Renders. Son bouton **Export** rend cette version
éditée ; l’export du montage guidé reste une version distincte. Les changements des deux
éditeurs ne sont pas synchronisés. Les limites natives de la version HyperFrames installée
restent applicables, notamment aux animations générées et aux corrections de captions.

Les processus Studio écoutent sur `127.0.0.1`, à partir du port 3102. Leur état et leurs
journaux restent dans `.mindstudio/runtime/hyperframes/previews`. Node 22+ est requis.
Pour arrêter un Studio depuis le dossier de l’application :

```sh
XDG_STATE_HOME="$PWD/.mindstudio/runtime" node node_modules/hyperframes/bin/hyperframes.mjs preview .mindstudio/studio/moloto --stop --json
```

L’entrée **Studio HyperFrames** dans la navigation ouvre `/studio`. Elle permet
également de créer des projets libres sans audio ni vidéo, de les nommer et de les
retrouver dans la bibliothèque. Chaque projet démarre sur une toile vide 1920×1080
avec une durée initiale de 10 secondes et conserve ses propres médias et sources.

Si un rendu final `delivery.mp4` est présent dans le dossier d’un projet libre,
le bouton **Télécharger le MP4 livré** apparaît dans la barre MindStudio.
Ce fichier correspond à la version livrée : après des modifications, utiliser
**Export** dans HyperFrames pour rendre la nouvelle version.
