"use client";

import { useReducer } from "react";
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

type WorkshopRequest = {
  id: string;
  title: string;
  preferredDate?: Date | string | null;
  preferredTime?: string | null;
};

type WorkshopDetailState = {
  showDeleteDialog: boolean;
  showRequestDialog: boolean;
  selectedRequest: WorkshopRequest | null;
  showAcceptDialog: boolean;
  showRejectDialog: boolean;
  requestToReject: string | null;
  showCancelDialog: boolean;
  showRescheduleDialog: boolean;
  showApprenticeProfileModal: boolean;
  selectedApprenticeUserId: string | null;
  showFeedbackDialog: boolean;
};

const initialWorkshopDetailState: WorkshopDetailState = {
  showDeleteDialog: false,
  showRequestDialog: false,
  selectedRequest: null,
  showAcceptDialog: false,
  showRejectDialog: false,
  requestToReject: null,
  showCancelDialog: false,
  showRescheduleDialog: false,
  showApprenticeProfileModal: false,
  selectedApprenticeUserId: null,
  showFeedbackDialog: false,
};

type WorkshopDetailAction =
  | { type: "SET"; payload: Partial<WorkshopDetailState> }
  | { type: "OPEN_ACCEPT"; request: WorkshopRequest }
  | { type: "OPEN_REJECT"; requestId: string }
  | { type: "OPEN_APPRENTICE_PROFILE"; userId: string }
  | { type: "CLOSE_ACCEPT" }
  | { type: "CLOSE_REJECT" }
  | { type: "CLOSE_APPRENTICE_PROFILE" };

function workshopDetailReducer(
  state: WorkshopDetailState,
  action: WorkshopDetailAction
): WorkshopDetailState {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    case "OPEN_ACCEPT":
      return {
        ...state,
        selectedRequest: action.request,
        showAcceptDialog: true,
      };
    case "OPEN_REJECT":
      return {
        ...state,
        requestToReject: action.requestId,
        showRejectDialog: true,
      };
    case "OPEN_APPRENTICE_PROFILE":
      return {
        ...state,
        selectedApprenticeUserId: action.userId,
        showApprenticeProfileModal: true,
      };
    case "CLOSE_ACCEPT":
      return {
        ...state,
        showAcceptDialog: false,
        selectedRequest: null,
      };
    case "CLOSE_REJECT":
      return {
        ...state,
        showRejectDialog: false,
        requestToReject: null,
      };
    case "CLOSE_APPRENTICE_PROFILE":
      return {
        ...state,
        showApprenticeProfileModal: false,
        selectedApprenticeUserId: null,
      };
    default:
      return state;
  }
}

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.id as string;
  const { data: session } = authClient.useSession();
  const [state, dispatch] = useReducer(
    workshopDetailReducer,
    initialWorkshopDetailState
  );
  const {
    showDeleteDialog,
    showRequestDialog,
    selectedRequest,
    showAcceptDialog,
    showRejectDialog,
    requestToReject,
    showCancelDialog,
    showRescheduleDialog,
    showApprenticeProfileModal,
    selectedApprenticeUserId,
    showFeedbackDialog,
  } = state;

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

  const handleAcceptRequest = (request: WorkshopRequest) => {
    dispatch({ type: "OPEN_ACCEPT", request });
  };

  const handleRejectRequest = (requestId: string) => {
    dispatch({ type: "OPEN_REJECT", requestId });
  };

  const confirmRejectRequest = (reason?: string) => {
    if (requestToReject) {
      rejectRequest.mutate(
        { requestId: requestToReject, reason },
        {
          onSuccess: () => {
            toast.success("Demande refusée avec succès");
            utils.mentor.getWorkshopRequests.invalidate();
            dispatch({ type: "CLOSE_REJECT" });
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
          dispatch({ type: "SET", payload: { showDeleteDialog: false } });
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
    dispatch({ type: "SET", payload: { showCancelDialog: true } });
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
            dispatch({ type: "SET", payload: { showCancelDialog: false } });
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
        onReschedule={() =>
          dispatch({ type: "SET", payload: { showRescheduleDialog: true } })
        }
        onUnpublish={handleUnpublish}
        onDelete={() =>
          dispatch({ type: "SET", payload: { showDeleteDialog: true } })
        }
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
            onViewApprenticeProfile={(userId) =>
              dispatch({ type: "OPEN_APPRENTICE_PROFILE", userId })
            }
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
                  onClick={() =>
                    dispatch({ type: "SET", payload: { showFeedbackDialog: true } })
                  }
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
            onRequestParticipation={() =>
              dispatch({ type: "SET", payload: { showRequestDialog: true } })
            }
            onCancelRegistration={handleCancelClick}
            onContactMentor={handleContactMentor}
            showContactMentor={isApprentice && !!workshop?.creator}
            isCancelling={cancelMutation.isPending}
          />
        </div>
      </motion.div>

      <DeleteWorkshopDialog
        open={showDeleteDialog}
        onOpenChange={(open) =>
          dispatch({ type: "SET", payload: { showDeleteDialog: open } })
        }
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {canRequestParticipation && workshop?.creator && (
        <RequestWorkshopParticipationDialog
          open={showRequestDialog}
          onOpenChange={(open) =>
            dispatch({ type: "SET", payload: { showRequestDialog: open } })
          }
          mentorId={workshop.creator.id}
          mentorName={workshop.creator.user?.name || "Mentor"}
          workshopId={workshop.id}
        />
      )}

      {selectedRequest && (
        <AcceptWorkshopRequestDialog
          open={showAcceptDialog}
          onOpenChange={(open) => {
            if (!open) {
              dispatch({ type: "CLOSE_ACCEPT" });
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
          if (!open) dispatch({ type: "CLOSE_REJECT" });
        }}
        onConfirm={confirmRejectRequest}
        isSubmitting={rejectRequest.isPending}
      />

      {workshop?.date && isRegistered && (
        <CancelWorkshopRegistrationDialog
          open={showCancelDialog}
          onOpenChange={(open) =>
            dispatch({ type: "SET", payload: { showCancelDialog: open } })
          }
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
          onOpenChange={(open) =>
            dispatch({ type: "SET", payload: { showRescheduleDialog: open } })
          }
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
                  dispatch({ type: "SET", payload: { showRescheduleDialog: false } });
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
            if (!open) dispatch({ type: "CLOSE_APPRENTICE_PROFILE" });
          }}
          apprenticeUserId={selectedApprenticeUserId}
        />
      )}

      {workshop && (
        <SubmitFeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={(open) =>
            dispatch({ type: "SET", payload: { showFeedbackDialog: open } })
          }
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
