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
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { AlertTriangle } from "lucide-react";

interface CancelWorkshopRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  isLoading: boolean;
  workshopTitle: string;
  workshopDate: Date;
}

export function CancelWorkshopRegistrationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  workshopTitle,
  workshopDate,
}: Readonly<CancelWorkshopRegistrationDialogProps>) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
  };

  const cancellationDeadline = new Date(workshopDate);
  cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Annuler l'inscription
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir annuler votre inscription à l'atelier{" "}
            <span className="font-semibold text-foreground">
              "{workshopTitle}"
            </span>{" "}
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border text-sm space-y-2">
            <h4 className="font-semibold mb-2">Politique d'annulation</h4>
            <p>
              • Les annulations sont gratuites jusqu'à 24 heures avant le début
              de l'atelier.
            </p>
            <p>
              • Passé ce délai, des pénalités peuvent s'appliquer sur votre
              score de fiabilité.
            </p>
            <p>
              • Date limite pour annulation sans frais :{" "}
              <span className="font-medium">
                {cancellationDeadline.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Motif de l'annulation (optionnel & anonyme)
            </Label>
            <Textarea
              id="reason"
              placeholder="Aidez-nous à nous améliorer en nous indiquant la raison..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Ce commentaire sera transmis à l'organisateur de manière anonyme.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Ne pas annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
