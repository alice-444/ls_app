"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { MessageSquare, Plus, Search, Pin } from "lucide-react";
import { useSocket } from "@/lib/socket-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BlockUserDialog } from "@/components/user/BlockUserDialog";
import { cn } from "@/lib/utils";
import { ConversationRow } from "./ConversationRow";
import { NewConversationDialog } from "./NewConversationDialog";

export function ConversationList() {
  const router = useRouter();
  const utils = trpc.useUtils();
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

  const { data: acceptedConnections } =
    trpc.connection.getAcceptedConnections.useQuery(undefined, {
      enabled: showNewConversationDialog,
    });

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

  const handleTogglePin = (conversationId: string, isPinned: boolean) => {
    if (isPinned) {
      unpinConversationMutation.mutate({ conversationId });
    } else {
      pinConversationMutation.mutate({ conversationId });
    }
  };

  const handleBlockUser = (otherUserId: string, displayName: string) => {
    setUserToBlock({ userId: otherUserId, userName: displayName });
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
      setLocalConversations((prev) => {
        const index = prev.findIndex(
          (c) => c.conversationId === updatedConversation.conversationId
        );
        if (index >= 0) {
          const newConversations = [...prev];
          newConversations[index] = updatedConversation;
          return newConversations.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        return [updatedConversation, ...prev].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
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

  const filteredConversations = localConversations.filter((conv) => {
    const displayName = conv.otherUserDisplayName || conv.otherUserName || "";
    const matchesSearch = displayName
      .toLowerCase()
      .includes(conversationSearchQuery.toLowerCase());
    const matchesPinFilter = !showOnlyPinned || conv.isPinned;
    return matchesSearch && matchesPinFilter;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

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
              <Pin
                className={cn(
                  "ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all",
                  showOnlyPinned && "fill-current"
                )}
              />
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
            paginatedConversations.map((conversation) => (
              <ConversationRow
                key={conversation.conversationId}
                conversation={conversation}
                onTogglePin={handleTogglePin}
                onDelete={(id) => deleteMutation.mutate({ conversationId: id })}
                onBlockUser={handleBlockUser}
                isDeleting={deleteMutation.isPending}
              />
            ))
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="h-8 sm:h-9 px-2 sm:px-3 py-1.5 rounded-full bg-white dark:bg-white border border-[#d6dae4] text-[#26547c] dark:text-[#e6e6e6] text-xs sm:text-sm font-semibold capitalize"
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
