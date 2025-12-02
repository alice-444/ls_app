"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { WorkshopRequestCard } from "./WorkshopRequestCard";

interface WorkshopRequestsProps {
  workshopId: string;
  workshopStatus: string;
  expandedWorkshopId: string | null;
  setExpandedWorkshopId: (id: string | null) => void;
  onAcceptRequest: (request: any) => void;
  onRejectRequest: (requestId: string) => void;
  isRejecting: boolean;
}

export function WorkshopRequests({
  workshopId,
  workshopStatus,
  expandedWorkshopId,
  setExpandedWorkshopId,
  onAcceptRequest,
  onRejectRequest,
  isRejecting,
}: WorkshopRequestsProps) {
  if (workshopStatus !== "PUBLISHED") {
    return null;
  }

  const { data: requests } = trpc.mentor.getWorkshopRequests.useQuery(
    { workshopId },
    { enabled: !!workshopId && workshopStatus === "PUBLISHED" }
  );

  const pendingRequests =
    requests?.filter((r: any) => r.status === "PENDING") || [];

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
          {displayRequests.map((request: any) => (
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
