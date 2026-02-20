import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const httpServer = createServer(app); // Socket.IO a besoin du serveur HTTP natif, pas d'express directement

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// --- Middlewares de sécurité ---

app.use(helmet()); // Ajoute des headers de sécurité HTTP (X-Frame-Options, CSP, etc.)

app.use(
    rateLimit({
      windowMs: 60 * 1000, // fenêtre de 1 minute
      max: 100,            // max 100 requêtes HTTP par IP par fenêtre
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Trop de requêtes, réessaie dans une minute." },
      // Note : le rate-limit ici couvre les routes HTTP.
      // Les événements Socket.IO sont gérés séparément côté sockets.
    })
);

app.use(express.json());

// --- Routes HTTP ---

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --- Logique Socket.IO ---

// Structure en mémoire : roomName -> Set de pseudos connectés
// Pas de BDD, tout est perdu au redémarrage (assumé et documenté)
const rooms = new Map<string, Set<string>>();

// Validation basique des entrées
function isValidString(value: unknown, maxLength: number): value is string {
  return (
      typeof value === "string" &&
      value.trim().length > 0 &&
      value.trim().length <= maxLength
  );
}

io.on("connection", (socket) => {
  console.log(`[socket] connecté : ${socket.id}`);

  // Stocke le contexte de ce socket pour le disconnect
  let currentRoom: string | null = null;
  let currentPseudo: string | null = null;

  // --- Événement : rejoindre une room ---
  // Payload attendu : { pseudo: string, room: string }
  socket.on("join-room", ({ pseudo, room }: { pseudo: unknown; room: unknown }) => {
    // Validation
    if (!isValidString(pseudo, 20)) {
      socket.emit("error", { message: "Pseudo invalide (1-20 caractères)." });
      return;
    }
    if (!isValidString(room, 30)) {
      socket.emit("error", { message: "Nom de room invalide (1-30 caractères)." });
      return;
    }

    const cleanPseudo = pseudo.trim();
    const cleanRoom = room.trim();

    // Quitter l'ancienne room si déjà dans une
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.delete(currentPseudo!);
      io.to(currentRoom).emit("user-left", {
        pseudo: currentPseudo,
        usersCount: rooms.get(currentRoom)?.size ?? 0,
      });
    }

    // Rejoindre la nouvelle room
    socket.join(cleanRoom);
    currentRoom = cleanRoom;
    currentPseudo = cleanPseudo;

    // Ajouter le pseudo à la room en mémoire
    if (!rooms.has(cleanRoom)) {
      rooms.set(cleanRoom, new Set());
    }
    rooms.get(cleanRoom)!.add(cleanPseudo);

    // Confirmer au client qu'il a rejoint
    socket.emit("joined", {
      room: cleanRoom,
      pseudo: cleanPseudo,
      usersCount: rooms.get(cleanRoom)!.size,
    });

    // Notifier les autres dans la room
    socket.to(cleanRoom).emit("user-joined", {
      pseudo: cleanPseudo,
      usersCount: rooms.get(cleanRoom)!.size,
    });

    console.log(`[socket] ${cleanPseudo} a rejoint la room "${cleanRoom}"`);
  });

  // --- Événement : envoyer un message ---
  // Payload attendu : { content: string }
  socket.on("send-message", ({ content }: { content: unknown }) => {
    // Doit être dans une room pour envoyer
    if (!currentRoom || !currentPseudo) {
      socket.emit("error", { message: "Rejoins une room avant d'envoyer un message." });
      return;
    }

    // Validation
    if (!isValidString(content, 500)) {
      socket.emit("error", { message: "Message invalide (1-500 caractères)." });
      return;
    }

    const message = {
      pseudo: currentPseudo,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Broadcast à toute la room (émetteur inclus via io.to, pas socket.to)
    io.to(currentRoom).emit("new-message", message);
  });

  // --- Événement : déconnexion ---
  socket.on("disconnect", () => {
    if (currentRoom && currentPseudo) {
      rooms.get(currentRoom)?.delete(currentPseudo);

      // Nettoyer la room si elle est vide
      if (rooms.get(currentRoom)?.size === 0) {
        rooms.delete(currentRoom);
      }

      io.to(currentRoom).emit("user-left", {
        pseudo: currentPseudo,
        usersCount: rooms.get(currentRoom)?.size ?? 0,
      });

      console.log(`[socket] ${currentPseudo} a quitté "${currentRoom}"`);
    }

    console.log(`[socket] déconnecté : ${socket.id}`);
  });
});

// --- Démarrage ---

httpServer.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
