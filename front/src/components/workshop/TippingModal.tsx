"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Loader2, Heart } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import type { TippingModalProps } from "@/types/workshop-components";

const PRESET_AMOUNTS = [5, 10, 20];

export function TippingModal({
  open,
  onOpenChange,
  mentorUserId,
  onSuccess,
}: TippingModalProps) {
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { data: creditBalance, isLoading: isLoadingBalance } = trpc.user.getCreditBalance.useQuery();

  const sendTipMutation = trpc.workshopFeedback.sendTip.useMutation({
    onSuccess: () => {
      toast.success("Pourboire envoyé. Votre mentor vous remercie !");
      setSelectedAmount(null);
      setCustomAmount("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Une erreur est survenue");
      setSelectedAmount(null);
    },
  });

  const handleTip = (amount: number) => {
    if (amount <= 0) {
      toast.error("Le montant doit être positif.");
      return;
    }
    setSelectedAmount(amount);
    sendTipMutation.mutate({
      mentorUserId,
      amount,
    });
  };

  const handleCustomTip = () => {
    const amount = parseInt(customAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide.");
      return;
    }
    handleTip(amount);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-pink-500" />
          </div>
          <DialogTitle className="text-center">
            Un grand merci au mentor ?
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Montrez votre appréciation en lui laissant un pourboire en crédits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2 justify-center">
            {PRESET_AMOUNTS.map(amount => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => handleTip(amount)}
                disabled={sendTipMutation.isPending}
                className="flex-1"
              >
                {sendTipMutation.isPending && selectedAmount === amount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    {amount}
                  </>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input 
              type="number"
              placeholder="Montant personnalisé"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              disabled={sendTipMutation.isPending}
            />
            <Button
              onClick={handleCustomTip}
              disabled={sendTipMutation.isPending || !customAmount}
            >
              Envoyer
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {isLoadingBalance ? (
              <Loader2 className="w-4 h-4 mx-auto animate-spin" />
            ) : (
              `Votre solde : ${creditBalance?.balance ?? 0} crédits`
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={sendTipMutation.isPending}
            className="w-full"
          >
            Peut-être une autre fois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
