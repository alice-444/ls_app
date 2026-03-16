"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // Si on a vérifié la session et l'utilisateur n'est pas authentifié, rediriger
    if (!isPending && !session?.user) {
      console.log("[ProtectedRoute] User not authenticated, redirecting to /login");
      router.push("/login");
    }
  }, [session, isPending, router]);

  // En attente de vérification, afficher un loader ou rien
  if (isPending) {
    return <div>Vérification de la session...</div>;
  }

  // Si authentifié, afficher le contenu
  if (session?.user) {
    return <>{children}</>;
  }

  // Pas authentifié, afficher rien (redirect en cours)
  return null;
}
