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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] bg-white dark:bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,182,71,0.05)] dark:hover:bg-[rgba(255,182,71,0.08)] transition-colors gap-4">
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
          <p className="font-semibold text-[#26547c] dark:text-[#e6e6e6]">
            {connection.otherUserDisplayName ||
              connection.otherUserName ||
              "Utilisateur"}
          </p>
          <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
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
          className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
        >
          <UserCircle className="h-4 w-4 mr-2" />
          Voir le profil
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onMessage?.(connection.otherUserId)}
          disabled={!onMessage}
          className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onRemove}
          disabled={isRemoving}
          className="border border-[#f44336] dark:border-[#f44336] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#f44336] dark:text-[#f44336] hover:bg-[rgba(244,67,54,0.1)] dark:hover:bg-[rgba(244,67,54,0.15)] rounded-[32px]"
        >
          <UserMinus className="h-4 w-4 mr-2" />
          Retirer
        </Button>
      </div>
    </div>
  );
}
