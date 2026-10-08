# Sauvegarde GitHub de MindStudio

Dépôt privé : [Krisdesign1/mindstudio-backup](https://github.com/Krisdesign1/mindstudio-backup).

Cette sauvegarde associe deux éléments complémentaires :

- **Le dépôt Git** conserve le code de l’application, les scripts, la documentation, les ressources publiques et les fichiers de dépendances.
- **La release `backup-2026-10-08`** conserve une archive complète du dossier de travail, répartie en fichiers `*.tar.zst.partNNN` de moins de 2 GiB. Elle inclut notamment `.mindstudio`, les projets éditables, les médias, les exports, les modèles locaux, `node_modules`, `.next`, `renders` et les caches. Ces données ne sont pas toutes suivies directement dans Git.

Un clone du dépôt, sans les archives de la release, **ne restaure pas tous les projets et médias**. La sauvegarde complète est validée seulement après création, transfert et vérification de toutes les parties de l’archive et de leur manifeste.

## Limites et fichiers protégés

La sauvegarde porte sur les fichiers présents dans `/Users/user/Downloads/HEYGEN` au moment de la capture. Ce n’est pas une sauvegarde automatique ni une synchronisation continue : les modifications ultérieures nécessitent une nouvelle sauvegarde.

Les fichiers `.env*`, sauf `.env.example`, les clés privées et les fichiers de credentials sont exclus pour ne pas les exposer sur GitHub, même dans un dépôt privé. Le dossier `.git` à la racine est aussi exclu de l’archive : l’historique publié reste disponible dans le dépôt. Conserver les secrets nécessaires séparément, dans un emplacement sécurisé. Recréer notamment `.env.local` après restauration ; ne jamais le committer.

Les fichiers situés ailleurs sur l’ordinateur, notamment dans Downloads mais hors du dossier HEYGEN, ne sont pas inclus. Certains scripts et notes font référence à ces chemins externes. Leur présence dans une note ne signifie pas que le fichier externe a été sauvegardé.

Les données enregistrées uniquement dans le navigateur (`localStorage`, profil Chrome, etc.) ne font pas partie de ce dossier et ne sont donc pas capturées. Les projets natifs stockés dans `.mindstudio`, eux, sont inclus. Exporter séparément les réglages ou projets qui n’existent que dans le navigateur avant de changer de machine.

L’archive conserve les liens symboliques, les permissions et les dates de modification. Les métadonnées étendues propres au système d’exploitation ne sont pas incluses. Le lien Python du venv pointe vers une installation externe de Python ; cette installation ne se trouve pas dans l’archive. Les environnements virtuels, les chemins absolus et certains binaires macOS ne sont pas portables tels quels vers une autre machine ou architecture. Consulter les prérequis du [README](../README.md), puis réinstaller les dépendances compatibles si nécessaire. Ne pas installer de service payant ou de gros outil supplémentaire sans accord.

## Télécharger et vérifier la sauvegarde

Avec GitHub CLI déjà disponible et connecté à un compte autorisé à lire le dépôt privé, télécharger **tous** les fichiers de la release dans un dossier dédié :

```sh
gh release download backup-2026-10-08 \
  --repo Krisdesign1/mindstudio-backup \
  --dir /tmp/mindstudio-backup-2026-10-08
```

Le dossier doit contenir toutes les parties de l’archive, `SHA256SUMS` et `manifest.json`. Ne pas renommer ou supprimer une partie. Les sommes SHA-256 permettent de détecter un téléchargement incomplet ou modifié ; le manifeste décrit le contenu du snapshot et ses exclusions et conserve une empreinte SHA-256 par fichier.

Avec `scripts/github-backup.mjs` disponible depuis l’installation actuelle ou téléchargé depuis le dépôt privé dans un dossier distinct :

```sh
node scripts/github-backup.mjs verify \
  --parts /tmp/mindstudio-backup-2026-10-08
```

Ne pas poursuivre si une partie manque, si une somme ne correspond pas ou si la vérification échoue. Télécharger à nouveau les fichiers concernés. La vérification des archives ne garantit pas à elle seule le fonctionnement de l’application : un test de restauration reste nécessaire.

## Restaurer sans écraser l’application

**Ne jamais restaurer dans le dossier de l’application active.** Choisir le nom d’un nouveau dossier qui n’existe pas encore, avec suffisamment d’espace pour l’archive décompressée. Le script refuse toute destination existante, même vide. Garder l’installation actuelle intacte jusqu’au contrôle de la restauration.

```sh
node scripts/github-backup.mjs restore \
  --parts /tmp/mindstudio-backup-2026-10-08 \
  --destination /tmp/mindstudio-restaure-2026-10-08
```

Contrôler le manifeste et les SHA-256, puis vérifier dans le dossier restauré : sources de l’application, projets `.mindstudio/studio`, originaux `.mindstudio/media`, autres données `.mindstudio`, sous-titres et exports attendus. Examiner aussi les liens symboliques et les prérequis externes indiqués plus haut.

Pour disposer de l’historique Git, créer un clone séparé **après cette restauration**, sans cloner dans le dossier restauré :

```sh
gh repo clone Krisdesign1/mindstudio-backup /tmp/mindstudio-sources-git
```

Une fois la restauration vérifiée, les secrets recréés séparément et les prérequis du README satisfaits, lancer l’application depuis le dossier restauré :

```sh
cd /tmp/mindstudio-restaure-2026-10-08
npm ci
npm run dev
```

`npm ci` réinstalle les dépendances exactes du lockfile et remplace le `node_modules` de la copie restaurée ; il peut nécessiter un accès réseau. Il ne doit pas être lancé dans l’installation actuelle pour tester la sauvegarde. Vérifier ensuite le chargement de MindStudio, la liste des projets, une timeline éditable et la disponibilité d’un export. Un rendu long n’est pas nécessaire pour le premier contrôle de récupération.

## Créer une nouvelle capture

Depuis la racine du dossier de l’application, enregistrer les modifications, éviter les écritures concurrentes dans les projets pendant la capture et choisir une sortie située **hors** du dossier sauvegardé :

```sh
node scripts/github-backup.mjs create \
  --source . \
  --output /tmp/mindstudio-backup-nouveau

node scripts/github-backup.mjs verify \
  --parts /tmp/mindstudio-backup-nouveau
```

Cette commande crée une sauvegarde locale ; elle ne constitue pas, à elle seule, un envoi réussi sur GitHub. Publier ensuite les parties, les sommes et le manifeste dans une nouvelle release privée, conserver les anciennes sauvegardes utiles et vérifier les fichiers réellement téléchargés depuis GitHub. Ne déclarer la nouvelle sauvegarde complète qu’après ces contrôles.
