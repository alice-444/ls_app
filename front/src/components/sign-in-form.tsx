import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getUserRole } from "@/lib/api-client";
import { trpc } from "@/utils/trpc";
import { Mail } from "lucide-react";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkFlow, setIsMagicLinkFlow] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

  const requestMagicLinkMutation = trpc.auth.requestMagicLink.useMutation({
    onSuccess: () => {
      toast.success("Un lien de connexion a été envoyé à votre adresse email.");
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
            toast.success("Sign in successful");
          },
          onError: (ctx) => {
            setIsSubmitting(false);
            toast.error(ctx.error.message || ctx.error.statusText);
          },
        }
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

  if (isMagicLinkFlow) {
    return (
        <div className="mx-auto w-full mt-10 max-w-md p-6">
            <h1 className="mb-6 text-center text-3xl font-bold">Connexion par Magic Link</h1>
            <p className="text-center text-muted-foreground mb-6">Entrez votre email pour recevoir un lien de connexion direct.</p>
            <form onSubmit={(e) => {
                e.preventDefault();
                requestMagicLinkMutation.mutate({ email: magicLinkEmail });
            }} className="space-y-4">
                <div>
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                        id="magic-email"
                        type="email"
                        value={magicLinkEmail}
                        onChange={(e) => setMagicLinkEmail(e.target.value)}
                        required
                        placeholder="votre@email.com"
                        disabled={requestMagicLinkMutation.isPending}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={requestMagicLinkMutation.isPending}>
                    {requestMagicLinkMutation.isPending ? "Envoi..." : "Envoyer le lien"}
                </Button>
            </form>
            <Button variant="link" onClick={() => setIsMagicLinkFlow(false)} className="mt-4 w-full">
                Retour à la connexion par mot de passe
            </Button>
        </div>
    );
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
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
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Sign In"}
        </Button>
      </form>
      <div className="mt-4 space-y-2 text-center">
        <Button
            variant="outline"
            onClick={() => setIsMagicLinkFlow(true)}
            className="w-full"
            disabled={isSubmitting}
        >
            <Mail className="mr-2 h-4 w-4" />
            Se connecter avec un Magic Link
        </Button>
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-indigo-600 hover:text-indigo-800"
          disabled={isSubmitting}
        >
          Need an account? Sign Up
        </Button>
        <div>
          <Button
            variant="link"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-muted-foreground hover:text-foreground"
            disabled={isSubmitting}
          >
            Forgot Password?
          </Button>
        </div>
      </div>
    </div>
  );
}
