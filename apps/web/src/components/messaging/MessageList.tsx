"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageReactions } from "./MessageReactions";

interface Message {
  messageId: string;
  senderId: string;
  senderName?: string | null;
  senderDisplayName?: string | null;
  content: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
  editCount?: number;
  isRead?: boolean;
  deletedAt?: Date | string | null;
  replyToMessageId?: string | null;
  replyToMessage?: {
    messageId: string;
    content: string;
    senderName: string | null;
    senderDisplayName: string | null;
  } | null;
  workshopReference?: {
    workshopId: string;
    workshopTitle: string;
    workshopDate: Date | string | null;
  } | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversationId: string;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onReplyToMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  isEditing?: boolean;
  workshopContext?: {
    workshopId: string | null;
    workshopTitle: string | null;
    workshopDate: Date | string | null;
  } | null;
}

export function MessageList({
  messages,
  currentUserId,
  conversationId,
  onEditMessage,
  onReplyToMessage,
  onDeleteMessage,
  isEditing = false,
  workshopContext,
}: MessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const canEditMessage = (message: Message): boolean => {
    if (message.workshopReference || message.deletedAt) {
      return false;
    }
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const fifteenMinutesInMs = 15 * 60 * 1000;
    const isWithinTimeLimit = messageAge <= fifteenMinutesInMs;
    const hasEditLimit = !message.editCount || message.editCount < 5;
    return isWithinTimeLimit && hasEditLimit;
  };

  const canDeleteMessage = (message: Message): boolean => {
    if (message.deletedAt || message.workshopReference) {
      return false;
    }
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;
    return messageAge <= fiveMinutesInMs;
  };

  const handleStartEdit = (message: Message) => {
    if (!canEditMessage(message)) {
      return;
    }
    setEditingMessageId(message.messageId);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleSaveEdit = (messageId: string) => {
    if (editContent.trim() && onEditMessage) {
      onEditMessage(messageId, editContent.trim());
      setEditingMessageId(null);
      setEditContent("");
    }
  };
  if (messages.length === 0 && !workshopContext?.workshopId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucun message pour le moment.</p>
        <p className="text-sm mt-2">Commencez la conversation !</p>
      </div>
    );
  }

  const getInitials = (
    name: string | null | undefined,
    displayName: string | null | undefined
  ): string => {
    const nameToUse = displayName || name || "";
    if (!nameToUse) return "??";

    const parts = nameToUse.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0])
        .toUpperCase()
        .slice(0, 2);
    }
    return nameToUse.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucun message pour le moment.</p>
          <p className="text-sm mt-2">Commence la conversation !</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          const timestamp = formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
            locale: fr,
          });

          const senderInitials = getInitials(
            message.senderName,
            message.senderDisplayName
          );

          const isEditing = editingMessageId === message.messageId;

          return (
            <div
              key={message.messageId}
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
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(message.messageId)}
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
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.replyToMessage && (
                      <div
                        className={cn(
                          "mb-2 pb-2 border-l-2 pl-2 text-xs",
                          isOwnMessage
                            ? "border-primary-foreground/30"
                            : "border-muted-foreground/30"
                        )}
                      >
                        <p
                          className={cn(
                            "font-medium mb-1",
                            isOwnMessage
                              ? "text-primary-foreground/80"
                              : "text-foreground"
                          )}
                        >
                          {message.replyToMessage.senderDisplayName ||
                            message.replyToMessage.senderName ||
                            "Utilisateur"}
                        </p>
                        <p
                          className={cn(
                            "truncate",
                            isOwnMessage
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          )}
                        >
                          {message.replyToMessage.content}
                        </p>
                      </div>
                    )}
                    {message.workshopReference && (
                      <div
                        className={cn(
                          "mb-2 pb-2 border-b",
                          isOwnMessage
                            ? "border-primary-foreground/20"
                            : "border-muted-foreground/20"
                        )}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <BookOpen
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isOwnMessage
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "font-medium truncate",
                                isOwnMessage
                                  ? "text-primary-foreground/90"
                                  : "text-foreground"
                              )}
                            >
                              {message.workshopReference.workshopTitle}
                            </p>
                            {message.workshopReference.workshopDate && (
                              <p
                                className={cn(
                                  "text-xs",
                                  isOwnMessage
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                {format(
                                  new Date(
                                    message.workshopReference.workshopDate
                                  ),
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
                        {message.deletedAt ? (
                          <p
                            className={cn(
                              "text-xs italic",
                              isOwnMessage
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            )}
                          >
                            Ce message a été supprimé
                          </p>
                        ) : message.workshopReference ? (
                          <p
                            className={cn(
                              "text-xs italic",
                              isOwnMessage
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            À propos de cet atelier
                          </p>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}
                        {message.updatedAt &&
                          message.editCount &&
                          message.editCount > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground italic">
                                Modifié
                                {message.editCount > 1 &&
                                  ` (${message.editCount}x)`}
                              </span>
                            </div>
                          )}
                      </div>
                      <div className="flex gap-1">
                        {onReplyToMessage && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity shrink-0",
                              isOwnMessage
                                ? "text-primary-foreground hover:bg-primary-foreground/20"
                                : "text-muted-foreground hover:bg-muted-foreground/20"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onReplyToMessage(message.messageId);
                            }}
                          >
                            <Reply className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isOwnMessage &&
                          !message.deletedAt &&
                          onEditMessage &&
                          canEditMessage(message) &&
                          (!message.editCount ||
                            (message.editCount || 0) < 5) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className={cn(
                                "h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity shrink-0",
                                isOwnMessage
                                  ? "text-primary-foreground hover:bg-primary-foreground/20"
                                  : "text-muted-foreground hover:bg-muted-foreground/20"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(message);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        {isOwnMessage &&
                          !message.deletedAt &&
                          onDeleteMessage &&
                          canDeleteMessage(message) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className={cn(
                                "h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity shrink-0",
                                isOwnMessage
                                  ? "text-primary-foreground hover:bg-primary-foreground/20"
                                  : "text-muted-foreground hover:bg-muted-foreground/20"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMessage(message.messageId);
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
                  <span className="text-xs text-muted-foreground">
                    {timestamp}
                  </span>
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
        })
      )}
    </div>
  );
}
