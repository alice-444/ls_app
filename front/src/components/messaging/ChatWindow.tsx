"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { authClient } from "@/lib/auth-client";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { ChatHeader } from "./ChatHeader";
import { ReplyPreview } from "./ReplyPreview";
import { BlockUserDialog } from "@/components/user/BlockUserDialog";
import { ReportUserDialog } from "@/components/user/ReportUserDialog";
import { toast } from "sonner";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { ChatMessage } from "@/hooks/useChatSocket";

function replaceTempMessage(
  messages: ChatMessage[],
  tempId: string,
  replacement: ChatMessage
): ChatMessage[] {
  return messages.map((msg) => (msg.messageId === tempId ? replacement : msg));
}

function createSentMessageHandler(
  tempMessageId: string,
  conversationId: string,
  userId: string,
  socket: { off: (event: string, handler: (msg: ChatMessage & { conversationId: string }) => void) => void },
  setLocalMessages: Dispatch<SetStateAction<ChatMessage[]>>
) {
  return function handleSentMessage(message: ChatMessage & { conversationId: string }) {
    if (message.conversationId === conversationId && message.senderId === userId) {
      setLocalMessages((prev) => replaceTempMessage(prev, tempMessageId, message));
      socket.off("new-message", handleSentMessage);
    }
  };
}

interface ChatWindowProps {
  readonly conversationId: string;
}

interface ChatConversation {
  conversationId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
}

