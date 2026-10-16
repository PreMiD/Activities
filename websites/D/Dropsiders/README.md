# 🎵 Dropsiders - Discord Rich Presence (PreMiD)

Ce dossier contient l'intégration officielle **PreMiD** pour **Dropsiders.fr**.

Elle permet d'afficher en temps réel sur Discord ce que vous faites sur Dropsiders :
* 📻 **Quand vous écoutez la Radio** : Titre du morceau, Nom de l'artiste, Statut en direct + Bouton *"Écouter la Radio"*.
* 📰 **Quand vous lisez une News / Récap** : Titre de l'article + Bouton *"Lire l'article"*.
* 🎪 **Quand vous parcourez l'Agenda, les Lives TV ou le Shop** : Statut adapté avec logo Dropsiders officiel.

---

## 🚀 Comment tester la Présence sur votre PC

### Prérequis (environ 2 minutes) :
1. Avoir l'application **Discord** ouverte sur votre ordinateur.
2. Avoir l'application **PreMiD** installée et lancée (téléchargeable gratuitement sur [premid.app](https://premid.app)).
3. Avoir l'extension de navigateur **PreMiD** installée sur votre navigateur (Chrome, Firefox, Brave, Edge).

---

### Étape 1 : Activer le Mode Développeur dans l'extension PreMiD
1. Dans votre navigateur, cliquez sur l'icône de l'extension **PreMiD**.
2. Cliquez sur la **roue crantée (Paramètres)** en haut à droite du menu PreMiD.
3. Activez l'option **"Mode développeur"** (ou *"Activity Developer Mode"*).

---

### Étape 2 : Lancer le test en local

Le système officiel PreMiD utilise le dépôt officiel des activités. Pour tester en 1 minute :

1. Ouvrez un terminal dans le dossier de votre choix et clonez le dépôt officiel PreMiD :
   ```bash
   git clone --depth 1 https://github.com/PreMiD/Presences.git
   cd Presences
   npm install
   ```

2. Copiez le dossier `premid-dropsiders` dans `websites/D/Dropsiders` :
   * **Chemin de destination** : `Presences/websites/D/Dropsiders/`
   * Placez-y `metadata.json` et `presence.ts`.

3. Lancez le serveur de développement PreMiD :
   ```bash
   npm run dev Dropsiders
   ```

4. Ouvrez **[https://dropsiders.fr](https://dropsiders.fr)** (ou `http://localhost:5173`) dans votre navigateur :
   * Regardez votre profil Discord : votre statut Dropsiders s'affiche en direct ! 🎉
   * Lancez la radio ou ouvrez un article : le statut Discord change immédiatement.

---

## 🌐 Comment la publier pour TOUS les utilisateurs sur le PreMiD Store ?

Une fois que le test vous convient :
1. Faites un **Fork** du dépôt GitHub [`PreMiD/Presences`](https://github.com/PreMiD/Presences).
2. Ajoutez la présence dans `websites/D/Dropsiders/`.
3. Créez une **Pull Request** sur GitHub.
4. L'équipe PreMiD valide la présence sous 24-48h, et Dropsiders sera disponible directement en 1 clic pour les millions d'utilisateurs de PreMiD dans le monde !
