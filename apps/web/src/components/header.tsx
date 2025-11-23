"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useEffect } from "react";

export default function Header() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const {
    data: userRole,
    refetch: refetchUserRole,
    isLoading: isLoadingRole,
    error: roleError,
  } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });

  const commonLinks = [
    { to: "/community", label: "Communité" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  const mentorLinks = [
    { to: "/my-workshops", label: "Mes Ateliers" },
    { to: "/workshop-editor", label: "Atelab" },
  ];

  const apprenantLinks = [{ to: "/workshop-room", label: "e-Atelier" }];

  const additionalCommonLinks = [
    { to: "/discussions", label: "Discussions" },
    { to: "/network", label: "Connexions" },
  ];

  const links = [
    ...commonLinks,
    ...(userRole === "MENTOR"
      ? mentorLinks
      : userRole === "APPRENANT"
      ? apprenantLinks
      : []),
    ...additionalCommonLinks,
  ];

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
