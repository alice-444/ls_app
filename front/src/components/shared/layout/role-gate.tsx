"use client";

import { usePathname, redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

const USER_ONLY_ROUTES = ["/dashboard", "/my-workshops", "/workshop-editor", "/mentor-profile", "/catalog", "/profil"];
const ADMIN_ONLY_ROUTES = ["/admin"];

export function RoleGate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const { data: userRole, isLoading: isLoadingRole, isError: isErrorRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000,
    retry: 1,
  });

  if (!session || isLoadingRole || isErrorRole) return <>{children}</>;

  if (userRole === null && pathname !== "/onboarding") redirect("/onboarding");
  if (userRole !== null && pathname === "/onboarding") redirect("/dashboard");

  if (!userRole) return <>{children}</>;

  const currentIsUserOnly = USER_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
  const currentIsAdminOnly = ADMIN_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));

  if (userRole === "ADMIN" && currentIsUserOnly) redirect("/admin");
  if (userRole !== "ADMIN" && currentIsAdminOnly) redirect("/dashboard");

  return <>{children}</>;
}
