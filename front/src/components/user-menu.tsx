import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Bell,
  User,
  LayoutDashboard,
  Users,
  GraduationCap,
  ChevronDown,
  BookOpen,
  PenTool,
  Calendar,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

interface MenuLink {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: ("MENTOR" | "APPRENANT")[];
  separatorBefore?: boolean;
}

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const menuLinks: MenuLink[] = useMemo(
    () => [
      {
        href: "/dashboard",
        label: "Tableau de bord",
        icon: LayoutDashboard,
      },
      {
        href: "/my-workshops",
        label: "Mes Ateliers",
        icon: Calendar,
        roles: ["MENTOR"],
      },
      {
        href: "/workshop-editor",
        label: "Atelab",
        icon: PenTool,
        roles: ["MENTOR"],
      },
      {
        href: "/mentor-profile",
        label: "Mon Profil Mentor",
        icon: User,
        roles: ["MENTOR"],
      },
      {
        href: "/workshop-room",
        label: "e-Atelier",
        icon: BookOpen,
        roles: ["APPRENANT"],
      },
      {
        href: "/profil",
        label: "Profil",
        icon: UserCircle,
        roles: ["APPRENANT"],
      },
      {
        href: "/notifications",
        label: "Notifications",
        icon: Bell,
        separatorBefore: true,
      },
      {
        href: "/settings",
        label: "Paramètres",
        icon: Settings,
      },
    ],
    []
  );

  const filteredMenuLinks = useMemo(() => {
    return menuLinks.filter((link) => {
      if (!link.roles) return true;
      if (!userRole) return false;
      return link.roles.includes(userRole);
    });
  }, [menuLinks, userRole]);

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    if (pathname === "/login") {
      return null;
    }
    return (
      <Button variant="outline" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  if (isLoadingRole) {
    return <Skeleton className="h-9 w-24" />;
  }

  const getRoleIcon = (role: "MENTOR" | "APPRENANT" | null) => {
    return role === "MENTOR" ? (
      <Users className="h-4 w-4" />
    ) : (
      <GraduationCap className="h-4 w-4" />
    );
  };

  const getRoleLabel = (role: "MENTOR" | "APPRENANT" | null) => {
    return role === "MENTOR" ? "Mentor" : "Apprenant";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFB647] focus:ring-offset-2 rounded-full p-1">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-[#FFB647] overflow-hidden bg-white dark:bg-[#1a1720] shadow-sm">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-[#26547c]/10 dark:bg-[#26547c]/20">
                <User className="h-5 w-5 text-[#26547c] dark:text-[#e6e6e6]" />
              </div>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 sm:h-6 sm:w-6 text-[#26547c] dark:text-[#e6e6e6] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] shadow-lg p-2">
        <DropdownMenuLabel className="px-3 py-2 text-[#26547c] dark:text-[#e6e6e6] font-semibold text-sm">
          Mon Compte
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#d6dae4] dark:bg-[rgba(214,218,228,0.32)]" />
        <DropdownMenuItem className="px-3 py-2 text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] cursor-default focus:bg-transparent">
          {session.user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#d6dae4] dark:bg-[rgba(214,218,228,0.32)]" />
        {filteredMenuLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <div key={link.href}>
              {link.separatorBefore && index > 0 && (
                <DropdownMenuSeparator className="bg-[#d6dae4] dark:bg-[rgba(214,218,228,0.32)]" />
              )}
              <DropdownMenuItem
                asChild
                className="px-3 py-2 text-sm text-[#26547c] dark:text-[#e6e6e6] rounded-[8px] hover:bg-[#ffb647]/10 dark:hover:bg-[#ffb647]/20 focus:bg-[#ffb647]/10 dark:focus:bg-[#ffb647]/20 transition-colors"
              >
                <Link href={link.href}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </DropdownMenuItem>
            </div>
          );
        })}
        <DropdownMenuSeparator className="bg-[#d6dae4] dark:bg-[rgba(214,218,228,0.32)]" />
        {userRole && (
          <DropdownMenuItem className="px-3 py-2 text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] cursor-default focus:bg-transparent">
            {getRoleIcon(userRole)}
            <span>Rôle : {getRoleLabel(userRole)}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-[#d6dae4] dark:bg-[rgba(214,218,228,0.32)]" />
        <div className="px-2 py-1">
          <Button
            variant="destructive"
            className="w-full h-9 rounded-[8px] text-sm font-semibold bg-[#f44336] hover:bg-[#d32f2f] dark:bg-[#f44336]/80 dark:hover:bg-[#d32f2f]/90 text-white border-0 shadow-sm"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/");
                  },
                },
              });
            }}
          >
            Se déconnecter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
