"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { authClient } from "@/lib/auth-client";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { BookOpen, X, Search, MoreVertical, Ban, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { BlockUserDialog } from "@/components/user/BlockUserDialog";
import { ReportUserDialog } from "@/components/user/ReportUserDialog";

type DateString = Date | string;

interface ChatWindowProps {
  readonly conversationId: string;
}

export function ChatWindow({ conversationId }: Readonly<ChatWindowProps>) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const socket = useSocket();
  const [localMessages, setLocalMessages] = useState<
    Array<{
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
    }>
  >([]);
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const { data: searchResults, isLoading: isSearching } =
    trpc.messaging.searchMessages.useQuery(
      {
        conversationId,
        query: searchQuery,
        limit: 50,
      },
      {
        enabled: showSearch && searchQuery.trim().length > 0 && !!session,
      }
    );

  const {
    data: messages,
    isLoading,
    refetch,
  } = trpc.messaging.getMessages.useQuery(
    { conversationId, limit: 100 },
    {
      enabled: !!conversationId && !!session,
    }
  );

  const utils = trpc.useUtils();
  const markAsReadMutation = trpc.messaging.markMessagesAsRead.useMutation({
    onSuccess: (data: any) => {
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
    {
      enabled: !!session,
    }
  );

  const conversation = conversations?.find(
    (c: any) => c.conversationId === conversationId
  );

  const { data: conversationDetails, refetch: refetchConversationDetails } =
    trpc.messaging.getConversationDetails.useQuery(
      { conversationId },
      {
        enabled: !!conversationId && !!session,
      }
    );

  useEffect(() => {
    if (conversationId && session) {
      refetchConversationDetails();
    }
  }, [conversationId, session, refetchConversationDetails]);

  useEffect(() => {
    if (messages) {
      const reversed = [...messages].reverse();
      setLocalMessages(reversed);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    if (conversationId && session) {
      markAsReadMutation.mutate({ conversationId });
    }
  }, [conversationId, session]);

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

    const handleNewMessage = (message: {
      messageId: string;
      conversationId: string;
      senderId: string;
      senderName?: string | null;
      senderDisplayName?: string | null;
      content: string;
      createdAt: Date | string;
      isRead?: boolean;
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
    }) => {
      if (message.conversationId === conversationId) {
        setLocalMessages((prev) => [...prev, message]);
        if (message.senderId !== session?.user?.id) {
          markAsReadMutation.mutate({ conversationId });
        }
      }
    };

    const updateMessageInList = (
      messages: typeof localMessages,
      updatedMessage: {
        messageId: string;
        content: string;
        updatedAt?: DateString | null;
        editCount?: number;
      }
    ) => {
      return messages.map((msg) =>
        msg.messageId === updatedMessage.messageId
          ? {
              ...msg,
              content: updatedMessage.content,
              updatedAt: updatedMessage.updatedAt,
              editCount: updatedMessage.editCount,
            }
          : msg
      );
    };

    const handleMessageUpdated = (updatedMessage: {
      messageId: string;
      conversationId: string;
      senderId: string;
      senderName?: string | null;
      senderDisplayName?: string | null;
      content: string;
      createdAt: DateString;
      updatedAt?: DateString | null;
      editCount?: number;
    }) => {
      if (updatedMessage.conversationId === conversationId) {
        setLocalMessages((prev) =>
          updateMessageInList(prev, {
            messageId: updatedMessage.messageId,
            content: updatedMessage.content,
            updatedAt: updatedMessage.updatedAt,
            editCount: updatedMessage.editCount,
          })
        );
      }
    };

    const markMessagesAsRead = (
      messages: typeof localMessages,
      messageIds: string[]
    ) => {
      return messages.map((msg) =>
        messageIds.includes(msg.messageId) ? { ...msg, isRead: true } : msg
      );
    };

    const handleMessagesRead = (data: {
      conversationId: string;
      messageIds: string[];
    }) => {
      if (data.conversationId === conversationId) {
        setLocalMessages((prev) => markMessagesAsRead(prev, data.messageIds));
      }
    };

    const markMessageAsDeleted = (
      messages: typeof localMessages,
      messageId: string
    ) => {
      return messages.map((msg) =>
        msg.messageId === messageId ? { ...msg, deletedAt: new Date() } : msg
      );
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      conversationId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setLocalMessages((prev) => markMessageAsDeleted(prev, data.messageId));
      }
    };

    const handleUserTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== session?.user?.id
      ) {
        const otherUser =
          conversation?.otherUserId === data.userId ? conversation : null;
        const userName =
          otherUser?.otherUserDisplayName ||
          otherUser?.otherUserName ||
          "Quelqu'un";

        const addTypingUser = (prev: Map<string, string>) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, userName);
          return newMap;
        };

        setTypingUsers(addTypingUser);

        const removeTypingUser = (prev: Map<string, string>) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        };

        setTimeout(() => {
          setTypingUsers(removeTypingUser);
        }, 3000);
      }
    };

    const removeTypingUserFromMap = (
      prev: Map<string, string>,
      userId: string
    ) => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    };

    const handleUserStoppedTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => removeTypingUserFromMap(prev, data.userId));
      }
    };

    const handleReactionAdded = (data: {
      messageId: string;
      userId: string;
      emoji: string;
    }) => {
      refetch();
    };

    const handleReactionRemoved = (data: {
      messageId: string;
      userId: string;
      emoji: string;
    }) => {
      refetch();
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("messages-read", handleMessagesRead);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);
    socket.on("reaction-added", handleReactionAdded);
    socket.on("reaction-removed", handleReactionRemoved);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-updated", handleMessageUpdated);
      socket.off("messages-read", handleMessagesRead);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
      socket.off("reaction-added", handleReactionAdded);
      socket.off("reaction-removed", handleReactionRemoved);
    };
  }, [socket, conversationId, session]);

  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
      setReplyingToMessageId(null);
    },
    onError: (error: any) => {
      console.error("Error sending message:", error);
    },
  });

  const updateMessageMutation = trpc.messaging.updateMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la modification", {
        description: error.message,
      });
    },
  });

  const deleteMessageMutation = trpc.messaging.deleteMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression", {
        description: error.message,
      });
    },
  });

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (socket?.connected) {
      socket.emit("update-message", {
        messageId,
        content: newContent,
      });
    } else {
      updateMessageMutation.mutate({
        messageId,
        content: newContent,
      });
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

    const currentUserName = session.user.name || null;

    const getReplyToMessage = () => {
      if (!replyingToMessageId) {
        return null;
      }

      const repliedMessage = localMessages.find(
        (m) => m.messageId === replyingToMessageId
      );

      if (!repliedMessage) {
        return null;
      }

      return {
        messageId: replyingToMessageId,
        content: repliedMessage.content || "",
        senderName: null,
        senderDisplayName: null,
      };
    };

    const optimisticMessage = {
      messageId: tempMessageId,
      senderId: session.user.id,
      senderName: currentUserName,
      senderDisplayName: null,
      content: trimmedContent,
      createdAt: new Date(),
      isRead: false,
      replyToMessageId: replyingToMessageId || null,
      replyToMessage: getReplyToMessage(),
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    setReplyingToMessageId(null);

    const replaceTempMessage = (
      prev: typeof localMessages,
      tempId: string,
      newMessage: {
        messageId: string;
        conversationId: string;
        senderId: string;
        senderName?: string | null;
        senderDisplayName?: string | null;
        content: string;
        createdAt: Date | string;
        replyToMessageId?: string | null;
        replyToMessage?: {
          messageId: string;
          content: string;
          senderName: string | null;
          senderDisplayName: string | null;
        } | null;
      }
    ) => {
      return prev.map((msg) => (msg.messageId === tempId ? newMessage : msg));
    };

    if (socket?.connected) {
      socket.emit("send-message", {
        conversationId,
        content: trimmedContent,
        replyToMessageId: replyingToMessageId || null,
      });

      const handleSentMessage = (message: {
        messageId: string;
        conversationId: string;
        senderId: string;
        senderName?: string | null;
        senderDisplayName?: string | null;
        content: string;
        createdAt: Date | string;
        replyToMessageId?: string | null;
        replyToMessage?: {
          messageId: string;
          content: string;
          senderName: string | null;
          senderDisplayName: string | null;
        } | null;
      }) => {
        if (
          message.conversationId === conversationId &&
          message.senderId === session.user.id
        ) {
          setLocalMessages((prev) =>
            replaceTempMessage(prev, tempMessageId, message)
          );
          socket.off("new-message", handleSentMessage);
        }
      };

      socket.once("new-message", handleSentMessage);

      setTimeout(() => {
        refetch();
      }, 1000);
    } else {
      sendMessageMutation.mutate({
        conversationId,
        content: trimmedContent,
        replyToMessageId: replyingToMessageId || null,
      });
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    setReplyingToMessageId(messageId);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="text-center text-muted-foreground dark:text-[#e6e6e6]">
          Chargement des messages...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 border-b border-[#d6dae4] dark:border-[#d6dae4] p-4 bg-white dark:bg-[#1a1720]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#26547c] dark:text-[#e6e6e6]">
              {conversation?.otherUserDisplayName ||
                conversation?.otherUserName ||
                "Conversation"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <Search className="h-4 w-4 text-gray-600 dark:text-[#e6e6e6]" />
            </Button>
            {conversation?.otherUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600 dark:text-[#e6e6e6]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-[#1a1720] border border-[#d6dae4]"
                >
                  <DropdownMenuItem
                    onClick={() => setShowBlockDialog(true)}
                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Bloquer l'utilisateur
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#d6dae4]" />
                  <DropdownMenuItem
                    onClick={() => setShowReportDialog(true)}
                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Signaler l'utilisateur
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {showSearch && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-[rgba(230,230,230,0.64)]" />
              <input
                type="text"
                placeholder="Rechercher dans la conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-[#d6dae4] rounded-lg bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] placeholder:text-gray-500 dark:placeholder:text-[rgba(230,230,230,0.64)] focus:outline-none focus:ring-2 focus:ring-[#26547c] dark:focus:ring-[#e6e6e6]"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {searchQuery && searchResults && (
              <div className="mt-2 max-h-48 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-[rgba(230,230,230,0.64)] p-2">
                    Aucun résultat trouvé
                  </p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((result: any) => {
                      const handleResultClick = () => {
                        const element = document.querySelector(
                          `[data-message-id="${result.messageId}"]`
                        );
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                          element.classList.add("ring-2", "ring-primary");
                          setTimeout(() => {
                            element.classList.remove("ring-2", "ring-primary");
                          }, 2000);
                        }
                        setShowSearch(false);
                      };

                      return (
                        <button
                          key={result.messageId}
                          type="button"
                          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded cursor-pointer text-sm text-[#26547c] dark:text-[#e6e6e6] transition-colors"
                          onClick={handleResultClick}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleResultClick();
                            }
                          }}
                        >
                          <p className="font-medium">
                            {result.senderDisplayName ||
                              result.senderName ||
                              "Utilisateur"}
                          </p>
                          <p className="text-muted-foreground truncate">
                            {result.content.length > 100
                              ? result.content.substring(0, 100) + "..."
                              : result.content}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col p-0 overflow-hidden bg-white dark:bg-[#1a1720]">
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList
            messages={localMessages}
            currentUserId={session?.user?.id || ""}
            conversationId={conversationId}
            onEditMessage={handleEditMessage}
            onReplyToMessage={handleReplyToMessage}
            onDeleteMessage={handleDeleteMessage}
            isEditing={updateMessageMutation.isPending}
            workshopContext={conversationDetails}
          />
          {typingUsers.size > 0 && (
            <TypingIndicator userName={Array.from(typingUsers.values())[0]} />
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-[#d6dae4] dark:border-[#d6dae4] p-4 shrink-0 bg-white dark:bg-[#1a1720]">
          {replyingToMessageId &&
            (() => {
              const replyingToMessage = localMessages.find(
                (m) => m.messageId === replyingToMessageId
              );

              if (!replyingToMessage) return null;

              return (
                <div className="mb-2 p-2 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-[rgba(230,230,230,0.64)] mb-1">
                      Répondre à:
                    </p>
                    {replyingToMessage.workshopReference ? (
                      <div className="flex items-center gap-2 text-sm text-[#26547c] dark:text-[#e6e6e6]">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-600 dark:text-[rgba(230,230,230,0.64)]" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {replyingToMessage.workshopReference
                              .workshopTitle || "Atelier"}
                          </p>
                          {replyingToMessage.workshopReference.workshopDate && (
                            <p className="text-xs text-gray-600 dark:text-[rgba(230,230,230,0.64)]">
                              {format(
                                new Date(
                                  replyingToMessage.workshopReference.workshopDate
                                ),
                                "d MMM yyyy",
                                { locale: fr }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm truncate text-[#26547c] dark:text-[#e6e6e6]">
                        {replyingToMessage.content}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={() => setReplyingToMessageId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })()}
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
              conversation.otherUserDisplayName || conversation.otherUserName
            }
            onBlocked={() => {
              router.push("/inbox");
            }}
          />
          <ReportUserDialog
            open={showReportDialog}
            onOpenChange={setShowReportDialog}
            userId={conversation.otherUserId}
            userName={
              conversation.otherUserDisplayName || conversation.otherUserName
            }
          />
        </>
      )}
    </div>
  );
}