export function ChatWindow({ conversationId }: Readonly<ChatWindowProps>) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const socket = useSocket();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const { data: searchResults } = trpc.messaging.searchMessages.useQuery(
    { conversationId, query: searchQuery, limit: 50 },
    { enabled: showSearch && searchQuery.trim().length > 0 && !!session }
  );

  const {
    data: messages,
    isLoading,
    refetch,
  } = trpc.messaging.getMessages.useQuery(
    { conversationId, limit: 100 },
    { enabled: !!conversationId && !!session }
  );

  const utils = trpc.useUtils();
  const markAsReadMutation = trpc.messaging.markMessagesAsRead.useMutation({
    onSuccess: (data: { messageIds: string[] }) => {
      utils.messaging.getUnreadConversationsCount.invalidate();
      refetch();
      if (socket?.connected && data.messageIds.length > 0) {
        socket.emit("mark-messages-read", {
          conversationId,
          messageIds: data.messageIds,
        });
      }
    },
  });

  const { data: conversations } = trpc.messaging.getConversations.useQuery(
    undefined,
    { enabled: !!session }
  ) as { data: ChatConversation[] | undefined };

  const conversation = conversations?.find(
    (c) => c.conversationId === conversationId
  );

  const { data: conversationDetails, refetch: refetchConversationDetails } =
    trpc.messaging.getConversationDetails.useQuery(
      { conversationId },
      { enabled: !!conversationId && !!session }
    );

  const markAsRead = useCallback(() => {
    markAsReadMutation.mutate({ conversationId });
  }, [conversationId]);

  useChatSocket({
    socket,
    conversationId,
    sessionUserId: session?.user?.id,
    conversation,
    setLocalMessages,
    setTypingUsers,
    markAsRead,
    refetch,
  });

  useEffect(() => {
    if (conversationId && session) {
      refetchConversationDetails();
    }
  }, [conversationId, session, refetchConversationDetails]);

  useEffect(() => {
    if (messages) {
      setLocalMessages([...messages].reverse());
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    if (conversationId && session) {
      markAsRead();
    }
  }, [conversationId, session, markAsRead]);

  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
      setReplyingToMessageId(null);
    },
    onError: (error: { message?: string }) => {
      console.error("Error sending message:", error);
    },
  });

  const updateMessageMutation = trpc.messaging.updateMessage.useMutation({
    onSuccess: () => refetch(),
    onError: (error: { message?: string }) => {
      toast.error("Erreur lors de la modification", { description: error.message });
    },
  });

  const deleteMessageMutation = trpc.messaging.deleteMessage.useMutation({
    onSuccess: () => refetch(),
    onError: (error: { message?: string }) => {
      toast.error("Erreur lors de la suppression", { description: error.message });
    },
  });

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (socket?.connected) {
      socket.emit("update-message", { messageId, content: newContent });
    } else {
      updateMessageMutation.mutate({ messageId, content: newContent });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (socket?.connected) {
      socket.emit("delete-message", { messageId });
    } else {
      deleteMessageMutation.mutate({ messageId });
    }
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !session) return;

    const trimmedContent = content.trim();
    const tempMessageId = `temp-${Date.now()}`;

    const repliedMessage = replyingToMessageId
      ? localMessages.find((m) => m.messageId === replyingToMessageId)
      : null;

    const replyToMessage = repliedMessage
      ? {
        messageId: replyingToMessageId!,
        content: repliedMessage.content || "",
        senderName: null,
        senderDisplayName: null,
      }
      : null;

    const optimisticMessage: ChatMessage = {
      messageId: tempMessageId,
      senderId: session.user.id,
      senderName: session.user.name || null,
      senderDisplayName: null,
      content: trimmedContent,
      createdAt: new Date(),
      isRead: false,
      replyToMessageId: replyingToMessageId || null,
      replyToMessage,
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    setReplyingToMessageId(null);

    if (socket?.connected) {
      socket.emit("send-message", {
        conversationId,
        content: trimmedContent,
        replyToMessageId: replyingToMessageId || null,
      });

      const handleSentMessage = createSentMessageHandler(
        tempMessageId,
        conversationId,
        session.user.id,
        socket,
        setLocalMessages
      );
      socket.once("new-message", handleSentMessage);
      setTimeout(() => refetch(), 1000);
    } else {
      sendMessageMutation.mutate({
        conversationId,
        content: trimmedContent,
        replyToMessageId: replyingToMessageId || null,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="text-center text-ls-muted">
          Chargement des messages...
        </div>
      </div>
    );
  }

  const replyingToMessage = replyingToMessageId
    ? localMessages.find((m) => m.messageId === replyingToMessageId)
    : null;

  const displayName =
    conversation?.otherUserDisplayName ||
    conversation?.otherUserName ||
    "Conversation";

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        displayName={displayName}
        otherUserId={conversation?.otherUserId}
        searchQuery={searchQuery}
        showSearch={showSearch}
        searchResults={searchResults}
        onSearchQueryChange={setSearchQuery}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onCloseSearch={() => {
          setSearchQuery("");
          setShowSearch(false);
        }}
        onShowBlockDialog={() => setShowBlockDialog(true)}
        onShowReportDialog={() => setShowReportDialog(true)}
      />
      <div className="flex-1 flex flex-col p-0 overflow-hidden bg-card">
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList
            messages={localMessages}
            currentUserId={session?.user?.id || ""}
            conversationId={conversationId}
            onEditMessage={handleEditMessage}
            onReplyToMessage={setReplyingToMessageId}
            onDeleteMessage={handleDeleteMessage}
            isEditing={updateMessageMutation.isPending}
            workshopContext={conversationDetails}
          />
          {typingUsers.size > 0 && (
            <TypingIndicator userName={Array.from(typingUsers.values())[0]} />
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-border p-4 shrink-0 bg-card">
          {replyingToMessage && (
            <ReplyPreview
              message={replyingToMessage}
              onCancel={() => setReplyingToMessageId(null)}
            />
          )}
          <MessageInput
            onSend={handleSendMessage}
            conversationId={conversationId}
          />
        </div>
      </div>
      {conversation?.otherUserId && (
        <>
          <BlockUserDialog
            open={showBlockDialog}
            onOpenChange={setShowBlockDialog}
            userId={conversation.otherUserId}
            userName={
              conversation.otherUserDisplayName || conversation.otherUserName || null
            }
            onBlocked={() => router.push("/inbox")}
          />
          <ReportUserDialog
            open={showReportDialog}
            onOpenChange={setShowReportDialog}
            userId={conversation.otherUserId}
            userName={
              conversation.otherUserDisplayName || conversation.otherUserName || null
            }
          />
        </>
      )}
    </div>
  );
}
