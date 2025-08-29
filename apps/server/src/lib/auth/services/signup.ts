import { z } from "zod";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../../../prisma/generated/client/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

const auth = betterAuth({
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

export const signUpInputSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1).max(120),
	username: z.string().min(3).max(30),
});

type SignUpInput = z.infer<typeof signUpInputSchema>;

type Success<T> = { ok: true; data: T };
type Failure = { ok: false; error: string; status?: number };
export type Result<T> = Success<T> | Failure;

export class SignUpService {
	async execute(input: unknown, headers: Headers): Promise<Result<{ userId: string }>> {
		const parsed = signUpInputSchema.safeParse(input);
		if (!parsed.success) {
			return {
				ok: false,
				error: parsed.error.issues.map((issue) => issue.message).join(", "),
				status: 400,
			};
		}
		try {
			const { email, password, username } = parsed.data;
			const name = parsed.data.name ?? email.split("@")[0];
			const data = await auth.api.signUpEmail({
				body: { email, password, name, username },
				headers,
			});
			return { ok: true, data: { userId: data.user.id } };
		} catch (error) {
			const anyErr = error as any;
			const status = typeof anyErr?.status === "number" ? anyErr.status : undefined;
			return { ok: false, error: (error as Error).message, status };
		}
	}
}