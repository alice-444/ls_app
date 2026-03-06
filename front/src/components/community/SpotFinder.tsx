"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Coffee, Library, TreePine, Zap, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Spot {
  id: string;
  name: string;
  description: string;
  address: string;
  tags: string[];
  rating: number;
}

interface SpotFinderProps {
  initialSpots: Spot[];
}

const ALL_TAGS = ["Ultra Calme", "Prises dispo", "Café pas cher", "Ouvert tard", "Wi-Fi Gratuit"];

export function SpotFinder({ initialSpots }: SpotFinderProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredSpots = selectedTag 
    ? initialSpots.filter(s => s.tags.includes(selectedTag))
    : initialSpots;

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "Ultra Calme": return <Library className="w-3 h-3" />;
      case "Prises dispo": return <Zap className="w-3 h-3" />;
      case "Café pas cher": return <Coffee className="w-3 h-3" />;
      case "Ouvert tard": return <Moon className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-1 rounded-full transition-all border-ls-border",
              selectedTag === tag ? "bg-ls-success text-white border-ls-success" : "hover:border-ls-success hover:text-ls-success"
            )}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredSpots.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-ls-surface border border-dashed border-ls-border rounded-[16px]">
            <MapPin className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
            <p className="text-ls-muted">Aucun spot trouvé avec ce critère.</p>
          </div>
        ) : (
          filteredSpots.map((spot) => (
            <Card key={spot.id} className="hover:shadow-md transition-all border-ls-border bg-ls-surface">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-bold text-ls-heading">{spot.name}</CardTitle>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{spot.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-ls-muted mt-1">
                  <MapPin className="w-3 h-3" />
                  {spot.address}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-ls-muted line-clamp-2 mt-2">
                  {spot.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-4">
                  {spot.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-ls-border/30 text-[10px] h-5 gap-1 font-normal">
                      {getTagIcon(tag)}
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
