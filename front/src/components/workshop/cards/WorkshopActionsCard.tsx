"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, BookOpen, MessageSquare } from "lucide-react";

interface WorkshopActionsCardProps {
  isRegistered: boolean;
  canRequestParticipation: boolean;
  isWorkshopPast: boolean;
  onRequestParticipation: () => void;
  onCancelRegistration: () => void;
  onContactMentor?: () => void;
  isCancelling: boolean;
  showContactMentor?: boolean;
}

export function WorkshopActionsCard({
  isRegistered,
  canRequestParticipation,
  isWorkshopPast,
  onRequestParticipation,
  onCancelRegistration,
  onContactMentor,
  isCancelling,
  showContactMentor = false,
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
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Vous êtes inscrit à cet atelier. Vous pouvez annuler votre
            inscription si nécessaire.
          </p>
          {showContactMentor && onContactMentor && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onContactMentor}
            >
              <MessageSquare className="h-4 w-4" />
              Contacter le mentor
            </Button>
          )}
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
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Vous souhaitez participer à cet atelier ? Envoyez une demande au
            mentor.
          </p>
          <Button className="w-full gap-2" onClick={onRequestParticipation}>
            <BookOpen className="h-4 w-4" />
            Demander à participer
          </Button>
          {showContactMentor && onContactMentor && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onContactMentor}
            >
              <MessageSquare className="h-4 w-4" />
              Contacter le mentor
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showContactMentor && onContactMentor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contacter le mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Vous avez une question sur cet atelier ? Contactez le mentor
            directement.
          </p>
          <Button className="w-full gap-2" onClick={onContactMentor}>
            <MessageSquare className="h-4 w-4" />
            Contacter le mentor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
