"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function VerifyEmailChangeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setErrorMessage("Token de vérification manquant");
        return;
      }

      setStatus("loading");
      const { data, error } = await (authClient as any).verifyEmail({
        query: {
          token,
        },
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Erreur lors de la vérification");
        toast.error(error.message || "Erreur lors de la vérification");
      } else {
        setStatus("success");
        toast.success("Email vérifié avec succès");
        setTimeout(() => {
          router.push("/settings");
        }, 3000);
      }
    }

    verify();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Vérification en cours...</CardTitle>
            <CardDescription>
              Veuillez patienter pendant que nous vérifions votre email
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Email vérifié avec succès</CardTitle>
            <CardDescription>
              Votre adresse email a été modifiée avec succès. Redirection vers
              les paramètres...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/settings")} className="w-full">
              Aller aux paramètres
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle>Erreur de vérification</CardTitle>
          <CardDescription>
            {errorMessage || "Le lien de vérification est invalide ou a expiré"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Le lien de vérification est invalide ou a expiré. Veuillez demander
            un nouveau lien depuis les paramètres.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/settings")} className="w-full">
              Aller aux paramètres
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Chargement...</CardTitle>
              <CardDescription>
                Veuillez patienter pendant le chargement
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
