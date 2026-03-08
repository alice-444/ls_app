"use client";

import Image from "next/image";
import { User, BookOpen, Star, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MentorCardProps } from "@/types/workshop-components";

export function MentorCard({ mentor, onViewProfile, className }: MentorCardProps) {
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
    <Card className={cn("overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow", className)}>
      <div className="relative h-48 w-full bg-muted">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={displayName || "Mentor"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          {workshopsCount !== undefined && workshopsCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 dark:bg-black/80">
              <BookOpen className="w-3 h-3" />
              {workshopsCount} atelier{workshopsCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex-1">
        <div className="mb-2">
          <h3 className="font-bold text-lg line-clamp-1">{displayName}</h3>
          <p className="text-sm text-primary font-medium">{domain || "Mentor"}</p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[3rem]">
          {bio || "Aucune description disponible."}
        </p>

        <div className="flex flex-wrap gap-1">
          {areasOfExpertise?.slice(0, 3).map((expertise, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0">
              {expertise}
            </Badge>
          ))}
          {(areasOfExpertise?.length || 0) > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{(areasOfExpertise?.length || 0) - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onViewProfile?.(id)} 
          className="w-full"
          variant="default"
        >
          Voir le profil
        </Button>
      </CardFooter>
    </Card>
  );
}
