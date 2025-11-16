"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

export default function Header() {
  const { data: session } = authClient.useSession();

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const commonLinks = [{ to: "/dashboard", label: "Dashboard" }];

  const profLinks = [
    { to: "/my-workshops", label: "Mes Ateliers" },
    { to: "/workshop-editor", label: "Atelab" }
  ];

  const apprenantLinks = [{ to: "/workshop-room", label: "e-Atelier" }];

  const additionalCommonLinks = [
    { to: "/discussions", label: "Discussions" },
    { to: "/relationships", label: "Relations" },
  ];

  const links = [
    ...commonLinks,
    ...(userRole === "PROF"
      ? profLinks
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
