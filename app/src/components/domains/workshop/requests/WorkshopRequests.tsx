"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { WorkshopRequestCard } from "./WorkshopRequestCard";
import type { WorkshopRequest } from "@ls-app/shared";
import type { WorkshopRequestsProps } from "@/types/workshop-components";

export function WorkshopRequests({
  workshopId,
  workshopStatus,
  expandedWorkshopId,
  setExpandedWorkshopId,
  onAcceptRequest,
  onRejectRequest,
  isRejecting,
}: Readonly<WorkshopRequestsProps>) {
  if (workshopStatus !== "PUBLISHED") {
    return null;
  }

  const { data: requests } = trpc.mentor.getWorkshopRequests.useQuery(
    { workshopId },
    { enabled: !!workshopId && workshopStatus === "PUBLISHED" }
  );

  const pendingRequests =
    (requests?.filter((r: WorkshopRequest) => r.status === "PENDING") as WorkshopRequest[]) || [];

  const displayRequests = pendingRequests;
  const isExpanded = expandedWorkshopId === workshopId;

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Demandes de participation ({displayRequests.length})
          </span>
          {pendingRequests.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              {pendingRequests.length} en attente
            </Badge>
          )}
        </div>
        {displayRequests.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setExpandedWorkshopId(isExpanded ? null : workshopId)
            }
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Voir
              </>
            )}
          </Button>
        )}
      </div>
      {isExpanded && displayRequests.length > 0 && (
        <div className="space-y-3 mt-3">
          {displayRequests.map((request) => (
            <WorkshopRequestCard
              key={request.id}
              request={request}
              onAccept={onAcceptRequest}
              onReject={onRejectRequest}
              isRejecting={isRejecting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
