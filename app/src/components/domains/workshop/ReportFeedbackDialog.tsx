"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag, Loader2 } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import type { ReportFeedbackDialogProps } from "@/types/workshop-components";

export function ReportFeedbackDialog({
  open,
  onOpenChange,
  feedbackId,
  onSuccess,
}: Readonly<ReportFeedbackDialogProps>) {
  const [reason, setReason] = useState<string>("");

  const reportMutation = trpc.workshopFeedback.reportFeedback.useMutation({
    onSuccess: () => {
      toast.success(
        "Avis signalé avec succès. Il sera examiné par notre équipe."
      );
      setReason("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const handleSubmit = () => {
    if (reason.trim().length < 10) {
      toast.error(
        "Veuillez fournir une raison détaillée (au moins 10 caractères)"
      );
      return;
    }

    reportMutation.mutate({
      feedbackId,
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Signaler un avis
          </DialogTitle>
          <DialogDescription>
            Aidez-nous à maintenir une communauté respectueuse en signalant les
            avis inappropriés.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Raison du signalement <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous signalez cet avis (insultes, spam, fausses affirmations, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              maxLength={500}
            />
            <p className="text-xs text-slate-500">
              {reason.length}/500 caractères (minimum 10)
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note :</strong> L'avis restera visible publiquement mais
              sera marqué comme "En cours de modération" dans notre système.
              Notre équipe examinera votre signalement sous peu.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={reportMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={reason.trim().length < 10 || reportMutation.isPending}
              variant="destructive"
            >
              {reportMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Signaler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
