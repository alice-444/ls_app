"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import ShinyText from "@/components/ui/ShinyText";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await (authClient as any).requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message || "Erreur lors de la demande de réinitialisation");
    } else {
      toast.success("Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md">
        <Card className="w-full border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>
              <h1 className="text-2xl font-bold">
                <ShinyText text="Email envoyé" />
              </h1>
            </CardTitle>
            <CardDescription>
              Si un compte existe pour cet email, un code de réinitialisation a
              été envoyé.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Vérifie ta boîte de réception et suis les instructions pour
              réinitialiser ton mot de passe.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push("/login")}
                className="w-full rounded-full bg-[#FFB647] hover:bg-[#FF9F1A] text-black font-semibold"
              >
                Retour à la connexion
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="w-full rounded-full"
              >
                Renvoyer l&apos;email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="w-full border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">
            <h1 className="text-3xl font-bold">
              <ShinyText text="Mot de passe oublié ?" />
            </h1>
          </CardTitle>
          <CardDescription className="text-center">
            Entre ton adresse email et nous t&apos;enverrons un code de
            réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 rounded-full"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full rounded-full bg-[#FFB647] hover:bg-[#FF9F1A] text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Envoi..." : "Envoyer le code"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.3 }}
              className="text-center"
            >
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
