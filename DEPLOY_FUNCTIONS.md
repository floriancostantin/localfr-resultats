# Déployer les Cloud Functions Firebase

## Prérequis : activer le plan Blaze sur Firebase

1. Allez sur **console.firebase.google.com** → votre projet `localfr-resultats`
2. En bas à gauche → **"Upgrade"** → plan **Blaze (pay-as-you-go)**
3. Entrez une carte bancaire → confirmez
   - ⚠️ Votre usage sera **gratuit** (bien sous les seuils gratuits)
   - Conseil : configurez une alerte budget à 1€ pour être sûr

## Installer Firebase CLI sur votre Mac

Ouvrez le Terminal et tapez :
```bash
npm install -g firebase-tools
```

## Se connecter et déployer

```bash
# Se connecter à Firebase
firebase login

# Aller dans le dossier du projet
cd "/Users/floriancostantin/Claude/Projects/APPLI LOCALPERF"

# Initialiser (si première fois)
firebase use --add
# → sélectionnez votre projet localfr-resultats

# Installer les dépendances des fonctions
cd functions
npm install
cd ..

# Déployer les fonctions
firebase deploy --only functions
```

## Ce qui sera déployé

3 fonctions Cloud :
- **notificationQuotidienne** — s'exécute chaque soir à 19h, envoie la notification à toute la force commerciale
- **envoyerNotificationMaintenant** — déclenchée par le bouton dans l'appli
- **checkAllAgenciesSoumises** — s'exécute à chaque saisie, envoie une notif spéciale quand TOUTES les agences ont saisi

## Vérifier le déploiement

Dans Firebase Console → **Functions** — vous verrez les 3 fonctions listées avec leur statut.
