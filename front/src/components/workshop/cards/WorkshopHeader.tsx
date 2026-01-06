"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Calendar, EyeOff, Trash2 } from "lucide-react";
import { formatDate, getStatusBadge } from "@/lib/workshop-utils";

interface WorkshopHeaderProps {
  readonly workshop: {
    readonly id: string;
    readonly title: string;
    readonly status: string;
    readonly createdAt: Date | string;
    readonly publishedAt?: Date | string | null;
  };
  readonly isOwner: boolean;
  readonly canReschedule: boolean;
  readonly onBack: () => void;
  readonly onEdit: () => void;
  readonly onReschedule: () => void;
  readonly onUnpublish: () => void;
  readonly onDelete: () => void;
  readonly isRescheduling: boolean;
  readonly isUnpublishing: boolean;
  readonly isDeleting: boolean;
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
}: Readonly<WorkshopHeaderProps>) {

  return (
    <div className="mb-10">
      <div className="mb-6">
        <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-black text-[#26547c] dark:text-[#e6e6e6] leading-[1.2] sm:leading-[1.3] lg:leading-[1.4] mb-4">
          {workshop.title}
        </h1>
        <div className="flex items-center gap-3">
          {isOwner && getStatusBadge(workshop.status, "lg")}
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Créé le {formatDate(workshop.createdAt, { includeWeekday: false })}
            {isOwner && workshop.publishedAt && (
              <span>
                {" "}
                • Publié le{" "}
                {formatDate(workshop.publishedAt, { includeWeekday: false })}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={onEdit}
              className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
            >
              <Edit className="w-4 h-4 mr-2" />
              Éditer
            </Button>
            {canReschedule && (
              <>
                <Button
                  variant="outline"
                  onClick={onReschedule}
                  disabled={isRescheduling}
                  className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reprogrammer
                </Button>
                <Button
                  variant="outline"
                  onClick={onUnpublish}
                  disabled={isUnpublishing}
                  className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
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
                className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Dépublier
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-[#f44336] hover:bg-[#d32f2f] dark:bg-[#f44336] dark:hover:bg-[#d32f2f] text-white dark:text-white rounded-[32px]"
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
