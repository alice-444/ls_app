import { RateLimiterPostgres, RateLimiterMemory } from "rate-limiter-flexible";
import { pool } from "../prisma-server";

let rateLimiterPostgres: RateLimiterPostgres | null = null;
let rateLimiterMemory: RateLimiterMemory | null = null;

try {
  if (pool) {
    rateLimiterPostgres = new RateLimiterPostgres({
      storeClient: pool,
      tableName: "rate_limiter",
      points: 10,
      duration: 60,
      blockDuration: 0,
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
    blockDuration: 0,
  });
}

export const mutationRateLimiter = rateLimiterPostgres || rateLimiterMemory!;

export const apiRateLimiter = pool
  ? new RateLimiterPostgres({
      storeClient: pool,
      tableName: "rate_limiter_api",
      points: 100,
      duration: 60,
      blockDuration: 0,
    })
  : new RateLimiterMemory({
      points: 100,
      duration: 60,
      blockDuration: 0,
    });

export const authRateLimiter = pool
  ? new RateLimiterPostgres({
      storeClient: pool,
      tableName: "rate_limiter_auth",
      points: 5,
      duration: 60,
      blockDuration: 0,
    })
  : new RateLimiterMemory({
      points: 5,
      duration: 60,
      blockDuration: 0,
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
