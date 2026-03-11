import Image from "next/image";
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
  LogIn,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface MenuLink {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: ("MENTOR" | "APPRENANT" | "ADMIN")[];
  separatorBefore?: boolean;
}

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const menuLinks: MenuLink[] = useMemo(
    () => [
      {
        href: "/admin",
        label: "Dashboard Admin",
        icon: ShieldCheck,
        roles: ["ADMIN"],
      },
      {
        href: "/admin/notifications",
        label: "Notifications",
        icon: Bell,
        roles: ["ADMIN"],
      },
      {
        href: "/admin/settings",
        label: "Paramètres",
        icon: Settings,
        roles: ["ADMIN"],
      },
      {
        href: "/dashboard",
        label: "Tableau de bord",
        icon: LayoutDashboard,
        roles: ["MENTOR", "APPRENANT"],
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
        roles: ["MENTOR", "APPRENANT"],
      },
      {
        href: "/settings",
        label: "Paramètres",
        icon: Settings,
        roles: ["MENTOR", "APPRENANT"],
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

  const activeHref = useMemo(() => {
    const matching = filteredMenuLinks
      .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`) || pathname.startsWith(`${l.href}?`))
      .sort((a, b) => b.href.length - a.href.length)[0];
    return matching?.href ?? null;
  }, [filteredMenuLinks, pathname]);

  if (isPending) {
    return (
      <div className="flex items-center gap-2 rounded-full p-1">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    );
  }

  if (!session) {
    if (pathname === "/login") {
      return null;
    }
    return (
      <Button
        variant="outline"
        asChild
        size="sm"
        className="group/btn h-9 sm:h-10 px-4 sm:px-5 border-2 border-(--primary-orange) text-(--primary-orange-dark) dark:text-(--primary-orange) bg-white/80 dark:bg-white/5 backdrop-blur-md hover:bg-(--primary-orange)/15 dark:hover:bg-(--primary-orange)/20 hover:border-(--primary-orange) hover:shadow-lg hover:shadow-(--primary-orange)/25 dark:hover:shadow-(--primary-orange)/20 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-(--primary-orange) focus-visible:ring-offset-2 transition-all duration-200 ease-out rounded-full font-semibold"
      >
        <Link href="/login?mode=signin" className="inline-flex items-center gap-2">
          <LogIn className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          <span>Se connecter</span>
        </Link>
      </Button>
    );
  }

  if (isLoadingRole) {
    return (
      <div className="flex items-center gap-2 rounded-full p-1">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    );
  }

  const getRoleIcon = (role: "MENTOR" | "APPRENANT" | "ADMIN" | null) => {
    if (role === "ADMIN") return <ShieldCheck className="h-4 w-4 text-primary" />;
    return role === "MENTOR" ? (
      <Users className="h-4 w-4" />
    ) : (
      <GraduationCap className="h-4 w-4" />
    );
  };

  const getRoleLabel = (role: "MENTOR" | "APPRENANT" | "ADMIN" | null) => {
    if (role === "ADMIN") return "Administrateur";
    return role === "MENTOR" ? "Mentor" : "Apprenant";
  };

  const isActive = (href: string) => activeHref === href;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="group flex items-center gap-2 sm:gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background rounded-full p-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Menu utilisateur"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-brand/50 overflow-hidden bg-white/35 dark:bg-white/15 backdrop-blur-xl backdrop-saturate-150 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08),inset_0_2px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35),0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.15)] ring-2 ring-transparent group-hover:ring-brand/40 group-hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.15),0_6px_12px_-4px_rgba(0,0,0,0.1),inset_0_2px_0_0_rgba(255,255,255,0.7),0_0_25px_-8px_rgba(255,182,71,0.35)] transition-all duration-200">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-brand/10">
                <User className="h-5 w-5 text-brand" aria-hidden />
              </div>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 sm:h-6 sm:w-6 text-ls-heading transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 bg-card/95 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 p-0 min-w-[18rem] overflow-hidden"
      >
        {/* Header avec avatar + nom */}
        <div className="relative px-4 py-4 bg-linear-to-br from-brand/5 via-transparent to-brand/5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-brand overflow-hidden bg-card shadow-md shrink-0">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-brand/10">
                  <User className="h-6 w-6 text-brand" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ls-heading truncate">
                {session.user.name || "Utilisateur"}
              </p>
              <p className="text-xs text-ls-muted truncate">{session.user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-2 max-h-[min(70vh,400px)] overflow-y-auto">
          <DropdownMenuLabel className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-ls-muted">
            Navigation
          </DropdownMenuLabel>
          <AnimatePresence>
            {filteredMenuLinks.map((link, index) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <motion.div
                  key={link.href}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : index * 0.02 }}
                >
                  {link.separatorBefore && index > 0 && (
                    <DropdownMenuSeparator className="bg-border/50 my-1" />
                  )}
                  <DropdownMenuItem
                    asChild
                    className={`px-3 py-2.5 text-sm rounded-xl transition-all cursor-pointer w-full flex items-center ${
                      active
                        ? "bg-brand/15 text-brand font-medium focus:bg-brand/20"
                        : "text-ls-heading hover:bg-brand/10 focus:bg-brand/10"
                    }`}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center w-full gap-2"
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1">{link.label}</span>
                      {active && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                          aria-hidden
                        />
                      )}
                    </Link>
                  </DropdownMenuItem>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <DropdownMenuSeparator className="bg-border/50 my-2" />

          {userRole && (
            <div className="px-3 py-2 flex items-center gap-2 text-sm text-ls-muted rounded-xl bg-muted/30">
              {getRoleIcon(userRole)}
              <span>Rôle : {getRoleLabel(userRole)}</span>
            </div>
          )}

          <DropdownMenuSeparator className="bg-border/50 my-2" />

          <div className="px-2 py-1.5">
            <Button
              variant="destructive"
              className="w-full h-9 rounded-full text-sm font-semibold"
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
