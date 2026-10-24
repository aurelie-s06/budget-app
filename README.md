# Mon Budget

Application web de gestion de budget personnel, réalisée avec AdonisJS dans le cadre du challenge AdonisJS (BUT MMI).

## Objectif

Permettre à un utilisateur de centraliser ses comptes, d'enregistrer ses revenus et ses dépenses, et de suivre son budget mois par mois, depuis un tableau de bord.

## Fonctionnalités

### Authentification
- Inscription, connexion et déconnexion (sessions)
- Chaque utilisateur n'accède qu'à ses propres données
- Catégories par défaut créées automatiquement à l'inscription (Logement, Alimentation, Transports, Santé, Loisirs, Abonnements, Restaurants, Autres)

### Comptes
- CRUD complet : créer, consulter, modifier, supprimer
- Types : compte courant, épargne, espèces, autre
- Solde initial + solde actuel calculé automatiquement à partir des opérations

### Catégories
- CRUD complet avec couleur personnalisée
- Budget mensuel facultatif par catégorie

### Opérations
- CRUD complet des revenus et des dépenses
- Association à un compte et à une catégorie
- Filtres par mois, compte, catégorie, type et montant (minimum / maximum)
- Recherche dans la description et dans la note
- Tri par date ou par montant
- Les filtres sont conservés dans l'URL

### Vue annuelle
- Revenus, dépenses, épargne et reste de chaque mois de l'année
- Tableau des dépenses par catégorie et par mois, avec le total de l'année

### Tableau de bord
- Solde total, revenus, dépenses et épargne du mois
- Taux de dépenses (dépenses ÷ revenus × 100, non calculé si aucun revenu)
- Suivi des budgets par catégorie avec barre de progression et alerte en cas de dépassement
- Graphique en anneau de la répartition des dépenses par catégorie
- 5 dernières opérations

## Technologies

| Rôle | Outil |
|---|---|
| Framework backend | AdonisJS |
| Base de données | SQLite |
| ORM | Lucid |
| Validation | VineJS |
| Frontend | React avec Inertia.js |
| Graphiques | Chart.js (react-chartjs-2) |
| Langage | TypeScript |
| Dates | Luxon |

## Installation en local

### Prérequis

- **Node.js 24 ou plus récent** (champ `engines` de `package.json`). Vérifier avec `node -v`.
- **npm** (installé avec Node.js).
- **Git**.

Aucune base de données à installer : SQLite est un simple fichier créé automatiquement dans le projet.

### 1. Récupérer le projet

```bash
git clone https://github.com/aurelie-s06/budget-app.git
cd budget-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
# Copier le modèle de configuration
cp .env.example .env

# Générer la clé secrète de l'application (remplit APP_KEY dans .env)
node ace generate:key
```

Par défaut, l'application écoute sur le port `3333` (variables `PORT` et `HOST` du fichier `.env`).

### 4. Créer la base de données

```bash
node ace migration:run
```

Cette commande crée le fichier SQLite et toutes les tables.

### 5. Lancer l'application

```bash
npm run dev
```

L'application est disponible sur http://localhost:3333. Cliquer sur « Commencer gratuitement » pour créer un compte : les catégories par défaut sont ajoutées automatiquement.

Pour arrêter le serveur : `Ctrl + C` dans le terminal.

### Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement avec rechargement automatique |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run typecheck` | Vérifie les types TypeScript (serveur et React) |
| `npm run format` | Formate le code avec Prettier |
| `npm run build` puis `npm start` | Version de production (lancée depuis le dossier `build/`, avec son propre `.env`) |
| `node ace migration:rollback` | Annule la dernière migration |

### Optionnel : démarrage automatique sous macOS

Un script installe un service macOS (LaunchAgent) qui lance Mon Budget à chaque ouverture de session et le relance s'il s'arrête. Il utilise ses propres ports pour ne pas gêner d'autres projets AdonisJS.

```bash
# Installer (à lancer une seule fois, depuis un terminal où « node -v » fonctionne)
bash scripts/autostart/install.sh

# Désinstaller
bash scripts/autostart/uninstall.sh
```

L'application est alors disponible sur http://monbudget.localhost:4848. Le journal du serveur se trouve dans `~/Library/Logs/monbudget.log`.

