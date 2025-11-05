"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

async function getUserRole(userId: string): Promise<"PROF" | "APPRENANT" | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/profile/role`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.role || null;
  } catch {
    return null;
  }
}

export default function Header() {
  const { data: session } = authClient.useSession();
  
  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: () => getUserRole(session?.user?.id || ""),
    enabled: !!session?.user?.id,
  });

  const commonLinks = [
    { to: "/dashboard", label: "Dashboard" },
  ];

  const profLinks = [
    { to: "/workshop-editor", label: "Atelab" },
  ];

  const apprenantLinks = [
    { to: "/workshop-room", label: "e-Atelier" },
  ];

  const additionalCommonLinks = [
    { to: "/discussions", label: "Discussions" },
    { to: "/relationships", label: "Relations" },
  ];

  const links = [
    ...commonLinks,
    ...(userRole === "PROF" ? profLinks : userRole === "APPRENANT" ? apprenantLinks : []),
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
