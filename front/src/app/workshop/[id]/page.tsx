"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { DeleteWorkshopDialog } from "@/components/workshop/dialogs/DeleteWorkshopDialog";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { RejectWorkshopRequestDialog } from "@/components/mentor/RejectWorkshopRequestDialog";
import { CancelWorkshopRegistrationDialog } from "@/components/workshop/dialogs/CancelWorkshopRegistrationDialog";
import { RescheduleWorkshopDialog } from "@/components/workshop/dialogs/RescheduleWorkshopDialog";
import { MiniProfileModal } from "@/components/apprentice/MiniProfileModal";
import { WorkshopHeader } from "@/components/workshop/cards/WorkshopHeader";
import { WorkshopDescription } from "@/components/workshop/cards/WorkshopDescription";
import { WorkshopDetailsCard } from "@/components/workshop/cards/WorkshopDetailsCard";
import { WorkshopCreatorCard } from "@/components/workshop/cards/WorkshopCreatorCard";
import { WorkshopParticipantsCard } from "@/components/workshop/cards/WorkshopParticipantsCard";
import { AttendanceManagementCard } from "@/components/workshop/cards/AttendanceManagementCard";
import { WorkshopActionsCard } from "@/components/workshop/cards/WorkshopActionsCard";
import { WorkshopRequestsCard } from "@/components/workshop/requests/WorkshopRequestsCard";
import { SubmitFeedbackDialog } from "@/components/workshop/SubmitFeedbackDialog";
import { WorkshopReviews } from "@/components/workshop/WorkshopReviews";
import { DailyVideoCall } from "@/components/workshop/DailyVideoCall";
import { JoinVideoButton } from "@/components/workshop/JoinVideoButton";

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.id as string;
  const { data: session } = authClient.useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showApprenticeProfileModal, setShowApprenticeProfileModal] =
    useState(false);
  const [selectedApprenticeUserId, setSelectedApprenticeUserId] = useState<
    string | null
  >(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const utils = trpc.useUtils();
  const getOrCreateConversationMutation =
    trpc.messaging.getOrCreateConversation.useMutation();

  const handleContactMentor = () => {
    if (workshop?.creator?.userId) {
      getOrCreateConversationMutation.mutate(
        {
          otherUserId: workshop.creator.userId,
          workshopId: workshop.id,
        },
        {
          onSuccess: (data: { conversationId: string }) => {
            utils.messaging.getConversationDetails.invalidate({
              conversationId: data.conversationId,
            });
            utils.messaging.getConversations.invalidate();
            router.push(`/inbox/${data.conversationId}`);
          },
          onError: (error: { message: string }) => {
            toast.error("Erreur lors de l'ouverture de la conversation", {
              description: error.message,
            });
          },
        }
      );
    }
  };

  const rejectRequest = trpc.mentor.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors du refus");
    },
  });

  const { data: workshopRequests } = trpc.mentor.getWorkshopRequests.useQuery(
    { workshopId },
    {
      enabled: !!workshopId && !!session?.user?.id,
    } as any
  );

  const handleAcceptRequest = (request: { id: string; title: string; preferredDate?: Date | string | null; preferredTime?: string | null }) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const handleRejectRequest = (requestId: string) => {
    setRequestToReject(requestId);
    setShowRejectDialog(true);
  };

  const confirmRejectRequest = (reason?: string) => {
    if (requestToReject) {
      rejectRequest.mutate(
        { requestId: requestToReject, reason },
        {
          onSuccess: () => {
            toast.success("Demande refusée avec succès");
            utils.mentor.getWorkshopRequests.invalidate();
            setShowRejectDialog(false);
            setRequestToReject(null);
          },
          onError: (error: { message: string }) => {
            toast.error(`Erreur: ${error.message}`);
          },
        }
      );
    }
  };

  const {
    data: workshop,
    isLoading,
    refetch,
  } = trpc.workshop.getById.useQuery(
    { workshopId },
    {
      enabled: !!workshopId,
    } as any
  );

  const deleteMutation = trpc.workshop.delete.useMutation();
  const unpublishMutation = trpc.workshop.unpublish.useMutation();

  const handleDelete = () => {
    deleteMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier supprimé avec succès");
          router.push("/my-workshops");
          setShowDeleteDialog(false);
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la suppression");
        },
      }
    );
  };

  const handleEdit = () => {
    router.push(`/workshop-editor?id=${workshopId}`);
  };

  const handleUnpublish = () => {
    unpublishMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier dépublié avec succès");
          refetch();
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la dépublication");
        },
      }
    );
  };

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const { data: upcomingWorkshops } =
    trpc.workshop.getUpcomingWorkshops.useQuery(undefined, {
      enabled: userRole === "APPRENANT" && !!session?.user?.id,
    } as any);

  const cancelMutation = trpc.workshop.cancelConfirmed.useMutation();
  const rescheduleMutation = trpc.workshop.reschedule.useMutation();

  const isWorkshopPast = (workshopData: typeof workshop): boolean => {
    if (!workshopData?.date || !workshopData?.time) return false;
    try {
      const date =
        typeof workshopData.date === "string"
          ? new Date(workshopData.date)
          : workshopData.date;
      const [hours, minutes] = workshopData.time.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      if (workshopData.duration) {
        endTime.setMinutes(endTime.getMinutes() + workshopData.duration);
      }
      return endTime < new Date();
    } catch {
      return false;
    }
  };

  const { data: canSubmitFeedback } =
    trpc.workshopFeedback.canSubmitFeedback.useQuery(
      { workshopId },
      {
        enabled:
          !!workshopId &&
          !!session?.user?.id &&
          userRole === "APPRENANT" &&
          !!workshop &&
          isWorkshopPast(workshop),
      } as any
    );

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement de l&apos;atelier...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!workshop) {
    const backUrl = userRole === "MENTOR" ? "/my-workshops" : "/workshop-room";
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            <ShinyText text="Atelier introuvable" />
          </h1>
          <p className="text-ls-muted mb-6">
            L&apos;atelier que tu recherches n&apos;existe pas ou a été supprimé.
          </p>
          <Button variant="cta" size="cta" onClick={() => router.push(backUrl)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux ateliers
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isApprentice = userRole === "APPRENANT";
  const isOwner = Boolean(
    session?.user?.id && workshop?.creator?.userId === session.user.id
  );
  const canRequestParticipation =
    isApprentice &&
    !isOwner &&
    workshop?.status === "PUBLISHED" &&
    !workshop?.apprenticeId;
  const isRegistered =
    isApprentice &&
    workshop?.apprenticeId &&
    upcomingWorkshops?.some((w: { id: string }) => w.id === workshop.id);

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = (reason?: string) => {
    if (workshop) {
      cancelMutation.mutate(
        {
          workshopId: workshop.id,
          cancellationReason: reason,
        },
        {
          onSuccess: () => {
            toast.success("Inscription annulée avec succès");
            refetch();
            setShowCancelDialog(false);
          },
          onError: (error: { message: string }) => {
            toast.error(error.message || "Erreur lors de l'annulation");
          },
        }
      );
    }
  };

  const handleBack = () => {
    const backUrl = isOwner ? "/my-workshops" : "/workshop-room";
    router.push(backUrl);
  };

  const canReschedule =
    workshop.status === "PUBLISHED" &&
    Boolean(workshop.date) &&
    !isWorkshopPast(workshop);

  return (
    <PageContainer>
      <WorkshopHeader
          workshop={workshop}
          isOwner={isOwner}
          canReschedule={Boolean(canReschedule)}
          onBack={handleBack}
          onEdit={handleEdit}
          onReschedule={() => setShowRescheduleDialog(true)}
          onUnpublish={handleUnpublish}
          onDelete={() => setShowDeleteDialog(true)}
          isRescheduling={rescheduleMutation.isPending}
          isUnpublishing={unpublishMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
          <div className="lg:col-span-2 space-y-6">
            <WorkshopDescription
              description={workshop.description}
              materialsNeeded={workshop.materialsNeeded}
            />

            {isOwner && workshopRequests && (
              <WorkshopRequestsCard
                requests={workshopRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                isRejecting={rejectRequest.isPending}
              />
            )}

            <WorkshopParticipantsCard
              workshop={workshop}
              onViewApprenticeProfile={(userId) => {
                setSelectedApprenticeUserId(userId);
                setShowApprenticeProfileModal(true);
              }}
            />
            {isOwner && isWorkshopPast(workshop) && (
              <AttendanceManagementCard
                workshopId={workshop.id}
                isOwner={isOwner}
              />
            )}

            {workshop.isVirtual && workshop.status === "PUBLISHED" && (
              <JoinVideoButton workshop={workshop} />
            )}

            {workshop.isVirtual &&
              workshop.status === "PUBLISHED" &&
              (isOwner || isRegistered) &&
              workshop.dailyRoomId && (
                <DailyVideoCall
                  workshopId={workshop.id}
                  onLeave={() => {
                    toast.info("Tu as quitté la visioconférence", {
                      description: "Tu peux rejoindre à tout moment.",
                    });
                    refetch();
                  }}
                />
              )}

            {isApprentice &&
              isWorkshopPast(workshop) &&
              canSubmitFeedback?.canSubmit && (
                <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-xl border border-border/50 p-6">
                  <h3 className="text-lg font-semibold text-ls-heading mb-2">
                    Partage ton avis
                  </h3>
                  <p className="text-sm text-ls-muted mb-4">
                    Aide le mentor à s&apos;améliorer en partageant ton expérience
                    de cet atelier.
                  </p>
                  <Button
                    variant="cta"
                    size="cta"
                    onClick={() => setShowFeedbackDialog(true)}
                  >
                    Donner mon avis
                  </Button>
                </div>
              )}

            {isApprentice &&
              isWorkshopPast(workshop) &&
              canSubmitFeedback &&
              !canSubmitFeedback.canSubmit && (
                <div className="bg-card/95 backdrop-blur-md rounded-2xl border border-border/50 p-4">
                  <p className="text-sm text-ls-muted">
                    {canSubmitFeedback.reason ||
                      "Tu ne peux pas soumettre d&apos;avis pour cet atelier."}
                  </p>
                </div>
              )}

            <WorkshopReviews
              workshopId={workshop.id}
              creatorUserId={workshop.creator?.userId}
            />
          </div>

        <div className="space-y-6">
            <WorkshopDetailsCard
              topic={workshop.topic}
              date={workshop.date}
              time={workshop.time}
              duration={workshop.duration}
              location={workshop.location}
              isVirtual={workshop.isVirtual}
              maxParticipants={workshop.maxParticipants}
            />

            {workshop.creator && (
              <WorkshopCreatorCard creator={workshop.creator} />
            )}

            <WorkshopActionsCard
              isRegistered={isRegistered}
              canRequestParticipation={canRequestParticipation}
              isWorkshopPast={isWorkshopPast(workshop)}
              onRequestParticipation={() => setShowRequestDialog(true)}
              onCancelRegistration={handleCancelClick}
              onContactMentor={handleContactMentor}
              showContactMentor={isApprentice && !!workshop?.creator}
              isCancelling={cancelMutation.isPending}
            />
          </div>
        </motion.div>

      <DeleteWorkshopDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {canRequestParticipation && workshop?.creator && (
        <RequestWorkshopParticipationDialog
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
          mentorId={workshop.creator.id}
          mentorName={workshop.creator.user?.name || "Mentor"}
          preselectedWorkshopId={workshop.id}
        />
      )}

      {selectedRequest && (
        <AcceptWorkshopRequestDialog
          open={showAcceptDialog}
          onOpenChange={(open) => {
            setShowAcceptDialog(open);
            if (!open) {
              setSelectedRequest(null);
              utils.mentor.getWorkshopRequests.invalidate();
            }
          }}
          requestId={selectedRequest.id}
          requestTitle={selectedRequest.title}
          preferredDate={
            selectedRequest.preferredDate
              ? new Date(selectedRequest.preferredDate)
              : null
          }
          preferredTime={selectedRequest.preferredTime}
        />
      )}

      <RejectWorkshopRequestDialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) setRequestToReject(null);
        }}
        onConfirm={confirmRejectRequest}
        isSubmitting={rejectRequest.isPending}
      />

      {workshop && workshop.date && isRegistered && (
        <CancelWorkshopRegistrationDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancelConfirm}
          isLoading={cancelMutation.isPending}
          workshopTitle={workshop.title}
          workshopDate={
            typeof workshop.date === "string"
              ? new Date(workshop.date)
              : workshop.date
          }
        />
      )}

      {workshop && isOwner && workshop.status === "PUBLISHED" && (
        <RescheduleWorkshopDialog
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          onConfirm={(data) => {
            rescheduleMutation.mutate(
              {
                workshopId: workshop.id,
                ...data,
              },
              {
                onSuccess: () => {
                  toast.success("Atelier reprogrammé avec succès");
                  refetch();
                  setShowRescheduleDialog(false);
                },
                onError: (error: { message: string }) => {
                  toast.error(error.message || "Erreur lors de la reprogrammation");
                },
              }
            );
          }}
          isLoading={rescheduleMutation.isPending}
          workshopTitle={workshop.title}
          oldDate={workshop.date}
          oldTime={workshop.time}
          oldDuration={workshop.duration}
          oldLocation={workshop.location}
          isVirtual={workshop.isVirtual}
        />
      )}

      {selectedApprenticeUserId && (
        <MiniProfileModal
          open={showApprenticeProfileModal}
          onOpenChange={(open) => {
            setShowApprenticeProfileModal(open);
            if (!open) {
              setSelectedApprenticeUserId(null);
            }
          }}
          apprenticeUserId={selectedApprenticeUserId}
        />
      )}

      {workshop && (
        <SubmitFeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={setShowFeedbackDialog}
          workshopId={workshop.id}
          onSuccess={() => {
            utils.workshopFeedback.canSubmitFeedback.invalidate({
              workshopId: workshop.id,
            });
          }}
        />
      )}
    </PageContainer>
  );
}
