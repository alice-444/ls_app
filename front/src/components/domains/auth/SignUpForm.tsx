import { authClient, customAuthClient } from "@/lib/auth-server-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ShinyText from "@/components/ui/ShinyText";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      username: "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const result = await customAuthClient.signUpEmail(value.email, value.password, value.name, value.username);

        authClient.signIn.email(
          {
            email: value.email,
            password: value.password,
          },
          {
            onSuccess: () => {
              setIsSubmitting(false);
              router.push("/onboarding");
              toast.success("Compte créé avec succès !");
            },
            onError: () => {
              setIsSubmitting(false);
              toast.error("Account created but sign in failed. Please sign in manually.");
              router.push("/login");
            },
          },
        );
      } catch (error) {
        setIsSubmitting(false);
        toast.error(error instanceof Error ? error.message : "Sign up failed");
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(30, "Username must be at most 30 characters"),
      }),
    },
  });

  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.3 },
    }),
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card className="w-full border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-center">
          <h1 className="text-3xl font-bold">
            <ShinyText text="Créer un compte" />
          </h1>
        </CardTitle>
        <CardDescription className="text-center">Rejoins LearnSup et accède aux ateliers</CardDescription>
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
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Nom</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ton prénom"
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
            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Nom d&apos;utilisateur</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="pseudo"
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

          <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={3}>
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

          <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={4}>
            <Button
              type="submit"
              className="w-full rounded-full bg-[#FFB647] hover:bg-[#FF9F1A] text-black font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={5} className="mt-6 text-center">
          <Button
            variant="link"
            onClick={onSwitchToSignIn}
            className="rounded-full text-[#26547c] hover:text-[#FF8C42] dark:text-[#4A90E2] dark:hover:text-[#FFB647]"
            disabled={isSubmitting}
          >
            Déjà un compte ? Se connecter
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
