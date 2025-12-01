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
import { Coins, Loader2, Heart } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

interface TippingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorUserId: string;
  onSuccess?: () => void;
}

export function TippingModal({
  open,
  onOpenChange,
  mentorUserId,
  onSuccess,
}: TippingModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const sendTipMutation = trpc.workshopFeedback.sendTip.useMutation({
    onSuccess: (data) => {
      toast.success("Pourboire envoyé. Votre mentor vous remercie !");
      setSelectedAmount(null);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const handleTip = (amount: number) => {
    setSelectedAmount(amount);
    sendTipMutation.mutate({
      mentorUserId,
      amount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-pink-500" />
          </div>
          <DialogTitle className="text-center">
            Le mentor était excellent ?
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Utilisez votre récompense pour laisser un pourboire !
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3 justify-center">
            <Button
              variant={selectedAmount === 1 ? "default" : "outline"}
              size="lg"
              onClick={() => handleTip(1)}
              disabled={sendTipMutation.isPending}
              className="flex-1"
            >
              {sendTipMutation.isPending && selectedAmount === 1 ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Coins className="w-4 h-4 mr-2" />
              )}
              Pourboire 1 crédit
            </Button>
            <Button
              variant={selectedAmount === 2 ? "default" : "outline"}
              size="lg"
              onClick={() => handleTip(2)}
              disabled={sendTipMutation.isPending}
              className="flex-1"
            >
              {sendTipMutation.isPending && selectedAmount === 2 ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Coins className="w-4 h-4 mr-2" />
              )}
              Pourboire 2 crédits
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={sendTipMutation.isPending}
            className="w-full"
          >
            Non merci
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
