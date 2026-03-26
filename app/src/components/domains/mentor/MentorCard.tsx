"use client";

import Image from "next/image";
import { User, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MentorCardProps } from "@/types/workshop-components";

export function MentorCard({ mentor, onViewProfile, className }: Readonly<MentorCardProps>) {
  const {
    id,
    displayName,
    domain,
    bio,
    photoUrl,
    areasOfExpertise,
    workshopsCount,
  } = mentor;

  return (
    <Card className={cn(
      "overflow-hidden flex flex-col h-full rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-xl shadow-black/5 gap-3 py-0",
      "hover:shadow-2xl hover:shadow-brand/10 transition-all duration-300",
      className
    )}>
      <div className="relative h-32 w-full bg-brand/5">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={displayName || "Mentor"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <User className="w-12 h-12 text-ls-muted" />
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          {workshopsCount !== undefined && workshopsCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 rounded-full border border-border/50 bg-card/95 backdrop-blur-sm">
              <BookOpen className="w-3 h-3" />
              {workshopsCount} atelier{workshopsCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 flex-1 min-w-0">
        <div className="mb-1">
          <h3 className="font-bold text-base line-clamp-1 text-ls-heading">{displayName}</h3>
          <p className="text-xs font-medium text-brand">{domain || "Mentor"}</p>
        </div>

        <p className="text-xs text-ls-muted line-clamp-2 mb-3">
          {bio || "Aucune description disponible."}
        </p>

        <div className="flex flex-wrap gap-1">
          {areasOfExpertise?.slice(0, 3).map((expertise) => (
            <Badge key={expertise} variant="outline" className="text-[10px] px-1.5 py-0 rounded-full border-border/50 bg-brand/5 text-ls-heading">
              {expertise}
            </Badge>
          ))}
          {(areasOfExpertise?.length || 0) > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full border-border/50 bg-brand/5 text-ls-muted">
              +{(areasOfExpertise?.length || 0) - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <Button
          onClick={() => onViewProfile?.(id)}
          variant="cta" size="cta" className="w-full"
        >
          Voir le profil
        </Button>
      </CardFooter>
    </Card>
  );
}
