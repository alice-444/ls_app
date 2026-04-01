"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import Loader from "@/components/shared/Loader";
import { authClient } from "@/lib/auth-server-client";

/**
 * Guard for Mentor space routes.
 * Checks for authentication and MENTOR role.
 */
export function MentorGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const { data: user, isLoading: isUserLoading } = trpc.user.getMe.useQuery(undefined, {
    enabled: !!session?.user,
    retry: false
  });

  const isLoading = isAuthPending || (!!session?.user && isUserLoading);

  useEffect(() => {
    if (!isLoading) {
      if (!session?.user) {
        router.push("/login");
      } else if (user && user.role !== "MENTOR") {
        router.push("/forbidden");
      }
    }
  }, [session, user, isLoading, router]);

  if (isLoading) {
    return <Loader fullScreen message="Vérification de tes accès mentor..." />;
  }

  if (session?.user && user?.role === "MENTOR") {
    return <>{children}</>;
  }

  return null;
}
