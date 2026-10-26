# Mon Budget

Application web de gestion de budget personnel, réalisée avec AdonisJS dans le cadre du challenge AdonisJS (BUT MMI).

## Objectif

Permettre à un utilisateur de centraliser ses comptes, d'enregistrer ses revenus et ses dépenses (à la main ou en important ses relevés bancaires), et de suivre son budget mois par mois et année par année.

## Fonctionnalités

### Authentification et profil
- Inscription, connexion et déconnexion (sessions)
- Chaque utilisateur n'accède qu'à ses propres données
- Catégories par défaut créées automatiquement à l'inscription (Logement, Alimentation, Transports, Santé, Loisirs, Abonnements, Restaurants, Autres)
- Page **Mon profil** (initiales en haut à droite) : modifier son nom et son email, changer de mot de passe (mot de passe actuel demandé), exporter ses opérations en CSV (lisible dans Excel ou Numbers), voir l'état des sauvegardes, supprimer son compte

### Comptes
- CRUD complet : créer, consulter, modifier, supprimer
- Types : compte courant, épargne, espèces, autre
- Solde actuel calculé automatiquement à partir des opérations
- Deux façons d'indiquer le solde :
  - **connu à une date** (par défaut) : le solde affiché par la banque un jour donné. Les opérations plus anciennes ajoutées ensuite ne le modifient pas, ce qui permet de saisir son historique après coup ;
  - **solde de départ** : le solde avant toutes les opérations du compte.

### Catégories
- CRUD complet avec couleur personnalisée
- Budget mensuel facultatif par catégorie

