import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

type DateString = Date | string;

export interface ChatMessage {
  messageId: string;
  senderId: string;
  senderName?: string | null;
  senderDisplayName?: string | null;
  content: string;
  createdAt: DateString;
  updatedAt?: DateString | null;
  editCount?: number;
  isRead?: boolean;
  deletedAt?: DateString | null;
  replyToMessageId?: string | null;
  replyToMessage?: {
    messageId: string;
    content: string;
    senderName: string | null;
    senderDisplayName: string | null;
  } | null;
  workshopReference?: {
    workshopTitle: string;
    workshopDate: DateString | null;
  } | null;
}

function updateMessageInList(
  messages: ChatMessage[],
  messageId: string,
  updates: Partial<ChatMessage>,
): ChatMessage[] {
  return messages.map((msg) =>
    msg.messageId === messageId ? { ...msg, ...updates } : msg,
  );
}

function markMessagesAsReadInList(
  messages: ChatMessage[],
  messageIds: string[],
): ChatMessage[] {
  return messages.map((msg) =>
    messageIds.includes(msg.messageId) ? { ...msg, isRead: true } : msg,
  );
}

function removeUserFromTypingMap(
  prev: Map<string, string>,
  userId: string,
): Map<string, string> {
  const newMap = new Map(prev);
  newMap.delete(userId);
  return newMap;
}

function addUserToTypingMap(
  prev: Map<string, string>,
  userId: string,
  userName: string,
): Map<string, string> {
  const newMap = new Map(prev);
  newMap.set(userId, userName);
  return newMap;
}

function scheduleTypingStop(
  setTypingUsers: Dispatch<SetStateAction<Map<string, string>>>,
  userId: string,
  delayMs: number,
): void {
  setTimeout(() => {
    setTypingUsers((prev) => removeUserFromTypingMap(prev, userId));
  }, delayMs);
}

interface ChatConversation {
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
}

interface UseChatSocketParams {
  socket: Socket | null;
  conversationId: string;
  sessionUserId?: string;
  conversation?: ChatConversation | null;
  setLocalMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setTypingUsers: Dispatch<SetStateAction<Map<string, string>>>;
  markAsRead: () => void;
  refetch: () => void;
}

export function useChatSocket({
  socket,
  conversationId,
  sessionUserId,
  conversation,
  setLocalMessages,
  setTypingUsers,
  markAsRead,
  refetch,
}: UseChatSocketParams) {
  useEffect(() => {
    if (socket && conversationId) {
      socket.emit("join-conversation", conversationId);
      return () => {
        socket.emit("leave-conversation", conversationId);
      };
    }
  }, [socket, conversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (
      message: ChatMessage & { conversationId: string },
    ) => {
      if (message.conversationId === conversationId) {
        setLocalMessages((prev) => [...prev, message]);
        if (message.senderId !== sessionUserId) {
          markAsRead();
        }
      }
    };

    const handleMessageUpdated = (updatedMessage: {
      messageId: string;
      conversationId: string;
      content: string;
      updatedAt?: DateString | null;
      editCount?: number;
    }) => {
      if (updatedMessage.conversationId === conversationId) {
        setLocalMessages((prev) =>
          updateMessageInList(prev, updatedMessage.messageId, {
            content: updatedMessage.content,
            updatedAt: updatedMessage.updatedAt,
            editCount: updatedMessage.editCount,
          }),
        );
      }
    };

    const handleMessagesRead = (data: {
      conversationId: string;
      messageIds: string[];
    }) => {
      if (data.conversationId === conversationId) {
        setLocalMessages((prev) =>
          markMessagesAsReadInList(prev, data.messageIds),
        );
      }
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      conversationId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setLocalMessages((prev) =>
          updateMessageInList(prev, data.messageId, { deletedAt: new Date() }),
        );
      }
    };

    const handleUserTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== sessionUserId
      ) {
        const userName =
          conversation?.otherUserId === data.userId
            ? conversation.otherUserDisplayName ||
              conversation.otherUserName ||
              "Quelqu'un"
            : "Quelqu'un";

        setTypingUsers((prev) =>
          addUserToTypingMap(prev, data.userId, userName),
        );
        scheduleTypingStop(setTypingUsers, data.userId, 3000);
      }
    };

    const handleUserStoppedTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => removeUserFromTypingMap(prev, data.userId));
      }
    };

    const handleReactionChanged = () => {
      refetch();
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("messages-read", handleMessagesRead);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);
    socket.on("reaction-added", handleReactionChanged);
    socket.on("reaction-removed", handleReactionChanged);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-updated", handleMessageUpdated);
      socket.off("messages-read", handleMessagesRead);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
      socket.off("reaction-added", handleReactionChanged);
      socket.off("reaction-removed", handleReactionChanged);
    };
  }, [
    socket,
    conversationId,
    sessionUserId,
    conversation,
    setLocalMessages,
    setTypingUsers,
    markAsRead,
    refetch,
  ]);
}
