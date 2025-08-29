import { authClient, customAuthClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();
	const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			username: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const { email, username, password } = value;
			
			setIsSubmitting(true);
			
			if (loginMethod === "email" && email) {
				authClient.signIn.email(
					{
						email,
						password,
					},
					{
						onSuccess: () => {
							setIsSubmitting(false);
							router.push("/dashboard");
							toast.success("Sign in successful");
						},
						onError: (error) => {
							setIsSubmitting(false);
							toast.error(error.error.message || error.error.statusText);
						},
					},
				);
			} else if (loginMethod === "username" && username) {
				authClient.signIn.username(
					{
						username,
						password,
					},
					{
						onSuccess: () => {
							setIsSubmitting(false);
							router.push("/dashboard");
							toast.success("Sign in successful");
						},
						onError: (error) => {
							setIsSubmitting(false);
							toast.error(error.error.message || error.error.statusText);
						},
					},
				);
			}
		},
		validators: {
			onSubmit: z.object({
				email: z.string().optional(),
				username: z.string().optional(),
				password: z.string().min(1, "Password is required"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="mx-auto w-full mt-10 max-w-md p-6">
			<h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

			<div className="mb-6 flex rounded-lg border p-1">
				<button
					type="button"
					onClick={() => setLoginMethod("email")}
					className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
						loginMethod === "email"
							? "bg-indigo-600 text-white"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Email
				</button>
				<button
					type="button"
					onClick={() => setLoginMethod("username")}
					className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
						loginMethod === "username"
							? "bg-indigo-600 text-white"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Username
				</button>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				{loginMethod === "email" ? (
					<div>
						<form.Field name="email">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										name={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										required
										disabled={isSubmitting}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>
				) : (
					<div>
						<form.Field name="username">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Username</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										required
										disabled={isSubmitting}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>
				)}

				<div>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!state.canSubmit || isSubmitting}
						>
							{isSubmitting ? "Submitting..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignUp}
					className="text-indigo-600 hover:text-indigo-800"
					disabled={isSubmitting}
				>
					Need an account? Sign Up
				</Button>
			</div>
		</div>
	);
}
