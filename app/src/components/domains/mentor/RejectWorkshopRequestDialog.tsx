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
import { Loader2, AlertTriangle, X, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const rejectRequestSchema = z.object({
  reason: z
    .string()
    .max(500, "Le motif ne peut pas dépasser 500 caractères")
    .optional(),
});

type RejectRequestFormData = z.infer<typeof rejectRequestSchema>;

interface RejectWorkshopRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
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
}: Readonly<RejectWorkshopRequestDialogProps>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectRequestFormData>({
    resolver: zodResolver(rejectRequestSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = (data: RejectRequestFormData) => {
    onConfirm(data.reason);
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Motif du refus (optionnel)
            </Label>
            <Textarea
              id="reason"
              placeholder="Expliquez brièvement pourquoi vous refusez cette demande..."
              className="min-h-[100px] resize-none"
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-xs text-red-500 font-medium">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleOpenChange(false);
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
