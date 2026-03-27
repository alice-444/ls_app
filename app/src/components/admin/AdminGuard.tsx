"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import Loader from "@/components/shared/Loader";
import { authClient } from "@/lib/auth-server-client";

/**
 * Higher-order component to strictly protect admin routes.
 * Checks for authentication and ADMIN role.
 */
export function AdminGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  // Also check role from DB via tRPC to be absolutely sure
  const { data: user, isLoading: isUserLoading } = trpc.user.getMe.useQuery(undefined, {
    enabled: !!session?.user,
    retry: false
  });

  const isLoading = isAuthPending || (!!session?.user && isUserLoading);

  useEffect(() => {
    if (!isLoading) {
      if (!session?.user) {
        router.push("/login");
      } else if (user && user.role !== "ADMIN") {
        router.push("/forbidden");
      }
    }
  }, [session, user, isLoading, router]);

  if (isLoading) {
    return <Loader fullScreen message="Vérification des accès administrateur..." />;
  }

  if (session?.user && user?.role === "ADMIN") {
    return <>{children}</>;
  }

  return null;
}
