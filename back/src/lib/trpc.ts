import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { prisma } from "./common/prisma";
import { container } from "./di/container";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
	return next({ ctx });
});

export const protectedProcedure = t.procedure
	.use(async ({ ctx, next }) => {
		if (!ctx.session) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Authentication required",
				cause: "No session",
			});
		}
		return next({
			ctx: {
				...ctx,
				session: ctx.session,
			},
		});
	});

// Middleware for automated audit logging of admin actions
const adminLogger = t.middleware(async ({ ctx, next, path, type, getRawInput }) => {
  const result = await next();

  // Log only successful mutations (write actions) for admin operations
  if (result.ok && type === "mutation" && ctx.session?.user?.id) {
    try {
      const rawInput = await getRawInput();
      await container.auditLogService.record(
        ctx.session.user.id,
        `ADMIN_ACTION_${path.toUpperCase().replace(/\./g, "_")}`,
        { input: rawInput }
      );
    } catch (e) {
      console.error("Failed to record admin audit log:", e);
    }
  }

  return result;
});

export const profProcedure = protectedProcedure
	.use(async ({ ctx, next }) => {
		const appUser = await (prisma as any).app_user.findUnique({
			where: { userId: ctx.session.user.id },
		});

		if (!appUser) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "AppUser not found. Please complete role selection first.",
			});
		}

		if (appUser.role !== "MENTOR") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only users with MENTOR role can perform this action",
			});
		}

		if (appUser.status !== "ACTIVE") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "User account is not active",
			});
		}

		return next({
			ctx: {
				...ctx,
				appUser,
			},
		});
	});

export const adminProcedure = protectedProcedure
  .use(adminLogger)
	.use(async ({ ctx, next }) => {
		const appUser = await (prisma as any).app_user.findUnique({
			where: { userId: ctx.session.user.id },
		});

		if (!appUser) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "AppUser not found. Please complete role selection first.",
			});
		}

		if (appUser.role !== "ADMIN") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only administrators can perform this action",
			});
		}

		if (appUser.status !== "ACTIVE") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "User account is not active",
			});
		}

		return next({
			ctx: {
				...ctx,
				appUser,
			},
		});
	});
