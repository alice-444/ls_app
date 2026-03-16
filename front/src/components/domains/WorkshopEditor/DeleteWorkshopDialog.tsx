"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

interface DeleteWorkshopDialogProps {
  workshop: {
    id: string;
    title: string;
    status: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteWorkshopDialog({
  workshop,
  open,
  onOpenChange,
  onSuccess,
}: Readonly<DeleteWorkshopDialogProps>) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = trpc.workshop.delete.useMutation({
    onSuccess: () => {
      toast.success("Atelier supprimé avec succès!", {
        description: "L'atelier a été définitivement supprimé.",
      });
      setIsDeleting(false);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast.error("Erreur lors de la suppression", {
        description: error.message || "Une erreur est survenue",
      });
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (!workshop) return;

    setIsDeleting(true);
    deleteMutation.mutate({ workshopId: workshop.id });
  };

  if (!workshop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <DialogTitle className="text-xl">Supprimer l'atelier</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Êtes-vous sûr de vouloir supprimer l'atelier{" "}
            <span className="font-semibold text-foreground">
              "{workshop.title}"
            </span>{" "}
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>⚠️ Attention :</strong> Cette action est irréversible.
            Toutes les données associées à cet atelier seront définitivement
            supprimées.
          </p>
        </div>

        {workshop.status === "PUBLISHED" && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>📢 Atelier publié :</strong> Cet atelier est actuellement
              visible par les apprenants. Sa suppression peut les affecter.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
