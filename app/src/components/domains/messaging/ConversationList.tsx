"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { MessageSquare, Plus, Search, Pin } from "lucide-react";
import { useSocket } from "@/lib/socket-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BlockUserDialog } from "@/components/domains/user/BlockUserDialog";
import { cn } from "@/lib/utils";
import { ConversationRow } from "./ConversationRow";
import { NewConversationDialog } from "./NewConversationDialog";
import { authClient } from "@/lib/auth-server-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";


function sortConversationsByPinnedAndTime<T extends { isPinned?: boolean; lastMessage?: { createdAt: string }; updatedAt: string }>(
  convs: T[]
): T[] {
  return [...convs].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
    const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });
}

function getNewConversationButtonText(hasConnections: boolean, userRole?: string | null): string {
  if (!hasConnections) return userRole === "MENTOR" ? "Voir mon réseau" : "Trouver un mentor";
  return "Nouvelle conversation";
}

function getNewConversationShortText(hasConnections: boolean, userRole?: string | null): string {
  if (!hasConnections) return userRole === "MENTOR" ? "Mon réseau" : "Trouver un mentor";
  return "Nouvelle conversation";
}

function applyConversationUpdate<T extends { conversationId: string; isPinned?: boolean; lastMessage?: { createdAt: string }; updatedAt: string }>(
  prev: T[],
  updated: T
): T[] {
  const index = prev.findIndex((c) => c.conversationId === updated.conversationId);
  let newConversations: T[];
  if (index >= 0) {
    newConversations = [...prev];
    newConversations[index] = updated;
  } else {
    newConversations = [updated, ...prev];
  }
  return sortConversationsByPinnedAndTime(newConversations);
}

function filterConversations<T extends { otherUserDisplayName?: string | null; otherUserName?: string | null; isPinned?: boolean }>(
  convs: T[],
  searchQuery: string,
  showOnlyPinned: boolean
): T[] {
  return convs.filter((conv) => {
    const displayName = conv.otherUserDisplayName || conv.otherUserName || "";
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPinFilter = !showOnlyPinned || conv.isPinned;
    return matchesSearch && matchesPinFilter;
  });
}

