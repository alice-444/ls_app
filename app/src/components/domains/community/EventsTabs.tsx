"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { WorkshopCard } from "@/components/domains/workshop/cards/WorkshopCard";
import { useRouter } from "next/navigation";
import { Calendar, History } from "lucide-react";
import type { WorkshopDetailed } from "@ls-app/shared";

interface EventsTabsProps {
  upcoming: WorkshopDetailed[];
  past: WorkshopDetailed[];
}

/**
 * EventsTabs Component
 * Displays workshops separated by upcoming and past status.
 */
export function EventsTabs({ upcoming, past }: Readonly<EventsTabsProps>) {
  const router = useRouter();

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="inline-flex h-11 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm p-1 text-ls-muted mb-6 border border-border/50">
        <TabsTrigger
          value="upcoming"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-brand"
        >
          <Calendar className="w-4 h-4 mr-2" />
          À venir ({upcoming.length})
        </TabsTrigger>
        <TabsTrigger
          value="past"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-brand"
        >
          <History className="w-4 h-4 mr-2" />
          Passés ({past.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="mt-0 focus-visible:ring-0">
        {upcoming.length === 0 ? (
          <div className="text-center py-12 bg-card/50 border-2 border-dashed border-border rounded-2xl backdrop-blur-sm">
            <Calendar className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
            <p className="text-ls-muted">Aucun atelier programmé pour l'instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                variant="catalogue"
                showDropdown={false}
                onViewDetails={(id) => router.push(`/workshop/${id}`)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-0 focus-visible:ring-0">
        {past.length === 0 ? (
          <div className="text-center py-12 bg-card/50 border-2 border-dashed border-border rounded-2xl backdrop-blur-sm">
            <History className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
            <p className="text-ls-muted">Aucun historique d'ateliers pour l'instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {past.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                variant="past"
                showDropdown={false}
                onViewDetails={(id) => router.push(`/workshop/${id}`)}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
