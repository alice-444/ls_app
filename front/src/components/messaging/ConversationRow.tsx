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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationData {
  conversationId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
  otherUserPhotoUrl?: string;
  isPinned: boolean;
  updatedAt: string | Date;
  lastMessage?: {
    content: string;
    createdAt: string | Date;
  } | null;
}

interface ConversationRowProps {
  readonly conversation: ConversationData;
  readonly onTogglePin: (conversationId: string, isPinned: boolean) => void;
  readonly onDelete: (conversationId: string) => void;
  readonly onBlockUser: (userId: string, displayName: string) => void;
  readonly isDeleting: boolean;
}

export function ConversationRow({
  conversation,
  onTogglePin,
  onDelete,
  onBlockUser,
  isDeleting,
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
    <div className="bg-white dark:bg-[rgba(255,255,255,0.08)] border border-[#d6dae4] rounded-2xl h-[90px] sm:h-[90px] flex items-center justify-between px-2 sm:px-4 py-2 hover:shadow-md transition-shadow">
      <button
        type="button"
        className="flex items-center gap-2 sm:gap-3 flex-1 cursor-pointer text-left min-w-0"
        onClick={() =>
          router.push(`/inbox/${conversation.conversationId}`)
        }
      >
        <Avatar.Root className="h-10 w-10 sm:h-11 sm:w-11 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-white dark:border-gray-950 shrink-0">
          <Avatar.Image
            src={conversation.otherUserPhotoUrl || undefined}
            alt={displayName}
            className="h-full w-full object-cover"
          />
          <Avatar.Fallback className="h-full w-full flex items-center justify-center text-xs font-medium">
            {initials}
          </Avatar.Fallback>
        </Avatar.Root>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <h3 className="text-[#26547c] dark:text-[#e6e6e6] text-sm font-bold truncate">
            {displayName}
          </h3>
          <div className="flex items-start gap-1 sm:gap-2">
            <p className="text-[#26547c] dark:text-[#e6e6e6] text-xs truncate flex-1">
              {lastMessagePreview}
            </p>
            {timestamp && (
              <span className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] text-xs whitespace-nowrap hidden sm:inline">
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
            onTogglePin(conversation.conversationId, conversation.isPinned)
          }
          className="hidden md:flex h-8 px-2.5 py-1 rounded-full border bg-white dark:bg-transparent border-[#d9d9d9] dark:border-[#d6dae4] text-[#26547c] dark:text-[#e6e6e6] text-xs font-semibold transition-colors capitalize hover:bg-gray-50 dark:hover:bg-white/10"
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
          className="hidden md:flex h-8 px-2.5 py-1 rounded-full bg-white dark:bg-transparent border border-[#d9d9d9] dark:border-[#d9d9d9] text-[#d84242] dark:text-red-400 text-xs font-semibold transition-colors capitalize hover:bg-red-50 dark:hover:bg-red-500/10"
          disabled={isDeleting}
        >
          <span>Supprimer</span>
          <Trash2 className="ml-1 h-3.5 w-3.5" />
        </Button>

        <ConversationDropdownMenu
          conversation={conversation}
          displayName={displayName}
          onTogglePin={onTogglePin}
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
  onTogglePin,
  onDelete,
  onBlockUser,
  isDeleting,
}: {
  readonly conversation: ConversationData;
  readonly displayName: string;
  readonly onTogglePin: (conversationId: string, isPinned: boolean) => void;
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
          className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title="Plus d'options"
        >
          <MoreVertical className="h-4 w-4 text-gray-600 dark:text-[#e6e6e6]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white dark:bg-[#1a1720] border border-[#d6dae4] rounded-xl shadow-lg"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-[rgba(230,230,230,0.64)] px-3 py-2">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#d6dae4]" />

        <DropdownMenuItem
          onClick={() =>
            router.push(`/inbox/${conversation.conversationId}`)
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
        >
          <MessageSquare className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
          <span className="text-sm text-gray-700 dark:text-[#e6e6e6]">
            Ouvrir la conversation
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            onTogglePin(conversation.conversationId, conversation.isPinned)
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
        >
          <Pin
            className={cn(
              "h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]",
              conversation.isPinned && "fill-current"
            )}
          />
          <span className="text-sm text-gray-700 dark:text-[#e6e6e6]">
            {conversation.isPinned ? "Désépingler" : "Épingler"}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#d6dae4]" />

        <DropdownMenuItem
          onClick={() =>
            router.push(`/apprentice/${conversation.otherUserId}`)
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
        >
          <User className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
          <span className="text-sm text-gray-700 dark:text-[#e6e6e6]">
            Voir le profil
          </span>
          <ExternalLink className="h-3 w-3 ml-auto text-gray-400 dark:text-[rgba(230,230,230,0.64)]" />
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#d6dae4]" />

        <DropdownMenuItem
          onClick={() =>
            onBlockUser(
              conversation.otherUserId,
              displayName
            )
          }
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg mx-1"
        >
          <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-600 dark:text-red-400">
            Bloquer l&apos;utilisateur
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onDelete(conversation.conversationId)}
          disabled={isDeleting}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg mx-1"
        >
          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-600 dark:text-red-400">
            Supprimer la conversation
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
