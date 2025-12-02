"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { authClient } from "@/lib/auth-client";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import {
  ArrowLeft,
  BookOpen,
  X,
  Search,
  MoreVertical,
  Ban,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
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
        workshopTitle: string;
        workshopDate: Date | string | null;
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
    onSuccess: (data) => {
      utils.messaging.getUnreadConversationsCount.invalidate();
      refetch();
      if (socket && socket.connected && data.messageIds.length > 0) {
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
    (c) => c.conversationId === conversationId
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
        workshopDate: Date | string | null;
      } | null;
    }) => {
      if (message.conversationId === conversationId) {
        setLocalMessages((prev) => [...prev, message]);
        if (message.senderId !== session?.user?.id) {
          markAsReadMutation.mutate({ conversationId });
        }
      }
    };

    const handleMessageUpdated = (updatedMessage: {
      messageId: string;
      conversationId: string;
      senderId: string;
      senderName?: string | null;
      senderDisplayName?: string | null;
      content: string;
      createdAt: Date | string;
      updatedAt?: Date | string | null;
      editCount?: number;
    }) => {
      if (updatedMessage.conversationId === conversationId) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === updatedMessage.messageId
              ? {
                  ...msg,
                  content: updatedMessage.content,
                  updatedAt: updatedMessage.updatedAt,
                  editCount: updatedMessage.editCount,
                }
              : msg
          )
        );
      }
    };

    const handleMessagesRead = (data: {
      conversationId: string;
      messageIds: string[];
    }) => {
      if (data.conversationId === conversationId) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.messageId)
              ? { ...msg, isRead: true }
              : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      conversationId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === data.messageId
              ? { ...msg, deletedAt: new Date() }
              : msg
          )
        );
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

        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, userName);
          return newMap;
        });

        setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
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
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const updateMessageMutation = trpc.messaging.updateMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error("Erreur lors de la modification", {
        description: error.message,
      });
    },
  });

  const deleteMessageMutation = trpc.messaging.deleteMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression", {
        description: error.message,
      });
    },
  });

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (socket && socket.connected) {
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
    if (socket && socket.connected) {
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

    // TODO: Optimistic update: add message immediately to local state
    const optimisticMessage = {
      messageId: tempMessageId,
      senderId: session.user.id,
      senderName: currentUserName,
      senderDisplayName: null,
      content: trimmedContent,
      createdAt: new Date(),
      isRead: false,
      replyToMessageId: replyingToMessageId || null,
      replyToMessage: replyingToMessageId
        ? localMessages.find((m) => m.messageId === replyingToMessageId)
          ? {
              messageId: replyingToMessageId,
              content:
                localMessages.find((m) => m.messageId === replyingToMessageId)
                  ?.content || "",
              senderName: null,
              senderDisplayName: null,
            }
          : null
        : null,
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    setReplyingToMessageId(null);

    if (socket && socket.connected) {
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
            prev.map((msg) => (msg.messageId === tempMessageId ? message : msg))
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
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Chargement des messages...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]">
      <CardHeader className="shrink-0 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inbox")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">
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
            >
              <Search className="h-4 w-4" />
            </Button>
            {conversation?.otherUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowBlockDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Bloquer l'utilisateur
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowReportDialog(true)}
                    className="text-destructive focus:text-destructive"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher dans la conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <p className="text-sm text-muted-foreground p-2">
                    Aucun résultat trouvé
                  </p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((result) => (
                      <div
                        key={result.messageId}
                        className="p-2 hover:bg-muted rounded cursor-pointer text-sm"
                        onClick={() => {
                          const element = document.querySelector(
                            `[data-message-id="${result.messageId}"]`
                          );
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth" });
                            element.classList.add("ring-2", "ring-primary");
                            setTimeout(() => {
                              element.classList.remove(
                                "ring-2",
                                "ring-primary"
                              );
                            }, 2000);
                          }
                          setShowSearch(false);
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
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
        <div className="border-t p-4 shrink-0">
          {replyingToMessageId &&
            (() => {
              const replyingToMessage = localMessages.find(
                (m) => m.messageId === replyingToMessageId
              );

              if (!replyingToMessage) return null;

              return (
                <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      Répondre à:
                    </p>
                    {replyingToMessage.workshopReference ? (
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {replyingToMessage.workshopReference
                              .workshopTitle || "Atelier"}
                          </p>
                          {replyingToMessage.workshopReference.workshopDate && (
                            <p className="text-xs text-muted-foreground">
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
                      <p className="text-sm truncate">
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
      </CardContent>
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
    </Card>
  );
}
