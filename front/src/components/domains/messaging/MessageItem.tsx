"use client";

import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as Avatar from "@radix-ui/react-avatar";
import {
  Edit2,
  Check,
  X,
  Pencil,
  CheckCheck,
  BookOpen,
  Reply,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MessageReactions } from "./MessageReactions";

type DateLike = Date | string;
type DateLikeOrNull = Date | string | null;

export interface Message {
  messageId: string;
  senderId: string;
  senderName?: string | null;
  senderDisplayName?: string | null;
  content: string;
  createdAt: DateLike;
  updatedAt?: DateLikeOrNull;
  editCount?: number;
  isRead?: boolean;
  deletedAt?: DateLikeOrNull;
  replyToMessageId?: string | null;
  replyToMessage?: {
    messageId: string;
    content: string;
    senderName: string | null;
    senderDisplayName: string | null;
  } | null;
  workshopReference?: {
    workshopTitle: string;
    workshopDate: DateLikeOrNull;
  } | null;
}

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  conversationId: string;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (value: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string) => void;
  onStartEdit: (message: Message) => void;
  onReplyToMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  canEditMessage: (message: Message) => boolean;
  canDeleteMessage: (message: Message) => boolean;
}

const ACTION_BTN_CLASS =
  "h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity shrink-0";

function getMessageContentType(message: Message): "deleted" | "workshop" | "content" {
  if (message.deletedAt) return "deleted";
  if (message.workshopReference) return "workshop";
  return "content";
}

function getInitials(
  name: string | null | undefined,
  displayName: string | null | undefined
): string {
  const nameToUse = displayName || name || "";
  if (!nameToUse) return "??";
  const parts = nameToUse.trim().split(/\s+/);
  if (parts.length >= 2) {
    const lastPart = parts.at(-1) ?? "";
    return (parts[0][0] + lastPart[0]).toUpperCase().slice(0, 2);
  }
  return nameToUse.slice(0, 2).toUpperCase();
}

export function MessageItem({
  message,
  currentUserId,
  conversationId,
  isEditing,
  editContent,
  onEditContentChange,
  onCancelEdit,
  onSaveEdit,
  onStartEdit,
  onReplyToMessage,
  onEditMessage,
  onDeleteMessage,
  canEditMessage,
  canDeleteMessage,
}: Readonly<MessageItemProps>) {
  const isOwnMessage = message.senderId === currentUserId;
  const cls = (own: string, other: string) => (isOwnMessage ? own : other);
  const timestamp = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: fr,
  });
  const senderInitials = getInitials(message.senderName, message.senderDisplayName);
  const contentType = getMessageContentType(message);

  const actionButtonClass = cls(
    "text-primary-foreground hover:bg-primary-foreground/20",
    "text-muted-foreground hover:bg-muted-foreground/20"
  );

  const showEditButton =
    isOwnMessage &&
    !message.deletedAt &&
    onEditMessage &&
    canEditMessage(message) &&
    (!message.editCount || (message.editCount || 0) < 5);

  const showDeleteButton =
    isOwnMessage && !message.deletedAt && onDeleteMessage && canDeleteMessage(message);

  return (
    <div
      key={message.messageId}
      data-message-id={message.messageId}
      className={cn("flex gap-3 group", cls("justify-end", "justify-start"))}
    >
      {!isOwnMessage && (
        <Avatar.Root className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
          <Avatar.Fallback className="h-full w-full flex items-center justify-center text-xs font-medium">
            {senderInitials}
          </Avatar.Fallback>
        </Avatar.Root>
      )}
      <div className={cn("flex flex-col max-w-[70%]", cls("items-end", "items-start"))}>
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full">
            <Textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="min-h-[60px] resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={onCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onSaveEdit(message.messageId)}
                disabled={!editContent.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-lg px-4 py-2 wrap-break-word relative group/message",
              cls("bg-primary text-primary-foreground", "bg-muted")
            )}
          >
            {message.replyToMessage && (
              <div
                className={cn(
                  "mb-2 pb-2 border-l-2 pl-2 text-xs",
                  cls("border-primary-foreground/30", "border-muted-foreground/30")
                )}
              >
                <p className={cn("font-medium mb-1", cls("text-primary-foreground/80", "text-foreground"))}>
                  {message.replyToMessage.senderDisplayName ||
                    message.replyToMessage.senderName ||
                    "Utilisateur"}
                </p>
                <p className={cn("truncate", cls("text-primary-foreground/60", "text-muted-foreground"))}>
                  {message.replyToMessage.content}
                </p>
              </div>
            )}
            {message.workshopReference && (
              <div
                className={cn(
                  "mb-2 pb-2 border-b",
                  cls("border-primary-foreground/20", "border-muted-foreground/20")
                )}
              >
                <div className="flex items-center gap-2 text-xs">
                  <BookOpen
                    className={cn("h-3.5 w-3.5 shrink-0", cls("text-primary-foreground/70", "text-muted-foreground"))}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium truncate", cls("text-primary-foreground/90", "text-foreground"))}>
                      {message.workshopReference.workshopTitle}
                    </p>
                    {message.workshopReference.workshopDate && (
                      <p className={cn("text-xs", cls("text-primary-foreground/70", "text-muted-foreground"))}>
                        {format(
                          new Date(message.workshopReference.workshopDate),
                          "d MMM yyyy",
                          { locale: fr }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <MessageContentBody contentType={contentType} message={message} cls={cls} />
                {message.updatedAt && message.editCount && message.editCount > 0 ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground italic">
                      Modifié
                      {message.editCount > 1 ? ` (${message.editCount}x)` : ""}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-1">
                {onReplyToMessage && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(ACTION_BTN_CLASS, actionButtonClass)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReplyToMessage(message.messageId);
                    }}
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </Button>
                )}
                {showEditButton && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(ACTION_BTN_CLASS, actionButtonClass)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEdit(message);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {showDeleteButton && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(ACTION_BTN_CLASS, actionButtonClass)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMessage?.(message.messageId);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isOwnMessage && (
            <div className="ml-1">
              {message.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
        {!message.deletedAt && (
          <MessageReactions
            messageId={message.messageId}
            currentUserId={currentUserId}
            conversationId={conversationId}
          />
        )}
      </div>
      {isOwnMessage && (
        <Avatar.Root className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
          <Avatar.Fallback className="h-full w-full flex items-center justify-center text-xs font-medium">
            {senderInitials}
          </Avatar.Fallback>
        </Avatar.Root>
      )}
    </div>
  );
}

function MessageContentBody({
  contentType,
  message,
  cls,
}: Readonly<{
  contentType: "deleted" | "workshop" | "content";
  message: Message;
  cls: (own: string, other: string) => string;
}>) {
  if (contentType === "deleted") {
    return (
      <p className={cn("text-xs italic", cls("text-primary-foreground/60", "text-muted-foreground"))}>
        Ce message a été supprimé
      </p>
    );
  }
  if (contentType === "workshop") {
    return (
      <p className={cn("text-xs italic", cls("text-primary-foreground/70", "text-muted-foreground"))}>
        À propos de cet atelier
      </p>
    );
  }
  return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
}
