"use client";

import { useState } from "react";
import { MessageItem, type Message } from "./MessageItem";

type DateLikeOrNull = Date | string | null;

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
    workshopDate: DateLikeOrNull;
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
            isEditing={editingMessageId === message.messageId}
            editContent={editContent}
            onEditContentChange={setEditContent}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onStartEdit={handleStartEdit}
            onReplyToMessage={onReplyToMessage}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
            canEditMessage={canEditMessage}
            canDeleteMessage={canDeleteMessage}
          />
        ))
      )}
    </div>
  );
}
