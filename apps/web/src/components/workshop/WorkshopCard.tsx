"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  LinkIcon,
  Users,
  MoreVertical,
} from "lucide-react";
import { formatDate, formatTime, getStatusBadge } from "@/lib/workshop-utils";
import { WorkshopDropdownMenu } from "./WorkshopDropdownMenu";
import { WorkshopDetails } from "./WorkshopDetails";
import { Star } from "lucide-react";

interface WorkshopCardProps {
  workshop: {
    id: string;
    title: string;
    date?: Date | string | null;
    time?: string | null;
    duration?: number | null;
    location?: string | null;
    isVirtual?: boolean;
    apprenticeId?: string | null;
    maxParticipants?: number | null;
    status?: string;
    averageRating?: number | null;
  };
  variant?: "default" | "hero" | "past";
  onViewDetails?: (workshopId: string) => void;
  onViewParticipants?: (workshopId: string) => void;
  onEdit?: (workshopId: string) => void;
  onReschedule?: (workshopId: string) => void;
  onDelete?: (workshopId: string) => void;
  onDuplicate?: (workshopId: string) => void;
  showDropdown?: boolean;
  className?: string;
}

export function WorkshopCard({
  workshop,
  variant = "default",
  onViewDetails,
  onViewParticipants,
  onEdit,
  onReschedule,
  onDelete,
  onDuplicate,
  showDropdown = true,
  className = "",
}: WorkshopCardProps) {
  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(workshop.id);
    }
  };

  const isPast = variant === "past";
  const isHero = variant === "hero";

  return (
    <Card
      className={`hover:shadow-lg transition-shadow relative ${
        isHero ? "lg:col-span-full" : ""
      } ${className}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={isPast ? "flex-1" : ""}>
            <CardTitle className={`${isHero ? "text-2xl" : "text-lg"} pr-2`}>
              {workshop.title}
            </CardTitle>
            {isPast && (
              <div className="mt-2 flex items-center gap-2">
                {workshop.status && getStatusBadge(workshop.status)}
                {workshop.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {workshop.averageRating}/5
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {showDropdown && (
            <WorkshopDropdownMenu
              workshop={workshop}
              onViewDetails={onViewDetails}
              onViewParticipants={onViewParticipants}
              onEdit={onEdit}
              onReschedule={onReschedule}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`space-y-2 ${onViewDetails ? "cursor-pointer" : ""}`}
          onClick={handleCardClick}
        >
          <WorkshopDetails
            workshop={workshop}
            variant={isHero ? "hero" : "default"}
          />
        </div>
        {isPast && onDuplicate && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(workshop.id);
              }}
            >
              Dupliquer cet atelier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

