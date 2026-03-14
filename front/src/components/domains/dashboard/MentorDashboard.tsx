"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CreditsCard,
  StudentsHelpedCard,
  PastWorkshopsCard,
  ConnectionsCard,
  type Connection,
} from "./MentorDashboardCards";
import { MentorDashboardRequests, type WorkshopRequest } from "./MentorDashboardRequests";
import { MentorDashboardCalendar } from "./MentorDashboardCalendar";
import { AllWorkshopRequestsDialog } from "./AllWorkshopRequestsDialog";
import { AcceptWorkshopRequestDialog } from "@/components/domains/mentor/AcceptWorkshopRequestDialog";
import { RejectWorkshopRequestDialog } from "@/components/domains/mentor/RejectWorkshopRequestDialog";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { createNavigateCalendar } from "@/lib/dashboard-utils";
import type { WorkshopDetailed, WorkshopBase } from "@ls-app/shared";

type CalendarView = "month" | "week" | "day" | "agenda";

interface MentorDashboardProps {
  readonly mentorStats: {
    readonly creditsEarned: number;
    readonly studentsHelped: number;
  };
  readonly pastWorkshops: WorkshopBase[];
  readonly acceptedConnections: Connection[] | undefined;
  readonly mentorWorkshopRequests: WorkshopRequest[] | undefined;
  readonly mentorWorkshops: WorkshopDetailed[] | undefined;
  readonly userStatus?: string;
}

export function MentorDashboard({
  mentorStats,
  pastWorkshops,
  acceptedConnections,
  mentorWorkshopRequests,
  mentorWorkshops,
}: Readonly<MentorDashboardProps>) {
  const router = useRouter();
  const [mentorCalendarDate, setMentorCalendarDate] = useState(new Date());
  const [mentorCalendarView, setMentorCalendarView] = useState<CalendarView>("month");
  const [showAllRequestsDialog, setShowAllRequestsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkshopRequest | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const utils = trpc.useUtils();

  const rejectMutation = trpc.mentor.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée");
      utils.mentor.getReceivedRequests.invalidate();
      setShowRejectDialog(false);
      setSelectedRequest(null);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors du refus");
    },
  });

  const navigateCalendar = createNavigateCalendar(
    mentorCalendarDate,
    mentorCalendarView,
    setMentorCalendarDate
  );

  const handleAcceptRequest = (request: WorkshopRequest) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const handleRejectRequest = (request: WorkshopRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-[16px]">
        <div className="flex flex-col gap-4 sm:gap-[16px] w-full lg:w-[300px] shrink-0">
          <CreditsCard
            creditsEarned={mentorStats?.creditsEarned ?? 0}
            onViewWorkshops={() => router.push("/my-workshops")}
            onViewAnalytics={() => router.push("/mentor/analytics")}
          />

          {mentorStats && (
            <StudentsHelpedCard
              studentsHelped={mentorStats.studentsHelped}
              onViewWorkshops={() => router.push("/my-workshops")}
            />
          )}

          <PastWorkshopsCard
            workshops={pastWorkshops ?? []}
            onViewWorkshops={() => router.push("/my-workshops")}
          />

          <ConnectionsCard
            connections={acceptedConnections ?? []}
            onViewConnections={() => router.push("/network")}
          />
        </div>

        <div className="flex flex-col gap-4 sm:gap-[16px] flex-1">
          <MentorDashboardRequests
            requests={mentorWorkshopRequests ?? []}
            onShowAllRequests={() => setShowAllRequestsDialog(true)}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />

          <MentorDashboardCalendar
            workshops={mentorWorkshops ?? []}
            calendarDate={mentorCalendarDate}
            calendarView={mentorCalendarView}
            onDateChange={setMentorCalendarDate}
            onViewChange={setMentorCalendarView}
            onNavigate={navigateCalendar}
          />
        </div>
      </div>

      <AllWorkshopRequestsDialog
        open={showAllRequestsDialog}
        onOpenChange={setShowAllRequestsDialog}
        requests={mentorWorkshopRequests}
      />

      {selectedRequest && (
        <>
          <AcceptWorkshopRequestDialog
            open={showAcceptDialog}
            onOpenChange={setShowAcceptDialog}
            requestId={selectedRequest.id}
            requestTitle={selectedRequest.title}
            preferredDate={
              selectedRequest.preferredDate
                ? new Date(selectedRequest.preferredDate)
                : null
            }
            preferredTime={selectedRequest.preferredTime}
            onSuccess={() => {
              utils.mentor.getReceivedRequests.invalidate();
              utils.workshop.getMyWorkshops.invalidate();
            }}
          />
          <RejectWorkshopRequestDialog
            open={showRejectDialog}
            onOpenChange={setShowRejectDialog}
            onConfirm={(reason) =>
              rejectMutation.mutate({ requestId: selectedRequest.id, reason })
            }
            isSubmitting={rejectMutation.isPending}
            apprenticeName={selectedRequest.apprenticeName}
            workshopTitle={selectedRequest.title}
          />
        </>
      )}
    </>
  );
}
