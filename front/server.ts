import "dotenv/config";
import { createServer } from "node:http";
import next from "next";
import { container } from "./src/lib/di/container";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3001", 10);
const app = next({ hostname, dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Skip Socket.IO requests to let the Socket.IO server handle them directly
      if (req.url?.startsWith("/socket.io")) {
        return;
      }

      // Must use explicit origin for credentials support
      const origin = req.headers.origin || process.env.CORS_ORIGIN || "https://app.learnsup.fr";

      // Set CORS headers
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT,PATCH");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-TRPC-Source, X-Requested-With, Accept, Sentry-Trace, baggage",
      );

      // Handle preflight OPTIONS requests directly
      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      // Let Next.js handle the request
      await handle(req, res);
    } catch (err: unknown) {
      console.error("Failed to prepare Next.js app", req.url, err);
      res.statusCode = 500;
      res.end("Connexion au serveur socket échouée : " + (err as Error).message);
      process.exit(1);
    }
  });

  console.info("Socket.IO initialized on path /socket.io");

  // Reset all user presence status on startup to avoid "ghost" online users
  container.presenceService.resetAllPresence();

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.info(`> Ready on http://${hostname}:${port}`);
      console.info(`> Socket.IO available at ws://${hostname}:${port}/socket.io`);
    });
});
