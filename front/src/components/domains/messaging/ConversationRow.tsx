"use client";

import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Pin,
  Trash2,
  MoreVertical,
  UserX,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PresenceIndicator } from "./PresenceIndicator";

interface ConversationData {
  conversationId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
  otherUserPhotoUrl?: string;
  isPinned: boolean;
  updatedAt: string | Date;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string | Date;
  } | null;
}

interface ConversationRowProps {
  readonly conversation: ConversationData;
  readonly onPin: (conversationId: string) => void;
  readonly onUnpin: (conversationId: string) => void;
  readonly onDelete: (conversationId: string) => void;
  readonly onBlockUser: (userId: string, displayName: string) => void;
  readonly isDeleting: boolean;
  readonly isOnline?: boolean;
  readonly lastSeen?: Date | string | null;
}

export function ConversationRow({
  conversation,
  onPin,
  onUnpin,
  onDelete,
  onBlockUser,
  isDeleting,
  isOnline = false,
  lastSeen = null,
}: ConversationRowProps) {
  const router = useRouter();

  const displayName =
    conversation.otherUserDisplayName ||
    conversation.otherUserName ||
    "Utilisateur";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  let lastMessagePreview = "";
  if (conversation.lastMessage) {
    const content = conversation.lastMessage.content;
    lastMessagePreview =
      content.length > 50 ? content.substring(0, 50) + "..." : content;
  }

  const timestamp = conversation.lastMessage
    ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
      locale: fr,
    })
    : "";

  return (
    <div className="bg-card/80 dark:bg-card/90 border border-border/50 rounded-2xl h-[90px] sm:h-[90px] flex items-center justify-between px-2 sm:px-4 py-2 hover:shadow-lg hover:border-brand/30 transition-all backdrop-blur-sm">
      <button
        type="button"
        className="flex items-center gap-2 sm:gap-3 flex-1 cursor-pointer text-left min-w-0"
        onClick={() =>
          router.push(`/inbox/${conversation.conversationId}`)
        }
      >
        <Avatar.Root className="h-10 w-10 sm:h-11 sm:w-11 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border shrink-0 relative">
          <Avatar.Image
            src={conversation.otherUserPhotoUrl || undefined}
            alt={displayName}
            className="h-full w-full object-cover"
          />
          <Avatar.Fallback className="h-full w-full flex items-center justify-center text-xs font-medium">
            {initials}
          </Avatar.Fallback>

          <div className="absolute bottom-0 right-0">
            <PresenceIndicator isOnline={isOnline} />
          </div>

          {conversation.unreadCount && conversation.unreadCount > 0 ? (
            <div className="absolute top-0 right-0 h-3.5 w-3.5 bg-red-500 border-2 border-background rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </span>
            </div>
          ) : null}
        </Avatar.Root>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <h3 className="text-ls-heading text-sm font-bold truncate">
            {displayName}
          </h3>
          <div className="flex items-start gap-1 sm:gap-2">
            <p className="text-ls-muted text-xs truncate flex-1">
              {lastMessagePreview}
            </p>
            {timestamp && (
              <span className="text-ls-muted text-xs whitespace-nowrap hidden sm:inline">
                &bull; {timestamp}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <Button
          variant="outline"
          onClick={() =>
            conversation.isPinned ? onUnpin(conversation.conversationId) : onPin(conversation.conversationId)
          }
          className="hidden md:flex h-8 px-2.5 py-1 rounded-full border border-border bg-card/50 text-ls-heading text-xs font-semibold transition-colors capitalize hover:bg-brand/10 hover:border-brand"
        >
          <span>
            {conversation.isPinned ? "désépingler" : "épingler"}
          </span>
          <Pin
            className={cn(
              "ml-1 h-3.5 w-3.5",
              conversation.isPinned && "fill-current"
            )}
          />
        </Button>

        <Button
          variant="outline"
          onClick={() => onDelete(conversation.conversationId)}
          className="hidden md:flex h-8 px-2.5 py-1 rounded-full bg-card/50 border border-border text-destructive text-xs font-semibold transition-colors capitalize hover:bg-destructive/10 hover:border-destructive/50"
          disabled={isDeleting}
        >
          <span>Supprimer</span>
          <Trash2 className="ml-1 h-3.5 w-3.5" />
        </Button>

        <ConversationDropdownMenu
          conversation={conversation}
          displayName={displayName}
          onPin={onPin}
          onUnpin={onUnpin}
          onDelete={onDelete}
          onBlockUser={onBlockUser}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}

function ConversationDropdownMenu({
  conversation,
  displayName,
  onPin,
  onUnpin,
  onDelete,
  onBlockUser,
  isDeleting,
}: {
  readonly conversation: ConversationData;
  readonly displayName: string;
  readonly onPin: (conversationId: string) => void;
  readonly onUnpin: (conversationId: string) => void;
  readonly onDelete: (conversationId: string) => void;
  readonly onBlockUser: (userId: string, displayName: string) => void;
  readonly isDeleting: boolean;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-brand/10 transition-colors"
          title="Plus d'options"
        >
          <MoreVertical className="h-4 w-4 text-ls-heading" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-ls-muted px-3 py-2">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={() =>
            router.push(`/inbox/${conversation.conversationId}`)
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-brand/10 rounded-xl mx-1"
        >
          <MessageSquare className="h-4 w-4 text-brand" />
          <span className="text-sm text-ls-heading">
            Ouvrir la conversation
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            conversation.isPinned ? onUnpin(conversation.conversationId) : onPin(conversation.conversationId)
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-brand/10 rounded-xl mx-1"
        >
          <Pin
            className={cn(
              "h-4 w-4 text-brand",
              conversation.isPinned && "fill-current"
            )}
          />
          <span className="text-sm text-ls-heading">
            {conversation.isPinned ? "Désépingler" : "Épingler"}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={() =>
            router.push(`/apprentice/${conversation.otherUserId}`)
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-brand/10 rounded-xl mx-1"
        >
          <User className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
          <span className="text-sm text-ls-heading">
            Voir le profil
          </span>
          <ExternalLink className="h-3 w-3 ml-auto text-ls-muted" />
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={() =>
            onBlockUser(
              conversation.otherUserId,
              displayName
            )
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-destructive/10 rounded-xl mx-1"
        >
          <UserX className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            Bloquer l&apos;utilisateur
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onDelete(conversation.conversationId)}
          disabled={isDeleting}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-destructive/10 rounded-xl mx-1"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            Supprimer la conversation
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
