"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Users, Clock, CheckCircle } from "lucide-react";

interface ImpactStatsProps {
  stats?: {
    totalMembers: number;
    totalHours: number;
    completedWorkshops: number;
  };
}

export function ImpactStats({ stats }: Readonly<ImpactStatsProps>) {
  const impactItems = [
    {
      label: "Membres Solidaires",
      value: stats?.totalMembers || 0,
      icon: Users,
      color: "text-ls-blue",
      bgColor: "bg-ls-blue-soft",
    },
    {
      label: "Heures Partagées",
      value: `${stats?.totalHours || 0}h`,
      icon: Clock,
      color: "text-brand",
      bgColor: "bg-brand-soft",
    },
    {
      label: "Ateliers Réussis",
      value: stats?.completedWorkshops || 0,
      icon: CheckCircle,
      color: "text-ls-success",
      bgColor: "bg-ls-success-soft",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {impactItems.map((item) => (
        <Card key={item.label} className="border border-border/50 bg-card/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden group hover:border-brand/50 transition-all">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`${item.bgColor} p-3 rounded-xl transition-transform group-hover:scale-110`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-ls-muted">
                {item.label}
              </p>
              <p className="text-xl font-black text-ls-heading">
                {item.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
