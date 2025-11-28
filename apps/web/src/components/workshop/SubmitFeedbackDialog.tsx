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
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Loader2 } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

interface SubmitFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopId: string;
  onSuccess?: () => void;
}

export function SubmitFeedbackDialog({
  open,
  onOpenChange,
  workshopId,
  onSuccess,
}: SubmitFeedbackDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const submitMutation = trpc.workshopFeedback.submitFeedback.useMutation({
    onSuccess: () => {
      toast.success("Merci pour votre avis !");
      setRating(0);
      setComment("");
      setIsAnonymous(false);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Donner votre avis</DialogTitle>
          <DialogDescription>
            Partagez votre expérience de cet atelier avec le mentor
          </DialogDescription>
        </DialogHeader>

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
                    className={`w-8 h-8 transition-colors ${
                      value <= displayRating
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
  );
}
