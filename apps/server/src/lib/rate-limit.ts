interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;

    // Automatic cleanup of expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    reset: number;
    remaining: number;
  }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetAt < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + this.windowMs,
      };
      this.store.set(identifier, newEntry);
      return {
        success: true,
        limit: this.maxRequests,
        reset: newEntry.resetAt,
        remaining: this.maxRequests - 1,
      };
    }

    // If the limit is reached
    if (entry.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        reset: entry.resetAt,
        remaining: 0,
      };
    }

    entry.count++;
    this.store.set(identifier, entry);

    return {
      success: true,
      limit: this.maxRequests,
      reset: entry.resetAt,
      remaining: this.maxRequests - entry.count,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Rate limiter for onboarding endpoints (10 requests per minute)
export const onboardingRateLimit = new InMemoryRateLimiter(10, 60);

// Rate limiter for file uploads (5 requests per minute)
export const uploadRateLimit = new InMemoryRateLimiter(5, 60);

// Rate limiter for profile endpoints (20 requests per minute)
export const profileRateLimit = new InMemoryRateLimiter(20, 60);

// Helper to check if the rate limiting is available (always true for the in-memory version)
export function isRateLimitEnabled(): boolean {
  return true;
}
