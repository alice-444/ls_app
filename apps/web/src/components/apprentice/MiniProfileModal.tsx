"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import Loader from "@/components/loader";
import {
  User,
  GraduationCap,
  Tag,
  UserPlus,
  UserMinus,
  Ban,
  Flag,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { BlockUserDialog } from "@/components/user/BlockUserDialog";
import { ReportUserDialog } from "@/components/user/ReportUserDialog";
import { useState } from "react";

interface MiniProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apprenticeUserId: string;
}

export function MiniProfileModal({
  open,
  onOpenChange,
  apprenticeUserId,
}: MiniProfileModalProps) {
  const { data: session } = authClient.useSession();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { data: miniProfile, isLoading } =
    trpc.apprentice.getMiniProfileForMentor.useQuery(
      { apprenticeUserId },
      {
        enabled: open && !!apprenticeUserId,
      }
    );

  const { data: connectionStatus, refetch: refetchConnectionStatus } =
    trpc.connection.checkConnectionStatus.useQuery(
      { otherUserId: apprenticeUserId },
      {
        enabled:
          open &&
          !!apprenticeUserId &&
          !!session &&
          apprenticeUserId !== session?.user?.id,
      }
    );

  const sendConnectionRequestMutation =
    trpc.connection.sendConnectionRequest.useMutation({
      onSuccess: () => {
        toast.success("Demande d'invitation envoyée");
        refetchConnectionStatus();
      },
      onError: (error) => {
        toast.error("Erreur lors de l'envoi", {
          description: error.message,
        });
      },
    });

  const removeConnectionMutation = trpc.connection.removeConnection.useMutation(
    {
      onSuccess: () => {
        toast.success("Connexion supprimée");
        refetchConnectionStatus();
      },
      onError: (error) => {
        toast.error("Erreur lors de la suppression", {
          description: error.message,
        });
      },
    }
  );

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <Loader />
        </DialogContent>
      </Dialog>
    );
  }

  if (!miniProfile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profil Apprenti</DialogTitle>
          <DialogDescription>Informations sur le participant</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {miniProfile.photoUrl ? (
              <img
                src={miniProfile.photoUrl}
                alt={miniProfile.displayName || "Apprenti"}
                className="w-20 h-20 rounded-full object-cover border-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2">
                <User className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {miniProfile.displayName || "Apprenti"}
              </h3>
              {(miniProfile.studyDomain || miniProfile.studyProgram) && (
                <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">
                  {miniProfile.studyDomain && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{miniProfile.studyDomain}</span>
                    </div>
                  )}
                  {miniProfile.studyProgram && (
                    <div className="flex items-center gap-2 ml-6">
                      <span>{miniProfile.studyProgram}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {miniProfile.iceBreakerTags &&
            miniProfile.iceBreakerTags.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {miniProfile.iceBreakerTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {session && apprenticeUserId !== session?.user?.id && (
            <div className="pt-4 border-t space-y-2">
              {connectionStatus?.status === "ACCEPTED" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    removeConnectionMutation.mutate({
                      otherUserId: apprenticeUserId,
                    });
                  }}
                  disabled={removeConnectionMutation.isPending}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {removeConnectionMutation.isPending
                    ? "Suppression..."
                    : "Retirer la connexion"}
                </Button>
              ) : connectionStatus?.status === "PENDING" ? (
                <Button variant="outline" className="w-full" disabled>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Demande en attente
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    sendConnectionRequestMutation.mutate({
                      receiverUserId: apprenticeUserId,
                    });
                  }}
                  disabled={sendConnectionRequestMutation.isPending}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {sendConnectionRequestMutation.isPending
                    ? "Envoi..."
                    : "Connecter"}
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBlockDialog(true)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReportDialog(true)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      {session && apprenticeUserId !== session?.user?.id && (
        <>
          <BlockUserDialog
            open={showBlockDialog}
            onOpenChange={setShowBlockDialog}
            userId={apprenticeUserId}
            userName={miniProfile?.displayName || null}
          />
          <ReportUserDialog
            open={showReportDialog}
            onOpenChange={setShowReportDialog}
            userId={apprenticeUserId}
            userName={miniProfile?.displayName || null}
          />
        </>
      )}
    </Dialog>
  );
}
