# 🎬 Intégration PreMiD — Discord Rich Presence pour POSKA

Ce dossier contient l'intégration officielle **PreMiD** pour afficher automatiquement sur Discord ce que les utilisateurs regardent ou explorent sur **POSKA** (`https://poska.pitsho.org`).

---

## 📦 Contenu du dossier
- `metadata.json` : Fichier de description et configuration officiel (schéma PreMiD 1.17).
- `presence.ts` : Script TypeScript qui lit le lecteur vidéo, le titre du film/série, l'épisode, la jaquette et le temps de lecture.
- `logo.png` : Logo officiel carré 512x512 pour la boutique PreMiD.

---

## 🚀 Étape 1 : Application Discord (Déjà configurée ✅)
L'identifiant d'application Discord officiel (`1566479852826001458`) est **déjà intégré** dans `presence.ts` !
- Assure-toi simplement sur le [Portail Développeur Discord](https://discord.com/developers/applications) que ton application s'appelle bien **`Poska`** et qu'elle possède le logo en icône.
- *(Optionnel)* Dans `metadata.json`, tu peux mettre ton propre identifiant utilisateur Discord dans `author.id` si tu veux être crédité sur le store PreMiD.

---

## 🧪 Étape 2 : Tester en local sur ton navigateur (Optionnel mais rapide)
Tu peux tester la présence directement sur ton PC sans rien publier :
1. Installe l'application bureau **PreMiD** et l'extension navigateur **PreMiD**.
2. Clique sur l'icône de l'extension PreMiD -> Paramètres (roue crantée) -> Active le **Mode Développeur**.
3. Ouvre un terminal dans ce dossier `integrations/premid` et lance :
   ```bash
   npx @premid/cli dev
   ```
4. Va sur `https://poska.pitsho.org/watch/...` et lance une vidéo : ton profil Discord s'allume instantanément !

---

## 🌐 Étape 3 : Soumettre la Pull Request officielle (Pour que ce soit automatique pour tout le monde)
1. Va sur le dépôt GitHub officiel de PreMiD : [github.com/PreMiD/Activities](https://github.com/PreMiD/Activities)
2. Clique sur **Fork** en haut à droite pour copier le dépôt sur ton compte GitHub.
3. Dans ton fork, navigue vers le dossier :
   ```text
   websites/P/
   ```
4. Crée un nouveau dossier nommé `Poska` et déposes-y les 3 fichiers :
   - `metadata.json`
   - `presence.ts`
   - `logo.png`
5. Clique sur **Commit changes**.
6. Clique sur **Contribute** -> **Open Pull Request**.
7. Donne comme titre à la PR : `feat(Poska): add Poska activity`.
8. Le robot de PreMiD va valider le format, puis un modérateur va fusionner la PR.

Une fois fusionné, **POSKA sera officiellement actif dans PreMiD pour tous les utilisateurs du monde entier** !
