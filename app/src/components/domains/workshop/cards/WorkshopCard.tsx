"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";
import { WorkshopDropdownMenu } from "../WorkshopDropdownMenu";
import { WorkshopDetails } from "../WorkshopDetails";
import type { WorkshopCardProps } from "@/types/workshop-components";

/**
 * WorkshopCard Component
 * Displays a summary of a workshop.
 * Follows SRP by delegating details rendering to WorkshopDetails and actions to WorkshopDropdownMenu.
 */
export function WorkshopCard({
  workshop,
  variant = "default",
  onViewDetails,
  onViewParticipants,
  onEdit,
  onReschedule,
  onDelete,
  onDuplicate,
  onComplete,
  onRequestParticipation,
  showDropdown = true,
  className = "",
}: Readonly<WorkshopCardProps>) {
  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(workshop.id);
    }
  };

  const isPast = variant === "past";
  const isHero = variant === "hero";
  const isCatalogue = variant === "catalogue";

  const getWorkshopDetailsVariant = (): "hero" | "catalogue" | "default" => {
    if (isHero) return "hero";
    if (isCatalogue) return "catalogue";
    return "default";
  };

  // Logic to get the creator's name (displayName, name, or fallback)
  const creatorName =
    workshop.creator?.displayName ||
    workshop.creator?.name ||
    "Mentor";

  return (
    <Card
      className={`hover:shadow-lg transition-shadow relative overflow-hidden min-w-0 ${isHero ? "lg:col-span-full" : ""
        } ${onViewDetails ? "cursor-pointer" : ""} ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-ls-heading ${isHero ? "text-3xl" : "text-xl"} truncate`}>
              {workshop.title}
            </CardTitle>
            {workshop.description && !isHero && (
              <CardDescription className="line-clamp-2 mt-2 text-ls-muted min-w-0 overflow-hidden break-all">
                {workshop.description}
              </CardDescription>
            )}
          </div>
          {showDropdown && !isCatalogue && (
            <WorkshopDropdownMenu
              workshop={workshop}
              onViewDetails={onViewDetails}
              onViewParticipants={onViewParticipants}
              onEdit={onEdit}
              onReschedule={onReschedule}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onComplete={onComplete}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 min-w-0 overflow-hidden">
          {isCatalogue && workshop.creator && (
            <div className="flex items-center gap-2 text-sm mb-3 min-w-0">
              <User className="h-4 w-4 text-ls-muted shrink-0" />
              <span className="text-ls-heading font-medium truncate">{creatorName}</span>
            </div>
          )}
          <WorkshopDetails
            workshop={workshop}
            variant={getWorkshopDetailsVariant()}
          />
        </div>

        {isPast && onDuplicate && (
          <div className="mt-4 pt-4 border-t border-ls-border">
            <Button
              variant="ctaOutline"
              size="cta"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(workshop.id);
              }}
            >
              Reprogrammer cet atelier
            </Button>
          </div>
        )}

        {isCatalogue && onRequestParticipation && (
          <div className="mt-4 pt-4 border-t border-ls-border">
            <Button
              variant="cta"
              size="cta"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onRequestParticipation(workshop);
              }}
            >
              Proposer un créneau
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
