"use client";

import { Button } from "@/components/ui/button";
import {
  UserPlus,
  CheckCircle,
  XCircle,
  UserCircle,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

interface PendingRequestItemProps {
  request: {
    connectionId: string;
    requesterUserId: string;
    requesterName: string | null;
    requesterDisplayName: string | null;
    requesterPhotoUrl: string | null;
    requesterRole?: "MENTOR" | "APPRENANT" | "ADMIN" | null;
    requesterAppId?: string;
  };
  onViewProfile: () => void;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export function PendingRequestItem({
  request,
  onViewProfile,
  onAccept,
  onReject,
  isProcessing,
}: PendingRequestItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] bg-white dark:bg-[rgba(255,255,255,0.08)] gap-4">
      <div className="flex items-center gap-4">
        {request.requesterPhotoUrl ? (
          <Image
            src={request.requesterPhotoUrl}
            alt={request.requesterDisplayName || request.requesterName || ""}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
        )}
        <div>
          <p className="font-semibold text-[#26547c] dark:text-[#e6e6e6]">
            {request.requesterDisplayName ||
              request.requesterName ||
              "Utilisateur"}
          </p>
          <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            souhaite rejoindre votre réseau
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onViewProfile}
          className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
        >
          <UserCircle className="h-4 w-4 mr-2" />
          Voir le profil
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled
          title="La messagerie sera disponible prochainement"
          className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] rounded-[32px]"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          disabled={isProcessing}
          className="bg-[#34b162] hover:bg-[#2a9d52] dark:bg-[#34b162] dark:hover:bg-[#2a9d52] text-white rounded-[32px]"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Accepter
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
          className="border border-[#f44336] dark:border-[#f44336] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#f44336] dark:text-[#f44336] hover:bg-[rgba(244,67,54,0.1)] dark:hover:bg-[rgba(244,67,54,0.15)] rounded-[32px]"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Refuser
        </Button>
      </div>
    </div>
  );
}
