# VEILLE.md

Veille technique structurée autour de la question **"Pourquoi ?"**.
Chaque choix technique est justifié : quelle alternative existait, pourquoi on a retenu cette solution.

---

## Pourquoi un monorepo avec pnpm ?

### Qu'est-ce qu'un monorepo ?
Un monorepo est un dépôt Git unique qui contient plusieurs projets ou packages. L'alternative est le "polyrepo" : un repo par projet.

### Alternatives considérées
- **Polyrepo** (un repo `web-app`, un repo `web-api`) : plus simple à démarrer, mais on perd la cohérence entre les projets — versions de TypeScript différentes, duplication de config ESLint, impossibilité de partager des types communs facilement.
- **Turborepo** : outil monorepo plus avancé avec cache de build distribué. Plus puissant mais plus complexe à configurer. Pertinent pour des équipes plus grandes.
- **Nx** : encore plus complet, orienté entreprise. Sur-dimensionné pour un projet à 2 services.

### Pourquoi pnpm ?
pnpm utilise un store global sur la machine : chaque dépendance est installée une seule fois, puis des **liens symboliques** sont créés dans les `node_modules` de chaque package. Résultat : installations jusqu'à 2x plus rapides que npm, et bien moins d'espace disque.

npm et yarn installent une copie complète de chaque dépendance par projet. Avec un monorepo, ça représente rapidement plusieurs Go de `node_modules` dupliqués.

**Sources :**
- https://www.enolacasielles.com/en/blog/monorepo
- https://dev.to/vinomanick/create-a-monorepo-using-pnpm-workspace-1ebn

---

## Pourquoi Socket.IO et pas WebSocket natif ?

### Le problème que Socket.IO résout
WebSocket est un protocole de communication bidirectionnelle persistante entre un client et un serveur. Une fois la connexion établie, elle reste ouverte — contrairement à HTTP qui ferme la connexion après chaque requête/réponse.

WebSocket natif (API `new WebSocket()` dans le navigateur) fonctionne, mais impose de tout gérer soi-même :
- Reconnexion en cas de coupure réseau
- Fallback si le WebSocket est bloqué par un proxy
- Diffusion à plusieurs clients (rooms)
- Format des messages

