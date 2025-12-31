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
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly apprenticeUserId: string;
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
    trpc.apprentice.getMiniProfileForMentor.useQuery({ apprenticeUserId }, {
      enabled: open && !!apprenticeUserId,
    } as any);

  const { data: connectionStatus, refetch: refetchConnectionStatus } =
    trpc.connection.checkConnectionStatus.useQuery(
      { otherUserId: apprenticeUserId },
      {
        enabled:
          open &&
          !!apprenticeUserId &&
          !!session &&
          apprenticeUserId !== session?.user?.id,
      } as any
    );

  const sendConnectionRequestMutation =
    trpc.connection.sendConnectionRequest.useMutation();

  const removeConnectionMutation =
    trpc.connection.removeConnection.useMutation();

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
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
      <DialogContent className="max-w-md bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <DialogHeader>
          <DialogTitle className="text-[#26547c] dark:text-[#e6e6e6]">
            Profil Apprenti
          </DialogTitle>
          <DialogDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Informations sur le participant
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {miniProfile.photoUrl ? (
              <img
                src={miniProfile.photoUrl}
                alt={miniProfile.displayName || "Apprenti"}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center border-2 border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
                <User className="h-10 w-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-[#26547c] dark:text-[#e6e6e6]">
                {miniProfile.displayName || "Apprenti"}
              </h3>
              {(miniProfile.studyDomain || miniProfile.studyProgram) && (
                <div className="flex flex-col gap-1 mt-1 text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  {miniProfile.studyDomain && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
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
              <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
                  <span className="text-sm font-medium text-[#26547c] dark:text-[#e6e6e6]">
                    Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {miniProfile.iceBreakerTags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[rgba(255,182,71,0.15)] dark:bg-[rgba(255,182,71,0.25)] text-[#ffb647] dark:text-[#ffb647] rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {session && apprenticeUserId !== session?.user?.id && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] space-y-2">
              {connectionStatus?.status === "ACCEPTED" ? (
                <Button
                  variant="outline"
                  className="w-full border border-[#f44336] dark:border-[#f44336] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#f44336] dark:text-[#f44336] hover:bg-[rgba(244,67,54,0.1)] dark:hover:bg-[rgba(244,67,54,0.15)] rounded-[32px]"
                  onClick={() => {
                    removeConnectionMutation.mutate(
                      {
                        otherUserId: apprenticeUserId,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Connexion supprimée");
                          refetchConnectionStatus();
                        },
                        onError: (error: { message: string }) => {
                          toast.error("Erreur lors de la suppression", {
                            description: error.message,
                          });
                        },
                      }
                    );
                  }}
                  disabled={removeConnectionMutation.isPending}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {removeConnectionMutation.isPending
                    ? "Suppression..."
                    : "Retirer la connexion"}
                </Button>
              ) : connectionStatus?.status === "PENDING" ? (
                <Button
                  variant="outline"
                  className="w-full border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] rounded-[32px]"
                  disabled
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Demande en attente
                </Button>
              ) : (
                <Button
                  className="w-full bg-[#34b162] hover:bg-[#2a9d52] dark:bg-[#34b162] dark:hover:bg-[#2a9d52] text-white rounded-[32px]"
                  onClick={() => {
                    sendConnectionRequestMutation.mutate(
                      {
                        receiverUserId: apprenticeUserId,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Demande d'invitation envoyée");
                          refetchConnectionStatus();
                        },
                        onError: (error: { message: string }) => {
                          toast.error("Erreur lors de l'envoi", {
                            description: error.message,
                          });
                        },
                      }
                    );
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
                  className="flex-1 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
                  onClick={() => setShowBlockDialog(true)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
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
