"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConversationItem } from "./ConversationItem";
import { MessageSquare, Plus, Search } from "lucide-react";
import { useSocket } from "@/lib/socket-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as Avatar from "@radix-ui/react-avatar";

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

  const { data: acceptedConnections } =
    trpc.connection.getAcceptedConnections.useQuery(undefined, {
      enabled: showNewConversationDialog,
    });

  const getOrCreateConversationMutation =
    trpc.messaging.getOrCreateConversation.useMutation({
      onSuccess: (data) => {
        router.push(`/inbox/${data.conversationId}`);
        setShowNewConversationDialog(false);
      },
      onError: (error) => {
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
    onError: (error) => {
      toast.error("Erreur lors de la suppression", {
        description: error.message,
      });
    },
  });

  const handleDelete = (conversationId: string) => {
    deleteMutation.mutate({ conversationId });
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
        } else {
          return [updatedConversation, ...prev].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
      });
    };

    socket.on("conversation-updated", handleConversationUpdate);

    return () => {
      socket.off("conversation-updated", handleConversationUpdate);
    };
  }, [socket]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (!localConversations || localConversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Aucune conversation</p>
            <p className="mb-4">Commencez à réseauter pour discuter !</p>
            <Button asChild>
              <Link href="/network">Voir mon réseau</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredConnections = (acceptedConnections || []).filter(
    (connection) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const name =
        connection.otherUserDisplayName || connection.otherUserName || "";
      return name.toLowerCase().includes(query);
    }
  );

  const existingConversationUserIds = new Set(
    localConversations.map((c) => c.otherUserId)
  );
  const availableConnections = filteredConnections.filter(
    (connection) => !existingConversationUserIds.has(connection.otherUserId)
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
              <CardDescription>
                {localConversations.length} conversation(s) active(s)
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowNewConversationDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle conversation
            </Button>
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
                      availableConnections.map((connection) => {
                        const displayName =
                          connection.otherUserDisplayName ||
                          connection.otherUserName ||
                          "Utilisateur";
                        const initials = displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);

                        return (
                          <div
                            key={connection.connectionId}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
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
                                    {connection.otherUserRole === "MENTOR"
                                      ? "Mentor"
                                      : connection.otherUserRole === "APPRENANT"
                                      ? "Apprenti"
                                      : connection.otherUserRole}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                getOrCreateConversationMutation.isPending
                              }
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {localConversations.map((conversation) => (
              <ConversationItem
                key={conversation.conversationId}
                conversation={conversation}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
