import { RateLimiterPostgres, RateLimiterMemory } from "rate-limiter-flexible";
import { Pool } from "pg";

let pgPool: Pool | null = null;
let rateLimiterPostgres: RateLimiterPostgres | null = null;
let rateLimiterMemory: RateLimiterMemory | null = null;

try {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    pgPool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    rateLimiterPostgres = new RateLimiterPostgres({
      storeClient: pgPool,
      tableName: "rate_limiter",
      points: 10,
      duration: 60,
      blockDuration: 60,
    });
  }
} catch (error) {
  console.warn(
    "Failed to initialize PostgreSQL rate limiter, using memory store:",
    error
  );
}

if (!rateLimiterPostgres) {
  rateLimiterMemory = new RateLimiterMemory({
    points: 10,
    duration: 60,
    blockDuration: 60,
  });
}

export const mutationRateLimiter = rateLimiterPostgres || rateLimiterMemory!;

export const apiRateLimiter = pgPool
  ? new RateLimiterPostgres({
      storeClient: pgPool,
      tableName: "rate_limiter_api",
      points: 100,
      duration: 60,
      blockDuration: 60,
    })
  : new RateLimiterMemory({
      points: 100,
      duration: 60,
      blockDuration: 60,
    });

export const authRateLimiter = pgPool
  ? new RateLimiterPostgres({
      storeClient: pgPool,
      tableName: "rate_limiter_auth",
      points: 5,
      duration: 60,
      blockDuration: 60,
    })
  : new RateLimiterMemory({
      points: 5,
      duration: 60,
      blockDuration: 60,
    });

export function getRateLimitIdentifier(
  userId?: string,
  ipAddress?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ipAddress) {
    return `ip:${ipAddress}`;
  }
  return "anonymous";
}
