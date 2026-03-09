"use client";

import { CancelWorkshopRegistrationDialog } from "@/components/workshop/dialogs/CancelWorkshopRegistrationDialog";
import { SubmitFeedbackDialog } from "@/components/workshop/SubmitFeedbackDialog";
import { ApprenantDashboard } from "@/components/dashboard/ApprenantDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { PageContainer } from "@/components/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";

import { useDashboard } from "@/hooks/useDashboard";
import { FloatingAddButton } from "@/components/dashboard/FloatingAddButton";

export default function Dashboard() {
  const {
    router,
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
    pastWorkshops,
    showFeedbackDialog,
    setShowFeedbackDialog,
    selectedFeedbackWorkshopId,
    setSelectedFeedbackWorkshopId,
    hasShownFeedbackModal,
    setHasShownFeedbackModal,
  } = useDashboard();

  if (isPending) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement du tableau de bord...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-12">
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Tableau de bord" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Planifie, hiérarchise et accomplis tes tâches en toute simplicité
        </p>
      </motion.div>

      {userRole === "apprenant" && isApprenant && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>
      )}

      {userRole === "mentor" && actualUserRole === "MENTOR" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
        <MentorDashboard
          mentorStats={mentorStats}
          pastWorkshops={pastWorkshops as Parameters<typeof MentorDashboard>[0]["pastWorkshops"]}
          acceptedConnections={acceptedConnections}
          mentorWorkshopRequests={mentorWorkshopRequests as Parameters<typeof MentorDashboard>[0]["mentorWorkshopRequests"]}
          mentorWorkshops={mentorWorkshops as Parameters<typeof MentorDashboard>[0]["mentorWorkshops"]}
          userStatus={userStatus}
        />
        </motion.div>
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
