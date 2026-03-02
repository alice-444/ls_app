"use client";

import { trpc } from "@/utils/trpc";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Flag, MessageSquare, LifeBuoy, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  const statCards = [
    {
      title: "Signalements",
      description: "Signalements d'utilisateurs en attente",
      count: stats?.reports ?? 0,
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/10",
      href: "/admin/user-reports",
    },
    {
      title: "Modération",
      description: "Avis d'ateliers à modérer",
      count: stats?.moderation ?? 0,
      icon: MessageSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/10",
      href: "/admin/feedback-moderation",
    },
    {
      title: "Support",
      description: "Demandes d'assistance ouvertes",
      count: stats?.support ?? 0,
      icon: LifeBuoy,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/10",
      href: "/admin/support",
    },
    {
      title: "Onboarding",
      description: "Utilisateurs en attente de validation",
      count: stats?.onboarding ?? 0,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
      href: "/admin/onboarding",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité nécessitant une attention immédiate.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{stat.count}</div>
                )}
                <CardDescription className="mt-1 text-xs">{stat.description}</CardDescription>
                
                <Link 
                  href={stat.href} 
                  className="mt-4 flex items-center text-xs font-medium text-primary hover:underline"
                >
                  Gérer
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Flux d'activité système (Bientôt disponible)</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-slate-400 italic">
            Les journaux d'audit s'afficheront ici.
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alertes Système</CardTitle>
            <CardDescription>État des services et notifications critiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
              <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-sm font-medium">Tous les systèmes sont opérationnels</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
