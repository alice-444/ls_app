import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../prisma/generated/client/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	plugins: [username()],
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});
