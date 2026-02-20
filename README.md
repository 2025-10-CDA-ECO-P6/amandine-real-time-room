# amandine-real-time-room

## 🔗 Démo
Le projet est en cours de développement.

- **Web App (Front React)** : [https://web-app-2d0i.onrender.com](https://web-app-2d0i.onrender.com)
- **Web API (Backend Express)** : [https://web-api-cgfe.onrender.com](https://web-api-cgfe.onrender.com)

---

## 📋 Description

Ce projet a pour objectif de créer une **application en temps réel** avec une architecture **mono-repo**.

Le focus principal est :

- Comprendre chaque ligne de code et chaque dépendance.
- Mettre en place une **architecture scalable** et maintenable pour le front et le back.
- Créer un environnement de développement **réaliste et sécurisé**.
- Favoriser le travail en groupe et l’intelligence collective.

Le projet inclut notamment :

- Un **front en React (TypeScript)**
- Un **back en Express (TypeScript)**
- Une **architecture mono-repo avec PNPM** pour mutualiser les dépendances

---

## 🗂️ Arborescence du projet

amandine-real-time-room/
├── apps/
│ ├── web-api/ # Backend Express TS
│ └── web-app/ # Front React TS
├── packages/
│ └── core/ # Packages partagés
├── node_modules/
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md


Chaque application (`web-app` et `web-api`) dispose de son propre `package.json`, mais les dépendances communes sont **mutualisées** grâce à PNPM.

---

## ⚙️ Stack technique

| Technologie | Rôle |
|------------|------|
| **React + TypeScript** | Frontend interactif |
| **Express + TypeScript** | Backend REST et WebSocket |
| **PNPM** | Gestion des dépendances et workspace mono-repo |
| **ESLint** | Linter pour garantir la qualité du code |
| **Nodemon** | Rechargement automatique du serveur backend |
| **Vite** | Build tool et dev server pour le frontend |

---

## 🏗️ Architecture et workflow

1. **Mono-repo PNPM**
    - Permet de mutualiser les dépendances entre plusieurs applications et packages.
    - Gestion plus efficace de `node_modules` grâce aux liens symboliques.
    - Idéal pour travailler avec plusieurs projets front ou back dans un même repo.

2. **Frontend (`web-app`)**
    - Créé avec **Vite + React + TypeScript**
    - Structure typique : `src/App.tsx`, `index.html`, `vite.config.ts`
    - Linting avec **ESLint + React plugin**

3. **Backend (`web-api`)**
    - Créé avec **Express + TypeScript**
    - `nodemon.json` pour recharger le serveur automatiquement
    - `tsconfig.json` pour gérer le TypeScript du backend

4. **Packages partagés (`packages/core`)**
    - Contient des configurations et scripts réutilisables pour le front et le back
    - Exemple : `nodemon.json` partagé ou types communs

---

## 🚀 Installation & lancement

```bash
# Cloner le projet
git clone https://github.com/2025-10-CDA-ECO-P6/amandine-real-time-room.git
cd amandine-real-time-room

# Installer toutes les dépendances depuis le workspace PNPM
pnpm install

# Lancer le backend en dev
cd apps/web-api
pnpm run dev

# Lancer le frontend en dev
cd ../web-app
pnpm run dev
```

Chaque application peut être démarrée indépendamment, mais elles partagent les packages communs du mono-repo.

## 🖼️ Maquettes

<table>
  <tr>
    <td><img src="TODO"/></td>
  </tr>
</table>

---

## 👤 Contact

**Amandine** – Développeuse

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/amandinekemp)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/amandinedelbouve/)
