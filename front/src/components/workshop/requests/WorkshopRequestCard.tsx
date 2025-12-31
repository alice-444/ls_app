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
      ? "bg-white dark:bg-[rgba(255,255,255,0.08)] rounded-[16px] p-3 sm:p-4 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]"
      : variant === "dashboard"
      ? "p-3 sm:p-4 rounded-[16px] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      : "border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] p-3 sm:p-4 bg-white dark:bg-[rgba(255,255,255,0.08)]";

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {content}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <Badge className={`text-xs ${statusColor} self-start sm:self-auto`}>
              {statusLabel}
            </Badge>
            {isPending && onAccept && onReject && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="default"
                  className="text-xs sm:text-sm px-3 sm:px-2 h-8 sm:h-7 w-full sm:w-auto bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold"
                  onClick={() => onAccept(request)}
                >
                  <Check className="w-3 h-3 sm:w-3 sm:h-3 mr-1.5 sm:mr-1" />
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs sm:text-sm px-3 sm:px-2 h-8 sm:h-7 w-full sm:w-auto border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 rounded-[32px]"
                  onClick={() => onReject(request.id)}
                  disabled={isRejecting}
                >
                  <X className="w-3 h-3 sm:w-3 sm:h-3 mr-1.5 sm:mr-1" />
                  Refuser
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${
          variant === "compact" ? "gap-2" : ""
        }`}
      >
        {content}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
          <Badge className={`text-xs ${statusColor} self-start sm:self-auto`}>
            {statusLabel}
          </Badge>
          {isPending && onAccept && onReject && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="default"
                className="text-xs sm:text-sm px-3 sm:px-2 h-8 sm:h-7 w-full sm:w-auto bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold"
                onClick={() => onAccept(request)}
              >
                <Check className="w-3 h-3 sm:w-3 sm:h-3 mr-1.5 sm:mr-1" />
                Accepter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs sm:text-sm px-3 sm:px-2 h-8 sm:h-7 w-full sm:w-auto border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 rounded-[32px]"
                onClick={() => onReject(request.id)}
                disabled={isRejecting}
              >
                <X className="w-3 h-3 sm:w-3 sm:h-3 mr-1.5 sm:mr-1" />
                Refuser
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

