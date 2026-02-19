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
      <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
            <CheckCircle className="w-5 h-5 text-[#34b162]" />
            Vous êtes inscrit à cet atelier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Vous êtes inscrit à cet atelier. Vous pouvez annuler votre
            inscription si nécessaire.
          </p>
          {showContactMentor && onContactMentor && (
            <Button
              variant="outline"
              className="w-full gap-2 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
              onClick={onContactMentor}
            >
              <MessageSquare className="h-4 w-4" />
              Contacter le mentor
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-full gap-2 bg-[#f44336] hover:bg-[#d32f2f] dark:bg-[#f44336] dark:hover:bg-[#d32f2f] text-white dark:text-white rounded-[32px]"
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
      <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
            <BookOpen className="w-5 h-5" />
            Participer à cet atelier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Vous souhaitez participer à cet atelier ? Envoyez une demande au
            mentor.
          </p>
          <Button
            className="w-full gap-2 bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold"
            onClick={onRequestParticipation}
          >
            <BookOpen className="h-4 w-4" />
            Demander à participer
          </Button>
          {showContactMentor && onContactMentor && (
            <Button
              variant="outline"
              className="w-full gap-2 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
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
      <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
            <MessageSquare className="w-5 h-5" />
            Contacter le mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-4">
            Vous avez une question sur cet atelier ? Contactez le mentor
            directement.
          </p>
          <Button
            className="w-full gap-2 bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold"
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