### Opérations
- CRUD complet des dépenses, des revenus et des **virements entre comptes** (un virement vers un compte épargne compte comme de l'épargne, pas comme une dépense)
- Filtres par mois, jour, compte, catégorie, type et montant (minimum / maximum), conservés dans l'URL
- Recherche dans la description et dans la note
- Tri par date ou par montant
- Sur téléphone, une carte par opération

### Import des relevés bancaires
- Dépôt d'un relevé de compte **BoursoBank en PDF** : les opérations sont lues, nommées et classées automatiquement
- **Aperçu avant validation** : chaque opération peut être cochée ou décochée, et modifiée au clic (date, description, catégorie ou virement, type, montant, note) ; bouton Annuler
- **Vérifications** :
  - le relevé est-il lu en entier ? (solde de début + opérations = solde de fin) ;
  - doublons avec les opérations déjà présentes, décochés d'office ;
  - solde de l'app après l'import comparé à celui du relevé
- **Apprentissage** : le libellé bancaire de chaque opération est gardé ; le nom et la catégorie choisis sont reproposés au relevé suivant. Renommer une ligne renomme aussi celles du même commerçant
- Enseignes courantes reconnues (McDo, Carrefour, SNCF, Zara, Doctolib…), montant d'origine des paiements à l'étranger mis dans la note

### Opérations récurrentes
- Loyer, abonnements, salaire… : hebdomadaires, mensuelles ou annuelles, avec date de fin facultative
- Les opérations sont créées automatiquement à chaque échéance (une date de départ passée crée aussi les échéances passées)
- Modifier une récurrence ne change que les échéances à venir ; la supprimer garde les opérations déjà créées

### À classer
- Les dépenses dans « Autres » ou sans catégorie, et les revenus sans catégorie, présentés **une par une**
- Un clic (ou une touche de **1** à **9**) pour choisir la catégorie, **0** pour garder « Autres », **Échap** pour passer
- Les opérations au même nom peuvent être classées en même temps ; création d'une catégorie sans quitter la page

### Tableau de bord
- Solde du compte courant mis en avant, les autres comptes en dessous
- Revenus, dépenses, épargne et reste du mois en cours, taux de dépenses
- Objectif d'épargne avec sa progression
- Graphiques sur 6 mois, 12 mois ou tout l'historique : revenus et dépenses, évolution du solde, épargne par mois

### Vue mensuelle
- Revenus (salaire et autres), dépenses, épargne et reste du mois
- Répartition des dépenses par catégorie (graphique en anneau)
- Calendrier des dépenses jour par jour
- Suivi des budgets par catégorie avec alerte en cas de dépassement
- Opérations du mois

### Vue annuelle
- Revenus, dépenses, épargne et reste de l'année
- Tableau des dépenses par catégorie et par mois, avec le total et la moyenne

### Application installable et sauvegardes
- Installable comme une application (Dock, écran d'accueil), thème clair ou sombre
- Sauvegarde automatique quotidienne de la base (voir [Sauvegardes](#sauvegardes))

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
| Lecture des relevés PDF | pdfjs-dist |
| Icônes | Lucide |
| Notifications | Sonner |

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
| `node ace backup:create` | Sauvegarde la base de données |
| `node ace test` | Lance les tests (arrêter le serveur avant : les deux partagent le cache de Vite) |

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

## Sauvegardes

Toutes les données tiennent dans un seul fichier, `tmp/db.sqlite3`, qui n'est pas versionné. L'application en fait donc une copie complète :

- **automatiquement**, une fois par jour, au démarrage du serveur puis à chaque heure si celle du jour manque ;
- **à la demande**, avec le bouton « Sauvegarder maintenant » de la page Mon profil, ou la commande `node ace backup:create`.

Les copies vont dans **iCloud Drive › Mon Budget › Sauvegardes** (ou `~/Documents/Mon Budget/Sauvegardes` sans iCloud). Les 15 plus récentes sont gardées. Pour choisir un autre dossier, définir `BACKUP_DIR` dans `.env`.

### Restaurer une sauvegarde

```bash
# 1. Arrêter le serveur (Ctrl + C, ou pour le démarrage automatique :)
launchctl bootout "gui/$(id -u)/com.monbudget.server"

# 2. Garder la base actuelle de côté, puis la remplacer par la sauvegarde choisie
mv tmp/db.sqlite3 tmp/db.sqlite3.avant-restauration
cp ~/Library/Mobile\ Documents/com~apple~CloudDocs/Mon\ Budget/Sauvegardes/mon-budget-AAAA-MM-JJ_HH-MM-SS.sqlite3 tmp/db.sqlite3

# 3. Relancer (npm run dev, ou pour le démarrage automatique :)
bash scripts/autostart/install.sh
```

## Structure des données

| Table | Champs principaux |
|---|---|
| `users` | nom, email, mot de passe haché |
| `accounts` | user_id, nom, type, solde (initial ou connu), date du solde connu, couleur |
| `categories` | user_id, nom, couleur, budget mensuel |
| `transactions` | user_id, account_id, to_account_id (virements), category_id, recurring_id, type (income / expense / transfer), montant, date, description, note, libellé bancaire, date de classement confirmé |
| `recurring_transactions` | user_id, comptes, catégorie, type, montant, description, fréquence, date de début, date de fin, échéances déjà créées |
| `savings_goals` | user_id, nom, montant visé, date de début, échéance |

Relations :
- un utilisateur possède plusieurs comptes, catégories, opérations et récurrences, et un objectif d'épargne ;
- une opération appartient à un compte et, éventuellement, à une catégorie ; un virement a aussi un compte d'arrivée ;
- supprimer un compte supprime ses opérations (`CASCADE`) ;
- supprimer une catégorie conserve les opérations, sans catégorie (`SET NULL`) ;
- supprimer une récurrence conserve les opérations qu'elle a créées (`SET NULL`).

Le montant est toujours enregistré en positif : c'est le champ `type` qui indique s'il s'agit d'un revenu, d'une dépense ou d'un virement. Les soldes ne sont jamais stockés, ils sont recalculés côté serveur.

## Organisation du code

```
app/
  controllers/   → une page ou un groupe d'actions par contrôleur (dashboard, months, years,
                   transactions, accounts, categories, recurring, imports, triage, settings…)
  services/      → logique métier :
                   budget_service      soldes, bilans du mois et de l'année
                   recurring_service   échéances des opérations récurrentes
                   statement_parser    lecture des relevés BoursoBank (PDF)
                   bank_labels         noms lisibles et enseignes connues
                   import_service      propositions, doublons, apprentissage
                   triage_service      opérations à classer
                   backup_service      sauvegardes de la base
  middleware/    → recurring_middleware : crée les opérations récurrentes arrivées à échéance
  models/        → User, Account, Category, Transaction, RecurringTransaction, SavingsGoal
  validators/    → validation VineJS des formulaires et des filtres
commands/        → node ace backup:create
database/
  migrations/    → création et évolution des tables
inertia/
  pages/         → pages React
  components/    → navigation, formulaires, graphiques, calendrier, notifications
  css/app.css    → styles (thème clair et sombre)
public/          → icônes et manifeste de l'application installable
scripts/
  autostart/     → démarrage automatique sous macOS
start/
  routes.ts      → routes, protégées par le middleware auth
  backup.ts      → sauvegarde quotidienne au démarrage du serveur
tests/unit/      → tests du calcul des échéances récurrentes
```

## Sécurité

- Toutes les pages de l'application sont protégées par le middleware `auth`.
- Les requêtes passent par `user.related(...)` : un utilisateur ne peut ni lire ni modifier les données d'un autre, même en changeant l'identifiant dans l'URL.
- À chaque création ou modification (opération, récurrence, import, classement), le serveur vérifie que les comptes et catégories choisis appartiennent bien à l'utilisateur.
- Changer de mot de passe ou supprimer son compte demande le mot de passe actuel.
- Toutes les données envoyées sont validées avec VineJS ; un relevé importé doit être un PDF de 10 Mo maximum.
- Le fichier `.env` et la base de données ne sont pas versionnés.

## Utilisation de l'IA

**Outil utilisé** : Claude (Anthropic)

**Comment je l'ai utilisé**
- Définir le périmètre du projet à partir d'un cahier des charges
- Concevoir la structure de la base de données
- Comprendre et corriger les erreurs rencontrées
- Débloquer les situations complexes, quand je ne savais pas comment avancer
- Vérifier le rendu des pages et rédiger les commits

**Avantages**
- Explication des messages d'erreur TypeScript et AdonisJS
- Aide pour trouver la cause d'un problème quand le message d'erreur ne suffisait pas (page blanche, affichage cassé)
- Vérification du rendu sur ordinateur et sur téléphone, en thème clair et sombre, à partir de captures d'écran

**Problèmes rencontrés et comment l'IA m'a aidée à les débloquer**

*Mise en place du projet*
- **Version d'AdonisJS récente** : certains exemples ne correspondaient pas à la structure générée (modèles basés sur `#database/schema`, contrôleurs importés via `#generated/controllers`). Il a fallu adapter le code.
- **Dates** : `vine.date()` ne renvoyait pas le format attendu par Lucid, ce qui provoquait l'erreur « Invalid value for Transaction.date ». Corrigé en validant la date comme texte `AAAA-MM-JJ`, puis en la convertissant avec `DateTime.fromISO`.
- **Fichiers `._` de macOS** : le projet étant sur un disque externe, macOS créait des fichiers parasites qu'AdonisJS prenait pour des pages. Corrigé avec un `.gitignore` adapté et une commande de nettoyage.
- **Code mal formaté** : accolades manquantes. Cela m'a appris à bien relire la structure d'une classe.

*Fonctionnalités*
- **Je ne connaissais pas mon solde de départ** : je voulais saisir mes opérations depuis plusieurs mois, mais je ne connaissais que mon solde actuel, et chaque opération ajoutée le faisait bouger. Avec l'IA, j'ai trouvé la solution du « solde connu à une date » : l'app recalcule elle-même le solde de départ, et les opérations plus anciennes ne changent plus le solde d'aujourd'hui.
- **Saisir les relevés à la main était trop long** : plus de 40 opérations par mois. L'IA m'a aidée à construire l'import des relevés PDF. Le plus difficile : un PDF ne contient que des morceaux de texte positionnés, sans tableau. Il a fallu reconstituer les lignes à partir de leur position, et distinguer un débit d'un crédit selon la colonne où se trouve le montant.
- **Être sûre que l'import n'oublie rien** : on vérifie que solde de début + opérations = solde de fin du relevé, et on repère les opérations déjà présentes pour ne pas créer de doublons.
- **Des noms d'opérations illisibles** : « CARTE 05/02/26 SUPER U 9 CB*1969 ». Le nettoyage des libellés retirait trop de choses au début (« Super U » devenait « Super »). Il a fallu affiner les règles en testant sur mes vrais relevés.

*Bugs difficiles à trouver*
- **Page blanche** : lancer les tests pendant que le serveur tournait a abîmé le cache partagé de Vite, et une bibliothèque n'était plus servie. Seul, je n'aurais pas trouvé : aucun message d'erreur côté serveur. L'IA a vérifié un par un les fichiers envoyés au navigateur et repéré une erreur 504. Corrigé en vidant le cache (`node_modules/.vite`) et en redémarrant le serveur.
- **Les messages de confirmation ne s'affichaient jamais** : le composant des notifications n'était présent que dans des mises en page du kit de démarrage qu'aucune page n'utilisait. Corrigé en l'ajoutant à la barre de navigation.
- **Conflit de styles** : une classe CSS réutilisée par erreur (`.b-stats`) a cassé l'affichage des vues Mois et Année. Cela m'a appris à vérifier qu'un nom de classe n'existe pas déjà.
- **Affichage cassé sur téléphone** : la liste des opérations et l'aperçu d'import débordaient de l'écran. Corrigé en affichant une carte par opération sur petit écran.
- **Requête exécutée trop tôt** : une fonction `async` qui renvoie une requête Lucid l'exécute aussitôt, car JavaScript la traite comme une promesse. Corrigé en renvoyant la requête dans un objet.
- **Heure des sauvegardes** : le serveur tourne en UTC (`TZ=UTC`), les noms de fichiers étaient décalés d'une heure. Corrigé en utilisant l'heure de Paris.

**Ce que j'en retiens**
L'IA m'a aidée à débloquer des situations complexes sur lesquelles je serais restée bloquée longtemps : comprendre d'où venait une page blanche sans message d'erreur, lire un PDF bancaire, ou résoudre le problème du solde de départ. Elle accélère beaucoup le développement, mais elle ne connaît pas toujours la version exacte des outils utilisés et peut elle-même introduire des erreurs (le conflit de styles en est un exemple). Il faut lire les messages d'erreur, comprendre le code produit et vérifier chaque étape, sinon on accumule des erreurs difficiles à retrouver.
