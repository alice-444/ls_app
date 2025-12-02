"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, EyeOff, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/workshop-utils";
import { getStatusBadge } from "@/lib/workshop-utils";

interface WorkshopHeaderProps {
  workshop: {
    id: string;
    title: string;
    status: string;
    createdAt: Date | string;
    publishedAt?: Date | string | null;
  };
  isOwner: boolean;
  canReschedule: boolean;
  onBack: () => void;
  onEdit: () => void;
  onReschedule: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  isRescheduling: boolean;
  isUnpublishing: boolean;
  isDeleting: boolean;
}

export function WorkshopHeader({
  workshop,
  isOwner,
  canReschedule,
  onBack,
  onEdit,
  onReschedule,
  onUnpublish,
  onDelete,
  isRescheduling,
  isUnpublishing,
  isDeleting,
}: WorkshopHeaderProps) {
  const shouldShowStatusBadge = isOwner;

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux ateliers
      </Button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              {workshop.title}
            </h1>
            {shouldShowStatusBadge && getStatusBadge(workshop.status)}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Créé le {formatDate(workshop.createdAt, { includeWeekday: false })}
            {shouldShowStatusBadge && workshop.publishedAt && (
              <span>
                {" "}
                • Publié le{" "}
                {formatDate(workshop.publishedAt, { includeWeekday: false })}
              </span>
            )}
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Éditer
            </Button>
            {canReschedule && (
              <>
                <Button
                  variant="outline"
                  onClick={onReschedule}
                  disabled={isRescheduling}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reprogrammer
                </Button>
                <Button
                  variant="outline"
                  onClick={onUnpublish}
                  disabled={isUnpublishing}
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Dépublier
                </Button>
              </>
            )}
            {!canReschedule && workshop.status === "PUBLISHED" && (
              <Button
                variant="outline"
                onClick={onUnpublish}
                disabled={isUnpublishing}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Dépublier
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
