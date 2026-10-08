# Chatterbox local — état de l’intégration

La page `/voices` et l’API locale `/api/voice` préparent une narration française à partir d’un extrait vocal autorisé. Les fichiers sont conservés dans `.mindstudio/voice/<uuid>` ; la référence originale n’est pas modifiée. Le worker utilise le CPU, le checkpoint multilingue V3 et conserve le filigrane du modèle.

L’environnement isolé est `.mindstudio/chatterbox-venv`. Le code officiel récupéré correspond à `5de7a54aa4e5e2baadb0182dde554908b48b85c2`. La révision de poids prévue est `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`.

Adaptation Mac Intel validée le 29 septembre 2026 : PyTorch 2.2.2 et Transformers 4.46.3 (le projet officiel demande respectivement 2.6.0 et 5.2.0). Ce jeu de dépendances reste une adaptation locale, pas une configuration officiellement prise en charge. `setuptools==80.10.2` fournit la dépendance nécessaire au filigrane Perth, qui reste actif.

Validation réelle hors ligne : la phrase « Bonjour. Ceci est un essai de narration en français. » produit 2,88 secondes de WAV en 33,6 secondes de synthèse, hors chargement. Whisper local retrouve la phrase. L’import multipart, le conditionnement sur cet extrait synthétique, la génération via le worker et le téléchargement WAV ont aussi réussi : 2,8 secondes d’audio en environ 77 secondes, chargement compris. La reconnaissance du second essai présente une petite différence de mots : écouter les résultats avant utilisation reste nécessaire. La fidélité du clonage d’une voix personnelle n’a pas été évaluée avec ces essais synthétiques.

Le fichier `.mindstudio/chatterbox-ready.json` active maintenant l’interface. Les versions installées sont consignées dans `.mindstudio/chatterbox-installed.txt`. Sur ce Mac, commencer par une phrase courte ; les longs scripts seront sensiblement plus lents que leur durée audio.

Aucun service de voix distant n’est appelé. Les téléchargements d’installation nécessitent Internet ; le worker de génération est configuré hors ligne. Le lien « Créer une vidéo » ouvre actuellement l’import audio : le WAV doit y être déposé.

Utilisation : ouvrir `/voices`, choisir un extrait vocal clair, confirmer son autorisation, coller le script français, puis lancer « Générer ma narration ». La page affiche le passage en cours et retrouve le dernier résultat après actualisation. Le moteur traite une génération à la fois dans le processus serveur courant.

## Studio complet

L’interface reprend la présentation claire fournie par l’utilisateur : deux onglets, import par glisser-déposer ou microphone (`MediaRecorder`, autorisation demandée par le navigateur), écoute de l’original, préparation de l’extrait, paramètres, essai court et lecteur du résultat. Le script et les réglages sont conservés dans le stockage local du navigateur ; l’extrait doit être resélectionné après rechargement.

- Nettoyage local : filtre spectral FFmpeg `afftdn`, intensité 0–0,85. Ce filtre n’est pas le moteur de nettoyage du notebook Colab ; il n’ajoute aucune dépendance payante. Les fichiers originaux sont conservés. Limite : 10 minutes / 100 Mo.
- Narration : quatre préréglages d’expressivité, CFG et température ; ces trois paramètres et la graine restent accessibles dans les réglages avancés. La génération réapplique au même original les réglages de préparation sélectionnés.
- Essai court : première phrase, bornée à 180 caractères. Le résultat est identifié comme un essai.
- Pauses : découpage aux phrases, ajout du silence choisi ; majoration aux paragraphes et à la ponctuation expressive quand les pauses naturelles sont activées.
- Volume équilibré : normalisation FFmpeg `loudnorm` à −18 LUFS, crête cible −1,5 dBTP.

Vérification de cette extension : nettoyage réel du WAV synthétique (2,88 s), synthèse avec préréglage posé et normalisation (1,6 s), paramètres transmis et texte court vérifiés. L’enregistrement microphone est implémenté mais n’a pas été essayé avec le microphone personnel de l’utilisateur.

Le lecteur du studio utilise désormais une forme d’onde calculée sur le fichier réel, une navigation accessible au clavier, la vitesse et le volume de lecture. L’API WAV sert les plages d’octets (HTTP 206) pour permettre la navigation audio. Le chargement affiche les étapes du worker, le temps écoulé depuis la requête, les passages achevés et une estimation du temps restant après le premier passage (pondérée par la longueur des textes). Le temps total reste dans le résultat. Vérification réelle : deux phrases, 4,3 secondes d’audio produites en 58 secondes ; lecture, durée et navigation clavier contrôlées dans Chrome.

## Bibliothèque vocale et historique

Dans `/voices`, les onglets **Mes voix** et **Historique des narrations** conservent les données sur le Mac.

Pour enregistrer une voix : importer l’extrait, confirmer son autorisation, cliquer sur **Préparer et écouter ma voix**, saisir un nom, puis **Enregistrer dans Mes voix**. Les extraits préparés sont copiés dans `.mindstudio/saved-voices/<id>/` indépendamment de la prise initiale. Ils peuvent être écoutés, renommés et chargés dans le formulaire sans réimportation. Le nettoyage est désactivé lors de cette réutilisation pour éviter de traiter deux fois le même extrait.

L’historique relit les prises existantes dans `.mindstudio/voice/`, avec recherche par titre ou script, écoute, téléchargement WAV et reprise du formulaire. Les titres renommés sont pris en compte. Les anciennes prises sans réglages conservés sont signalées ; leur reprise utilise les valeurs par défaut. Les réglages de synthèse disponibles sont restaurés, tandis que le nettoyage reste désactivé lorsque l’extrait préparé est réutilisé.
