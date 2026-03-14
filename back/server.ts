import "dotenv/config";
import { createServer } from "http";
import type { UrlWithParsedQuery } from "url";
import next from "next";
import { initializeSocketServer } from "./src/lib/socket/server";
import { container } from "./src/lib/di/container";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME_BACKEND || "0.0.0.0";
const port = Number.parseInt(process.env.PORT_BACKEND || "4500", 10);

const app = next({ hostname, dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Must use explicit origin for credentials support
      const origin = req.headers.origin || process.env.CORS_ORIGIN || "https://app.learnsup.fr";
      
      // Set CORS headers
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT,PATCH");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-TRPC-Source, X-Requested-With, Accept, Sentry-Trace, baggage");

      // Handle preflight OPTIONS requests directly
      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      // Let Next.js handle the request
      await handle(req, res);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = initializeSocketServer(httpServer);
  console.log("Socket.IO initialized on path /socket.io");

  // Reset all user presence status on startup to avoid "ghost" online users
  container.presenceService.resetAllPresence();

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(
        `> Socket.IO available at ws://${hostname}:${port}/socket.io`,
      );
    });
});