### Ce que Socket.IO ajoute
Socket.IO enveloppe WebSocket et fournit :
- **Reconnexion automatique** : si le réseau coupe, le client se reconnecte sans intervention.
- **Fallback HTTP polling** : si WebSocket est bloqué (réseau d'entreprise, proxy strict), Socket.IO repasse automatiquement sur du polling HTTP long. La communication fonctionne quand même, moins efficacement.
- **Rooms** : système de groupes de sockets intégré. `socket.join("ma-room")` et `io.to("ma-room").emit(...)` suffisent. En WebSocket natif, il faudrait gérer une Map de connexions manuellement.
- **Événements nommés** : `socket.on("join-room", ...)` est bien plus lisible que parser manuellement des messages JSON bruts.

### Pourquoi pas Server-Sent Events (SSE) ?
SSE est une alternative légère pour envoyer des données du serveur vers le client. Mais SSE est **unidirectionnel** (serveur → client uniquement). Pour un chat, on a besoin des deux sens : le client envoie des messages, le serveur les broadcast. SSE ne convient pas.

**Source :** https://socket.io/docs/v4/

---

## Pourquoi Docker ?

### Le problème sans Docker
Sans conteneurisation, "ça marche sur ma machine" est un problème réel. Les versions de Node.js, les variables d'environnement, les dépendances système peuvent différer entre le poste d'un développeur, la CI et le serveur de production.

### Ce que Docker apporte
Docker isole chaque service dans un **conteneur** : un environnement reproductible avec son OS minimal, sa version de Node.js, ses dépendances. Le même conteneur tourne identiquement partout.

### Docker vs machine virtuelle (VM)
Une VM recrée un système d'exploitation complet — plusieurs Go. Docker partage le noyau du système hôte et simule uniquement ce qui est nécessaire. Un conteneur Docker démarre en secondes, une VM en minutes.

### Pourquoi multi-stage ?
Sans multi-stage, l'image finale contiendrait Node.js, tous les outils de build, les `node_modules` de dev — des centaines de Mo inutiles en production.

Avec multi-stage :
- **Stage 1** : on installe tout, on compile le TypeScript ou on build Vite.
- **Stage 2** : on copie uniquement le résultat (fichiers JS compilés ou fichiers HTML/CSS/JS du build Vite). Pour le front, Nginx suffit — Node.js n'est plus nécessaire.

L'image finale est plus légère, plus rapide à déployer et expose moins de surface d'attaque.

Docker met aussi en **cache** chaque layer. Si le code source n'a pas changé mais que les dépendances non plus, Docker réutilise le cache — le build est quasi-instantané.

---

## Pourquoi Nginx ?

### Qu'est-ce qu'un reverse proxy ?
Un reverse proxy est un intermédiaire entre le navigateur et les services backend. Le navigateur ne sait pas qu'il parle à plusieurs services — il ne voit qu'une seule URL.

Nginx dans ce projet :
- Sert les fichiers statiques React (HTML, CSS, JS) directement depuis le disque.
- Redirige `/api/*` vers le service web-api (HTTP classique).
- Redirige `/socket.io/` vers le service web-api avec upgrade WebSocket.

### Pourquoi pas juste Express pour tout servir ?
On pourrait servir les fichiers statiques React depuis Express avec `express.static()`. Mais Nginx est bien plus performant pour servir des fichiers statiques (conçu pour ça, gestion du cache HTTP, compression gzip). Express est conçu pour la logique applicative, pas pour servir des assets.

### Nginx vs Load Balancer
Un load balancer répartit le trafic entre plusieurs instances d'un même service pour absorber la charge. Nginx peut aussi faire ça, mais ici on l'utilise uniquement comme reverse proxy — une seule instance de chaque service.

### Pourquoi les WebSockets nécessitent une config spéciale dans Nginx ?
HTTP est un protocole sans état (chaque requête est indépendante). WebSocket démarre par une requête HTTP spéciale (`Upgrade: websocket`) qui "upgrade" la connexion en connexion persistante bidirectionnelle. Nginx doit explicitement autoriser cet upgrade :

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Sans ces lignes, Nginx ferme la connexion après la requête HTTP initiale et Socket.IO ne peut pas établir la connexion WebSocket.

---

## Pourquoi Helmet ?

### Le problème
Par défaut, Express ne met aucun header de sécurité dans ses réponses HTTP. Un navigateur reçoit la réponse et n'a aucune instruction sur ce qui est autorisé ou non : iframes, scripts externes, types de contenu…

### Ce que Helmet fait
Helmet est un middleware Express qui injecte automatiquement une dizaine de headers HTTP de sécurité :

| Header | Rôle |
|--------|------|
| `X-Frame-Options: DENY` | Interdit d'intégrer le site dans une iframe → protection contre le clickjacking |
| `X-Content-Type-Options: nosniff` | Interdit au navigateur de "deviner" le type MIME → protection contre le MIME sniffing |
| `Strict-Transport-Security` | Force HTTPS → protection contre les attaques man-in-the-middle |
| `Content-Security-Policy` | Définit les sources de contenu autorisées (scripts, styles, images…) |

Une seule ligne de code (`app.use(helmet())`) active tout ça — pas de raison de s'en passer.

**Preuve :** `curl -I https://web-api-cgfe.onrender.com/health` affiche ces headers dans la réponse.

---

## Pourquoi le rate limiting ?

### Le problème
Sans limite, n'importe qui peut envoyer des milliers de requêtes par seconde vers l'API. Deux conséquences :
- **DoS (Denial of Service)** : le serveur est saturé, plus personne ne peut l'utiliser.
- **Brute force** : un attaquant peut tester des milliers de combinaisons de valeurs.

### La solution
`express-rate-limit` bloque une IP après un certain nombre de requêtes dans une fenêtre de temps. Ici : 100 requêtes par minute. Au-delà, le serveur répond `429 Too Many Requests`.

C'est une protection basique mais efficace pour une V1. En production à grande échelle, on ajouterait un rate limiting au niveau de l'infrastructure (Nginx, Cloudflare) plutôt qu'au niveau applicatif.

---

## Pourquoi YAML pour render.yaml et docker-compose ?

YAML (Yet Another Markup Language) est un format de sérialisation de données lisible par les humains. Il est utilisé massivement pour la configuration d'infrastructure : Docker Compose, GitHub Actions, Kubernetes, Render Blueprints…

`.yaml` et `.yml` sont exactement identiques — c'est juste une convention d'extension. Les deux sont acceptés partout.

YAML a été choisi (plutôt que JSON ou TOML) pour sa lisibilité : pas de guillemets sur les clés, indentation pour la hiérarchie, commentaires possibles avec `#`.

---

## Pourquoi TypeScript et pas JavaScript ?

TypeScript ajoute un système de types statiques sur JavaScript. Le compilateur détecte les erreurs de type **avant** l'exécution, pas pendant. Sur un projet avec une communication socket (données qui transitent entre client et serveur sans schéma forcé), typer les payloads des événements (`{ pseudo: string; room: string }`) permet d'attraper les bugs dès le développement.

Coût : un peu plus de configuration (tsconfig.json), une étape de compilation supplémentaire. Bénéfice : beaucoup moins de bugs silencieux en production.

---

## Pourquoi pas de base de données ?

Ce projet est une V1 "concept". Ajouter une base de données (PostgreSQL, MongoDB…) aurait complexifié :
- L'infrastructure (un 3ème service à déployer)
- Le code (ORM, migrations, connexion)
- Les coûts Render

Le choix d'une `Map` en mémoire est assumé et documenté. Les données sont perdues au redémarrage du serveur. Pour une V2, on ajouterait Redis pour la persistance des rooms (léger, adapté aux données temporaires) ou PostgreSQL pour l'historique des messages.