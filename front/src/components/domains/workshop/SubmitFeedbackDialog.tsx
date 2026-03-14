"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Star, Loader2, Coins, CheckCircle2 } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { TippingModal } from "./TippingModal";
import type { SubmitFeedbackDialogProps } from "@/types/workshop-components";

export function SubmitFeedbackDialog({
  open,
  onOpenChange,
  workshopId,
  onSuccess,
}: Readonly<SubmitFeedbackDialogProps>) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showTippingModal, setShowTippingModal] = useState(false);
  const [mentorUserId, setMentorUserId] = useState<string | null>(null);

  const submitMutation = trpc.workshopFeedback.submitFeedback.useMutation({
    onSuccess: (data: { mentorUserId?: string }) => {
      setShowSuccessAnimation(true);

      setTimeout(() => {
        setShowSuccessAnimation(false);
        if (data.mentorUserId) {
          setMentorUserId(data.mentorUserId);
          setShowTippingModal(true);
        } else {
          toast.success(
            "Merci pour votre avis ! +1 crédit ajouté à votre portefeuille."
          );
          setRating(0);
          setComment("");
          setIsAnonymous(false);
          onOpenChange(false);
          onSuccess?.();
        }
      }, 2000);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    submitMutation.mutate({
      workshopId,
      rating,
      comment: comment.trim() || null,
      isAnonymous,
    });
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  const handleTippingModalClose = () => {
    setShowTippingModal(false);
    setMentorUserId(null);
    setRating(0);
    setComment("");
    setIsAnonymous(false);
    onOpenChange(false);
    onSuccess?.();
  };

  if (showSuccessAnimation) {
    return (
      <Dialog open={open} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogTitle className="sr-only">Merci pour votre avis</DialogTitle>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <CheckCircle2 className="relative w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Merci !</h3>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Coins className="w-5 h-5" />
              <p className="font-medium">
                +1 crédit ajouté à votre portefeuille
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !showTippingModal} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Comment s'est passé l'atelier ?</DialogTitle>
            <DialogDescription>
              Partagez votre expérience de cet atelier avec le mentor
            </DialogDescription>
          </DialogHeader>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Coins className="w-5 h-5" />
              <p className="text-sm">
                Soumettez votre avis et gagnez 1 crédit immédiatement !
              </p>
            </div>
          </div>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Note *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStarClick(value)}
                    onMouseEnter={() => handleStarHover(value)}
                    onMouseLeave={handleStarLeave}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${value <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                        }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {rating === 1 && "Très mauvais"}
                  {rating === 2 && "Mauvais"}
                  {rating === 3 && "Moyen"}
                  {rating === 4 && "Bien"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                placeholder="Partagez votre expérience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-slate-500">
                {comment.length}/1000 caractères
              </p>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="anonymous"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Rendre mon avis anonyme
                </Label>
                <p className="text-xs text-slate-500">
                  Votre nom ne sera pas visible par le mentor
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitMutation.isPending}
              >
                {submitMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {mentorUserId && (
        <TippingModal
          open={showTippingModal}
          onOpenChange={handleTippingModalClose}
          mentorUserId={mentorUserId}
          onSuccess={() => {
            toast.success("Merci pour votre avis !");
            handleTippingModalClose();
          }}
        />
      )}
    </>
  );
}
