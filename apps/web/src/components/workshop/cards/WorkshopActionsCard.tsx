"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, BookOpen } from "lucide-react";

interface WorkshopActionsCardProps {
  isRegistered: boolean;
  canRequestParticipation: boolean;
  isWorkshopPast: boolean;
  onRequestParticipation: () => void;
  onCancelRegistration: () => void;
  isCancelling: boolean;
}

export function WorkshopActionsCard({
  isRegistered,
  canRequestParticipation,
  isWorkshopPast,
  onRequestParticipation,
  onCancelRegistration,
  isCancelling,
}: WorkshopActionsCardProps) {
  if (isRegistered && !isWorkshopPast) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Vous êtes inscrit à cet atelier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Vous êtes inscrit à cet atelier. Vous pouvez annuler votre
            inscription si nécessaire.
          </p>
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={onCancelRegistration}
            disabled={isCancelling}
          >
            <X className="h-4 w-4" />
            Annuler mon inscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (canRequestParticipation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Participer à cet atelier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Vous souhaitez participer à cet atelier ? Envoyez une demande au
            mentor.
          </p>
          <Button className="w-full gap-2" onClick={onRequestParticipation}>
            <BookOpen className="h-4 w-4" />
            Demander à participer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
