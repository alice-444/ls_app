"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Trash2,
  MoreVertical,
  UserX,
  User,
  ExternalLink,
} from "lucide-react";
import { useSocket } from "@/lib/socket-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { BlockUserDialog } from "@/components/user/BlockUserDialog";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function ConversationList() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const {
    data: conversations,
    isLoading,
    refetch,
  } = trpc.messaging.getConversations.useQuery();
  const [localConversations, setLocalConversations] = useState(
    conversations || []
  );
  const socket = useSocket();
  const [showNewConversationDialog, setShowNewConversationDialog] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationSearchQuery, setConversationSearchQuery] = useState("");
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const conversationsPerPage = 5;
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const { data: acceptedConnections } =
    trpc.connection.getAcceptedConnections.useQuery(undefined, {
      enabled: showNewConversationDialog,
    });

  const getOrCreateConversationMutation =
    trpc.messaging.getOrCreateConversation.useMutation({
      onSuccess: (data: any) => {
        router.push(`/inbox/${data.conversationId}`);
        setShowNewConversationDialog(false);
      },
      onError: (error: any) => {
        toast.error("Erreur lors de l'ouverture de la conversation", {
          description: error.message,
        });
      },
    });

  const handleStartConversation = (otherUserId: string) => {
    getOrCreateConversationMutation.mutate({ otherUserId });
  };

  const deleteMutation = trpc.messaging.deleteConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversation supprimée");
      refetch();
      utils.messaging.getUnreadConversationsCount.invalidate();
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression", {
        description: error.message,
      });
    },
  });

  const handleDelete = (conversationId: string) => {
    deleteMutation.mutate({ conversationId });
  };

  const pinConversationMutation = trpc.messaging.pinConversation.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Conversation épinglée");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de l'épinglage", {
        description: error.message,
      });
    },
  });

  const unpinConversationMutation =
    trpc.messaging.unpinConversation.useMutation({
      onSuccess: () => {
        refetch();
        toast.success("Conversation désépinglée");
      },
      onError: (error: any) => {
        toast.error("Erreur lors du désépinglage", {
          description: error.message,
        });
      },
    });

  const handleTogglePin = (conversationId: string, isPinned: boolean) => {
    if (isPinned) {
      unpinConversationMutation.mutate({ conversationId });
    } else {
      pinConversationMutation.mutate({ conversationId });
    }
  };

  const handleBlockUser = (otherUserId: string, displayName: string) => {
    setUserToBlock({
      userId: otherUserId,
      userName: displayName,
    });
    setBlockDialogOpen(true);
  };

  useEffect(() => {
    if (conversations) {
      setLocalConversations(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = (
      updatedConversation: NonNullable<typeof conversations>[0]
    ) => {
      setLocalConversations((prev: any) => {
        const index = prev.findIndex(
          (c: any) => c.conversationId === updatedConversation.conversationId
        );

        if (index >= 0) {
          const newConversations = [...prev];
          newConversations[index] = updatedConversation;
          return newConversations.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        } else {
          return [updatedConversation, ...prev].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
      });
    };

    const handleUserOnline = (data: { userId: string }) => {
      utils.messaging.getUserPresence.invalidate({ userId: data.userId });
      utils.messaging.getMultipleUsersPresence.invalidate();
    };

    const handleUserOffline = (data: { userId: string }) => {
      utils.messaging.getUserPresence.invalidate({ userId: data.userId });
      utils.messaging.getMultipleUsersPresence.invalidate();
    };

    socket.on("conversation-updated", handleConversationUpdate);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);

    return () => {
      socket.off("conversation-updated", handleConversationUpdate);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
    };
  }, [socket, utils]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-8">
        <div className="text-center text-muted-foreground dark:text-[#e6e6e6]">
          Chargement...
        </div>
      </div>
    );
  }

  if (!localConversations || localConversations.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-8">
        <div className="text-center py-12 text-muted-foreground dark:text-[#e6e6e6]">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Aucune conversation</p>
            <p className="mb-4">Commencez à réseauter pour discuter !</p>
          <Button
            onClick={() => setShowNewConversationDialog(true)}
            className="bg-[#ffb647] hover:bg-[#ff9f1a] border border-[#ffb647] text-black rounded-full px-6 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
            </Button>
          </div>
      </div>
    );
  }

  // Filter conversations based on search and pin status
  const filteredConversations = localConversations.filter((conv: any) => {
    const displayName = conv.otherUserDisplayName || conv.otherUserName || "";
    const matchesSearch = displayName
      .toLowerCase()
      .includes(conversationSearchQuery.toLowerCase());
    const matchesPinFilter = !showOnlyPinned || conv.isPinned;
    return matchesSearch && matchesPinFilter;
  });

  // Sort by pinned status first, then by updatedAt
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    // Pinned conversations come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then sort by most recent
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const totalPages = Math.ceil(
    sortedConversations.length / conversationsPerPage
  );
  const paginatedConversations = sortedConversations.slice(
    (currentPage - 1) * conversationsPerPage,
    currentPage * conversationsPerPage
  );

  const filteredConnections = (acceptedConnections || []).filter(
    (connection: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const name =
        connection.otherUserDisplayName || connection.otherUserName || "";
      return name.toLowerCase().includes(query);
    }
  );

  const existingConversationUserIds = new Set(
    localConversations.map((c: any) => c.otherUserId)
  );
  const availableConnections = filteredConnections.filter(
    (connection: any) => !existingConversationUserIds.has(connection.otherUserId)
  );

  return (
    <>
      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-3 sm:p-5 space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 sm:max-w-md">
            <div className="relative">
              <Input
                placeholder="Rechercher..."
                value={conversationSearchQuery}
                onChange={(e) => setConversationSearchQuery(e.target.value)}
                className="h-9 sm:h-10 pl-4 pr-10 rounded-full border border-[#d6dae4] bg-[rgba(214,218,228,0.16)] text-[#26547c] dark:text-[#e6e6e6] placeholder:text-[rgba(38,84,124,0.64)] dark:placeholder:text-[rgba(230,230,230,0.64)] text-xs"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-[18px] sm:w-[18px] text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setShowOnlyPinned(!showOnlyPinned)}
              className={cn(
                "h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all duration-200 flex-1 sm:flex-initial",
                showOnlyPinned
                  ? "bg-[#ffb647] dark:bg-[#ffb647] border-[#ffb647] text-[#161616] hover:bg-[#ff9f1a] dark:hover:bg-[#ff9f1a] shadow-md hover:shadow-lg"
                  : "bg-white dark:bg-transparent border-[#d6dae4] dark:border-[#d6dae4] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[#ffb647]/10 hover:border-[#ff9f1a] hover:text-[#ff9f1a] dark:hover:bg-[#ffb647]/20 dark:hover:border-[#ffb647] dark:hover:text-[#ffb647] hover:shadow-sm"
              )}
            >
              <span className="hidden sm:inline">Conversations épinglées</span>
              <span className="sm:hidden">Épinglées</span>
              <Pin className={cn("ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all", showOnlyPinned && "fill-current")} />
            </Button>

            <Button
              onClick={() => setShowNewConversationDialog(true)}
              className="h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full bg-[#ffb647] hover:bg-[#ff9f1a] border border-[#ffb647] text-[#161616] text-xs font-semibold transition-colors shadow-md flex-1 sm:flex-initial"
            >
              <span className="hidden sm:inline">Nouvelle conversation</span>
              <span className="sm:hidden">Nouveau</span>
              <Plus className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2.5">
          {paginatedConversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground dark:text-[#e6e6e6]">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Aucune conversation trouvée
              </p>
              <p>Essayez de modifier ta recherche</p>
            </div>
          ) : (
            paginatedConversations.map((conversation) => {
              const displayName =
                conversation.otherUserDisplayName ||
                conversation.otherUserName ||
                "Utilisateur";
              const initials = displayName
                .split(" ")
                .map((n: any) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              let lastMessagePreview = "";
              if (conversation.lastMessage) {
                const content = conversation.lastMessage.content;
                lastMessagePreview =
                  content.length > 50
                    ? content.substring(0, 50) + "..."
                    : content;
              }

              const timestamp = conversation.lastMessage
                ? formatDistanceToNow(
                    new Date(conversation.lastMessage.createdAt),
                    {
                      locale: fr,
                    }
                  )
                : "";

              return (
                <div
                  key={conversation.conversationId}
                  className="bg-white dark:bg-[rgba(255,255,255,0.08)] border border-[#d6dae4] rounded-2xl h-[90px] sm:h-[90px] flex items-center justify-between px-2 sm:px-4 py-2 hover:shadow-md transition-shadow"
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 sm:gap-3 flex-1 cursor-pointer text-left min-w-0"
                    onClick={() =>
                      router.push(`/inbox/${conversation.conversationId}`)
                    }
                  >
                    <Avatar.Root className="h-10 w-10 sm:h-11 sm:w-11 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-white dark:border-gray-950 shrink-0">
                      <Avatar.Image
                        src={conversation.otherUserPhotoUrl || undefined}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                      <Avatar.Fallback className="h-full w-full flex items-center justify-center text-xs font-medium">
                        {initials}
                      </Avatar.Fallback>
                    </Avatar.Root>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <h3 className="text-[#26547c] dark:text-[#e6e6e6] text-sm font-bold truncate">
                        {displayName}
                      </h3>
                      <div className="flex items-start gap-1 sm:gap-2">
                        <p className="text-[#26547c] dark:text-[#e6e6e6] text-xs truncate flex-1">
                          {lastMessagePreview}
                        </p>
                        {timestamp && (
                          <span className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] text-xs whitespace-nowrap hidden sm:inline">
                            • {timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleTogglePin(
                          conversation.conversationId,
                          conversation.isPinned
                        )
                      }
                      className="hidden md:flex h-8 px-2.5 py-1 rounded-full border bg-white dark:bg-transparent border-[#d9d9d9] dark:border-[#d6dae4] text-[#26547c] dark:text-[#e6e6e6] text-xs font-semibold transition-colors capitalize hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      <span>
                        {conversation.isPinned ? "désépingler" : "épingler"}
                      </span>
                      <Pin
                        className={cn(
                          "ml-1 h-3.5 w-3.5",
                          conversation.isPinned && "fill-current"
                        )}
                      />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDelete(conversation.conversationId)}
                      className="hidden md:flex h-8 px-2.5 py-1 rounded-full bg-white dark:bg-transparent border border-[#d9d9d9] dark:border-[#d9d9d9] text-[#d84242] dark:text-red-400 text-xs font-semibold transition-colors capitalize hover:bg-red-50 dark:hover:bg-red-500/10"
                      disabled={deleteMutation.isPending}
                    >
                      <span>Supprimer</span>
                      <Trash2 className="ml-1 h-3.5 w-3.5" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title="Plus d'options"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-600 dark:text-[#e6e6e6]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-white dark:bg-[#1a1720] border border-[#d6dae4] rounded-xl shadow-lg"
                      >
                        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-[rgba(230,230,230,0.64)] px-3 py-2">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#d6dae4]" />

                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/inbox/${conversation.conversationId}`)
                          }
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
                        >
                          <MessageSquare className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
                          <span className="text-sm text-gray-700 dark:text-[#e6e6e6]">
                            Ouvrir la conversation
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleTogglePin(
                              conversation.conversationId,
                              conversation.isPinned
                            )
                          }
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
                        >
                          <Pin
                            className={cn(
                              "h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]",
                              conversation.isPinned && "fill-current"
                            )}
                          />
                          <span className="text-sm text-gray-700 dark:text-[#e6e6e6]">
                            {conversation.isPinned ? "Désépingler" : "Épingler"}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-[#d6dae4]" />

                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/apprentice/${conversation.otherUserId}`
                            )
                          }
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg mx-1"
                        >
                          <User className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
                          <span className="text-sm text-gray-700 dark:text-[#e6e6e6]">
                            Voir le profil
                          </span>
                          <ExternalLink className="h-3 w-3 ml-auto text-gray-400 dark:text-[rgba(230,230,230,0.64)]" />
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-[#d6dae4]" />

                        <DropdownMenuItem
                          onClick={() =>
                            handleBlockUser(
                              conversation.otherUserId,
                              conversation.otherUserDisplayName ||
                                conversation.otherUserName ||
                                "cet utilisateur"
                            )
                          }
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg mx-1"
                        >
                          <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm text-red-600 dark:text-red-400">
                            Bloquer l'utilisateur
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleDelete(conversation.conversationId)
                          }
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg mx-1"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm text-red-600 dark:text-red-400">
                            Supprimer la conversation
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full bg-white dark:bg-white border border-[#d6dae4] text-[#26547c] dark:text-[#e6e6e6] text-xs sm:text-sm font-semibold capitalize",
                currentPage === 1 && "opacity-30"
              )}
            >
              Précédent
            </Button>

            <div className="flex items-center gap-2 sm:gap-3">
              {Array.from(
                { length: Math.min(4, totalPages) },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-7 sm:w-8 text-center text-xs sm:text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] transition-opacity",
                    currentPage === page ? "opacity-100" : "opacity-60"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full bg-white dark:bg-white border border-[#d6dae4] text-[#26547c] dark:text-[#e6e6e6] text-xs sm:text-sm font-semibold capitalize"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

            <Dialog
              open={showNewConversationDialog}
              onOpenChange={(open) => {
                setShowNewConversationDialog(open);
                if (!open) {
                  setSearchQuery("");
                }
              }}
            >
              <DialogContent
                className="max-w-2xl"
                onClose={() => setShowNewConversationDialog(false)}
              >
                <DialogHeader>
                  <DialogTitle>Démarrer une nouvelle conversation</DialogTitle>
                  <DialogDescription>
                    Sélectionnez une personne de votre réseau pour commencer à
                    discuter
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans votre réseau..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {availableConnections.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? "Aucun résultat trouvé"
                          : "Toutes vos connexions ont déjà une conversation active"}
                      </div>
                    ) : (
                      availableConnections.map((connection: any) => {
                        const displayName =
                          connection.otherUserDisplayName ||
                          connection.otherUserName ||
                          "Utilisateur";
                        const initials = displayName
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);

                  let roleName: string | null = connection.otherUserRole;
                  if (connection.otherUserRole === "MENTOR") {
                    roleName = "Mentor";
                  } else if (connection.otherUserRole === "APPRENANT") {
                    roleName = "Apprenti";
                  }

                        return (
                    <button
                            key={connection.connectionId}
                      type="button"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer w-full text-left"
                            onClick={() =>
                              handleStartConversation(connection.otherUserId)
                            }
                          >
                            <div className="flex items-center gap-3">
                              {connection.otherUserPhotoUrl ? (
                                <img
                                  src={connection.otherUserPhotoUrl}
                                  alt={displayName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <Avatar.Root className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                  <Avatar.Fallback className="h-full w-full flex items-center justify-center text-sm font-medium">
                                    {initials}
                                  </Avatar.Fallback>
                                </Avatar.Root>
                              )}
                              <div>
                                <p className="font-medium">{displayName}</p>
                                {connection.otherUserRole && (
                                  <p className="text-sm text-muted-foreground">
                              {roleName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                        disabled={getOrCreateConversationMutation.isPending}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                    </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

      {userToBlock && (
        <BlockUserDialog
          open={blockDialogOpen}
          onOpenChange={setBlockDialogOpen}
          userId={userToBlock.userId}
          userName={userToBlock.userName}
          onBlocked={() => {
            refetch();
            setUserToBlock(null);
          }}
        />
      )}
    </>
  );
}
