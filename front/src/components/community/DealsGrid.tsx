"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Laptop, Ticket, Briefcase, ExternalLink, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  promoCode?: string | null;
  imageUrl?: string | null;
}

interface DealsGridProps {
  initialDeals: Deal[];
}

const CATEGORIES = [
  { id: "ALL", label: "Tous", icon: Tag },
  { id: "FOOD", label: "Food", icon: Utensils },
  { id: "SOFTWARE", label: "Logiciels", icon: Laptop },
  { id: "CULTURE", label: "Culture", icon: Ticket },
  { id: "SERVICES", label: "Services", icon: Briefcase },
];

export function DealsGrid({ initialDeals }: DealsGridProps) {
  const [filter, setFilter] = useState("ALL");

  const filteredDeals = filter === "ALL" 
    ? initialDeals 
    : initialDeals.filter(d => d.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant="outline"
            size="sm"
            onClick={() => setFilter(cat.id)}
            className={cn(
              "rounded-full border-ls-border hover:border-brand hover:bg-brand-soft transition-all h-9 px-4",
              filter === cat.id && "bg-brand text-ls-heading border-brand hover:bg-brand-hover"
            )}
          >
            <cat.icon className="w-4 h-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      {filteredDeals.length === 0 ? (
        <div className="text-center py-12 bg-ls-surface border border-dashed border-ls-border rounded-[16px]">
          <Tag className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
          <p className="text-ls-muted">Aucun bon plan dans cette catégorie pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="group hover:shadow-md transition-all border-ls-border bg-ls-surface overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="secondary" className="bg-ls-blue-soft text-ls-blue border-none text-[10px] uppercase tracking-wider">
                    {deal.category}
                  </Badge>
                  {deal.promoCode && (
                    <Badge variant="outline" className="border-brand text-brand bg-brand-soft font-mono">
                      {deal.promoCode}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-brand transition-colors">
                  {deal.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-ls-muted line-clamp-2 mb-4">
                  {deal.description}
                </p>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between h-9 text-xs hover:bg-brand-soft text-ls-heading font-semibold"
                >
                  <a href={deal.link} target="_blank" rel="noopener noreferrer">
                    En profiter
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
