"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FeedbackSection() {
  const [feedback, setFeedback] = useState("");

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
            className="h-10"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <MessageSquare className="h-4 w-4 mr-2" />
          Envoyer le feedback
        </Button>
      </div>
    </div>
  );
}
