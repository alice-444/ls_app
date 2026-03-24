"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-server-client";
import { trpc } from "@/utils/trpc";
import { PageContainer } from "@/components/shared/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PendingRequestsList } from "@/components/domains/network/PendingRequestsList";
import { AcceptedConnectionsList } from "@/components/domains/network/AcceptedConnectionsList";
import { RemoveConnectionDialog } from "@/components/domains/network/RemoveConnectionDialog";
import { ProfileModalManager } from "@/components/domains/network/ProfileModalManager";
import { SentRequestsList } from "@/components/domains/network/SentRequestsList";

export default function NetworkPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<
    "MENTOR" | "APPRENANT" | null
  >(null);
  const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);

  const {
    data: pendingRequests,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = trpc.connection.getPendingRequestsReceived.useQuery(undefined, {
    enabled: !!session,
  });

  const {
    data: sentRequests,
    isLoading: isLoadingSent,
    refetch: refetchSent,
  } = trpc.connection.getPendingRequestsSent.useQuery(undefined, {
    enabled: !!session,
  });

  const {
    data: acceptedConnections,
    isLoading: isLoadingConnections,
    refetch: refetchConnections,
  } = trpc.connection.getAcceptedConnections.useQuery(undefined, {
    enabled: !!session,
  });

  const acceptMutation = trpc.connection.acceptConnectionRequest.useMutation();
  const rejectMutation = trpc.connection.rejectConnectionRequest.useMutation();
  const removeConnectionMutation = trpc.connection.removeConnection.useMutation();

  const getOrCreateConversationMutation =
    trpc.messaging.getOrCreateConversation.useMutation();

  const handleMessage = (otherUserId: string) => {
    getOrCreateConversationMutation.mutate(
      { otherUserId },
      {
        onSuccess: (data: { conversationId: string }) => {
          router.push(`/inbox/${data.conversationId}`);
        },
        onError: (error: { message: string }) => {
          toast.error("Erreur lors de l'ouverture de la conversation", {
            description: error.message,
          });
        },
      }
    );
  };

  if (isSessionPending || isLoadingPending || isLoadingConnections || isLoadingSent) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement de ton réseau...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const handleViewProfile = (
    userId: string,
    role: "MENTOR" | "APPRENANT" | null,
    appId?: string
  ) => {
    setSelectedUserRole(role);
    if (role === "MENTOR" && appId) {
      setSelectedUserId(appId);
    } else if (role === "APPRENANT") {
      setSelectedUserId(userId);
    }
    setShowProfileModal(true);
  };

  const handleRemoveConnection = (otherUserId: string) => {
    setUserToRemove(otherUserId);
    setShowRemoveConfirmDialog(true);
  };

  const confirmRemoveConnection = () => {
    if (userToRemove) {
      removeConnectionMutation.mutate(
        {
          otherUserId: userToRemove,
        },
        {
          onSuccess: () => {
            toast.success("Connexion supprimée");
            refetchConnections();
            setShowRemoveConfirmDialog(false);
            setUserToRemove(null);
          },
          onError: (error: { message: string }) => {
            toast.error("Erreur lors de la suppression", {
              description: error.message,
            });
          },
        }
      );
    }
  };

  return (
    <PageContainer>
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Mon Réseau" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Gère tes connexions et ton réseau
        </p>
      </motion.div>

      <motion.div
        className="space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {pendingRequests && pendingRequests.length > 0 && (
          <PendingRequestsList
            requests={pendingRequests}
            onViewProfile={(request) => {
              const role = (request as any).requesterRole;
              const appId = (request as any).requesterAppId;
              handleViewProfile(request.requesterUserId, role, appId);
            }}
            onAccept={(connectionId) => {
              acceptMutation.mutate(
                { connectionId },
                {
                  onSuccess: () => {
                    toast.success("Demande acceptée");
                    refetchPending();
                    refetchConnections();
                    refetchSent();
                  },
                  onError: (error: { message: string }) => {
                    toast.error("Erreur lors de l'acceptation", {
                      description: error.message,
                    });
                  },
                }
              );
            }}
            onReject={(connectionId) => {
              rejectMutation.mutate(
                { connectionId },
                {
                  onSuccess: () => {
                    toast.success("Demande refusée");
                    refetchPending();
                  },
                  onError: (error: { message: string }) => {
                    toast.error("Erreur lors du refus", {
                      description: error.message,
                    });
                  },
                }
              );
            }}
            isProcessing={acceptMutation.isPending || rejectMutation.isPending}
          />
        )}

        {sentRequests && sentRequests.length > 0 && (
          <SentRequestsList
            requests={sentRequests}
            onCancel={(connectionId) => {
              rejectMutation.mutate(
                { connectionId },
                {
                  onSuccess: () => {
                    toast.success("Demande annulée");
                    refetchSent();
                  },
                  onError: (error: { message: string }) => {
                    toast.error("Erreur lors de l'annulation", {
                      description: error.message,
                    });
                  }
                }
              )
            }}
            isCanceling={rejectMutation.isPending}
          />
        )}

        <AcceptedConnectionsList
          connections={acceptedConnections || []}
          onViewProfile={(connection) => {
            const role = (connection as any).otherUserRole;
            const appId = (connection as any).otherUserAppId;
            handleViewProfile(connection.otherUserId, role, appId);
          }}
          onRemove={handleRemoveConnection}
          onMessage={handleMessage}
          isRemoving={removeConnectionMutation.isPending}
        />

        <ProfileModalManager
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          userId={selectedUserId}
          userRole={selectedUserRole}
        />

        <RemoveConnectionDialog
          open={showRemoveConfirmDialog}
          onOpenChange={setShowRemoveConfirmDialog}
          onConfirm={confirmRemoveConnection}
          isRemoving={removeConnectionMutation.isPending}
        />
      </motion.div>
    </PageContainer>
  );
}
