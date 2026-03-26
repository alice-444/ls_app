import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { auth } from "../auth";
import { container } from "../di/container";
import { SocketMessageHandler } from "./handlers/message.handler";
import { socketConnections, connectedUsers } from "../metrics/prometheus";

let io: SocketIOServer | null = null;

function buildHeadersAdapter(
  cookies: string,
  handshakeHeaders: Record<string, any>,
) {
  return {
    get: (name: string) => {
      if (name.toLowerCase() === "cookie") return cookies;
      return handshakeHeaders[name.toLowerCase()] as string | undefined;
    },
    has: (name: string) => {
      if (name.toLowerCase() === "cookie") return !!cookies;
      return name.toLowerCase() in handshakeHeaders;
    },
  } as Headers;
}

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:3001",
    "http://localhost:3001",
    "https://app.learnsup.fr",
  ];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
    addTrailingSlash: true, // Plus compatible avec certains proxies
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"], // On remet websocket en premier pour tenter l'upgrade direct
    allowEIO3: true,
    maxHttpBufferSize: 1e7, // 10MB au lieu de 1MB pour les sessions lourdes
    perMessageDeflate: false, // Désactiver la compression pour éviter les conflits avec Traefik
  });

  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        console.log("WebSocket connection rejected: No cookies found");
        return next(new Error("Authentication required"));
      }

      // Build a proper Headers object with ALL handshake headers
      const headersObj = new Headers();
      Object.entries(socket.handshake.headers).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headersObj.append(key, v));
          } else {
            headersObj.set(key, value as string);
          }
        }
      });

      // Timeout de 5s pour Better Auth (si DB est lente/plantée)
      const sessionPromise = auth.api.getSession({ headers: headersObj });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), 5000),
      );

      const session = (await Promise.race([
        sessionPromise,
        timeoutPromise,
      ])) as any;

      if (!session?.user) {
        console.warn(
          "WebSocket connection rejected: Session not found or DB error",
        );
        return next(new Error("Unauthorized"));
      }

      (socket as any).userId = session.user.id;
      (socket as any).session = session;
      next();
    } catch (error) {
      console.error("WebSocket auth error (likely DB):", error);
      // Ne pas crasher, mais refuser la connexion proprement
      next(new Error("Authentication service unavailable"));
    }
  });

  const messageHandler = new SocketMessageHandler(io, {
    messagingService: container.messagingService,
    appUserRepository: container.appUserRepository,
    conversationRepository: container.conversationRepository,
    messageRepository: container.messageRepository,
    enrichmentService: container.messageEnrichmentService,
    messageReactionService: container.messageReactionService,
    messageReactionRepository: container.messageReactionRepository,
  });

  io.on("connection", async (socket) => {
    const userId = (socket as any).userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    socketConnections.inc();

    // Track user role for business metrics
    let userRole = "UNKNOWN";
    try {
      const appUser = await container.appUserRepository.findByUserId(userId);
      if (appUser?.role) {
        userRole = appUser.role;
        connectedUsers.labels(userRole).inc();
      }
    } catch (e) {
      console.error("Failed to fetch user role for metrics:", e);
    }

    socket.join(`user:${userId}`);

    // Add admins to a special room for notifications
    if (userRole === "ADMIN") {
      socket.join("admins");
      console.info(`Admin joined admins room: ${userId}`);
    }

    await container.presenceService.updateUserPresence(userId, true);
    socket.broadcast.emit("user-online", { userId });

    messageHandler.registerHandlers(socket, userId);

    socket.on("disconnect", async () => {
      socketConnections.dec();
      if (userRole !== "UNKNOWN") {
        connectedUsers.labels(userRole).dec();
      }

      await container.presenceService.updateUserPresence(userId, false);
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
