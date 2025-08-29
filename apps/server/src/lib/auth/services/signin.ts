import { z } from "zod";
import { auth } from "@/lib/auth";

export const signInInputSchema = z
	.object({
		email: z.string().email().optional(),
		username: z.string().min(3).max(30).optional(),
		password: z.string().min(8),
	})
	.refine((data) => Boolean(data.email || data.username), {
		message: "Provide email or username",
		path: ["email"],
	});

type Success<T> = { ok: true; data: T };
type Failure = { ok: false; error: string; status?: number };
export type Result<T> = Success<T> | Failure;

export class SignInService {
	async execute(input: unknown, headers: Headers): Promise<Result<{ userId: string }>> {
		const parsed = signInInputSchema.safeParse(input);
		if (!parsed.success) {
			return {
				ok: false,
				error: parsed.error.issues.map((i) => i.message).join(", "),
				status: 400,
			};
		}
		try {
			const { email, username, password } = parsed.data;
			const data = email
				? await auth.api.signInEmail({ body: { email, password }, headers })
				: await auth.api.signInUsername({ body: { username: username as string, password }, headers });
			if (!data || !data.user) {
				return { ok: false, error: "Unexpected authentication response", status: 500 };
			}
			return { ok: true, data: { userId: data.user.id } };
		} catch (error) {
			const anyErr = error as any;
			const status = typeof anyErr?.status === "number" ? anyErr.status : undefined;
			return { ok: false, error: (error as Error).message, status };
		}
	}
}
