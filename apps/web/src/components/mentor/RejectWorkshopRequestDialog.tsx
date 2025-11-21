import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, X } from "lucide-react";

const rejectRequestSchema = z.object({});

type RejectRequestFormData = z.infer<typeof rejectRequestSchema>;

interface RejectWorkshopRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  apprenticeName?: string;
  workshopTitle?: string;
}

export function RejectWorkshopRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  apprenticeName,
  workshopTitle,
}: RejectWorkshopRequestDialogProps) {
  const { handleSubmit } = useForm<RejectRequestFormData>({
    resolver: zodResolver(rejectRequestSchema),
  });

  const onSubmit = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Refuser la demande
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de refuser la demande de participation
            {apprenticeName ? ` de ${apprenticeName}` : ""}
            {workshopTitle ? ` pour l'atelier "${workshopTitle}"` : ""}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-100 dark:border-red-900">
            <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Cette action est irréversible. Une fois refusée, la demande ne
                pourra plus être acceptée.
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refus en cours...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirmer le refus
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
