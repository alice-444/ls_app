"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  LinkIcon,
  Users,
  MoreVertical,
  User,
  BookOpen,
} from "lucide-react";
import { formatDate, formatTime, getStatusBadge } from "@/lib/workshop-utils";
import { WorkshopDropdownMenu } from "../WorkshopDropdownMenu";
import { WorkshopDetails } from "../WorkshopDetails";
import { Star } from "lucide-react";
import type { WorkshopCardProps } from "@/types/workshop-components";

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
}: WorkshopCardProps) {
  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(workshop.id);
    }
  };

  const isPast = variant === "past";
  const isHero = variant === "hero";
  const isCatalogue = variant === "catalogue";

  return (
    <Card
      className={`hover:shadow-lg transition-shadow relative ${
        isHero ? "lg:col-span-full" : ""
      } ${isCatalogue ? "cursor-pointer" : ""} ${className}`}
      onClick={isCatalogue ? handleCardClick : undefined}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={isPast || isCatalogue ? "flex-1" : ""}>
            <CardTitle className={`${isHero ? "text-2xl" : "text-lg"} pr-2`}>
              {workshop.title}
            </CardTitle>
            {isCatalogue && workshop.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {workshop.description}
              </CardDescription>
            )}
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
        <div
          className={`space-y-2 ${onViewDetails && !isCatalogue ? "cursor-pointer" : ""}`}
          onClick={!isCatalogue ? handleCardClick : undefined}
        >
          {isCatalogue && workshop.creator && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {workshop.creator.user?.name || "Mentor"}
              </span>
            </div>
          )}
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
        {isCatalogue && onRequestParticipation && (
          <div className="mt-4 pt-4 border-t">
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onRequestParticipation(workshop);
              }}
            >
              <BookOpen className="h-4 w-4" />
              Demander à participer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

