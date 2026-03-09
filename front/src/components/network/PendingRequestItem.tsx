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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border/50 rounded-2xl bg-card/80 gap-4">
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
          <p className="font-semibold text-ls-heading">
            {request.requesterDisplayName ||
              request.requesterName ||
              "Utilisateur"}
          </p>
          <p className="text-sm text-ls-muted">
            souhaite rejoindre ton réseau
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onViewProfile}
          className="border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full"
        >
          <UserCircle className="h-4 w-4 mr-2" />
          Voir le profil
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled
          title="La messagerie sera disponible prochainement"
          className="border border-border bg-card/80 text-ls-muted rounded-full"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Accepter
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
          className="border border-destructive bg-card/80 text-destructive hover:bg-destructive/10 rounded-full"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Refuser
        </Button>
      </div>
    </div>
  );
}
