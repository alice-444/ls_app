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
  UserPlus,
  UserMinus,
  Linkedin,
  Youtube,
  Github,
  Ban,
  Flag,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { BlockUserDialog } from "@/components/user/BlockUserDialog";
import { ReportUserDialog } from "@/components/user/ReportUserDialog";
import { useState } from "react";

interface MentorProfileModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mentorId: string;
}

export function MentorProfileModal({
  open,
  onOpenChange,
  mentorId,
}: MentorProfileModalProps) {
  const { data: session } = authClient.useSession();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { data: mentor, isLoading } = trpc.mentor.getById.useQuery(
    { mentorId },
    {
      enabled: open && !!mentorId,
    } as any
  );

  const { data: connectionStatus, refetch: refetchConnectionStatus } =
    trpc.connection.checkConnectionStatus.useQuery(
      { otherUserId: mentor?.userId || "" },
      {
        enabled:
          open &&
          !!mentor?.userId &&
          !!session &&
          mentor.userId !== session?.user?.id,
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

  if (!mentor) {
    return null;
  }

  const socialMediaLinks = mentor.socialMediaLinks || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <DialogHeader>
          <DialogTitle className="text-[#26547c] dark:text-[#e6e6e6]">
            Profil Mentor
          </DialogTitle>
          <DialogDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Informations sur le mentor
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {mentor.photoUrl ? (
              <img
                src={mentor.photoUrl}
                alt={mentor.name || "Mentor"}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center border-2 border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
                <User className="h-10 w-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-[#26547c] dark:text-[#e6e6e6]">
                {mentor.name || "Mentor"}
              </h3>
              {mentor.domain && (
                <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mt-1">
                  {mentor.domain}
                </p>
              )}
            </div>
          </div>

          {mentor.bio && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
              <h4 className="font-medium mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                À propos
              </h4>
              <p className="text-sm text-[#161616] dark:text-[#e6e6e6]">
                {mentor.bio}
              </p>
            </div>
          )}

          {mentor.qualifications && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
              <h4 className="font-medium mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                Qualifications
              </h4>
              <p className="text-sm text-[#161616] dark:text-[#e6e6e6]">
                {mentor.qualifications}
              </p>
            </div>
          )}

          {mentor.experience && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
              <h4 className="font-medium mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                Expérience
              </h4>
              <p className="text-sm text-[#161616] dark:text-[#e6e6e6]">
                {mentor.experience}
              </p>
            </div>
          )}

          {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
              <h4 className="font-medium mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                Domaines d'expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {mentor.areasOfExpertise.map((area: string) => (
                  <span
                    key={area}
                    className="px-3 py-1 bg-[rgba(38,84,124,0.1)] dark:bg-[rgba(74,144,226,0.2)] text-[#26547c] dark:text-[#4A90E2] rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mentor.mentorshipTopics && mentor.mentorshipTopics.length > 0 && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
              <h4 className="font-medium mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                Sujets de mentorat
              </h4>
              <div className="flex flex-wrap gap-2">
                {mentor.mentorshipTopics.map((topic: string) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-[rgba(255,182,71,0.15)] dark:bg-[rgba(255,182,71,0.25)] text-[#ffb647] dark:text-[#ffb647] rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(socialMediaLinks.linkedin ||
            socialMediaLinks.twitter ||
            socialMediaLinks.youtube ||
            socialMediaLinks.github) && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
              <h4 className="font-medium mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                Réseaux sociaux
              </h4>
              <div className="flex flex-wrap gap-2">
                {socialMediaLinks.linkedin && (
                  <a
                    href={socialMediaLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#0077b5] text-white rounded-[32px] hover:bg-[#005885] transition-colors text-sm font-medium"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {socialMediaLinks.youtube && (
                  <a
                    href={socialMediaLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#FF0000] text-white rounded-[32px] hover:bg-[#cc0000] transition-colors text-sm font-medium"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>
                )}
                {socialMediaLinks.github && (
                  <a
                    href={socialMediaLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#333] dark:bg-[#24292e] text-white rounded-[32px] hover:bg-[#24292e] dark:hover:bg-[#1a1e22] transition-colors text-sm font-medium"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}

          {session && mentor.userId !== session?.user?.id && (
            <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] space-y-2">
              {(() => {
                if (connectionStatus?.status === "ACCEPTED") {
                  return (
                    <Button
                      variant="outline"
                      className="w-full border border-[#f44336] dark:border-[#f44336] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#f44336] dark:text-[#f44336] hover:bg-[rgba(244,67,54,0.1)] dark:hover:bg-[rgba(244,67,54,0.15)] rounded-[32px]"
                      onClick={() => {
                        removeConnectionMutation.mutate(
                          {
                            otherUserId: mentor.userId,
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
                  );
                }
                if (connectionStatus?.status === "PENDING") {
                  return (
                    <Button
                      variant="outline"
                      className="w-full border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] rounded-[32px]"
                      disabled
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Demande en attente
                    </Button>
                  );
                }
                return (
                  <Button
                    className="w-full bg-[#34b162] hover:bg-[#2a9d52] dark:bg-[#34b162] dark:hover:bg-[#2a9d52] text-white rounded-[32px]"
                    onClick={() => {
                      sendConnectionRequestMutation.mutate(
                        {
                          receiverUserId: mentor.userId,
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
                );
              })()}
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
      {session && mentor.userId !== session?.user?.id && (
        <>
          <BlockUserDialog
            open={showBlockDialog}
            onOpenChange={setShowBlockDialog}
            userId={mentor.userId}
            userName={mentor.name || null}
          />
          <ReportUserDialog
            open={showReportDialog}
            onOpenChange={setShowReportDialog}
            userId={mentor.userId}
            userName={mentor.name || null}
          />
        </>
      )}
    </Dialog>
  );
}
