"use client";

import { CancelWorkshopRegistrationDialog } from "@/components/workshop/dialogs/CancelWorkshopRegistrationDialog";
import { SubmitFeedbackDialog } from "@/components/workshop/SubmitFeedbackDialog";
import { ApprenantDashboard } from "@/components/dashboard/ApprenantDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { PageHeader, PageContainer } from "@/components/layout";

import { useDashboard } from "@/hooks/useDashboard";
import { FloatingAddButton } from "@/components/dashboard/FloatingAddButton";

export default function Dashboard() {
  const {
    router,
    session,
    isPending,
    queryClient,
    userRole,
    actualUserRole,
    userStatus,
    isMentor,
    isApprenant,
    workshopRequests,
    confirmedWorkshops,
    workshopHistory,
    creditBalance,
    acceptedConnections,
    mentorConnections,
    cancelWorkshopMutation,
    cancelRequestMutation,
    showCancelDialog,
    setShowCancelDialog,
    selectedCancellationWorkshop,
    mentorWorkshopRequests,
    mentorWorkshops,
    mentorStats,
    showFeedbackDialog,
    setShowFeedbackDialog,
    selectedFeedbackWorkshopId,
    setSelectedFeedbackWorkshopId,
    hasShownFeedbackModal,
    setHasShownFeedbackModal,
  } = useDashboard();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-12">
      <PageHeader
        title="Tableau de bord"
        subtitle="Planifiez, hiérarchisez et accomplissez vos tâches en toute simplicité"
      />

      {userRole === "apprenant" && isApprenant && (
        <ApprenantDashboard
          creditBalance={creditBalance}
          mentorConnections={mentorConnections}
          workshopHistory={workshopHistory}
          acceptedConnections={acceptedConnections}
          workshopRequests={workshopRequests}
          confirmedWorkshops={confirmedWorkshops}
          onCancelRequest={(requestId) =>
            cancelRequestMutation.mutate({ requestId })
          }
          onCancelConfirmed={(workshopId) => setShowCancelDialog(workshopId)}
        />
      )}

      {userRole === "mentor" && actualUserRole === "MENTOR" && (
        <MentorDashboard
          mentorStats={mentorStats}
          pastWorkshops={[]}
          acceptedConnections={acceptedConnections}
          mentorWorkshopRequests={mentorWorkshopRequests}
          mentorWorkshops={mentorWorkshops}
          userStatus={userStatus}
        />
      )}

      {selectedFeedbackWorkshopId && (
        <SubmitFeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={(open) => {
            setShowFeedbackDialog(open);
            if (!open) {
              setSelectedFeedbackWorkshopId(null);
              setHasShownFeedbackModal(false);
            }
          }}
          workshopId={selectedFeedbackWorkshopId}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: [
                ["workshopFeedback", "getEligibleWorkshopsForFeedback"],
              ],
            });
            setHasShownFeedbackModal(false);
          }}
        />
      )}

      {selectedCancellationWorkshop && (
        <CancelWorkshopRegistrationDialog
          open={showCancelDialog !== null}
          onOpenChange={(open) => !open && setShowCancelDialog(null)}
          onConfirm={(reason) => {
            if (showCancelDialog) {
              cancelWorkshopMutation.mutate({
                workshopId: showCancelDialog,
                cancellationReason: reason,
              });
            }
          }}
          isLoading={cancelWorkshopMutation.isPending}
          workshopTitle={selectedCancellationWorkshop.title}
          workshopDate={
            selectedCancellationWorkshop.date
              ? new Date(selectedCancellationWorkshop.date as string)
              : new Date()
          }
        />
      )}

      {isMentor && (
        <FloatingAddButton
          onClick={() => router.push("/workshop-editor?new=true")}
        />
      )}
    </PageContainer>
  );
}
