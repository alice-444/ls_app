"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { PresenceIndicator } from "./PresenceIndicator";
import { trpc } from "@/utils/trpc";
import { formatWorkshopReferencePreview } from "@/lib/messaging/format-message";

interface ConversationItemProps {
  conversation: {
    conversationId: string;
    otherUserId: string;
    otherUserName: string | null;
    otherUserDisplayName: string | null;
    otherUserPhotoUrl: string | null;
    otherUserRole: "MENTOR" | "APPRENANT" | "ADMIN" | null;
    lastMessage: {
      content: string;
      createdAt: Date | string;
    } | null;
    unreadCount: number;
    updatedAt: Date | string;
  };
  onDelete?: (conversationId: string) => void;
  isDeleting?: boolean;
}

export function ConversationItem({
  conversation,
  onDelete,
  isDeleting = false,
}: Readonly<ConversationItemProps>) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: presence } = trpc.messaging.getUserPresence.useQuery(
    { userId: conversation.otherUserId },
    {
      refetchInterval: 15000, // Rafraîchir toutes les 15 secondes
    }
  );
  const hasUnread = conversation.unreadCount > 0;
  const displayName =
    conversation.otherUserDisplayName ||
    conversation.otherUserName ||
    "Utilisateur";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatLastMessagePreview = (content: string): string => {
    const formatted = formatWorkshopReferencePreview(content);
    return formatted.length > 50
      ? formatted.substring(0, 50) + "..."
      : formatted;
  };

  const lastMessagePreview = conversation.lastMessage
    ? formatLastMessagePreview(conversation.lastMessage.content)
    : "Aucun message";

  const timestamp = conversation.lastMessage
    ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
      addSuffix: true,
      locale: fr,
    })
    : formatDistanceToNow(new Date(conversation.updatedAt), {
      addSuffix: true,
      locale: fr,
    });

  const handleClick = () => {
    router.push(`/inbox/${conversation.conversationId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(conversation.conversationId);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full text-left flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-accent group",
          hasUnread && "bg-accent/50 font-semibold"
        )}
      >
        <div className="relative">
          <Avatar.Root className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <Avatar.Image
              src={conversation.otherUserPhotoUrl || undefined}
              alt={displayName}
              className="h-full w-full object-cover"
            />
            <Avatar.Fallback className="h-full w-full flex items-center justify-center text-sm font-medium">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
          {presence && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <PresenceIndicator
                isOnline={presence.isOnline}
                lastSeen={presence.lastSeen}
                size="sm"
              />
            </div>
          )}
          {hasUnread && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span
              className={cn("font-medium truncate", hasUnread && "font-bold")}
            >
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground ml-2 shrink-0">
              {timestamp}
            </span>
          </div>
          <p
            className={cn(
              "text-sm text-muted-foreground truncate",
              hasUnread && "font-medium text-foreground"
            )}
          >
            {lastMessagePreview}
          </p>
        </div>
        {hasUnread && (
          <div className="shrink-0">
            <div className="h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </div>
          </div>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </button>
      <DeleteConversationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        conversationName={displayName}
      />
    </>
  );
}
