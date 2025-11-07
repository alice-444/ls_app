import { NextResponse } from "next/server";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
}

interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

export async function applyRateLimit(
  rateLimiter: RateLimiter,
  identifier: string
): Promise<
  | { ok: true; result: RateLimitResult }
  | { ok: false; result: RateLimitResult; response: NextResponse }
> {
  const result = await rateLimiter.limit(identifier);

  if (!result.success) {
    return {
      ok: false,
      result,
      response: NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          limit: result.limit,
          reset: result.reset,
          remaining: result.remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
          },
        }
      ),
    };
  }

  return { ok: true, result };
}
