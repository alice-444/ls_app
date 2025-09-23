"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

type FormValues = { password: string; confirm: string };

function ResetPasswordForm() {
	const params = useSearchParams();
	const token = useMemo(() => params.get("token") || "", [params]);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
		defaultValues: { password: "", confirm: "" },
		mode: "onSubmit",
	});
    const passwordValue = watch("password");

    const { score: strengthScore, label: strengthLabel } = getPasswordStrength(passwordValue || "");

	useEffect(() => {
		if (!token) {
			toast.error("Lien invalide ou manquant.");
		}
	}, [token]);

	async function onSubmit(values: FormValues) {
		if (!token) return;
		if (!values.password || values.password !== values.confirm) {
			toast.error("Les mots de passe ne correspondent pas.");
			return;
		}
		try {
			const res = await fetch(`${baseURL}/api/auth/reset-password/${encodeURIComponent(token)}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ password: values.password }),
			});
			if (!res.ok) {
				const body = await safeJson(res);
				throw new Error(body?.error?.message || res.statusText);
			}
			toast.success("Mot de passe réinitialisé.");
		} catch (err: any) {
			toast.error(err?.message || "Erreur inattendue");
		}
	}

	return (
		<div className="mx-auto w-full mt-10 max-w-md p-6">
			<h1 className="mb-6 text-center text-3xl font-bold">Réinitialiser ton mot de passe</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="password">Nouveau mot de passe</Label>
					<Input
						id="password"
						type="password"
						{...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 caractères" } })}
						disabled={isSubmitting}
					/>
                    <div className="space-y-1">
                        <div className="h-1.5 w-full rounded bg-gray-200">
                            <div
                                className={
                                    `h-1.5 rounded transition-all duration-200 ` +
                                    strengthBarColor(strengthScore)
                                }
                                style={{ width: `${(strengthScore / 4) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-600">Robustesse: {strengthLabel}</p>
                    </div>
                    {/* Hints */}
                    <ul className="mt-1 list-disc pl-5 text-xs text-gray-600">
                        <li>Au moins 8 caractères</li>
                        <li>Inclure des lettres majuscules et minuscules</li>
                        <li>Inclure au moins un chiffre</li>
                        <li>Ajouter un caractère spécial (ex: ! @ # $ %)</li>
                    </ul>
					{errors.password?.message && (
						<p className="text-red-500">{errors.password.message}</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="confirm">Confirmer ton mot de passe</Label>
					<Input
						id="confirm"
						type="password"
						{...register("confirm", {
							required: "Confirmation requise",
							validate: (val) => val === watch("password") || "Les mots de passe ne correspondent pas",
						})}
						disabled={isSubmitting}
					/>
					{errors.confirm?.message && (
						<p className="text-red-500">{errors.confirm.message}</p>
					)}
				</div>
				<Button type="submit" className="w-full" disabled={!token || isSubmitting}>
					{isSubmitting ? "Envoi..." : "Valider"}
				</Button>
			</form>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div className="mx-auto w-full mt-10 max-w-md p-6">Chargement...</div>}>
			<ResetPasswordForm />
		</Suspense>
	);
}

async function safeJson(res: Response) {
	try {
		return await res.json();
	} catch {
		return null;
	}
}

function getPasswordStrength(pw: string): { score: number; label: string } {
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    const labels = ["Faible", "Moyen", "Bon", "Fort", "Très fort"];
    return { score, label: labels[score] ?? "Faible" };
}

function strengthBarColor(score: number): string {
    switch (score) {
        case 0:
            return "w-0 bg-red-400";
        case 1:
            return "w-1/4 bg-red-500";
        case 2:
            return "w-2/4 bg-yellow-500";
        case 3:
            return "w-3/4 bg-green-500";
        case 4:
            return "w-full bg-emerald-600";
        default:
            return "w-0 bg-red-400";
    }
}


