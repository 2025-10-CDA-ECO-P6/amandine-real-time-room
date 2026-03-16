# amandine-real-time-room

## 🔗 Démo
Le projet est en cours de développement.

- **Web App (Front React)** : [https://web-app-2d0i.onrender.com](https://web-app-2d0i.onrender.com)
- **Web API (Backend Express)** : [https://web-api-cgfe.onrender.com](https://web-api-cgfe.onrender.com)
- **Health check** : [https://web-api-cgfe.onrender.com/health](https://web-api-cgfe.onrender.com/health)

---

## 📋 Description

Ce projet a pour objectif de créer une **application en temps réel** avec une architecture **mono-repo**.

Le focus principal est :

- Mettre en place une **architecture scalable** et maintenable pour le front et le back.
- Créer un environnement de développement **réaliste et sécurisé**.
- Favoriser le travail en groupe et l'intelligence collective.

Le projet inclut notamment :

- Un **front en React (TypeScript)** avec SCSS/BEM et layout asymétrique
- Un **back en Express + Socket.IO (TypeScript)**
- Une **architecture mono-repo avec PNPM** pour mutualiser les dépendances
- Un **déploiement Render** via Docker (2 conteneurs)

---

## 📊 Statut des jalons

| Jalon | Statut | Détail |
|-------|--------|--------|
| J1 — Monorepo + Docker + Render + `/health` | ✅ Fait | 2 services déployés sur Render |
| J2 — UI mobile-first SCSS/BEM + asymétrie | ✅ Fait | Grid desktop asymétrique, BEM strict |
| J2-3 — Socket.IO rooms + sécurité + Swagger | 🟡 Partiel | Socket.IO ✅, Swagger ❌ à faire |
| J3 — CI ESLint + docs complètes | 🟡 Partiel | GitHub Actions, CONTRIBUTING.md, VEILLE.md |

---

## 🗂️ Arborescence du projet

```
amandine-real-time-room/
├── apps/
│   ├── web-api/                  ← Backend Express + Socket.IO (TypeScript)
│   │   ├── src/
│   │   │   └── server.ts         ← routes HTTP + Socket.IO
│   │   └── Dockerfile            ← multi-stage : build TS + run Node
│   └── web-app/                  ← Front React + Vite + SCSS
│       ├── src/
│       │   ├── App.tsx           ← orchestrateur : gère le socket et les vues
│       │   ├── JoinRoom.tsx      ← formulaire pseudo + room
│       │   ├── ChatRoom.tsx      ← affichage messages + compositeur
│       │   └── styles/
│       │       ├── main.scss     ← point d'entrée SCSS
│       │       ├── _variables.scss
│       │       └── components/
│       │           ├── _join.scss
│       │           └── _chat.scss
│       ├── nginx.conf            ← proxy /api et /socket.io → web-api
│       └── Dockerfile            ← multi-stage : build Vite + serve Nginx
├── node_modules/
├── package.json                  ← scripts root (dev, lint, build)
├── pnpm-lock.yaml
├── pnpm-workspace.yaml           ← déclare les packages du monorepo
├── render.yaml                   ← Blueprint Render (2 services)
└── README.md
```

### Schéma de flux

```
Navigateur
    │ HTTP / WebSocket
    ▼
web-app (Render) — React + Nginx
    │
    ├── /api/*      → HTTP      → web-api :3000
    └── /socket.io/ → WebSocket → web-api :3000
```

**Pourquoi ce découpage ?**
Le front (React) est un ensemble de fichiers statiques servis par Nginx. Nginx joue le rôle de reverse proxy : il reçoit toutes les requêtes et redirige `/api` et `/socket.io` vers le back. Cela évite les problèmes de CORS et centralise le point d'entrée.

---

## ⚙️ Stack technique

| Technologie | Rôle |
|------------|------|
| **React + TypeScript** | Frontend interactif |
| **Express + TypeScript** | Backend REST |
| **Socket.IO** | Communication temps réel (rooms, messages) |
| **SCSS + BEM** | Styles structurés, convention de nommage CSS |
| **PNPM** | Gestion des dépendances et workspace mono-repo |
| **Nginx** | Serveur web + reverse proxy (front → back) |
| **Docker** | Conteneurisation des 2 services (multi-stage) |
| **Render** | Hébergement cloud (Blueprint via render.yaml) |
| **Helmet** | Headers de sécurité HTTP automatiques |
| **express-rate-limit** | Protection contre les attaques DoS |
| **ESLint** | Linter pour garantir la qualité du code |
| **Vite** | Build tool et dev server pour le frontend |

---

## 🏗️ Architecture et workflow

### 1. Mono-repo PNPM — Pourquoi ?

Un monorepo regroupe plusieurs packages dans un seul dépôt Git. Les avantages ici :

- **Dépendances mutualisées** : pnpm installe React, TypeScript, etc. une seule fois dans `node_modules` à la racine, et crée des liens symboliques dans chaque package. Moins d'espace disque, installations plus rapides.
- **Scripts unifiés** : `pnpm dev` au root lance front et back simultanément.
- **Cohérence** : une seule version de TypeScript, un seul ESLint pour tout le projet.

`pnpm-workspace.yaml` déclare les packages :
```yaml
packages:
  - 'apps/*'
```

### 2. Frontend (`web-app`)

- Créé avec **Vite + React + TypeScript**
- SCSS/BEM : convention de nommage (`.join__card`, `.chat__msg--own`)
- Layout **mobile-first** : flex colonne sur mobile, Grid asymétrique (`200px 1fr`) sur desktop
- Linting avec **ESLint + React plugin**

### 3. Backend (`web-api`)

- **Express + Socket.IO + TypeScript**
- Sécurité : Helmet (headers HTTP) + rate-limit (429 au-delà de 100 req/min)
- Stockage en mémoire (`Map`) — pas de base de données
- Route `/health`

### 4. Nginx — Pourquoi ?

Nginx est un serveur web et reverse proxy. Il reçoit les requêtes HTTP/WebSocket du navigateur et les redirige vers le bon service :
- Requêtes vers `/api/*` → forward vers le service web-api
- Requêtes vers `/socket.io/` → forward vers web-api avec upgrade WebSocket
- Tout le reste → sert les fichiers statiques React (`index.html`, JS, CSS)

---

## 🚀 Installation & lancement

```bash
# Cloner le projet
git clone https://github.com/2025-10-CDA-ECO-P6/amandine-real-time-room.git
cd amandine-real-time-room

# Installer toutes les dépendances depuis le workspace PNPM
pnpm install

# Lancer front et back en parallèle
pnpm dev
```

Le front tourne sur `http://localhost:5173`, le back sur `http://localhost:3000`.
Vite proxifie `/socket.io` vers le back — pas de CORS en développement.

### Variables d'environnement

| Variable | Où | Valeur par défaut | Description |
|----------|----|-------------------|-------------|
| `PORT` | web-api | `3000` | Port du serveur Express |
| `VITE_API_URL` | web-app | `''` (vide) | URL du back en prod (vide = même domaine via Nginx) |

---

## 🐳 Docker

### Pourquoi Docker ?

Docker isole chaque service dans un conteneur avec son propre environnement. Cela garantit que le code fonctionne de la même façon en local, en CI et en production — peu importe le système d'exploitation de la machine.

### Pourquoi multi-stage ?

Le build multi-stage utilise plusieurs étapes dans un seul Dockerfile :
- **Stage 1 (build)** : installe les dépendances et compile le code. Node.js y est nécessaire.
- **Stage 2 (run)** : copie uniquement le résultat compilé. Node.js n'est plus nécessaire pour le front (Nginx suffit), ce qui réduit fortement la taille de l'image finale.

Chaque stage est mis en cache par Docker : si les fichiers sources n'ont pas changé, Docker réutilise le cache et le build est instantané.

### Commandes Docker

```bash
# ── Front ──────────────────────────────────────────────
docker build -f apps/web-app/Dockerfile -t image-app-real-time-room .
docker run -d -p 80:80 --name app-real-time-room image-app-real-time-room
docker start app-real-time-room
docker stop app-real-time-room

# ── Back ───────────────────────────────────────────────
docker build -f apps/web-api/Dockerfile -t image-api-real-time-room .
docker run -d -p 3030:3000 --name api-real-time-room image-api-real-time-room
docker stop api-real-time-room

# ── Utilitaires ────────────────────────────────────────
docker ps -a                          # voir tous les conteneurs
docker build --no-cache -f ...        # forcer un rebuild complet
```

---

## ☁️ Déploiement Render

Le fichier `render.yaml` (Blueprint) décrit les 2 services Render en code. Il permet de recréer tout l'environnement de production en un clic.

**Pourquoi YAML ?** YAML est un format de configuration lisible par les humains, utilisé pour décrire des infrastructures (Docker Compose, GitHub Actions, Render…). `.yaml` et `.yml` sont identiques — c'est une convention d'extension.

Render ne supporte pas Docker Compose : chaque service est déclaré séparément dans `render.yaml`.

---

## ⚡ Socket.IO — Fonctionnement

### Pourquoi Socket.IO et pas WebSocket natif ?

WebSocket est le protocole bas niveau. Socket.IO est une bibliothèque qui l'enveloppe et ajoute :
- Reconnexion automatique en cas de coupure réseau
- Fallback sur le polling HTTP si WebSocket est bloqué (proxy strict, réseau d'entreprise)
- Système de rooms (groupes de sockets) intégré
- Émission/écoute d'événements nommés (plus lisible que des messages bruts)

### Événements implémentés

| Événement | Direction | Payload | Description |
|-----------|-----------|---------|-------------|
| `join-room` | Client → Serveur | `{ pseudo, room }` | Rejoindre une room |
| `send-message` | Client → Serveur | `{ content }` | Envoyer un message |
| `new-message` | Serveur → Room | `{ pseudo, content, timestamp }` | Broadcast d'un message |
| `user-joined` | Serveur → Room | `{ pseudo }` | Notification d'arrivée |
| `user-left` | Serveur → Room | `{ pseudo }` | Notification de départ |
| `disconnect` | automatique | — | Socket fermé |

### Stockage en mémoire

Les utilisateurs sont stockés dans une `Map` JavaScript côté serveur. **Il n'y a pas de base de données.** Les données sont perdues au redémarrage du serveur, c'est voulu.

```
Map<socket.id, { pseudo, room }>
```

---

## 🔒 Sécurité

### Helmet — Pourquoi ?

Helmet injecte automatiquement des headers HTTP de sécurité sur chaque réponse :
- `X-Frame-Options` : empêche le clickjacking (intégration dans une iframe malveillante)
- `X-Content-Type-Options` : empêche le MIME sniffing
- `Content-Security-Policy` : restreint les sources de contenu autorisées

**Preuve** : `curl -I https://web-api-cgfe.onrender.com/health` — les headers apparaissent dans la réponse.

### Rate Limiting — Pourquoi ?

Sans limite, un attaquant peut envoyer des milliers de requêtes par seconde et saturer le serveur (attaque DoS). Le rate limiter bloque une IP après 100 requêtes par minute et retourne un `429 Too Many Requests`.

### Validation des entrées

Les champs pseudo (max 20 chars), room (max 30 chars) et message (max 500 chars) sont validés côté serveur avant tout traitement.

---

## 🎨 UI — SCSS / BEM

### Convention BEM

BEM (Block Element Modifier) est une convention de nommage CSS :
- **Block** : composant autonome → `.join`, `.chat`
- **Element** : partie d'un block → `.join__card`, `.chat__bubble`
- **Modifier** : variante → `.chat__msg--own`, `.join__btn--disabled`

Avantage : les noms de classes sont auto-documentés et évitent les conflits entre composants.

### Mobile-first

Le CSS de base cible le mobile (flex, colonne). Les médias queries `@media (min-width: 768px)` ajoutent le layout desktop par-dessus. On part du plus contraint vers le plus complexe.

### Asymétrie desktop

Sur desktop, le layout passe sur CSS Grid avec `grid-template-columns: 200px 1fr` — une sidebar étroite à gauche et le contenu à droite, créant l'asymétrie voulue par le wireframe.

---

## ✅ Ce qui reste à faire

- [ ] **Swagger / OpenAPI** : documenter la route `/health` et les événements Socket.IO sur `/api-docs`
- [ ] **GitHub Actions CI** : workflow ESLint sur chaque push/PR

---

## 👤 Contact

**Amandine** – Développeuse

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/amandinekemp)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/amandinedelbouve/)