Si le port `4848` ou `24848` est déjà utilisé, modifier `PORT` et `HMR_PORT` en haut du script `install.sh`.

### Optionnel : installer l'application

Mon Budget peut s'installer comme une application, avec sa propre icône et sa propre fenêtre :

- **Safari (macOS)** : menu Fichier › Ajouter au Dock ;
- **Chrome / Edge** : icône d'installation dans la barre d'adresse ;
- **iPhone (Safari)** : Partager › Sur l'écran d'accueil.

Le serveur doit tourner pour que l'application fonctionne (le démarrage automatique ci-dessus s'en charge).

## Structure des données

| Table | Champs principaux |
|---|---|
| `users` | nom, email, mot de passe haché |
| `accounts` | user_id, nom, type, solde initial, couleur |
| `categories` | user_id, nom, couleur, budget mensuel |
| `transactions` | user_id, account_id, category_id, type (income / expense), montant, date, description, note |

Relations :
- un utilisateur possède plusieurs comptes, catégories et opérations ;
- une opération appartient à un compte et, éventuellement, à une catégorie ;
- supprimer un compte supprime ses opérations (`CASCADE`) ;
- supprimer une catégorie conserve les opérations, sans catégorie (`SET NULL`).

Le montant est toujours enregistré en positif : c'est le champ `type` qui indique s'il s'agit d'un revenu ou d'une dépense. Les soldes ne sont jamais stockés, ils sont recalculés côté serveur.

## Organisation du code

```
app/
  controllers/   → dashboard, months, years, accounts, categories, transactions
  services/      → calculs du budget (soldes, bilans du mois et de l'année)
  models/        → User, Account, Category, Transaction (avec leurs relations)
  validators/    → validation VineJS des formulaires et des filtres
database/
  migrations/    → création des tables
inertia/
  pages/         → pages React (dashboard, months, years, accounts, categories, transactions)
  components/    → navigation, graphiques, calendrier
  css/app.css    → styles
public/          → icônes et manifeste de l'application installable
scripts/
  autostart/     → démarrage automatique sous macOS
start/
  routes.ts      → routes, protégées par le middleware auth
```

## Sécurité

- Toutes les pages de l'application sont protégées par le middleware `auth`.
- Les requêtes passent par `user.related(...)` : un utilisateur ne peut ni lire ni modifier les données d'un autre, même en changeant l'identifiant dans l'URL.
- Lors de la création d'une opération, le serveur vérifie que le compte et la catégorie choisis appartiennent bien à l'utilisateur.
- Toutes les données envoyées sont validées avec VineJS.
- Le fichier `.env` n'est pas versionné.

## Utilisation de l'IA

**Outil utilisé** : Claude (Anthropic)

**Comment je l'ai utilisé**
- Définir le périmètre du projet à partir d'un cahier des charges
- Concevoir la structure de la base de données
- Comprendre et corriger les erreurs rencontrées
- Rédiger les commits

**Avantages**
- Explication des messages d'erreur TypeScript et AdonisJS

**Difficultés et erreurs corrigées**
- **Version d'AdonisJS récente** : certains exemples ne correspondaient pas à la structure générée (modèles basés sur `#database/schema`, contrôleurs importés via `#generated/controllers`). Il a fallu adapter le code.
- **Dates** : `vine.date()` ne renvoyait pas le format attendu par Lucid, ce qui provoquait l'erreur « Invalid value for Transaction.date ». Corrigé en validant la date comme texte `AAAA-MM-JJ`, puis en la convertissant avec `DateTime.fromISO`.
- **Fichiers `._` de macOS** : le projet étant sur un disque externe, macOS créait des fichiers parasites qu'AdonisJS prenait pour des pages. Corrigé avec un `.gitignore` adapté et une commande de nettoyage.
- **Code mal formaté** : accolades manquantes. Cela m'a appris à bien relire la structure d'une classe.

**Ce que j'en retiens**
L'IA accélère beaucoup le développement, mais elle ne connaît pas toujours la version exacte des outils utilisés. Il faut lire les messages d'erreur, comprendre le code produit et vérifier chaque étape, sinon on accumule des erreurs difficiles à retrouver.
