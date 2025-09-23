"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: { email: "" },
        mode: "onSubmit",
    });

    async function onSubmit(values: FormValues) {
        try {
            const res = await fetch(`${baseURL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: values.email }),
            });
            if (res.status >= 500) {
                const body = await safeJson(res);
                throw new Error(body?.error?.message || res.statusText);
            }
            toast.success("Si un compte existe, un email a été envoyé.");
        } catch (err: any) {
            toast.error(err?.message || "Erreur inattendue");
        }
    }

    return (
        <div className="mx-auto w-full mt-10 max-w-md p-6">
            <h1 className="mb-6 text-center text-3xl font-bold">Mot de passe oublié</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        {...register("email", { required: "Email requis" })}
                        disabled={isSubmitting}
                    />
                    {errors.email?.message && (
                        <p className="text-red-500">{errors.email.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi..." : "Envoyer le lien"}
                </Button>
            </form>
        </div>
    );
}

async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}


