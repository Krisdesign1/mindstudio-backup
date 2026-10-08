# Assistant Codex dans MindStudio

Ouvrir `/assistant`, également disponible dans le menu « Assistant Codex ».

Le serveur utilise la copie officielle de Codex installée dans `.mindstudio/codex-runtime` et son protocole App Server sur l’entrée/sortie standard. Il utilise la connexion ChatGPT existante. Si elle est absente, le bouton de connexion ouvre le parcours officiel. Il n’utilise pas de clé API en remplacement : les limites de l’accès Codex s’appliquent.

## Utilisation

- Choisir un projet du navigateur ou rester en conversation libre et coller une transcription.
- Envoyer une demande. La réponse apparaît progressivement, avec le temps écoulé et un bouton d’arrêt.
- Lire les propositions avant/après. « Appliquer au projet » enregistre uniquement les champs éditoriaux autorisés. « Annuler » restaure la version précédente tant qu’elle n’a pas été modifiée depuis.
- Les conversations sont enregistrées dans `.mindstudio/codex/conversations`. Le navigateur retrouve sa dernière conversation après rechargement.

Le contexte et le texte envoyé sont traités par OpenAI. Les fichiers audio et vidéo ne sont pas joints. La génération d’images, les rendus vidéo et le pilotage de Chatterbox ne sont pas encore des outils de cet assistant. Les trois films spéciaux sur disque (Mbappé, Mourinho, Reviens) ne sont pas dans le sélecteur des projets du navigateur ; leur texte peut être collé en conversation libre.

## Protection des projets

Champs modifiables : titre, idée, script, signature, couleur, logo court et textes/intention visuelle des scènes. Les sources, durées, identifiants, chemins de fichiers et réglages audio restent inchangés. La structure proposée puis le projet résultant sont validés. Un conflit avec une modification plus récente bloque l’application et l’annulation. Aucun changement n’est appliqué automatiquement par le modèle.

Le serveur est réservé au studio local et vérifie l’origine des requêtes. Les fonctions shell, applications, hooks, agents multiples et recherche web sont désactivées ; les threads utilisent le bac à sable en lecture seule. Les requêtes d’approbation venant du modèle sont refusées. Les jetons d’authentification ne passent pas par le navigateur MindStudio.

## Installation sur une autre machine

```sh
npm install --prefix .mindstudio/codex-runtime @openai/codex@0.159.1
```

Documentation officielle : https://learn.chatgpt.com/docs/app-server

Vérification : `npm run typecheck`, `npm test` et essai réel depuis `/assistant`.
