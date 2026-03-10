"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const isCardClickable = !isCatalogue && onViewDetails;

  const getWorkshopDetailsVariant = (): "hero" | "catalogue" | "default" => {
    if (isHero) return "hero";
    if (isCatalogue) return "catalogue";
    return "default";
  };

  // Logic to get the creator's name - now simplified thanks to DTOs
  const creatorName = workshop.creator?.displayName || "Mentor";

  return (
    <Card
      className={`hover:shadow-lg transition-shadow relative ${
        isHero ? "lg:col-span-full" : ""
      } ${isCatalogue ? "cursor-pointer" : ""} ${className}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-ls-heading ${isHero ? "text-3xl" : "text-xl"} truncate`}>
              {workshop.title}
            </CardTitle>
            {workshop.description && !isHero && (
              <CardDescription className="line-clamp-2 mt-2 text-ls-muted">
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
        {isCardClickable ? (
          <button
            type="button"
            className="w-full text-left space-y-2 cursor-pointer border-none bg-transparent p-0 font-inherit"
            onClick={handleCardClick}
          >
            <WorkshopDetails
              workshop={workshop}
              variant={getWorkshopDetailsVariant()}
            />
          </button>
        ) : (
          <div className="space-y-2">
            {isCatalogue && workshop.creator && (
              <div className="flex items-center gap-2 text-sm mb-3">
                <User className="h-4 w-4 text-ls-muted" />
                <span className="text-ls-heading font-medium">{creatorName}</span>
              </div>
            )}
            <WorkshopDetails
              workshop={workshop}
              variant={getWorkshopDetailsVariant()}
            />
          </div>
        )}
        
        {isPast && onDuplicate && (
          <div className="mt-4 pt-4 border-t border-ls-border">
            <Button
              variant="ctaOutline"
              size="cta"
              className="w-full"
              onClick={() => onDuplicate(workshop.id)}
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
