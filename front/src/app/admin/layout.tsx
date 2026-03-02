"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Loader2, ShieldAlert, LayoutDashboard, Flag, MessageSquare, LifeBuoy, Users, Settings, Bell, History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // We use the trpc health check or a simple query to verify session on server side too if needed
  // But here we'll rely on a specific query that only admins can call
  const { error } = trpc.admin.getStats.useQuery(undefined, {
    enabled: !!session,
    retry: false,
  });

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/login");
    }
    if (error?.data?.code === "FORBIDDEN") {
      setIsAdmin(false);
    } else if (session && !error) {
      setIsAdmin(true);
    }
  }, [session, isSessionPending, error, router]);

  if (isSessionPending || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Accès Refusé</h1>
        <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link href="/" className="text-primary hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Signalements", href: "/admin/user-reports", icon: Flag },
    { label: "Modération", href: "/admin/feedback-moderation", icon: MessageSquare },
    { label: "Support", href: "/admin/support", icon: LifeBuoy },
    { label: "Onboarding", href: "/admin/onboarding", icon: Users },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Paramètres", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Admin */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-white p-6 dark:bg-slate-900 lg:block">
        <div className="mb-10 flex items-center gap-2 font-bold text-xl text-primary">
          <ShieldAlert className="h-6 w-6" />
          <span>LS Admin</span>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="container mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
