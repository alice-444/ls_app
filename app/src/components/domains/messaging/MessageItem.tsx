"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as Avatar from "@radix-ui/react-avatar";
import { Edit2, Check, X, CheckCheck, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageReactions } from "./MessageReactions";
import { MessageBubble } from "./MessageBubble";

/** Date value from API (serialized as ISO string) or Date object */
type DateTimeInput = Date | string;

export interface MessageItemMessage {
  messageId: string;
  senderId: string;
  senderName?: string | null;
  senderDisplayName?: string | null;
  content: string;
  createdAt: DateTimeInput;
  updatedAt?: DateTimeInput | null;
  editCount?: number;
  isRead?: boolean;
  deletedAt?: DateTimeInput | null;
  replyToMessageId?: string | null;
  replyToMessage?: {
    messageId: string;
    content: string;
    senderName: string | null;
    senderDisplayName: string | null;
  } | null;
  workshopReference?: {
    workshopTitle: string;
    workshopDate: DateTimeInput | null;
  } | null;
}

interface MessageItemProps {
  readonly message: MessageItemMessage;
  readonly currentUserId: string;
  readonly conversationId: string;
  readonly isOwnMessage: boolean;
  readonly isEditing: boolean;
  readonly editContent: string;
  readonly onEditContentChange: (value: string) => void;
  readonly onEditMessage?: (messageId: string, newContent: string) => void;
  readonly onReplyToMessage?: (messageId: string) => void;
  readonly onDeleteMessage?: (messageId: string) => void;
  readonly canEditMessage: (message: MessageItemMessage) => boolean;
  readonly canDeleteMessage: (message: MessageItemMessage) => boolean;
  readonly onStartEdit: (message: MessageItemMessage) => void;
  readonly onCancelEdit: () => void;
  readonly onSaveEdit: (messageId: string) => void;
}

function getInitials(
  name: string | null | undefined,
  displayName: string | null | undefined
): string {
  const nameToUse = displayName || name || "";
  if (!nameToUse) return "??";

  const parts = nameToUse.trim().split(/\s+/);
  if (parts.length >= 2) {
    const lastPart = parts.at(-1);
    return (parts[0][0] + (lastPart?.[0] ?? "")).toUpperCase().slice(0, 2);
  }
  return nameToUse.slice(0, 2).toUpperCase();
}

interface MessageActionButtonsProps {
  readonly message: MessageItemMessage;
  readonly isOwnMessage: boolean;
  readonly showEdit: boolean;
  readonly showDelete: boolean;
  readonly actionButtonClass: string;
  readonly onReplyToMessage?: (messageId: string) => void;
  readonly onStartEdit: (message: MessageItemMessage) => void;
  readonly onDeleteMessage?: (messageId: string) => void;
}

function MessageActionButtons({
  message,
  isOwnMessage,
  showEdit,
  showDelete,
  actionButtonClass,
  onReplyToMessage,
  onStartEdit,
  onDeleteMessage,
}: Readonly<MessageActionButtonsProps>) {
  const buttonClass = cn(
    "h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity shrink-0",
    actionButtonClass
  );

  return (
    <div className="flex gap-1">
      {onReplyToMessage && (
        <Button
          size="icon"
          variant="ghost"
          className={buttonClass}
          onClick={(e) => {
            e.stopPropagation();
            onReplyToMessage(message.messageId);
          }}
        >
          <Reply className="h-3.5 w-3.5" />
        </Button>
      )}
      {showEdit && (
        <Button
          size="icon"
          variant="ghost"
          className={buttonClass}
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(message);
          }}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      )}
      {showDelete && (
        <Button
          size="icon"
          variant="ghost"
          className={buttonClass}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteMessage?.(message.messageId);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function MessageItem({
  message,
  currentUserId,
  conversationId,
  isOwnMessage,
  isEditing,
  editContent,
  onEditContentChange,
  onEditMessage,
  onReplyToMessage,
  onDeleteMessage,
  canEditMessage,
  canDeleteMessage,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: Readonly<MessageItemProps>) {
  const timestamp = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: fr,
  });
  const senderInitials = getInitials(
    message.senderName,
    message.senderDisplayName
  );

  const showEditButton = !!(
    isOwnMessage &&
    !message.deletedAt &&
    onEditMessage &&
    canEditMessage(message) &&
    (!message.editCount || (message.editCount || 0) < 5)
  );

  const showDeleteButton = !!(
    isOwnMessage &&
    !message.deletedAt &&
    onDeleteMessage &&
    canDeleteMessage(message)
  );

  const actionButtonClass = isOwnMessage
    ? "text-primary-foreground hover:bg-primary-foreground/20"
    : "text-muted-foreground hover:bg-muted-foreground/20";

  return (
    <div
      data-message-id={message.messageId}
      className={cn(
        "flex gap-3 group",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage && (
        <Avatar.Root className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
          <Avatar.Fallback className="h-full w-full flex items-center justify-center text-xs font-medium">
            {senderInitials}
          </Avatar.Fallback>
        </Avatar.Root>
      )}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
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
          <MessageBubble
            message={message}
            isOwnMessage={isOwnMessage}
            actions={
              <MessageActionButtons
                message={message}
                isOwnMessage={isOwnMessage}
                showEdit={showEditButton}
                showDelete={showDeleteButton}
                actionButtonClass={actionButtonClass}
                onReplyToMessage={onReplyToMessage}
                onStartEdit={onStartEdit}
                onDeleteMessage={onDeleteMessage}
              />
            }
          />
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
