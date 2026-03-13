"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { BlockUserDialog } from "./BlockUserDialog";

interface ReportUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string | null;
  messageId?: string | null;
  onReported?: () => void;
}

type ReportReason =
  | "HARASSMENT"
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_PROFILE";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "HARASSMENT", label: "Harcèlement" },
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE_CONTENT", label: "Contenu inapproprié" },
  { value: "FAKE_PROFILE", label: "Profil factice" },
];

export function ReportUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  messageId,
  onReported,
}: ReportUserDialogProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const utils = trpc.useUtils();
  const reportUserMutation = trpc.userReport.createReport.useMutation({
    onSuccess: () => {
      toast.success(
        "Merci. Nous avons reçu votre signalement et l'examinerons."
      );
      utils.userReport.getMyReports.invalidate();
      setIsReporting(false);
      onOpenChange(false);
      setShowBlockDialog(true);
      onReported?.();
    },
    onError: (error: { message?: string }) => {
      toast.error("Erreur lors du signalement", {
        description: error.message,
      });
      setIsReporting(false);
    },
  });

  const handleReport = () => {
    if (!reason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    setIsReporting(true);
    reportUserMutation.mutate({
      reportedUserId: userId,
      reason: reason as ReportReason,
      details: details.trim() || null,
      messageId: messageId || null,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Signaler un utilisateur
            </DialogTitle>
            <DialogDescription>
              Signalez {userName || "cet utilisateur"} pour un comportement
              inapproprié. Notre équipe examinera votre signalement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison du signalement *</Label>
              <Select
                value={reason}
                onValueChange={(value) => setReason(value as ReportReason)}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Sélectionnez une raison" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Détails (optionnel)</Label>
              <Textarea
                id="details"
                placeholder="Décrivez le problème..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isReporting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              disabled={isReporting || !reason}
            >
              {isReporting ? "Envoi..." : "Signaler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BlockUserDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        userId={userId}
        userName={userName}
      />
    </>
  );
}
