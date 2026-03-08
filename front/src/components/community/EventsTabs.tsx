"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkshopCard } from "@/components/workshop/cards/WorkshopCard";
import { useRouter } from "next/navigation";
import { Calendar, History } from "lucide-react";

interface EventsTabsProps {
  upcoming: any[];
  past: any[];
}

export function EventsTabs({ upcoming, past }: EventsTabsProps) {
  const router = useRouter();

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="inline-flex h-11 items-center justify-center rounded-2xl bg-ls-bg p-1 text-ls-text-light mb-6 border border-ls-border">
        <TabsTrigger 
          value="upcoming" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-ls-blue data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-ls-border"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Upcoming ({upcoming.length})
        </TabsTrigger>
        <TabsTrigger 
          value="past"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-ls-blue data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-ls-border"
        >
          <History className="w-4 h-4 mr-2" />
          Past ({past.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="mt-0 focus-visible:ring-0">
        {upcoming.length === 0 ? (
          <div className="text-center py-12 bg-ls-bg/50 border-2 border-dashed border-ls-border rounded-3xl">
            <Calendar className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
            <p className="text-ls-muted">No workshops scheduled yet.</p>
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
          <div className="text-center py-12 bg-ls-bg/50 border-2 border-dashed border-ls-border rounded-3xl">
            <History className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
            <p className="text-ls-muted">No workshop history yet.</p>
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
