# Configuration Firebase (connexion, inscription, et VRAIS emails)

L'authentification (inscription, connexion, mot de passe oublié) est maintenant
gérée par **Firebase Authentication**. Les emails de réinitialisation sont donc
de vrais emails envoyés par l'infrastructure de Google — fiables, sans SMTP à
configurer, sans mot de passe d'application.

## 1. Créer un projet Firebase

1. Allez sur https://console.firebase.google.com
2. **Ajouter un projet** → donnez-lui un nom (ex. "rapport-assistant") → suivez les étapes
3. Vous n'avez pas besoin d'activer Google Analytics pour ce projet

## 2. Activer la connexion par email/mot de passe

1. Dans le menu de gauche : **Authentication** → **Sign-in method** (ou "Modes de connexion")
2. Activez le fournisseur **Email/Password** (Adresse e-mail/Mot de passe)

## 3. Récupérer la clé API Web

1. Cliquez sur l'icône ⚙️ (Paramètres du projet) en haut à gauche
2. Dans l'onglet **Général**, descendez jusqu'à **Vos applications**
3. Cliquez sur `</>` (Web) pour créer une "app web" si vous n'en avez pas encore
   (pas besoin de configurer l'hébergement Firebase, juste enregistrer l'app)
4. Copiez la valeur `apiKey` affichée (une longue chaîne du type `AIzaSy...`)

## 4. Renseigner `backend/config.php`

```php
return [
    'firebase_api_key' => 'AIzaSy...votre_clé...',
];
```

## 5. (Optionnel) Personnaliser l'email et la page de réinitialisation

Par défaut, Firebase envoie un email avec son propre modèle et redirige vers
une page Firebase générique pour saisir le nouveau mot de passe. Pour que
l'utilisateur retombe sur **votre** page `reset_password.php` (déjà prête à
gérer ça) :

1. **Authentication** → **Templates** (Modèles) → **Password reset**
2. Cliquez sur l'icône crayon → **URL d'action personnalisée**
3. Renseignez : `https://votre-domaine.com/public/reset_password.php`

Vous pouvez aussi personnaliser le texte de l'email, le nom de l'expéditeur,
etc. depuis cet écran.

## 6. Tester

Depuis la page de connexion, cliquez sur **"Mot de passe oublié ?"**, entrez
l'email d'un compte déjà inscrit dans l'app, et vérifiez la réception du
véritable email envoyé par Firebase (pensez à vérifier les spams la première
fois).

## Notes techniques

- `backend/firebase.php` appelle l'API REST **Identity Toolkit** de Firebase
  via cURL — aucun SDK, aucune dépendance Composer.
- Les comptes ne sont plus stockés dans `storage/users.json` : Firebase est
  la source de vérité pour les identifiants. Le fichier `storage/users.json`
  n'est donc plus utilisé.
- La session PHP (`$_SESSION['user']`) continue de gérer l'accès aux pages de
  l'assistant, exactement comme avant — seule la vérification des identifiants
  a changé.
