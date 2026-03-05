import type { Context } from "@/lib/context";
import { t } from "@/lib/trpc";
import { appRouter } from "@/routers";

export const createCaller = t.createCallerFactory(appRouter);

export function createPublicContext(): Context {
  return {
    session: null,
    ipAddress: "127.0.0.1",
    req: null as any,
  };
}

export function createProtectedContext(overrides?: {
  userId?: string;
  name?: string;
  email?: string;
}): Context {
  const userId = overrides?.userId ?? "test-user-id";
  return {
    session: {
      user: {
        id: userId,
        name: overrides?.name ?? "Test User",
        email: overrides?.email ?? "test@example.com",
        image: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      session: {
        id: "test-session-id",
        userId,
        token: "test-token",
        expiresAt: new Date(Date.now() + 86400),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: "127.0.0.1",
        userAgent: "test",
      },
    },
    ipAddress: "127.0.0.1",
    req: null as any,
  };
}
