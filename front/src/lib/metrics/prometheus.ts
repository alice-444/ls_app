import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from "prom-client";

export const register = new Registry();

register.setDefaultLabels({
  app: "ls-backend",
});

collectDefaultMetrics({ register });

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const activeConnections = new Gauge({
  name: "active_connections",
  help: "Number of active connections",
  registers: [register],
});

export const databaseQueryDuration = new Histogram({
  name: "database_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const socketConnections = new Gauge({
  name: "socket_connections",
  help: "Number of active socket connections",
  registers: [register],
});

// --- Business Metrics ---
export const connectedUsers = new Gauge({
  name: "connected_users_total",
  help: "Number of currently connected users by role",
  labelNames: ["role"],
  registers: [register],
});

export const workshopsTotal = new Counter({
  name: "workshops_total",
  help: "Total number of workshops events",
  labelNames: ["status"], // created, completed, cancelled
  registers: [register],
});

export const creditsExchangedTotal = new Counter({
  name: "credits_exchanged_total",
  help: "Total volume of credits exchanged on the platform",
  labelNames: ["type"], // top_up, usage, refund
  registers: [register],
});

// --- Security & Reliability Metrics ---
export const authFailuresTotal = new Counter({
  name: "auth_failures_total",
  help: "Total number of authentication failures",
  labelNames: ["reason"], // invalid_credentials, rate_limited, locked
  registers: [register],
});

export const externalApiErrorsTotal = new Counter({
  name: "external_api_errors_total",
  help: "Total number of errors when calling external services",
  labelNames: ["service"], // daily, resend, polar
  registers: [register],
});
