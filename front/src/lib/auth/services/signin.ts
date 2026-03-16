import { z } from "zod";
import { auth } from "@/lib/auth";
import { authFailuresTotal } from "@/lib/metrics/prometheus";

export const signInInputSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
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
			const { email, password } = parsed.data;
			const data = await auth.api.signInEmail({ body: { email, password }, headers });
			if (!data?.user) {
        authFailuresTotal.labels("unexpected_response").inc();
				return { ok: false, error: "Unexpected authentication response", status: 500 };
			}
			return { ok: true, data: { userId: data.user.id } };
		} catch (error) {
			const anyErr = error as any;
			const status = typeof anyErr?.status === "number" ? anyErr.status : undefined;
      
      // Map common error reasons for metrics
      let reason: string;
      if (status === 401) reason = "invalid_credentials";
      else if (status === 429) reason = "rate_limited";
      else reason = "unknown";
      
      authFailuresTotal.labels(reason).inc();
      
			return { ok: false, error: (error as Error).message, status };
		}
	}
}
