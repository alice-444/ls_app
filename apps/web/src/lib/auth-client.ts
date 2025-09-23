import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const authClient = createAuthClient({
    baseURL,
    plugins: [usernameClient()],
});

export const customAuthClient = {
	async signUpEmail(email: string, password: string, name: string, username: string) {
		const response = await fetch(`${baseURL}/api/sign-up`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ email, password, name, username }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Sign up failed");
		}

		return response.json();
	},
};
