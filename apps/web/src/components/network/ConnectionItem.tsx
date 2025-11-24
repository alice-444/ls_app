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
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
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
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <Users className="h-6 w-6 text-gray-500" />
          </div>
        )}
        <div>
          <p className="font-semibold">
            {connection.otherUserDisplayName ||
              connection.otherUserName ||
              "Utilisateur"}
          </p>
          <p className="text-sm text-muted-foreground">
            Connecté depuis le{" "}
            {new Date(connection.updatedAt).toLocaleDateString("fr-FR")}
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
          onClick={() => onMessage?.(connection.otherUserId)}
          disabled={!onMessage}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onRemove}
          disabled={isRemoving}
        >
          <UserMinus className="h-4 w-4 mr-2" />
          Retirer
        </Button>
      </div>
    </div>
  );
}
