"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { WorkshopCard } from "@/components/workshop/cards/WorkshopCard";
import type { WorkshopDetailed } from "@ls-app/shared";

interface AvailableWorkshopsGridProps {
  readonly workshops: WorkshopDetailed[] | undefined;
  readonly onJoinWorkshop: (workshop: WorkshopDetailed) => void;
}

export function AvailableWorkshopsGrid({
  workshops,
  onJoinWorkshop,
}: AvailableWorkshopsGridProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {workshops && workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              variant="catalogue"
              className="border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-brand/10 transition-all duration-300"
              onViewDetails={(id) => router.push(`/workshop/${id}`)}
              onRequestParticipation={(w) => onJoinWorkshop(w)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Aucun atelier disponible
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Tous les ateliers ouverts sont déjà complets ou vous y êtes déjà
              inscrit.
            </p>
            <Button onClick={() => router.push("/workshop-room")}>
              Voir tous les ateliers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
