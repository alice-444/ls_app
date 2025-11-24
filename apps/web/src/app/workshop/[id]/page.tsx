"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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
import { WorkshopActionsCard } from "@/components/workshop/cards/WorkshopActionsCard";
import { WorkshopRequestsCard } from "@/components/workshop/requests/WorkshopRequestsCard";

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

  const utils = trpc.useUtils();
  const getOrCreateConversationMutation =
    trpc.messaging.getOrCreateConversation.useMutation({
      onSuccess: (data) => {
        utils.messaging.getConversationDetails.invalidate({
          conversationId: data.conversationId,
        });
        utils.messaging.getConversations.invalidate();
        router.push(`/inbox/${data.conversationId}`);
      },
      onError: (error) => {
        toast.error("Erreur lors de l'ouverture de la conversation", {
          description: error.message,
        });
      },
    });

  const handleContactMentor = () => {
    if (workshop?.creator?.userId) {
      getOrCreateConversationMutation.mutate({
        otherUserId: workshop.creator.userId,
        workshopId: workshop.id,
      });
    }
  };

  const rejectRequest = trpc.mentor.rejectWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée avec succès");
      utils.mentor.getWorkshopRequests.invalidate();
      setShowRejectDialog(false);
      setRequestToReject(null);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const { data: workshopRequests } = trpc.mentor.getWorkshopRequests.useQuery(
    { workshopId },
    {
      enabled: !!workshopId && !!session?.user?.id,
    }
  );

  const handleAcceptRequest = (request: any) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const handleRejectRequest = (requestId: string) => {
    setRequestToReject(requestId);
    setShowRejectDialog(true);
  };

  const confirmRejectRequest = () => {
    if (requestToReject) {
      rejectRequest.mutate({ requestId: requestToReject });
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
    }
  );

  const deleteMutation = trpc.workshop.delete.useMutation({
    onSuccess: () => {
      toast.success("Atelier supprimé avec succès");
      router.push("/my-workshops");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const unpublishMutation = trpc.workshop.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Atelier dépublié avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la dépublication");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ workshopId });
    setShowDeleteDialog(false);
  };

  const handleEdit = () => {
    router.push(`/workshop-editor?id=${workshopId}`);
  };

  const handleUnpublish = () => {
    unpublishMutation.mutate({ workshopId });
  };

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const { data: upcomingWorkshops } =
    trpc.workshop.getUpcomingWorkshops.useQuery(undefined, {
      enabled: userRole === "APPRENANT" && !!session?.user?.id,
    });

  const cancelMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée avec succès");
      refetch();
      setShowCancelDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const rescheduleMutation = trpc.workshop.reschedule.useMutation({
    onSuccess: () => {
      toast.success("Atelier reprogrammé avec succès");
      refetch();
      setShowRescheduleDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la reprogrammation");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workshop) {
    const backUrl = userRole === "MENTOR" ? "/my-workshops" : "/workshop-room";
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Atelier introuvable
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            L'atelier que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => router.push(backUrl)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux ateliers
          </Button>
        </div>
      </div>
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
  const shouldShowStatusBadge = isOwner;
  const isRegistered =
    isApprentice &&
    workshop?.apprenticeId &&
    upcomingWorkshops?.some((w: any) => w.id === workshop.id);

  const isWorkshopPast = (): boolean => {
    if (!workshop?.date || !workshop?.time) return false;
    try {
      const date =
        typeof workshop.date === "string"
          ? new Date(workshop.date)
          : workshop.date;
      const [hours, minutes] = workshop.time.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      if (workshop.duration) {
        endTime.setMinutes(endTime.getMinutes() + workshop.duration);
      }
      return endTime < new Date();
    } catch {
      return false;
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = (reason?: string) => {
    if (workshop) {
      cancelMutation.mutate({
        workshopId: workshop.id,
        cancellationReason: reason,
      });
    }
  };

  const handleBack = () => {
    const backUrl = isOwner ? "/my-workshops" : "/workshop-room";
    router.push(backUrl);
  };

  const canReschedule =
    workshop.status === "PUBLISHED" &&
    Boolean(workshop.date) &&
    !isWorkshopPast();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              isWorkshopPast={isWorkshopPast()}
              onRequestParticipation={() => setShowRequestDialog(true)}
              onCancelRegistration={handleCancelClick}
              onContactMentor={handleContactMentor}
              showContactMentor={isApprentice && !!workshop?.creator}
              isCancelling={cancelMutation.isPending}
            />
          </div>
        </div>
      </div>

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
            rescheduleMutation.mutate({
              workshopId: workshop.id,
              ...data,
            });
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
    </div>
  );
}
