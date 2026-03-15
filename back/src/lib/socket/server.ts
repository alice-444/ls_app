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
    "https://app.learnsup.fr"
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
    addTrailingSlash: false,
    pingTimeout: 60000, // Increased for better stability in production
    pingInterval: 25000, // Adjusted to match common proxy timeouts
    transports: ["polling", "websocket"], // Polling first is more robust for fallback
  });

  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        console.log("WebSocket connection rejected: No cookies found");
        return next(new Error("Authentication required"));
      }

      // Build a proper Headers object for Better Auth
      const headersObj = new Headers();
      headersObj.set("cookie", cookies);
      // Copy other relevant headers
      const handshakeHeaders = socket.handshake.headers;
      if (handshakeHeaders["user-agent"]) headersObj.set("user-agent", handshakeHeaders["user-agent"] as string);
      if (handshakeHeaders["x-forwarded-for"]) headersObj.set("x-forwarded-for", handshakeHeaders["x-forwarded-for"] as string);

      const session = await auth.api.getSession({ headers: headersObj });

      if (!session?.user) {
        console.log("WebSocket connection rejected: Invalid session");
        return next(new Error("Unauthorized"));
      }

      (socket as any).userId = session.user.id;
      (socket as any).session = session;
      next();
    } catch (error) {
      console.error("WebSocket auth error:", error);
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
