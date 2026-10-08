# Évaluation de l’IA locale — 29 septembre 2026

Objectif : proposer des scènes à partir de la transcription « Reviens », sans API payante. Ce test ne crée ni images ni vidéo et ne modifie aucun projet existant.

## Machine et moteur

- MacBook Pro Intel Core i7-9750H, six cœurs, 32 Go RAM.
- Intel UHD 630 et AMD Radeon Pro 5500M 4 Go détectées.
- Ollama 0.20.0 utilise ici le CPU, pas la Radeon.
- Environ 14 Go libres au début du test ; aucun modèle téléchargé.
- Deux modèles déjà présents : Qwen2.5 1.5B (~0,99 Go) et Llama3.2 (~2,02 Go).
- Serveur démarré sur 127.0.0.1:11434 avec OLLAMA_NO_CLOUD=1. Cette configuration vaut pour ce lancement, pas pour tous les futurs démarrages.

## Protocole

`scripts/local-ai-benchmark.py` envoie le texte complet à chaque modèle local, successivement. Consigne identique : cinq passages cités, illustrations concrètes et animations, dans l’ordre du récit. Sortie JSON contrainte, contexte 4 096 tokens, sortie limitée à 1 200 tokens, température 0,2, six threads. Résultats bruts conservés dans `.mindstudio/local-ai/`. Ces mesures portent sur un seul essai par modèle ; ce ne sont pas des garanties de vitesse.

## Premier résultat

Qwen2.5 1.5B : 128,74 secondes, 478 tokens produits, 8,64 tokens/s pendant la génération. Le temps total inclut chargement et traitement de la demande. Mémoire observée via Ollama : environ 1,1 Go.

La réponse est structurée mais insuffisante : inversion des rôles père/fils, lieu inventé, scènes répétées et absence de couverture de la fin du récit. Ce modèle n’est pas validé comme réalisateur automatique.

Llama3.2 : 253,82 secondes, 479 tokens produits, 4,23 tokens/s pendant la génération. Les rôles sont mieux distingués, mais la fin du récit est absente, les mouvements sont répétitifs et une colère non présente dans le texte est ajoutée. Ce modèle n’est pas non plus validé comme réalisateur automatique.

## Limites et suite

La mémoire permet l’inférence locale. Le français narratif, la fidélité sémantique et le temps CPU restent à évaluer. Une sortie JSON valide ne garantit pas une bonne mise en scène. Si la qualité ne suffit pas, limiter le rôle du modèle à des propositions pour un passage précis, avec validation humaine. L’intégration à l’application n’est pas réalisée par ce test.

## Conclusion du test

Aucun achat ni téléchargement nécessaire. Les deux modèles fonctionnent sur le CPU, mais aucun ne satisfait la demande de conception complète sur cet essai. Ne pas remplacer les scènes existantes par ces propositions. Les requêtes utilisent `keep_alive: 0` pour libérer les modèles après réponse.

## Deuxième essai : une scène guidée à la fois

Exécuté avec `scripts/local-ai-scene-benchmark.py`, Llama3.2 déjà installé, contexte 2 048 tokens, sortie maximale 350 tokens, température 0,2, seed 42 et six threads. Deux passages indépendants avec contexte explicite ; aucune modification des projets. Requêtes et réponses brutes conservées dans `.mindstudio/local-ai/scenes/`. Aucun achat ni téléchargement.

| Passage | Temps total | Proposition | Évaluation humaine |
| --- | --- | --- | --- |
| « Tu n’oses même plus prier comme avant. » | 49,07 s | Personne assise sur un lit, bras croisés, yeux baissés ; épaules vers l’arrière. | Évoque la honte, mais ne montre pas la difficulté à prier. Le champ personnages contient seulement « 1 ». L’animation décrit surtout une posture, sans mouvement exploitable. |
| « Il est retourné chez son père pour retrouver une nouvelle vie. » | 57,19 s | Fils agenouillé devant son père, tête baissée, bras vers le sol. | Rôles corrects, mais agenouillement ajouté et retour non montré. Décor générique, animation encore décrite comme une pose. |

Les deux réponses sont des objets JSON valides contenant les quatre champs demandés. Cette validité ne résout pas les défauts de conception. Un seul essai par passage : aucune garantie générale de qualité ou de rapidité.

Conclusion : le contexte explicite aide à conserver les rôles, mais cet essai ne valide toujours pas un réalisateur autonome. Les résultats peuvent servir de brouillons à corriger ; ne pas les transformer automatiquement en scènes finales. Aucun moteur de génération d’images ou de vidéo n’a été testé ici, et aucune intégration IA n’a été ajoutée à l’application. Pour une prochaine intégration, privilégier un storyboard éditable avec validation des actions visibles et choix des médias avant animation.
