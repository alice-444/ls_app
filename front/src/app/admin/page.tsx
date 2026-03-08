"use client";

import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertOctagon,
  MessageSquare,
  LifeBuoy,
  Users,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  const statCards = [
    {
      title: "Signalements",
      description: "Signalements d'utilisateurs en attente",
      count: stats?.reports ?? 0,
      icon: AlertOctagon,
      href: "/admin/user-reports",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Modération",
      description: "Avis mentors sous révision",
      count: stats?.moderation ?? 0,
      icon: MessageSquare,
      href: "/admin/moderation",
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      title: "Support",
      description: "Demandes de support ouvertes",
      count: stats?.support ?? 0,
      icon: LifeBuoy,
      href: "/admin/support",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Onboarding",
      description: "Utilisateurs en attente de validation",
      count: stats?.onboarding ?? 0,
      icon: Users,
      href: "/admin/users?status=PENDING",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ls-heading">Tableau de bord administrateur</h1>
        <p className="text-ls-muted mt-2">
          Bienvenue dans votre espace de gestion. Voici un aperçu des tâches en attente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="overflow-hidden border-ls-border bg-ls-surface transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ls-text">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold text-ls-heading">{card.count}</div>
              )}
              <p className="text-xs text-ls-muted mt-1">{card.description}</p>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full mt-4 justify-between h-8 text-xs hover:bg-brand-soft group"
              >
                <Link href={card.href}>
                  Gérer
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-ls-border bg-ls-surface">
          <CardHeader>
            <CardTitle className="text-ls-heading">Actions rapides</CardTitle>
            <CardDescription className="text-ls-muted">
              Accédez directement aux modules de gestion
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/users"
              className="flex items-center p-4 border border-ls-border rounded-xl hover:bg-brand-soft transition-colors group"
            >
              <Users className="h-5 w-5 mr-3 text-ls-blue" />
              <span className="flex-1 font-medium text-ls-text">Gestion utilisateurs</span>
              <ChevronRight className="h-4 w-4 text-ls-muted transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center p-4 border border-ls-border rounded-xl hover:bg-brand-soft transition-colors group"
            >
              <ShieldCheck className="h-5 w-5 mr-3 text-ls-text" />
              <span className="flex-1 font-medium text-ls-text">Paramètres système</span>
              <ChevronRight className="h-4 w-4 text-ls-muted transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        {/* You can add more cards here for recent activity, etc. */}
      </div>
    </div>
  );
}

// Inline helper for ShieldCheck since it's not imported from lucide
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
