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
  Twitter,
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
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
    }
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

  if (!mentor) {
    return null;
  }

  const socialMediaLinks = mentor.socialMediaLinks || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil Mentor</DialogTitle>
          <DialogDescription>Informations sur le mentor</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {mentor.photoUrl ? (
              <img
                src={mentor.photoUrl}
                alt={mentor.name || "Mentor"}
                className="w-20 h-20 rounded-full object-cover border-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2">
                <User className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {mentor.name || "Mentor"}
              </h3>
              {mentor.domain && (
                <p className="text-sm text-gray-600 mt-1">{mentor.domain}</p>
              )}
            </div>
          </div>

          {mentor.bio && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">À propos</h4>
              <p className="text-sm text-gray-700">{mentor.bio}</p>
            </div>
          )}

          {mentor.qualifications && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Qualifications</h4>
              <p className="text-sm text-gray-700">{mentor.qualifications}</p>
            </div>
          )}

          {mentor.experience && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Expérience</h4>
              <p className="text-sm text-gray-700">{mentor.experience}</p>
            </div>
          )}

          {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Domaines d'expertise</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.areasOfExpertise.map((area: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mentor.mentorshipTopics && mentor.mentorshipTopics.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Sujets de mentorat</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.mentorshipTopics.map((topic: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
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
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Réseaux sociaux</h4>
              <div className="flex flex-wrap gap-2">
                {socialMediaLinks.linkedin && (
                  <a
                    href={socialMediaLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {socialMediaLinks.twitter && (
                  <a
                    href={socialMediaLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                )}
                {socialMediaLinks.youtube && (
                  <a
                    href={socialMediaLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
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
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}

          {session && mentor.userId !== session?.user?.id && (
            <div className="pt-4 border-t space-y-2">
              {connectionStatus?.status === "ACCEPTED" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    removeConnectionMutation.mutate({
                      otherUserId: mentor.userId,
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
                      receiverUserId: mentor.userId,
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
