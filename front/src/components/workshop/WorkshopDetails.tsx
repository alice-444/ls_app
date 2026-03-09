"use client";

import { Calendar, Clock, MapPin, LinkIcon, Users, Tag } from "lucide-react";
import { formatDate, formatTime } from "@/lib/workshop-utils";
import type { WorkshopBase } from "@/types/workshop";

interface WorkshopDetailsProps {
  workshop: Partial<WorkshopBase> & {
    apprenticeId?: string | null;
  };
  variant?: "default" | "hero" | "catalogue";
}

/**
 * WorkshopDetails Component
 * Pure presentational component that renders workshop metadata.
 */
const TEXT_COLOR_BY_VARIANT: Record<
  NonNullable<WorkshopDetailsProps["variant"]>,
  string
> = {
  hero: "text-blue-100",
  catalogue: "text-ls-muted",
  default: "text-slate-600 dark:text-slate-400",
};

export function WorkshopDetails({
  workshop,
  variant = "default",
}: WorkshopDetailsProps) {
  const textColor = TEXT_COLOR_BY_VARIANT[variant ?? "default"];
  const iconSize = variant === "hero" ? "w-5 h-5" : "w-4 h-4";
  const textSize = variant === "hero" ? "font-medium" : "text-sm";

  return (
    <>
      {workshop.topic && (
        <div className={`flex items-center gap-2 ${textSize} ${textColor}`}>
          <Tag className={iconSize} />
          {workshop.topic}
        </div>
      )}
      {workshop.date && (
        <div className={`flex items-center gap-2 ${textSize} ${textColor}`}>
          <Calendar className={iconSize} />
          {formatDate(workshop.date, {
            includeWeekday: variant === "hero",
          })}
        </div>
      )}
      {workshop.time && (
        <div className={`flex items-center gap-2 ${textSize} ${textColor}`}>
          <Clock className={iconSize} />
          {formatTime(workshop.time)}
          {workshop.duration && ` • ${workshop.duration} min`}
        </div>
      )}
      {workshop.isVirtual ? (
        <div className={`flex items-center gap-2 ${textSize} ${textColor}`}>
          <LinkIcon className={iconSize} />
          {variant === "hero" ? "Atelier en ligne" : "En ligne"}
        </div>
      ) : (
        workshop.location && (
          <div className={`flex items-center gap-2 ${textSize} ${textColor}`}>
            <MapPin className={iconSize} />
            {workshop.location}
          </div>
        )
      )}
      <div className={`flex items-center gap-2 ${textSize} ${textColor}`}>
        <Users className={iconSize} />
        {variant === "hero" ? "Inscrits: " : ""}
        {workshop.apprenticeId ? 1 : 0} / {workshop.maxParticipants || "∞"}
      </div>
    </>
  );
}
