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
    <div className="flex items-center justify-between p-4 border rounded-lg">
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
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-gray-500" />
          </div>
        )}
        <div>
          <p className="font-semibold">
            {request.requesterDisplayName ||
              request.requesterName ||
              "Utilisateur"}
          </p>
          <p className="text-sm text-muted-foreground">
            souhaite rejoindre votre réseau
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onViewProfile}>
          <UserCircle className="h-4 w-4 mr-2" />
          Voir le profil
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled
          title="La messagerie sera disponible prochainement"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button size="sm" onClick={onAccept} disabled={isProcessing}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Accepter
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Refuser
        </Button>
      </div>
    </div>
  );
}
