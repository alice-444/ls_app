"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, X, MessageSquare } from "lucide-react";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
} from "@/lib/workshop-request-utils";
import type { WorkshopRequestCardProps } from "@/types/workshop-components";

const VARIANT_STYLES = {
  compact: {
    container:
      "bg-white dark:bg-[rgba(255,255,255,0.08)] rounded-[16px] p-3 sm:p-4 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]",
    name: "text-sm font-medium",
    title: "font-medium text-slate-900 dark:text-slate-100",
    message: "text-xs text-slate-600 dark:text-slate-400 mt-1 italic",
    date: "text-xs text-slate-500 dark:text-slate-500 mt-1",
    gap: "gap-2",
  },
  dashboard: {
    container:
      "p-3 sm:p-4 rounded-[16px] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
    name: "text-xs text-slate-600 dark:text-slate-400 mt-1",
    title: "font-medium text-sm",
    message: "text-xs text-slate-500 dark:text-slate-500 mt-1 italic",
    date: "text-xs text-slate-500 dark:text-slate-500 mt-1",
    gap: "",
  },
  default: {
    container:
      "border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] p-3 sm:p-4 bg-white dark:bg-[rgba(255,255,255,0.08)]",
    name: "font-medium text-slate-900 dark:text-slate-100",
    title: "font-medium text-slate-900 dark:text-slate-100",
    message: "text-sm text-slate-600 dark:text-slate-400 mt-1 italic",
    date: "text-xs text-slate-500 dark:text-slate-500 mt-2",
    gap: "",
  },
} as const;

function ActionButtons({
  request,
  onAccept,
  onReject,
  isRejecting,
}: Readonly<{
  request: WorkshopRequestCardProps["request"];
  onAccept: NonNullable<WorkshopRequestCardProps["onAccept"]>;
  onReject: NonNullable<WorkshopRequestCardProps["onReject"]>;
  isRejecting: boolean;
}>) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Button
        variant="ctaSuccess"
        size="ctaSm"
        className="w-full sm:w-auto"
        onClick={() => onAccept(request)}
      >
        <Check className="w-3 h-3 sm:w-3 sm:h-3" />
        Accepter
      </Button>
      <Button
        variant="ctaDestructive"
        size="ctaSm"
        className="w-full sm:w-auto"
        onClick={() => onReject(request.id)}
        disabled={isRejecting}
      >
        <X className="w-3 h-3 sm:w-3 sm:h-3" />
        Refuser
      </Button>
    </div>
  );
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
}: Readonly<WorkshopRequestCardProps>) {
  const isPending = request.status === "PENDING";
  const apprenticeName = request.apprentice?.user?.name || "Apprenti";
  const mentorName = request.mentor?.user?.name || "Mentor";
  const statusLabel = getWorkshopRequestStatusLabel(request.status);
  const statusColor = getWorkshopRequestStatusColor(request.status);

  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;
  const containerClass = styles.container;
  const nameClass = styles.name;
  const titleClass = styles.title;
  const messageClass = styles.message;
  const dateClass = styles.date;

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
      {request.status === "REJECTED" && request.rejectionReason && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-md">
          <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Motif du refus :
          </p>
          <p className="text-[11px] text-red-600 dark:text-red-300 italic mt-0.5">
            "{request.rejectionReason}"
          </p>
        </div>
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
              <ActionButtons
                request={request}
                onAccept={onAccept}
                onReject={onReject}
                isRejecting={isRejecting}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${styles.gap}`}
      >
        {content}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
          <Badge className={`text-xs ${statusColor} self-start sm:self-auto`}>
            {statusLabel}
          </Badge>
          {isPending && onAccept && onReject && (
            <ActionButtons
              request={request}
              onAccept={onAccept}
              onReject={onReject}
              isRejecting={isRejecting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

