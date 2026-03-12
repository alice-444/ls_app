"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CancelWorkshopRegistrationDialog } from "@/components/workshop/dialogs/CancelWorkshopRegistrationDialog";
import { toast } from "sonner";
import { useState } from "react";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import { ApprenticeSidebar } from "./ApprenticeSidebar";
import { UpcomingWorkshopsCard } from "./UpcomingWorkshopsCard";
import { AvailableWorkshopsGrid } from "./AvailableWorkshopsGrid";
import type { WorkshopDetailed } from "@ls-app/shared";

export function ApprenticeWorkshopDashboard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const [cancelDialogWorkshop, setCancelDialogWorkshop] =
    useState<WorkshopDetailed | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedWorkshopForRequest, setSelectedWorkshopForRequest] = useState<{
    workshopId: string | null;
    mentorId: string;
    mentorName: string;
  } | null>(null);

  const { data: upcomingWorkshops, isLoading: isLoadingUpcoming } =
    trpc.workshop.getUpcomingWorkshops.useQuery(undefined, {
      enabled: !!session && userRole === "APPRENANT",
      refetchOnWindowFocus: true,
    }) as { data: WorkshopDetailed[] | undefined; isLoading: boolean };

  const { data: availableWorkshops, isLoading: isLoadingAvailable } =
    trpc.workshop.getAvailableWorkshops.useQuery(undefined, {
      enabled: !!session && userRole === "APPRENANT",
      refetchOnWindowFocus: true,
    }) as { data: WorkshopDetailed[] | undefined; isLoading: boolean };

  const { data: workshopHistory, isLoading: isLoadingHistory } =
    trpc.workshop.getWorkshopHistory.useQuery(undefined, {
      enabled: !!session && userRole === "APPRENANT",
      refetchOnWindowFocus: true,
    });

  const { data: titleData } = trpc.user.getTitle.useQuery(undefined, {
    enabled: !!session && userRole === "APPRENANT",
  });

  const utils = trpc.useUtils();

  const cancelMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée avec succès");
      utils.workshop.getUpcomingWorkshops.invalidate();
      setCancelDialogWorkshop(null);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const handleCancelConfirm = (reason?: string) => {
    if (cancelDialogWorkshop) {
      cancelMutation.mutate({
        workshopId: cancelDialogWorkshop.id,
        cancellationReason: reason,
      });
    }
  };

  const handleJoinWorkshop = (workshop: WorkshopDetailed) => {
    const mentorName = workshop.creator?.displayName || workshop.creator?.name || workshop.creator?.user?.name;
    if (workshop.creator?.id && mentorName) {
      setSelectedWorkshopForRequest({
        workshopId: workshop.id,
        mentorId: workshop.creator.id,
        mentorName: mentorName,
      });
      setShowRequestDialog(true);
    }
  };

  if (isLoadingUpcoming || isLoadingAvailable || isLoadingHistory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ApprenticeSidebar
          workshopHistory={workshopHistory}
          titleData={titleData}
        />

        <div className="lg:col-span-8 space-y-8">
          <UpcomingWorkshopsCard
            workshops={upcomingWorkshops}
            onCancelClick={setCancelDialogWorkshop}
          />

          <Card className="border-none shadow-md bg-white dark:bg-slate-950 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Calendrier de mes ateliers
              </CardTitle>
              <CardDescription className="mt-1">
                Vue d&apos;ensemble de vos ateliers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingWorkshops && upcomingWorkshops.length > 0 ? (
                <WorkshopCalendar
                  workshops={upcomingWorkshops}
                  height="600px"
                  showOnlyConfirmed={true}
                  userRole="APPRENANT"
                  onSelectEvent={(workshop) => {
                    router.push(`/workshop/${workshop.id}`);
                  }}
                />
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Aucun atelier programmé
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Vos ateliers confirmés apparaîtront ici
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <AvailableWorkshopsGrid
            workshops={availableWorkshops}
            onJoinWorkshop={handleJoinWorkshop}
          />
        </div>
      </div>

      {cancelDialogWorkshop?.date && (
        <CancelWorkshopRegistrationDialog
          open={!!cancelDialogWorkshop}
          onOpenChange={(open) => {
            if (!open) setCancelDialogWorkshop(null);
          }}
          onConfirm={handleCancelConfirm}
          isLoading={cancelMutation.isPending}
          workshopTitle={cancelDialogWorkshop.title}
          workshopDate={
            typeof cancelDialogWorkshop.date === "string"
              ? new Date(cancelDialogWorkshop.date)
              : cancelDialogWorkshop.date
          }
        />
      )}

      {selectedWorkshopForRequest && (
        <RequestWorkshopParticipationDialog
          open={showRequestDialog}
          onOpenChange={(open) => {
            setShowRequestDialog(open);
            if (!open) setSelectedWorkshopForRequest(null);
          }}
          mentorId={selectedWorkshopForRequest.mentorId}
          mentorName={selectedWorkshopForRequest.mentorName}
          workshopId={selectedWorkshopForRequest.workshopId}
          onSuccess={() => {
            utils.workshop.getAvailableWorkshops.invalidate();
            utils.workshop.getUpcomingWorkshops.invalidate();
            utils.apprentice.getMyRequests.invalidate();
          }}
        />
      )}
    </div>
  );
}
