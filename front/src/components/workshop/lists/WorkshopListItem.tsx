"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Eye,
  Edit,
  CheckCircle,
  EyeOff,
  Trash2,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/workshop-utils";
import { getStatusBadge } from "@/lib/workshop-utils";
import { WorkshopRequests } from "../requests/WorkshopRequests";
import type { WorkshopListItemProps } from "@/types/workshop-components";

export function WorkshopListItem({
  workshop,
  expandedWorkshopId,
  onExpand,
  onViewDetails,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
  onAcceptRequest,
  onRejectRequest,
  isPublishing,
  isUnpublishing,
  isDeleting,
  isRejecting,
}: WorkshopListItemProps) {
  const isExpanded = expandedWorkshopId === workshop.id;

  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onViewDetails(workshop.id)}
              >
                {workshop.title}
              </h3>
              {workshop.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {workshop.description}
                </p>
              )}
            </div>
            <div>{getStatusBadge(workshop.status)}</div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            {workshop.date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(workshop.date)}
              </div>
            )}
            {workshop.time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {workshop.time}
              </div>
            )}
            {workshop.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {workshop.duration} min
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {workshop.status === "PUBLISHED" && workshop.apprenticeId ? 1 : 0}{" "}
              / {workshop.maxParticipants || "∞"} participants
            </div>
          </div>
          <WorkshopRequests
            workshopId={workshop.id}
            workshopStatus={workshop.status}
            expandedWorkshopId={expandedWorkshopId}
            setExpandedWorkshopId={onExpand}
            onAcceptRequest={onAcceptRequest}
            onRejectRequest={onRejectRequest}
            isRejecting={isRejecting}
          />
        </div>

        <div className="flex gap-2 lg:flex-col xl:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(workshop.id)}
            className="flex-1 lg:flex-none"
          >
            <Eye className="w-4 h-4 lg:mr-0 xl:mr-2" />
            <span className="lg:hidden xl:inline">Détails</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(workshop.id)}
            className="flex-1 lg:flex-none"
          >
            <Edit className="w-4 h-4 lg:mr-0 xl:mr-2" />
            <span className="lg:hidden xl:inline">Éditer</span>
          </Button>
          {workshop.status === "DRAFT" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onPublish(workshop.id)}
              disabled={isPublishing}
              className="flex-1 lg:flex-none"
            >
              <CheckCircle className="w-4 h-4 lg:mr-0 xl:mr-2" />
              <span className="lg:hidden xl:inline">Publier</span>
            </Button>
          )}
          {workshop.status === "PUBLISHED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnpublish(workshop.id)}
              disabled={isUnpublishing}
              className="flex-1 lg:flex-none"
            >
              <EyeOff className="w-4 h-4 lg:mr-0 xl:mr-2" />
              <span className="lg:hidden xl:inline">Dépublier</span>
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(workshop.id)}
            disabled={isDeleting}
            className="flex-1 lg:flex-none"
          >
            <Trash2 className="w-4 h-4 lg:mr-0 xl:mr-2" />
            <span className="lg:hidden xl:inline">Supprimer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

