"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { id: "ALL", label: "Tout", icon: Tag },
  { id: "FOOD", label: "Food & Drink", icon: Utensils },
  { id: "SOFTWARE", label: "Logiciels & Tech", icon: Laptop },
  { id: "CULTURE", label: "Culture & Loisirs", icon: Ticket },
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
              "rounded-full border-border hover:border-brand hover:bg-brand/5 dark:border-white/20 dark:hover:bg-brand/10 transition-all h-9 px-4 font-semibold",
              filter === cat.id && "bg-brand text-white border-brand hover:bg-brand-hover dark:bg-brand dark:border-brand"
            )}
          >
            <cat.icon className="w-4 h-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      {filteredDeals.length === 0 ? (
        <div className="text-center py-12 bg-card/50 border-2 border-dashed border-border rounded-2xl backdrop-blur-sm">
          <Tag className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
          <p className="text-ls-muted">Aucune offre dans cette catégorie pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="group hover:shadow-lg transition-all border border-border/50 bg-card/95 backdrop-blur-md overflow-hidden rounded-2xl shadow-xl dark:bg-card/90 dark:border-white/10 dark:hover:border-brand/30">
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="secondary" className="bg-ls-blue/10 dark:bg-ls-blue/20 text-ls-blue border-none text-[10px] uppercase tracking-wider font-bold">
                    {deal.category}
                  </Badge>
                  {deal.promoCode && (
                    <Badge variant="outline" className="border-brand text-brand bg-brand/5 dark:bg-brand/15 dark:border-brand/70 font-mono font-bold">
                      {deal.promoCode}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-brand transition-colors font-black text-ls-heading">
                  {deal.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-sm text-ls-muted line-clamp-2 mb-4">
                  {deal.description}
                </p>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between h-9 text-xs hover:bg-brand/5 dark:hover:bg-brand/10 text-ls-heading font-bold rounded-full"
                >
                  <a href={deal.link} target="_blank" rel="noopener noreferrer">
                    Voir l'offre
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
