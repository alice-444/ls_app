"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy } from "lucide-react";

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTitle: string;
}

export function LevelUpModal({
  open,
  onOpenChange,
  newTitle,
}: LevelUpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <Trophy className="relative w-16 h-16 text-yellow-500" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Félicitations !
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Vous êtes maintenant un{" "}
            <span className="font-semibold text-primary">{newTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-2 py-4">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <p className="text-sm text-muted-foreground">
            Continuez à participer aux ateliers pour progresser !
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Continuer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
