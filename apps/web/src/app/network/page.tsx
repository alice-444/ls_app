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
    data: acceptedConnections,
    isLoading: isLoadingConnections,
    refetch: refetchConnections,
  } = trpc.connection.getAcceptedConnections.useQuery(undefined, {
    enabled: !!session,
  });

  const acceptMutation = trpc.connection.acceptConnectionRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande acceptée");
      refetchPending();
      refetchConnections();
    },
    onError: (error) => {
      toast.error("Erreur lors de l'acceptation", {
        description: error.message,
      });
    },
  });

  const rejectMutation = trpc.connection.rejectConnectionRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée");
      refetchPending();
    },
    onError: (error) => {
      toast.error("Erreur lors du refus", {
        description: error.message,
      });
    },
  });

  const removeConnectionMutation = trpc.connection.removeConnection.useMutation(
    {
      onSuccess: () => {
        toast.success("Connexion supprimée");
        refetchConnections();
      },
      onError: (error) => {
        toast.error("Erreur lors de la suppression", {
          description: error.message,
        });
      },
    }
  );

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending || isLoadingPending || isLoadingConnections) {
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
      removeConnectionMutation.mutate({
        otherUserId: userToRemove,
      });
      setShowRemoveConfirmDialog(false);
      setUserToRemove(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mon Réseau</h1>
      </div>

      {pendingRequests && pendingRequests.length > 0 && (
        <PendingRequestsList
          requests={pendingRequests}
          onViewProfile={(request) => {
            const role = (request as any).requesterRole;
            const appId = (request as any).requesterAppId;
            handleViewProfile(request.requesterUserId, role, appId);
          }}
          onAccept={(connectionId) => {
            acceptMutation.mutate({ connectionId });
          }}
          onReject={(connectionId) => {
            rejectMutation.mutate({ connectionId });
          }}
          isProcessing={acceptMutation.isPending || rejectMutation.isPending}
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
    </div>
  );
}
