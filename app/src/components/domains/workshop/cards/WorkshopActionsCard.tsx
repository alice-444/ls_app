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
}: Readonly<WorkshopActionsCardProps>) {
  if (isRegistered && !isWorkshopPast) {
    return (
      <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ls-heading">
            <CheckCircle className="w-5 h-5 text-[#34b162]" />
            Tu es inscrit.e à cet atelier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-ls-muted">
            Tu es inscrit.e à cet atelier. Tu peux annuler ton inscription si nécessaire.
          </p>
          {showContactMentor && onContactMentor && (
            <Button
              variant="ctaOutline"
              size="cta"
              className="w-full gap-2"
              onClick={onContactMentor}
            >
              <MessageSquare className="h-4 w-4" />
              Contacter le mentor
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-full gap-2 bg-destructive hover:bg-destructive/90 text-white rounded-full"
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
      <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ls-heading">
            <BookOpen className="w-5 h-5" />
            Participer à cet atelier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-ls-muted">
            Tu souhaites participer à cet atelier ? Envoie une demande au mentor.
          </p>
          <Button
            variant="cta"
            size="cta"
            className="w-full gap-2"
            onClick={onRequestParticipation}
          >
            <BookOpen className="h-4 w-4" />
            Demander à participer
          </Button>
          {showContactMentor && onContactMentor && (
            <Button
              variant="ctaOutline"
              size="cta"
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
      <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ls-heading">
            <MessageSquare className="w-5 h-5" />
            Contacter le mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ls-muted mb-4">
            Tu as une question sur cet atelier ? Contacte le mentor directement.
          </p>
          <Button
            variant="cta"
            size="cta"
            className="w-full gap-2"
            onClick={onContactMentor}
          >
            <MessageSquare className="h-4 w-4" />
            Contacter le mentor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
