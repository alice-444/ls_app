"use client";

import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useEffect } from "react";

const USER_ONLY_ROUTES = ["/dashboard", "/my-workshops", "/workshop-editor", "/mentor-profile", "/catalog", "/profil"];
const ADMIN_ONLY_ROUTES = ["/admin"];

export function RoleGate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { data: userRole, isLoading: isLoadingRole, isError: isErrorRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (isLoadingRole || isErrorRole || !session || !userRole) return;

    if (userRole === null && pathname !== "/onboarding") {
      router.push("/onboarding");
      return;
    }
    if (userRole !== null && pathname === "/onboarding") {
      router.push("/dashboard");
      return;
    }

    const isUserOnlyPath = USER_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
    const isAdminOnlyPath = ADMIN_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));

    if (userRole === "ADMIN" && isUserOnlyPath) {
      router.push("/admin");
    } else if (userRole !== "ADMIN" && isAdminOnlyPath) {
      router.push("/dashboard");
    }
  }, [userRole, session, pathname, isLoadingRole, isErrorRole, router]);

  return <>{children}</>;
}
