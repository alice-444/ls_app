"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

const USER_ONLY_ROUTES = ["/dashboard", "/my-workshops", "/workshop-editor", "/mentor-profile", "/workshop-room", "/profil"];
const ADMIN_ONLY_ROUTES = ["/admin"];

export function RoleGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!session) return;

    // Handle onboarding redirect
    if (!isLoadingRole && userRole === null && pathname !== "/onboarding") {
      router.push("/onboarding");
      return;
    }

    if (!userRole) return;

    // 1. Redirect ADMIN away from USER routes
    const isUserRoute = USER_ONLY_ROUTES.some(route => pathname.startsWith(isUserRoutePattern(route)));
    // More precise check for exact matches or subroutes
    const currentIsUserOnly = USER_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
    
    if (userRole === "ADMIN" && currentIsUserOnly) {
      router.push("/admin");
      return;
    }

    // 2. Redirect USER away from ADMIN routes
    const currentIsAdminOnly = ADMIN_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
    if (userRole !== "ADMIN" && currentIsAdminOnly) {
      router.push("/dashboard");
      return;
    }
  }, [session, userRole, isLoadingRole, pathname, router]);

  return <>{children}</>;
}

// Helper to avoid duplicate logic
function isUserRoutePattern(route: string) {
    return route;
}
