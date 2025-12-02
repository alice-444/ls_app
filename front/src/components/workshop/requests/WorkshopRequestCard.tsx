"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
} from "@/lib/workshop-request-utils";

interface WorkshopRequestCardProps {
  request: {
    id: string;
    status: string;
    title?: string | null;
    description?: string | null;
    message?: string | null;
    preferredDate?: Date | string | null;
    preferredTime?: string | null;
    createdAt: Date | string;
    apprentice?: {
      user?: {
        name: string | null;
      };
    };
    mentor?: {
      user?: {
        name: string | null;
      };
    };
  };
  onAccept?: (request: any) => void;
  onReject?: (requestId: string) => void;
  isRejecting?: boolean;
  variant?: "default" | "compact" | "dashboard";
  showTitle?: boolean;
  showDescription?: boolean;
  showPreferredDate?: boolean;
  showMentor?: boolean;
}

export function WorkshopRequestCard({
  request,
  onAccept,
  onReject,
  isRejecting = false,
  variant = "default",
  showTitle = false,
  showDescription = false,
  showPreferredDate = false,
  showMentor = false,
}: WorkshopRequestCardProps) {
  const isPending = request.status === "PENDING";
  const apprenticeName = request.apprentice?.user?.name || "Apprenti";
  const mentorName = request.mentor?.user?.name || "Mentor";
  const statusLabel = getWorkshopRequestStatusLabel(request.status);
  const statusColor = getWorkshopRequestStatusColor(request.status);

  const containerClass =
    variant === "compact"
      ? "bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border"
      : variant === "dashboard"
      ? "flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      : "border rounded-lg p-4 bg-slate-50 dark:bg-slate-900";

  const nameClass =
    variant === "compact"
      ? "text-sm font-medium"
      : variant === "dashboard"
      ? "text-xs text-slate-600 dark:text-slate-400 mt-1"
      : "font-medium text-slate-900 dark:text-slate-100";

  const titleClass =
    variant === "dashboard"
      ? "font-medium text-sm"
      : "font-medium text-slate-900 dark:text-slate-100";

  const messageClass =
    variant === "compact"
      ? "text-xs text-slate-600 dark:text-slate-400 mt-1 italic"
      : variant === "dashboard"
      ? "text-xs text-slate-500 dark:text-slate-500 mt-1 italic"
      : "text-sm text-slate-600 dark:text-slate-400 mt-1 italic";

  const dateClass =
    variant === "compact"
      ? "text-xs text-slate-500 dark:text-slate-500 mt-1"
      : variant === "dashboard"
      ? "text-xs text-slate-500 dark:text-slate-500 mt-1"
      : "text-xs text-slate-500 dark:text-slate-500 mt-2";

  const content = (
    <div className="flex-1">
      {showTitle && request.title && (
        <h4 className={titleClass}>{request.title}</h4>
      )}
      {variant === "dashboard" && !showTitle && (
        <p className={nameClass}>
          {showMentor ? `Mentor: ${mentorName}` : `De: ${apprenticeName}`}
        </p>
      )}
      {variant !== "dashboard" && (
        <p className={nameClass}>
          {showMentor ? mentorName : apprenticeName}
        </p>
      )}
      {showDescription && request.description && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-2">
          {request.description}
        </p>
      )}
      {request.message && (
        <p className={messageClass}>"{request.message}"</p>
      )}
      {showPreferredDate && request.preferredDate && (
        <p className={dateClass}>
          Date préférée:{" "}
          {new Date(request.preferredDate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {request.preferredTime && ` à ${request.preferredTime}`}
        </p>
      )}
      <p className={dateClass}>
        {new Date(request.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );

  if (variant === "dashboard") {
    return (
      <div className={containerClass}>
        {content}
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${statusColor}`}>{statusLabel}</Badge>
          {isPending && onAccept && onReject && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="default"
                className="text-xs px-2"
                onClick={() => onAccept(request)}
              >
                <Check className="w-3 h-3 mr-1" />
                Accepter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-2 text-red-600 hover:text-red-700"
                onClick={() => onReject(request.id)}
                disabled={isRejecting}
              >
                <X className="w-3 h-3 mr-1" />
                Refuser
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div
        className={`flex items-start justify-between ${
          variant === "compact" ? "gap-2" : "gap-3"
        }`}
      >
        {content}
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${statusColor}`}>{statusLabel}</Badge>
          {isPending && onAccept && onReject && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="default"
                className="text-xs px-2 h-7"
                onClick={() => onAccept(request)}
              >
                <Check className="w-3 h-3 mr-1" />
                Accepter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-2 h-7 text-red-600 hover:text-red-700"
                onClick={() => onReject(request.id)}
                disabled={isRejecting}
              >
                <X className="w-3 h-3 mr-1" />
                Refuser
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

