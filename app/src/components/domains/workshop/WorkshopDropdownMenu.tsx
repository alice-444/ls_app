"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Users,
  Edit,
  Calendar,
  Copy,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface WorkshopDropdownMenuProps {
  workshop: {
    id: string;
    status?: string;
    date?: Date | string | null;
    isVirtual?: boolean;
    location?: string | null;
  };
  onViewDetails?: (workshopId: string) => void;
  onViewParticipants?: (workshopId: string) => void;
  onEdit?: (workshopId: string) => void;
  onReschedule?: (workshopId: string) => void;
  onDelete?: (workshopId: string) => void;
  onDuplicate?: (workshopId: string) => void;
  onComplete?: (workshopId: string) => void;
  variant?: "default" | "hero";
}

export function WorkshopDropdownMenu({
  workshop,
  onViewDetails,
  onViewParticipants,
  onEdit,
  onReschedule,
  onDelete,
  onDuplicate,
  onComplete,
  variant = "default",
}: Readonly<WorkshopDropdownMenuProps>) {
  const handleCopyLink = () => {
    if (workshop.location) {
      navigator.clipboard.writeText(workshop.location);
      toast.success("Lien de réunion copié !");
    }
  };

  const canReschedule =
    workshop.status === "PUBLISHED" && workshop.date !== null;

  const canComplete = workshop.status === "PUBLISHED";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "hero" ? "secondary" : "ghost"}
          size="sm"
          className={
            variant === "hero"
              ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
              : "h-8 w-8 p-0"
          }
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className={variant === "hero" ? "w-4 h-4" : "h-4 w-4"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {onViewDetails && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(workshop.id);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir les détails
          </DropdownMenuItem>
        )}
        {onViewParticipants && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onViewParticipants(workshop.id);
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Voir les participants
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(workshop.id);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            {onDuplicate ? "Modifier les détails" : "Dupliquer / Réorganiser"}
          </DropdownMenuItem>
        )}
        {canReschedule && onReschedule && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onReschedule(workshop.id);
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Reprogrammer
            </DropdownMenuItem>
          </>
        )}
        {canComplete && onComplete && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onComplete(workshop.id);
            }}
            className="text-green-600 dark:text-green-400"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marquer comme terminé
          </DropdownMenuItem>
        )}
        {workshop.isVirtual && workshop.location && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLink();
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            {variant === "hero" ? "Copier" : "Copier le lien de réunion"}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workshop.id);
              }}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {variant === "hero" ? "Annuler" : "Annuler l'atelier"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

