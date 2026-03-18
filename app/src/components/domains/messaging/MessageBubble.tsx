"use client";

import type React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BookOpen, Pencil } from "lucide-react";
import type { MessageItemMessage } from "./MessageItem";

interface MessageBodyProps {
  readonly message: MessageItemMessage;
  readonly isOwnMessage: boolean;
}

interface MessageBubbleProps {
  readonly message: MessageItemMessage;
  readonly isOwnMessage: boolean;
  readonly actions?: React.ReactNode;
}

function MessageBody({ message, isOwnMessage }: Readonly<MessageBodyProps>) {
  const mutedTextClass = isOwnMessage
    ? "text-primary-foreground/70"
    : "text-muted-foreground";
  const deletedTextClass = isOwnMessage
    ? "text-primary-foreground/60"
    : "text-muted-foreground";

  if (message.deletedAt) {
    return (
      <p className={cn("text-xs italic", deletedTextClass)}>
        Ce message a été supprimé
      </p>
    );
  }
  if (message.workshopReference) {
    return (
      <p className={cn("text-xs italic", mutedTextClass)}>
        À propos de cet atelier
      </p>
    );
  }
  return (
    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
  );
}

export function MessageBubble({ message, isOwnMessage, actions }: Readonly<MessageBubbleProps>) {
  return (
    <div
      className={cn(
        "rounded-lg px-4 py-2 wrap-break-word relative group/message",
        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
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
          <MessageBody message={message} isOwnMessage={isOwnMessage} />
          {message.updatedAt && (message.editCount ?? 0) > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Pencil className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground italic">
                Modifié
                {(message.editCount ?? 0) > 1 &&
                  ` (${message.editCount}x)`}
              </span>
            </div>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}
