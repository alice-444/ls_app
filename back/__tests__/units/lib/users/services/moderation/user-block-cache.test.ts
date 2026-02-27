import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserBlockCache } from "../../../../../../src/lib/users/services/moderation/user-block-cache";

describe("UserBlockCache", () => {
  let cache: UserBlockCache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new UserBlockCache(60);
  });

  afterEach(() => {
    cache.destroy();
    vi.useRealTimers();
  });

  describe("get / set", () => {
    it("returns null for missing entry", () => {
      expect(cache.get("a", "b")).toBeNull();
    });

    it("stores and retrieves true", () => {
      cache.set("a", "b", true);
      expect(cache.get("a", "b")).toBe(true);
    });

    it("stores and retrieves false", () => {
      cache.set("a", "b", false);
      expect(cache.get("a", "b")).toBe(false);
    });

    it("overwrites existing entry", () => {
      cache.set("a", "b", true);
      cache.set("a", "b", false);
      expect(cache.get("a", "b")).toBe(false);
    });
  });

  describe("TTL expiration", () => {
    it("returns value before TTL expires", () => {
      cache.set("a", "b", true);
      vi.advanceTimersByTime(59_000);
      expect(cache.get("a", "b")).toBe(true);
    });

    it("returns null after TTL expires", () => {
      cache.set("a", "b", true);
      vi.advanceTimersByTime(61_000);
      expect(cache.get("a", "b")).toBeNull();
    });
  });

  describe("getCacheKey (deterministic order)", () => {
    it("returns same value regardless of argument order", () => {
      cache.set("alice", "bob", true);
      expect(cache.get("bob", "alice")).toBe(true);
    });

    it("distinguishes different user pairs", () => {
      cache.set("a", "b", true);
      expect(cache.get("a", "c")).toBeNull();
    });
  });

  describe("invalidate", () => {
    it("removes specific pair entry", () => {
      cache.set("a", "b", true);
      cache.set("a", "c", true);
      cache.invalidate("a", "b");
      expect(cache.get("a", "b")).toBeNull();
      expect(cache.get("a", "c")).toBe(true);
    });
  });

  describe("invalidateForUser", () => {
    it("removes all entries containing userId", () => {
      cache.set("a", "b", true);
      cache.set("a", "c", true);
      cache.set("d", "e", true);
      cache.invalidateForUser("a");
      expect(cache.get("a", "b")).toBeNull();
      expect(cache.get("a", "c")).toBeNull();
      expect(cache.get("d", "e")).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      cache.set("a", "b", true);
      cache.set("c", "d", true);
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get("a", "b")).toBeNull();
    });
  });

  describe("destroy", () => {
    it("clears cache and stops cleanup interval", () => {
      cache.set("a", "b", true);
      cache.destroy();
      expect(cache.size()).toBe(0);
    });
  });

  describe("size", () => {
    it("returns 0 for empty cache", () => {
      expect(cache.size()).toBe(0);
    });

    it("returns correct count", () => {
      cache.set("a", "b", true);
      cache.set("c", "d", false);
      expect(cache.size()).toBe(2);
    });
  });
});