export function ConversationList() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: session } = authClient.useSession();

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: conversations,
    isLoading,
    refetch,
  } = trpc.messaging.getConversations.useQuery();
  type Conversation = NonNullable<typeof conversations>[number];
  const [localConversations, setLocalConversations] = useState<Conversation[]>(
    conversations || []
  );
  const socket = useSocket();
  const [showNewConversationDialog, setShowNewConversationDialog] =
    useState(false);
  const [conversationSearchQuery, setConversationSearchQuery] = useState("");
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const conversationsPerPage = 5;
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const otherUserIds = useMemo(() =>
    localConversations.map(c => c.otherUserId),
    [localConversations]
  );

  const { data: presenceMap } = trpc.messaging.getMultipleUsersPresence.useQuery(
    { userIds: otherUserIds },
    { enabled: otherUserIds.length > 0, refetchInterval: 60000 }
  );

  const { data: acceptedConnections, isLoading: isLoadingConnections } =
    trpc.connection.getAcceptedConnections.useQuery(undefined, {
      enabled: !!session,
    });

  const hasConnections = !!(acceptedConnections && acceptedConnections.length > 0);

  const getOrCreateConversationMutation =
    trpc.messaging.getOrCreateConversation.useMutation({
      onSuccess: (data: { conversationId: string }) => {
        router.push(`/inbox/${data.conversationId}`);
        setShowNewConversationDialog(false);
      },
      onError: (error: { message?: string }) => {
        toast.error("Erreur lors de l'ouverture de la conversation", {
          description: error.message,
        });
      },
    });

  const deleteMutation = trpc.messaging.deleteConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversation supprimée");
      refetch();
      utils.messaging.getUnreadConversationsCount.invalidate();
    },
    onError: (error: { message?: string }) => {
      toast.error("Erreur lors de la suppression", {
        description: error.message,
      });
    },
  });

  const pinConversationMutation = trpc.messaging.pinConversation.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Conversation épinglée");
    },
    onError: (error: { message?: string }) => {
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
      onError: (error: { message?: string }) => {
        toast.error("Erreur lors du désépinglage", {
          description: error.message,
        });
      },
    });

  const handlePin = (conversationId: string) => {
    pinConversationMutation.mutate({ conversationId });
  };

  const handleUnpin = (conversationId: string) => {
    unpinConversationMutation.mutate({ conversationId });
  };

  const handleBlockUser = (otherUserId: string, displayName: string) => {
    setUserToBlock({ userId: otherUserId, userName: displayName });
    setBlockDialogOpen(true);
  };

  const handleNewConversationClick = () => {
    if (hasConnections) {
      setShowNewConversationDialog(true);
    } else {
      router.push(userRole === "MENTOR" ? "/network" : "/mentors");
    }
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
      setLocalConversations((prev) =>
        applyConversationUpdate(prev, updatedConversation)
      );
    };

    const handlePresenceChange = (data: { userId: string }) => {
      utils.messaging.getUserPresence.invalidate({ userId: data.userId });
      utils.messaging.getMultipleUsersPresence.invalidate();
    };

    socket.on("conversation-updated", handleConversationUpdate);
    socket.on("user-online", handlePresenceChange);
    socket.on("user-offline", handlePresenceChange);

    return () => {
      socket.off("conversation-updated", handleConversationUpdate);
      socket.off("user-online", handlePresenceChange);
      socket.off("user-offline", handlePresenceChange);
    };
  }, [socket, utils]);

  if (isLoading) {
    return (
      <div className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl p-8 shadow-xl">
        <div className="text-center text-ls-muted">
          Chargement...
        </div>
      </div>
    );
  }

  if (!localConversations || localConversations.length === 0) {
    return (
      <div className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl p-8 shadow-xl">
        <div className="text-center py-12 text-ls-muted">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-ls-heading mb-2">Aucune conversation</p>
          <p className="mb-4">Commence à réseauter pour discuter !</p>
          <Button
            onClick={handleNewConversationClick}
            disabled={isLoadingConnections}
            variant="cta" size="cta" className="px-6 py-2"
          >
            {isLoadingConnections ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ls-heading" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {getNewConversationButtonText(hasConnections, userRole)}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const filteredConversations = filterConversations(
    localConversations,
    conversationSearchQuery,
    showOnlyPinned
  );

  const sortedConversations = sortConversationsByPinnedAndTime(filteredConversations);

  const totalPages = Math.ceil(
    sortedConversations.length / conversationsPerPage
  );
  const paginatedConversations = sortedConversations.slice(
    (currentPage - 1) * conversationsPerPage,
    currentPage * conversationsPerPage
  );

  const existingConversationUserIds = new Set(
    localConversations.map((c) => c.otherUserId)
  );

  return (
    <>
      <div className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl p-3 sm:p-5 space-y-4 sm:space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 sm:max-w-md">
            <div className="relative">
              <Input
                placeholder="Rechercher..."
                value={conversationSearchQuery}
                onChange={(e) => setConversationSearchQuery(e.target.value)}
                className="h-9 sm:h-10 pl-4 pr-10 rounded-full border border-border bg-card/80 text-ls-heading placeholder:text-ls-muted text-xs"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-[18px] sm:w-[18px] text-ls-muted" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setShowOnlyPinned(!showOnlyPinned)}
              className={cn(
                "h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all duration-200 flex-1 sm:flex-initial",
                showOnlyPinned
                  ? "bg-brand border-brand text-ls-heading hover:bg-brand-hover shadow-md hover:shadow-lg"
                  : "bg-transparent border-border text-ls-heading hover:bg-brand/10 hover:border-brand hover:text-brand"
              )}
            >
              <span className="hidden sm:inline">Conversations épinglées</span>
              <span className="sm:hidden">Épinglées</span>
              <Pin
                className={cn(
                  "ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all",
                  showOnlyPinned && "fill-current"
                )}
              />
            </Button>

            <Button
              onClick={handleNewConversationClick}
              disabled={isLoadingConnections}
              variant="cta" size="ctaSm" className="flex-1 sm:flex-initial"
            >
              {isLoadingConnections ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-ls-heading" />
              ) : (
                <>
                  <span className="hidden sm:inline">
                    {getNewConversationShortText(hasConnections, userRole)}
                  </span>
                  <span className="sm:hidden">
                    Nouveau
                  </span>
                  <Plus className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2.5">
          {paginatedConversations.length === 0 ? (
            <div className="text-center py-12 text-ls-muted">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-ls-heading mb-2">
                Aucune conversation trouvée
              </p>
              <p>Essaie de modifier ta recherche</p>
            </div>
          ) : (
            paginatedConversations.map((conversation) => {
              const presence = presenceMap?.[conversation.otherUserId];
              return (
                <ConversationRow
                  key={conversation.conversationId}
                  conversation={conversation}
                  onPin={handlePin}
                  onUnpin={handleUnpin}
                  onDelete={(id) => deleteMutation.mutate({ conversationId: id })}
                  onBlockUser={handleBlockUser}
                  isDeleting={deleteMutation.isPending}
                  isOnline={presence?.isOnline}
                  lastSeen={presence?.lastSeen}
                />
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
                "h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full bg-card border border-border text-ls-heading text-xs sm:text-sm font-semibold capitalize",
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
                    "w-7 sm:w-8 text-center text-xs sm:text-sm font-semibold text-ls-heading transition-opacity",
                    currentPage === page ? "opacity-100" : "opacity-60"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full bg-card border border-border text-ls-heading text-xs sm:text-sm font-semibold capitalize"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      <NewConversationDialog
        open={showNewConversationDialog}
        onOpenChange={setShowNewConversationDialog}
        connections={acceptedConnections || []}
        existingConversationUserIds={existingConversationUserIds}
        onStartConversation={(otherUserId) =>
          getOrCreateConversationMutation.mutate({ otherUserId })
        }
        isPending={getOrCreateConversationMutation.isPending}
        userRole={userRole}
      />

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
