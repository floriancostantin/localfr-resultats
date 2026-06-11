# Guide d'installation — local.fr Résultats Journaliers

## Ce qu'il vous faut
- Un compte Google (gratuit)
- Un compte GitHub (gratuit)
- 20 minutes

---

## ÉTAPE 1 — Créer le projet Firebase

1. Allez sur **https://console.firebase.google.com**
2. Cliquez **"Créer un projet"**
3. Nom du projet : `localfr-resultats` (ou ce que vous voulez)
4. Désactivez Google Analytics (pas utile) → **Créer le projet**

### Activer la base de données
1. Dans le menu gauche → **Realtime Database** → **Créer une base de données**
2. Choisissez **Europe (europe-west1)**
3. Mode : **Démarrer en mode test** (vous verrouillerez plus tard)
4. Cliquez **Activer**

### Récupérer les clés
1. Menu gauche → icône ⚙️ → **Paramètres du projet**
2. Descendez jusqu'à **"Vos applications"** → cliquez l'icône **`</>`** (Web)
3. Nom de l'appli : `localfr-app` → **Enregistrer**
4. Copiez le bloc `firebaseConfig` qui apparaît — vous en aurez besoin à l'étape 3

---

## ÉTAPE 2 — Créer le dépôt GitHub

1. Allez sur **https://github.com** → **New repository**
2. Nom : `localfr-resultats`
3. Cochez **"Public"**
4. Cliquez **Create repository**
5. Uploadez les fichiers : `index.html`, `manifest.json`, `icon-192.png`, `icon-512.png`
   - Cliquez **"uploading an existing file"** et glissez-déposez les fichiers

### Activer GitHub Pages
1. Dans le dépôt → **Settings** → **Pages** (menu gauche)
2. Source : **Deploy from a branch** → branche **main** → dossier **/ (root)**
3. **Save** → votre URL sera : `https://VOTRE_USERNAME.github.io/localfr-resultats`

---

## ÉTAPE 3 — Connecter Firebase à l'appli

Ouvrez `index.html` et cherchez ce bloc (vers la ligne 200) :

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "VOTRE_API_KEY",
  authDomain:        "VOTRE_PROJECT.firebaseapp.com",
  databaseURL:       "https://VOTRE_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "VOTRE_PROJECT",
  storageBucket:     "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId:             "VOTRE_APP_ID"
};
```

Remplacez chaque valeur par celles copiées depuis Firebase à l'étape 1.

Re-uploadez le fichier `index.html` modifié sur GitHub.

---

## ÉTAPE 4 — Générer les icônes

Vous avez besoin de deux icônes PNG pour que l'appli s'affiche correctement sur l'écran d'accueil iPhone :
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

**Option simple :** utilisez le logo local.fr sur fond fuchsia (#EC008C), taille 192×192 et 512×512.
Envoyez-moi le logo et je génère les icônes.

---

## ÉTAPE 5 — Installer sur les iPhones des DA

Envoyez l'URL GitHub Pages à chaque DA avec ces instructions :

1. Ouvrir l'URL dans **Safari** (pas Chrome)
2. Appuyer sur l'icône **Partager** (carré avec flèche ↑)
3. Choisir **"Sur l'écran d'accueil"**
4. Nommer l'appli **"local.fr"** → **Ajouter**

L'appli apparaît sur l'écran d'accueil comme une vraie application.

---

## Sécurité Firebase (optionnel mais recommandé)

Dans Firebase Console → Realtime Database → **Règles**, remplacez par :

```json
{
  "rules": {
    "results": {
      ".read": true,
      ".write": true
    }
  }
}
```

Pour une version sécurisée avec authentification, contactez votre équipe IT.

---

## En cas de problème

- L'appli fonctionne aussi **sans Firebase** (données locales par appareil) — utile pour tester avant la mise en ligne
- Point de synchronisation visible en haut à gauche : 🟢 connecté · 🟡 synchronisation · ⚫ hors ligne
