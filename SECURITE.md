# 🔒 Mise en place de la sécurité — LocalPerf

Ce guide active la séparation **Directeur / Commercial** avec une vraie sécurité côté base.

> ⚠️ **Respecte l'ordre des étapes.** Si tu publies les nouvelles règles (étape 4) AVANT d'avoir
> créé le compte directeur (étape 2), l'appli se bloque pour tout le monde. L'ordre ci-dessous
> ne casse jamais l'appli en cours de route.

---

## Étape 1 — Activer les méthodes de connexion (2 min)

1. Va sur **https://console.firebase.google.com** → projet **localfr-resultats**
2. Menu gauche → **Authentication** → bouton **Get started / Commencer** (si pas déjà fait)
3. Onglet **Sign-in method** (Méthode de connexion)
4. Active **deux** fournisseurs :
   - **E-mail/Mot de passe** → clique → bascule **Activer** → **Enregistrer**
   - **Anonyme** → clique → bascule **Activer** → **Enregistrer**

> L'anonyme sert aux **commerciaux** (accès lecture seule, sans mot de passe).

---

## Étape 2 — Créer le compte directeur unique (1 min)

C'est ce compte dont le **mot de passe = le code DA global** distribué aux directeurs.

1. Toujours dans **Authentication** → onglet **Users** (Utilisateurs)
2. Bouton **Add user** (Ajouter un utilisateur)
3. **E-mail** : `da@localperf.app`  ← *exactement ça, ne pas changer*
4. **Mot de passe** : choisis le **code DA** que tu donneras aux directeurs
   *(ex : `LocalDA2026!` — mets quelque chose de pas trop simple)*
5. **Add user**

> 🔑 Pour **changer le code** plus tard : ici même → ce compte → menu **⋮** → **Reset password**,
> ou supprime/recrée le compte avec un nouveau mot de passe.

---

## Étape 3 — Déployer la nouvelle version de l'appli (index.html)

Déploie le `index.html` mis à jour (il sait maintenant demander le code et se connecter).

- **Si Netlify (glisser-déposer)** : reuploade le dossier / `index.html` sur ton site Netlify.
- **Si Firebase Hosting** : dans le dossier du projet, `firebase deploy --only hosting`.
- **Si GitHub Pages** : reuploade `index.html` sur le dépôt.

> À ce stade, l'appli fonctionne déjà avec la connexion sécurisée, MÊME si les règles
> ne sont pas encore verrouillées. Rien n'est cassé.

---

## Étape 4 — Verrouiller la base de données (le vrai verrou) ✅

Maintenant que le compte existe et que l'appli sait s'authentifier, on ferme la base.

**Option A — par la console (le plus simple)**
1. Firebase Console → **Realtime Database** → onglet **Règles** (Rules)
2. Remplace tout le contenu par :

```json
{
  "rules": {
    "results": {
      ".read": "auth != null",
      ".write": "auth != null && auth.token.email == 'da@localperf.app'"
    },
    "palmares": {
      ".read": "auth != null",
      ".write": "auth != null && auth.token.email == 'da@localperf.app'"
    },
    ".read": false,
    ".write": false
  }
}
```

3. Clique **Publier** (Publish)

**Option B — par ligne de commande** (si tu utilises le CLI Firebase)
```
firebase deploy --only database
```
*(le fichier `database.rules.json` est déjà prêt dans le projet)*

---

## ✅ Vérification finale

| Test | Résultat attendu |
|------|------------------|
| Login **Commercial** (sans code) | Voit Palmarès + Classement. Pas d'onglet Saisie/Rédiger. |
| Login **Directeur** avec le **bon** code | Accès complet, saisie OK. |
| Login **Directeur** avec un **mauvais** code | « ❌ Code d'accès incorrect », pas d'accès. |
| Un commercial qui tenterait d'écrire dans la base | **Refusé** par les règles (PERMISSION_DENIED). |

---

## Ce qui a changé dans le code (récap technique)

- `index.html` : login DA → `signInWithEmailAndPassword` (le code est validé par Firebase, pas
  juste à l'écran) · login commercial → `signInAnonymously` (lecture seule) · navigation vers
  Saisie/Rédiger bloquée pour les non-DA · session persistée entre les ouvertures.
- `database.rules.json` : écriture sur `results` et `palmares` réservée au compte directeur ;
  lecture réservée aux utilisateurs connectés (commerciaux anonymes inclus) ; tout le reste fermé.
- `firebase.json` : référence le fichier de règles ; exclut la maquette et les sauvegardes du déploiement.
- Sauvegarde de l'ancien `index.html` : fichier `index.html.backup-…` (à conserver le temps de valider).
