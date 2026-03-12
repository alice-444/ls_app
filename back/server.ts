import "dotenv/config";
import { createServer } from "http";
import type { UrlWithParsedQuery } from "url";
import next from "next";
import { initializeSocketServer } from "./src/lib/socket/server";
import { container } from "./src/lib/di/container";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME_BACKEND;
const port = Number.parseInt(process.env.PORT_BACKEND || "4500", 10);

const app = next({ hostname, dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const origin = req.headers.origin || "http://localhost:3001";
      const corsHeaders = {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      // Handle preflight OPTIONS requests directly
      if (req.method === "OPTIONS") {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
      }

      // Wrap the response to add CORS headers to all responses
      const originalWriteHead = res.writeHead.bind(res);
      res.writeHead = function (statusCode: number, ...args: any[]) {
        const headers = args[0] || {};
        Object.assign(headers, corsHeaders);
        return originalWriteHead(statusCode, headers, ...args.slice(1));
      };

      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers.host || `${hostname || "localhost"}:${port}`;
      const baseUrl = `${protocol}://${host}`;
      const url = new URL(req.url!, baseUrl);

      const parsedUrl: UrlWithParsedQuery = {
        auth:
          url.username && url.password
            ? `${url.username}:${url.password}`
            : url.username || null,
        hash: url.hash || null,
        host: url.host || null,
        hostname: url.hostname || null,
        href: url.href,
        path: url.pathname + url.search,
        pathname: url.pathname,
        port: url.port || null,
        protocol: url.protocol || null,
        query: Object.fromEntries(url.searchParams),
        search: url.search || null,
        slashes: url.protocol?.endsWith(":") ? true : null,
      };

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      const origin = req.headers.origin || "http://localhost:3001";
      res.writeHead(500, {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
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
