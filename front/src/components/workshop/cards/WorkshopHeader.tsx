"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Calendar, EyeOff, Trash2 } from "lucide-react";
import { formatDate, getStatusBadge } from "@/lib/workshop-utils";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/ui/breadcrumb";

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

  const breadcrumbItems = isOwner
    ? [
        { label: "Tableau de bord", href: "/dashboard" },
        { label: "Mes ateliers", href: "/my-workshops" },
        { label: workshop.title },
      ]
    : [
        { label: "Tableau de bord", href: "/dashboard" },
        { label: "e-Atelier", href: "/workshop-room" },
        { label: workshop.title },
      ];

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
          <ShinyText text={workshop.title} />
        </h1>
        <div className="flex items-center gap-3">
          {isOwner && getStatusBadge(workshop.status, "lg")}
          <p className="text-base sm:text-lg text-ls-muted">
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
          className="border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={onEdit}
              className="border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full"
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
                  className="border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reprogrammer
                </Button>
                <Button
                  variant="outline"
                  onClick={onUnpublish}
                  disabled={isUnpublishing}
                  className="border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full"
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
                className="border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Dépublier
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
