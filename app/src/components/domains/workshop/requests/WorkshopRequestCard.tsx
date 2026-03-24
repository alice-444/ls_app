"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, X, MessageSquare } from "lucide-react";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
} from "@/lib/workshop-request-utils";
import type { WorkshopRequest } from "@ls-app/shared";
import type { WorkshopRequestCardProps } from "@/types/workshop-components";

type CardVariant = NonNullable<WorkshopRequestCardProps["variant"]>;

const BORDER_CARD =
  "border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]";
const BG_CARD =
  "bg-white dark:bg-[rgba(255,255,255,0.08)]";

function getContainerClass(variant: CardVariant): string {
  if (variant === "compact") {
    return `${BG_CARD} ${BORDER_CARD} p-3 sm:p-4`;
  }
  if (variant === "dashboard") {
    return `p-3 sm:p-4 ${BORDER_CARD} ${BG_CARD} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`;
  }
  return `${BORDER_CARD} p-3 sm:p-4 ${BG_CARD}`;
}

function getNameClass(variant: CardVariant): string {
  if (variant === "compact") return "text-sm font-medium";
  if (variant === "dashboard") return "text-xs text-slate-600 dark:text-slate-400 mt-1";
  return "font-medium text-slate-900 dark:text-slate-100";
}

function getTitleClass(variant: CardVariant): string {
  if (variant === "dashboard") return "font-medium text-sm";
  return "font-medium text-slate-900 dark:text-slate-100";
}

function getMessageClass(variant: CardVariant): string {
  if (variant === "compact") {
    return "text-xs text-slate-600 dark:text-slate-400 mt-1 italic";
  }
  if (variant === "dashboard") {
    return "text-xs text-slate-500 dark:text-slate-500 mt-1 italic";
  }
  return "text-sm text-slate-600 dark:text-slate-400 mt-1 italic";
}

function getDateClass(variant: CardVariant): string {
  const base = "text-xs text-slate-500 dark:text-slate-500";
  if (variant === "default") return `${base} mt-2`;
  return `${base} mt-1`;
}

function ApprenticeOrMentorName({
  showMentor,
  mentorName,
  apprenticeName,
  onViewApprenticeProfile,
  apprenticeUserId,
}: Readonly<{
  showMentor: boolean;
  mentorName: string;
  apprenticeName: string;
  onViewApprenticeProfile?: (userId: string) => void;
  apprenticeUserId?: string | null;
}>) {
  if (onViewApprenticeProfile && apprenticeUserId && !showMentor) {
    return (
      <button
        type="button"
        onClick={() => onViewApprenticeProfile(apprenticeUserId)}
        className="hover:underline text-brand font-medium text-left transition-colors"
      >
        {apprenticeName}
      </button>
    );
  }

  return <span>{showMentor ? mentorName : apprenticeName}</span>;
}

function PendingRequestActions({
  request,
  isPending,
  onAccept,
  onReject,
  isRejecting,
}: Readonly<{
  request: WorkshopRequest;
  isPending: boolean;
  onAccept?: (request: WorkshopRequest) => void;
  onReject?: (requestId: string) => void;
  isRejecting: boolean;
}>) {
  if (!isPending || !onAccept || !onReject) {
    return null;
  }

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

function WorkshopRequestCardContent({
  request,
  variant,
  showTitle,
  showDescription,
  showPreferredDate,
  showMentor,
  apprenticeName,
  mentorName,
  onViewApprenticeProfile,
}: Readonly<{
  request: WorkshopRequest;
  variant: CardVariant;
  showTitle: boolean;
  showDescription: boolean;
  showPreferredDate: boolean;
  showMentor: boolean;
  apprenticeName: string;
  mentorName: string;
  onViewApprenticeProfile?: (userId: string) => void;
}>) {
  const titleClass = getTitleClass(variant);
  const nameClass = getNameClass(variant);
  const messageClass = getMessageClass(variant);
  const dateClass = getDateClass(variant);
  const apprenticeUserId = request.apprentice?.user?.id ?? null;

  const apprenticeNameComponent = (
    <ApprenticeOrMentorName
      showMentor={showMentor}
      mentorName={mentorName}
      apprenticeName={apprenticeName}
      onViewApprenticeProfile={onViewApprenticeProfile}
      apprenticeUserId={apprenticeUserId}
    />
  );

  return (
    <div className="flex-1">
      {showTitle && request.title && (
        <h4 className={titleClass}>{request.title}</h4>
      )}
      {variant === "dashboard" && !showTitle && (
        <p className={nameClass}>
          {showMentor ? (
            `Mentor: ${mentorName}`
          ) : (
            <>De: {apprenticeNameComponent}</>
          )}
        </p>
      )}
      {variant !== "dashboard" && (
        <p className={nameClass}>
          {showMentor ? mentorName : apprenticeNameComponent}
        </p>
      )}
      {showDescription && request.description && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-2">
          {request.description}
        </p>
      )}
      {request.message && (
        <p className={messageClass}>&quot;{request.message}&quot;</p>
      )}
      {request.status === "REJECTED" && request.rejectionReason && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-md">
          <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Motif du refus :
          </p>
          <p className="text-[11px] text-red-600 dark:text-red-300 italic mt-0.5">
            &quot;{request.rejectionReason}&quot;
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
}

export function WorkshopRequestCard({
  request,
  onAccept,
  onReject,
  onViewApprenticeProfile,
  isRejecting = false,
  variant = "default",
  showTitle = false,
  showDescription = false,
  showPreferredDate = false,
  showMentor = false,
}: Readonly<WorkshopRequestCardProps>) {
  const statusLabel = getWorkshopRequestStatusLabel(request.status);
  const statusColor = getWorkshopRequestStatusColor(request.status);
  const containerClass = getContainerClass(variant);
  const isPending = request.status === "PENDING";
  const apprenticeName = request.apprentice?.user?.name || "Apprenti";
  const mentorName = request.mentor?.user?.name || "Mentor";

  const content = (
    <WorkshopRequestCardContent
      request={request}
      variant={variant}
      showTitle={showTitle}
      showDescription={showDescription}
      showPreferredDate={showPreferredDate}
      showMentor={showMentor}
      apprenticeName={apprenticeName}
      mentorName={mentorName}
      onViewApprenticeProfile={onViewApprenticeProfile}
    />
  );

  const actionsColumn = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
      <Badge className={`text-xs ${statusColor} self-start sm:self-auto`}>
        {statusLabel}
      </Badge>
      <PendingRequestActions
        request={request}
        isPending={isPending}
        onAccept={onAccept}
        onReject={onReject}
        isRejecting={isRejecting}
      />
    </div>
  );

  if (variant === "dashboard") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {content}
          {actionsColumn}
        </div>
      </div>
    );
  }

  const outerGapClass =
    variant === "compact" ? "gap-2" : "";

  return (
    <div className={containerClass}>
      <div
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${outerGapClass}`}
      >
        {content}
        {actionsColumn}
      </div>
    </div>
  );
}
