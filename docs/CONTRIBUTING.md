# CONTRIBUTING.md

Guide de contribution au projet **amandine-real-time-room**.

---

## Workflow Git

### Branches

On suit une convention de nommage simple :

```
main          ← code stable, déployé sur Render
feat/nom      ← nouvelle fonctionnalité
fix/nom       ← correction de bug
docs/nom      ← documentation uniquement
chore/nom     ← config, deps, outillage
```

Exemples :
```
feat/socket-rooms
fix/nginx-proxy-websocket
docs/veille-socketio
chore/add-helmet
```

### Conventional Commits

Chaque commit doit respecter la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description courte en français ou anglais

feat(back): ajout de l'événement join-room
fix(front): correction du scroll automatique des messages
docs(readme): ajout section sécurité
chore(deps): ajout helmet et express-rate-limit
style(scss): correction indentation _chat.scss
```

Types autorisés : `feat`, `fix`, `docs`, `style`, `chore`, `refactor`, `test`

> Lefthook peut être configuré en local pour valider les commits automatiquement.
> Voir : https://github.com/Christophe-008/git-conventional-commit-guard

---

## Scripts disponibles

Tous les scripts se lancent depuis la **racine du monorepo**.

```bash
pnpm install          # installe toutes les dépendances (root + packages)
pnpm dev              # lance front (port 5173) et back (port 3000) en parallèle
pnpm lint             # lance ESLint sur tout le monorepo
pnpm build            # build production de tous les packages
```

Scripts par package :
```bash
pnpm --filter web-app dev     # lance uniquement le front
pnpm --filter web-api dev     # lance uniquement le back
pnpm --filter web-app build   # build Vite du front
pnpm --filter web-api build   # compile TypeScript du back
```

Ajouter une dépendance à un package spécifique :
```bash
pnpm add <package> --filter web-app    # dépendance front
pnpm add <package> --filter web-api    # dépendance back
pnpm add -D <package> --filter web-app # dépendance de dev front
```

> Ne jamais utiliser `npm` ou `yarn` dans ce projet — uniquement `pnpm`.

---

## Conventions SCSS / BEM

### BEM — Block Element Modifier

BEM est la convention de nommage CSS utilisée dans tout le projet.

```
.block {}                  ← composant autonome
.block__element {}         ← partie du composant
.block__element--modifier {} ← variante d'un élément
```

Exemples concrets du projet :
```scss
.join {}                   // bloc : écran formulaire
.join__card {}             // élément : la carte centrale
.join__input {}            // élément : champ de saisie
.join__btn {}              // élément : bouton
.join__btn--disabled {}    // modificateur : bouton désactivé

.chat {}                   // bloc : écran de chat
.chat__header {}           // élément : barre du haut
.chat__msg {}              // élément : un message
.chat__msg--own {}         // modificateur : notre propre message
.chat__bubble {}           // élément : bulle de texte
```

### Règles SCSS

**Structure des fichiers :**
```
styles/
├── main.scss            ← point d'entrée, importe tout
├── _variables.scss      ← tokens : couleurs, espacements, breakpoints
└── components/
    ├── _join.scss       ← styles du bloc .join
    └── _chat.scss       ← styles du bloc .chat
```

**Règles à respecter :**

- Le `_` en préfixe indique un "partial" SCSS — il n'est jamais compilé seul.
- Utiliser `@use` et non `@import` (déprécié depuis Sass 1.23).
- Les variables globales sont toutes dans `_variables.scss`. Ne pas mettre de valeurs en dur dans les composants.
- Nesting SCSS limité à 3 niveaux maximum pour rester lisible.
- Mobile-first : le CSS de base cible le mobile, les `@media` ajoutent le desktop.

```scss
// ✅ Correct
.chat {
  display: flex;

  @media (min-width: $bp) {
    display: grid;
  }

  &__header {
    padding: $space-md;
  }
}

// ❌ Interdit
.chat .chat__header .chat__header-title span { ... } // trop profond
#chat { ... }                                         // pas d'ID en CSS
```

---

## Règles CI (à venir J3)

Un workflow GitHub Actions sera mis en place pour lancer ESLint automatiquement sur chaque push et pull request.

Fichier : `.github/workflows/lint.yml`

```yaml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm lint
```

> Tant que la CI n'est pas en place, lancer `pnpm lint` manuellement avant chaque push.

---

## Docker — bonnes pratiques

- Toujours builder depuis la **racine du monorepo** (contexte Docker = racine).
- Ne jamais committer `node_modules` — le `.dockerignore` doit l'exclure.
- Tester l'image localement avant de push sur `main`.

```bash
# Vérifier que l'image tourne correctement
docker build -f apps/web-api/Dockerfile -t test-api .
docker run -p 3000:3000 test-api
curl http://localhost:3000/health
```

---

## Sécurité — rappels

- Ne jamais committer de secrets ou variables d'environnement dans le code.
- Les variables sensibles sont déclarées dans Render (dashboard) et en local dans `.env` (non commité).
- `.env` doit être dans `.gitignore`.