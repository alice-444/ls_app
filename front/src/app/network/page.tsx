"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { PendingRequestsList } from "@/components/network/PendingRequestsList";
import { AcceptedConnectionsList } from "@/components/network/AcceptedConnectionsList";
import { RemoveConnectionDialog } from "@/components/network/RemoveConnectionDialog";
import { ProfileModalManager } from "@/components/network/ProfileModalManager";
import { SentRequestsList } from "@/components/network/SentRequestsList";

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
  const cancelSentRequestMutation = trpc.connection.removeConnection.useMutation(); 

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

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending || isLoadingPending || isLoadingConnections || isLoadingSent) {
    return <Loader />;
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
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
        <div className="relative mb-6 sm:mb-8 lg:mb-10">
          <div className="relative h-[60px] sm:h-[70px] lg:h-[75px]">
            <div className="absolute left-0 top-0 h-[60px] sm:h-[70px] lg:h-[75px] w-full sm:w-[350px] lg:w-[461px]">
              <div className="absolute left-[120px] sm:left-[140px] lg:left-[163px] top-0 h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                <div className="h-full w-full bg-[#26547c] rounded" />
              </div>
              <div className="absolute left-[85px] sm:left-[100px] lg:left-[116px] top-[30px] sm:top-[35px] lg:top-[38px] h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                <div className="h-full w-full bg-[#26547c] rounded" />
              </div>
              <div className="absolute left-0 top-[-20px] sm:top-[-24px] lg:top-[-27px] h-[36px] sm:h-[40px] lg:h-[45px] w-[36px] sm:w-[40px] lg:w-[45px]">
                <div className="h-full w-full bg-[#26547c] rounded-full opacity-20" />
              </div>
              <div className="absolute left-[40px] sm:left-[48px] lg:left-[56px] top-[2px] h-[52px] sm:h-[60px] lg:h-[66px] w-[280px] sm:w-[320px] lg:w-[405px]">
                <div className="absolute right-[100px] sm:right-[120px] lg:right-[138px] top-[-6px] sm:top-[-7px] lg:top-[-8px] h-[64px] sm:h-[72px] lg:h-[80px] w-[240px] sm:w-[280px] lg:w-[320px] rotate-[359.6deg]">
                  <div className="h-[62px] sm:h-[70px] lg:h-[78px] w-[240px] sm:w-[280px] lg:w-[320px] bg-[#26547c] border-2 border-white rounded-tl-[28px] sm:rounded-tl-[32px] lg:rounded-tl-[36px] rounded-tr-[28px] sm:rounded-tr-[32px] lg:rounded-tr-[36px] rounded-bl-[4px] rounded-br-[4px]" />
                </div>
              </div>
            </div>
            <div className="relative z-10 pt-2 sm:pt-3 lg:pt-4">
              <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-black text-white leading-[1.2] sm:leading-[1.3] lg:leading-[75px] whitespace-nowrap">
                Mon Réseau
              </h1>
            </div>
          </div>
          <p className="text-[20px] sm:text-[22px] lg:text-[24px] text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-5 lg:mt-6">
            Gère tes connexions et ton réseau
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
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
                  // Note: The logic for canceling a sent request is the same as rejecting it
                  // from the receiver's side, or removing it.
                  rejectMutation.mutate(
                    { connectionId },
                    {
                        onSuccess: () => {
                            toast.success("Demande annulée");
                            refetchSent();
                        },
                        onError: (error) => {
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
        </div>

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
      </div>
    </div>
  );
}
