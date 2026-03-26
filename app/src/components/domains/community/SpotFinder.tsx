"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Coffee, Zap, Moon, Wifi } from "lucide-react";

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

const TAG_ICONS: Record<string, any> = {
  "Ultra Calme": Moon,
  "Prises dispo": Zap,
  "Café pas cher": Coffee,
  "Wi-Fi Gratuit": Wifi,
};

export function SpotFinder({ initialSpots }: Readonly<SpotFinderProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {initialSpots.length === 0 ? (
        <div className="col-span-full text-center py-12 bg-card/50 border-2 border-dashed border-border rounded-2xl backdrop-blur-sm">
          <MapPin className="w-12 h-12 mx-auto text-ls-muted mb-4 opacity-20" />
          <p className="text-ls-muted">Aucun spot recommandé pour l'instant.</p>
        </div>
      ) : (
        initialSpots.map((spot) => (
          <Card key={spot.id} className="group hover:border-ls-success/30 transition-all border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-xl">
            <CardHeader className="p-6 pb-2">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-lg font-black text-ls-heading group-hover:text-ls-success transition-colors">
                  {spot.name}
                </CardTitle>
                <div className="flex items-center bg-ls-success/10 px-2 py-1 rounded-lg text-ls-success font-bold text-sm">
                  <Star className="w-4 h-4 fill-ls-success mr-1" />
                  {spot.rating}
                </div>
              </div>
              <div className="flex items-center text-ls-muted text-xs mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {spot.address}
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <p className="text-sm text-ls-muted line-clamp-2 mb-6">
                {spot.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {spot.tags.map(tag => {
                  const Icon = TAG_ICONS[tag] || MapPin;
                  return (
                    <Badge key={tag} variant="secondary" className="bg-muted/50 text-ls-muted border-none rounded-full px-3 py-1 text-[10px] font-bold">
                      <Icon className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
