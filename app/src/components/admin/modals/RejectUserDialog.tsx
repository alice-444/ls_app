import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onReject: () => void;
  isBulk?: boolean;
  selectedCount?: number;
}

export function RejectUserDialog({
  open,
  onOpenChange,
  selectedUser,
  rejectionReason,
  setRejectionReason,
  onReject,
  isBulk = false,
  selectedCount = 0,
}: Readonly<RejectUserDialogProps>) {
  let descriptionLead: string;
  if (isBulk) {
    descriptionLead = `Êtes-vous sûr de vouloir rejeter les ${selectedCount} utilisateurs sélectionnés ?`;
  } else if (selectedUser?.name) {
    descriptionLead = `Rejeter ${selectedUser.name} (${selectedUser.email}) ?`;
  } else {
    descriptionLead = "Rejeter cet utilisateur ?";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border/50">
        <DialogHeader>
          <DialogTitle>
            {isBulk ? `Rejeter la sélection (${selectedCount})` : "Rejeter l'utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {descriptionLead}{" "}
            Vous pouvez indiquer une raison (optionnel).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Raison du rejet (optionnel)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="rounded-xl"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setRejectionReason("");
            }}
          >
            Annuler
          </Button>
          <Button variant="ctaDestructive" size="cta" onClick={onReject}>
            Rejeter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
