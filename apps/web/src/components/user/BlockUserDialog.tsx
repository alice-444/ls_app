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
import { AlertTriangle } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string | null;
  onBlocked?: () => void;
}

export function BlockUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onBlocked,
}: BlockUserDialogProps) {
  const [isBlocking, setIsBlocking] = useState(false);
  const utils = trpc.useUtils();
  const blockUserMutation = trpc.userBlock.blockUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur bloqué avec succès");
      utils.userBlock.getBlockedUsers.invalidate();
      utils.messaging.getConversations.invalidate();
      onOpenChange(false);
      onBlocked?.();
    },
    onError: (error) => {
      toast.error("Erreur lors du blocage", {
        description: error.message,
      });
      setIsBlocking(false);
    },
  });

  const handleBlock = () => {
    setIsBlocking(true);
    blockUserMutation.mutate({ blockedUserId: userId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Bloquer l'utilisateur
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir bloquer {userName || "cet utilisateur"} ?
            Ils ne pourront plus vous envoyer de messages et ne verront plus vos
            mises à jour de profil.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBlocking}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleBlock}
            disabled={isBlocking}
          >
            {isBlocking ? "Blocage..." : "Bloquer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
