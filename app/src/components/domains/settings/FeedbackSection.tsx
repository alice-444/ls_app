"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export function FeedbackSection() {
  const [feedback, setFeedback] = useState("");

  const createRequestMutation = trpc.support.createRequest.useMutation({
    onSuccess: () => {
      toast.success("Merci pour ton feedback !", {
        description: "Nous l'avons bien reçu et nous l'analyserons bientôt.",
      });
      setFeedback("");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de l'envoi", {
        description: error.message || "Une erreur est survenue, réessaie plus tard.",
      });
    },
  });

  const handleSubmit = () => {
    if (!feedback.trim()) {
      toast.error("Le message ne peut pas être vide");
      return;
    }

    createRequestMutation.mutate({
      subject: "Feedback utilisateur (Paramètres)",
      description: feedback,
      problemType: "FEEDBACK",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">Feedback</h2>
      </div>
      <p className="text-base text-ls-heading">
        Aidez-nous à améliorer LearnSup
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback">Ton feedback</Label>
          <Input
            id="feedback"
            placeholder="Partagez vos suggestions ou signaler un problème..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={createRequestMutation.isPending}
            className="h-10"
          />
        </div>
        <Button
          variant="outline"
          className="w-full sm:w-auto bg-brand text-ls-heading hover:bg-brand-hover border-brand rounded-full"
          onClick={handleSubmit}
          disabled={createRequestMutation.isPending}
        >
          {createRequestMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Envoi...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Envoyer le feedback
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
