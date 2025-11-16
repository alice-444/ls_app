import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { prisma } from "./common/prisma";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
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

export const profProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const appUser = await (prisma as any).app_user.findUnique({
		where: { userId: ctx.session.user.id },
	});

	if (!appUser) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "AppUser not found. Please complete role selection first.",
		});
	}

	if (appUser.role !== "PROF") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Only users with PROF role can perform this action",
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
