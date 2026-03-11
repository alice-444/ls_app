import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { auth } from "../auth";
import { container } from "../di/container";
import { SocketMessageHandler } from "./handlers/message.handler";
import { socketConnections, connectedUsers } from "../metrics/prometheus";

let io: SocketIOServer | null = null;

function buildHeadersAdapter(cookies: string, handshakeHeaders: Record<string, any>) {
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

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3001",
      credentials: true,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) return next(new Error("Authentication required"));

      const headersObj = buildHeadersAdapter(cookies, socket.handshake.headers);
      const session = await auth.api.getSession({ headers: headersObj });

      if (!session?.user) return next(new Error("Unauthorized"));

      (socket as any).userId = session.user.id;
      (socket as any).session = session;
      next();
    } catch {
      next(new Error("Authentication failed"));
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
