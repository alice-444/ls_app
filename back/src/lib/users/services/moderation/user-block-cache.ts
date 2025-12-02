interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

export class UserBlockCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly ttlMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttlSeconds: number = 300) {
    this.ttlMs = ttlSeconds * 1000;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private getCacheKey(userId1: string, userId2: string): string {
    return userId1 < userId2
      ? `${userId1}:${userId2}`
      : `${userId2}:${userId1}`;
  }

  get(userId1: string, userId2: string): boolean | null {
    const key = this.getCacheKey(userId1, userId2);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(userId1: string, userId2: string, value: boolean): void {
    const key = this.getCacheKey(userId1, userId2);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  invalidateForUser(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  invalidate(userId1: string, userId2: string): void {
    const key = this.getCacheKey(userId1, userId2);
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
