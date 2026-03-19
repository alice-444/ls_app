import { authClient } from "@/lib/auth-server-client";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ShinyText from "@/components/ui/ShinyText";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getUserRole } from "@/lib/api-client";
import { trpc } from "@/utils/trpc";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInForm({ onSwitchToSignUp }: Readonly<{ onSwitchToSignUp: () => void }>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkFlow, setIsMagicLinkFlow] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

  const requestMagicLinkMutation = trpc.auth.requestMagicLink.useMutation({
    onSuccess: () => {
      toast.success("Un lien de connexion a été envoyé à ton adresse email.");
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de l'envoi du lien.");
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const { email, password } = value;
      setIsSubmitting(true);

      authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: async () => {
            const role = await getUserRole();
            await queryClient.invalidateQueries({ queryKey: ["userRole"] });

            if (role === "ADMIN") {
              window.location.href = "/admin";
            } else {
              router.push("/dashboard");
            }
            toast.success("Connexion réussie");
          },
          onError: (ctx) => {
            setIsSubmitting(false);
            toast.error(ctx.error.message || ctx.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.3 },
    }),
  };

  if (isMagicLinkFlow) {
    return (
      <Card className="w-full border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">
            <h1 className="text-2xl font-bold">
              <ShinyText text="Connexion par Magic Link" />
            </h1>
          </CardTitle>
          <CardDescription className="text-center">
            Entre ton email pour recevoir un lien de connexion direct.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestMagicLinkMutation.mutate({ email: magicLinkEmail });
            }}
            className="space-y-4"
          >
            <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={0}>
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                type="email"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                required
                placeholder="ton@email.com"
                disabled={requestMagicLinkMutation.isPending}
                className="mt-2 rounded-full"
              />
            </motion.div>
            <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={1}>
              <Button type="submit" className="w-full rounded-full" disabled={requestMagicLinkMutation.isPending}>
                {requestMagicLinkMutation.isPending ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </motion.div>
          </form>
          <Button
            variant="link"
            onClick={() => setIsMagicLinkFlow(false)}
            className="w-full rounded-full text-muted-foreground hover:text-foreground"
          >
            Retour à la connexion par mot de passe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-center">
          <h1 className="text-3xl font-bold">
            <ShinyText text="Bienvenue" />
          </h1>
        </CardTitle>
        <CardDescription className="text-center">Connecte-toi pour accéder à ton tableau de bord</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={0}>
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
                    placeholder="ton@email.com"
                    className="rounded-full"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-destructive text-sm">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </motion.div>
          <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={1}>
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Mot de passe</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    className="rounded-full"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-destructive text-sm">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </motion.div>
          <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={2}>
            <Button
              type="submit"
              className="w-full rounded-full bg-[#FFB647] hover:bg-[#FF9F1A] text-black font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </motion.div>
        </form>
        <div className="mt-6 space-y-3">
          <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={3}>
            <Button
              variant="outline"
              onClick={() => setIsMagicLinkFlow(true)}
              className="w-full rounded-full"
              disabled={isSubmitting}
            >
              <Mail className="mr-2 h-4 w-4" />
              Se connecter avec un Magic Link
            </Button>
          </motion.div>
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="link"
              onClick={onSwitchToSignUp}
              className="rounded-full text-[#26547c] hover:text-[#FF8C42] dark:text-[#4A90E2] dark:hover:text-[#FFB647]"
              disabled={isSubmitting}
            >
              Pas encore de compte ? S&apos;inscrire
            </Button>
            <Button
              variant="link"
              onClick={() => router.push("/forgot-password")}
              className="rounded-full text-sm text-muted-foreground hover:text-foreground"
              disabled={isSubmitting}
            >
              Mot de passe oublié ?
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
