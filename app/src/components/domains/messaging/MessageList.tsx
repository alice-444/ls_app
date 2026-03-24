"use client";

import { useState } from "react";
import { MessageItem } from "./MessageItem";
import type { MessageItemMessage } from "./MessageItem";

/** Date value from API (serialized as ISO string) or Date object */
type DateTimeInput = Date | string;

type Message = MessageItemMessage;

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
    workshopDate: DateTimeInput | null;
  } | null;
}

export function MessageList({
  messages,
  currentUserId,
  conversationId,
  onEditMessage,
  onReplyToMessage,
  onDeleteMessage,
  workshopContext,
}: Readonly<MessageListProps>) {
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

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucun message pour le moment.</p>
          <p className="text-sm mt-2">Commence la conversation !</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.messageId}
            message={message}
            currentUserId={currentUserId}
            conversationId={conversationId}
            isOwnMessage={message.senderId === currentUserId}
            isEditing={editingMessageId === message.messageId}
            editContent={editContent}
            onEditContentChange={setEditContent}
            onEditMessage={onEditMessage}
            onReplyToMessage={onReplyToMessage}
            onDeleteMessage={onDeleteMessage}
            canEditMessage={canEditMessage}
            canDeleteMessage={canDeleteMessage}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
          />
        ))
      )}
    </div>
  );
}
