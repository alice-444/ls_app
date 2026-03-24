import { TRPCError } from "@trpc/server";
import {
  mutationRateLimiter,
  apiRateLimiter,
  getRateLimitIdentifier,
} from "./rate-limit";

export const rateLimitMutation = async (
  userId?: string,
  ipAddress?: string
) => {
  const identifier = getRateLimitIdentifier(userId, ipAddress);

  try {
    await mutationRateLimiter.consume(identifier);
  } catch (rejRes: any) {
    const remainingTime = Math.round(rejRes.msBeforeNext / 1000) || 1;
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Trop de requêtes. Veuillez réessayer dans ${remainingTime} seconde(s).`,
      cause: {
        retryAfter: remainingTime,
        limit: 10,
        window: 60,
      },
    });
  }
};

export const rateLimitQuery = async (userId?: string, ipAddress?: string) => {
  const identifier = getRateLimitIdentifier(userId, ipAddress);

  try {
    await apiRateLimiter.consume(identifier);
  } catch (rejRes: any) {
    const remainingTime = Math.round(rejRes.msBeforeNext / 1000) || 1;
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Trop de requêtes. Veuillez réessayer dans ${remainingTime} seconde(s).`,
      cause: {
        retryAfter: remainingTime,
        limit: 100,
        window: 60,
      },
    });
  }
};
