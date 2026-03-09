"use client";

import { Button } from "@/components/ui/button";
import { UserMinus, UserCircle, MessageSquare, Users } from "lucide-react";
import Image from "next/image";

interface ConnectionItemProps {
  connection: {
    connectionId: string;
    otherUserId: string;
    otherUserName: string | null;
    otherUserDisplayName: string | null;
    otherUserPhotoUrl: string | null;
    otherUserRole?: "MENTOR" | "APPRENANT" | "ADMIN" | null;
    otherUserAppId?: string;
    updatedAt: Date | string;
  };
  onViewProfile: () => void;
  onRemove: () => void;
  onMessage?: (otherUserId: string) => void;
  isRemoving: boolean;
}

export function ConnectionItem({
  connection,
  onViewProfile,
  onRemove,
  onMessage,
  isRemoving,
}: ConnectionItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border/50 rounded-2xl bg-card/80 hover:bg-brand-soft/30 transition-colors gap-4">
      <div className="flex items-center gap-4">
        {connection.otherUserPhotoUrl ? (
          <Image
            src={connection.otherUserPhotoUrl}
            alt={
              connection.otherUserDisplayName || connection.otherUserName || ""
            }
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        )}
        <div>
          <p className="font-semibold text-ls-heading">
            {connection.otherUserDisplayName ||
              connection.otherUserName ||
              "Utilisateur"}
          </p>
          <p className="text-sm text-ls-muted">
            Connecté depuis le{" "}
            {new Date(connection.updatedAt).toLocaleDateString("fr-FR")}
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
          onClick={() => onMessage?.(connection.otherUserId)}
          disabled={!onMessage}
          className="border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onRemove}
          disabled={isRemoving}
          className="border border-destructive bg-card/80 text-destructive hover:bg-destructive/10 rounded-full"
        >
          <UserMinus className="h-4 w-4 mr-2" />
          Retirer
        </Button>
      </div>
    </div>
  );
}
