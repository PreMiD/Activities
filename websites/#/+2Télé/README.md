# PreMiD Presence - +2Télé 📺

Ce module apporte le support de **Discord Rich Presence** pour le site de référence d'archives télévisuelles **+2Télé** (https://plus2tele.com).

## Fonctionnalités

Le module détecte dynamiquement votre navigation sur la plateforme et met à jour votre statut Discord en conséquence :

- **Page d'accueil** : Affiche que vous naviguez sur le site.
- **Listes globales** : Détecte si vous parcourez la liste des archives, des chaînes, des agences, ou des collections.
- **Chaînes & Agences & Collections** : Affiche le nom de la chaîne/agence/collection consultée ainsi que le nombre total d'archives associées (ex: `Page 1 sur 357 • 7130 archives`).
- **Profils Utilisateurs** : Affiche le nom du membre et son volume total d'archives partagées.
- **Zapping** : Affiche le titre de l'archive aléatoire en cours de visionnage.
- **Lecteur Média** : Affiche le titre de l'archive vidéo, l'auteur de la publication, le bouton pour y accéder, et gère l'état de lecture/pause (avec icônes synchronisées).

## Caractéristiques Techniques

1. **Routage Multi-langue** : Supporte de manière transparente les préfixes linguistiques dynamiques du site (`/fr`, `/gb`, `/es`, `/de`, `/pt`, `/it`, `/pl`, `/ro`).
2. **Extraction DOM Robuste & Multi-langue** :
   - Recherche du nombre d'archives basée sur les sélecteurs de classes Tailwind CSS (`text-xl font-bold` pour la section "Archives"), ce qui rend l'extraction insensible aux traductions du site.
   - Séparation propre de la pagination et du nombre total d'archives (ex. extrait et reformate `"Page 1 sur 357 • Affichage de 20 sur 7130 archives"` en `"Page 1 sur 357 • 7130 archives"` dans toutes les langues).
3. **Fichiers de Ressources Locales** : Intègre des traductions de présence pour 8 langues (FR, EN, ES, DE, PT, IT, PL, RO).

## Installation & Test en Local

Pour lancer le serveur de développement local et tester le module :

```bash
# Lancer le serveur dev PreMiD
npx pmd dev +2Télé

# Compiler le module
npx pmd build "+2Télé"
```
