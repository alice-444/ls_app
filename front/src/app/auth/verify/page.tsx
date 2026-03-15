"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/shared/loader";
import { toast } from "sonner";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/login?error=missing_token");
      return;
    }

    // Appel direct au client Better Auth pour vérifier le token
    // Le cookie de session sera déposé automatiquement par le navigateur suite à cet appel API
    authClient.magicLink.verify(
      {
        query: {
          token,
        },
      },
      {
        onSuccess: () => {
          toast.success("Connexion réussie !");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          console.error("Verification error:", ctx.error);
          toast.error(ctx.error.message || "Lien invalide ou expiré");
          router.push("/login?error=magic_link");
        },
      }
    );
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader size="lg" />
      <p className="text-muted-foreground animate-pulse font-medium">
        Vérification de votre lien de connexion...
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <VerifyContent />
    </Suspense>
  );
}
