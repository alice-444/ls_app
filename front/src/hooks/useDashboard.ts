"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { redirect, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { getUserData } from "@/lib/api-client";
import { toast } from "sonner";

type UserRole = "apprenant" | "mentor" | "both";

interface WorkshopRequest {
  id: string;
  title: string;
  status: string;
  description?: string;
  preferredDate?: string | Date | null;
  preferredTime?: string | null;
  rejectionReason?: string | null;
  apprenticeName?: string;
  [key: string]: any;
}

interface WorkshopItem {
  id: string;
  title: string;
  description?: string | null;
  date?: string | Date | null;
  time?: string | null;
  duration?: number | null;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null;
  status?: string;
  apprenticeId?: string | null;
}

function mapServerRole(
  role: "MENTOR" | "APPRENANT" | "ADMIN" | null,
): UserRole {
  if (role === "MENTOR") return "mentor";
  if (role === "APPRENANT") return "apprenant";
  return "both";
}

function notifyWorkshopRequestStatusChanges(
  prev: WorkshopRequest[],
  current: WorkshopRequest[],
) {
  for (const req of current) {
    const prevReq = prev.find((r) => r.id === req.id);
    if (!prevReq) continue;
    if (prevReq.status === "PENDING" && req.status === "ACCEPTED") {
      toast.success(`Votre demande "${req.title}" a été acceptée !`, {
        description: "L'atelier a été programmé.",
        duration: 6000,
      });
    } else if (prevReq.status === "PENDING" && req.status === "REJECTED") {
      toast.error(`Votre demande "${req.title}" a été refusée`, {
        description:
          req.rejectionReason || "Consultez le dashboard pour plus d'infos.",
        duration: 8000,
      });
    }
  }
}

export function useDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userData", session?.user?.id],
    queryFn: getUserData,
    enabled: !!session?.user?.id,
  });

  const actualUserRole = userData?.role || null;
  const userStatus = userData?.status || "ACTIVE";
  const userRole = mapServerRole(actualUserRole);

  if (
    !isLoadingUserData &&
    !isPending &&
    session !== undefined &&
    actualUserRole === "ADMIN"
  ) {
    redirect("/admin");
  }
  if (
    !isLoadingUserData &&
    !isPending &&
    session &&
    actualUserRole === undefined
  ) {
    redirect("/onboarding");
  }

  const isMentor =
    (userRole === "mentor" || userRole === "both") &&
    actualUserRole === "MENTOR";
  const isApprenant =
    (userRole === "apprenant" || userRole === "both") &&
    actualUserRole === "APPRENANT";

  // --- Mentor Data (Consolidated) ---
  const { data: mentorDashboardData, isLoading: isLoadingMentorData } = trpc.mentor.getDashboardData.useQuery(
    undefined,
    {
      enabled: !!session && isMentor,
      refetchInterval: 10000,
    }
  );

  // --- Apprentice Data (Consolidated) ---
  const { data: apprenticeDashboardData, isLoading: isLoadingApprenticeData, refetch: refetchApprenticeData } = trpc.apprentice.getDashboardData.useQuery(
    undefined,
    {
      enabled: !!session && isApprenant,
      refetchInterval: 10000,
    }
  );

  const workshopRequests = apprenticeDashboardData?.workshopRequests as WorkshopRequest[] | undefined;

  const previousApprenticeRequestsRef = useRef<WorkshopRequest[] | null>(null);

  useEffect(() => {
    const prev = previousApprenticeRequestsRef.current;
    if (workshopRequests && prev) {
      notifyWorkshopRequestStatusChanges(prev, workshopRequests);
    }
    if (workshopRequests) {
      previousApprenticeRequestsRef.current = [...workshopRequests];
    }
  }, [workshopRequests]);

  const confirmedWorkshops = apprenticeDashboardData?.confirmedWorkshops;
  const workshopHistory = apprenticeDashboardData?.workshopHistory;
  const eligibleWorkshops = apprenticeDashboardData?.eligibleFeedbackWorkshops;

  // Shared / Balanced between Dashboard Roles
  const creditBalance = isMentor ? mentorDashboardData?.creditBalance : apprenticeDashboardData?.creditBalance;
  const acceptedConnections = isMentor ? mentorDashboardData?.acceptedConnections : apprenticeDashboardData?.acceptedConnections;

  const mentorConnections = useMemo(() => {
    if (!acceptedConnections) return [];
    return (acceptedConnections as any[]).filter(
      (conn: any) => conn.otherUserRole === "MENTOR",
    );
  }, [acceptedConnections]);

  const cancelWorkshopMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée");
      if (isApprenant) refetchApprenticeData();
      setShowCancelDialog(null);
    },
  });

  const cancelRequestMutation = trpc.apprentice.cancelRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande annulée");
      if (isApprenant) refetchApprenticeData();
    },
  });

  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const selectedCancellationWorkshop = (
    confirmedWorkshops as WorkshopItem[] | undefined
  )?.find((w) => w.id === showCancelDialog);

  // Mentor Stats & Lists from consolidated query
  const mentorWorkshopRequests = mentorDashboardData?.mentorWorkshopRequests as WorkshopRequest[] | undefined;
  const mentorWorkshops = mentorDashboardData?.mentorWorkshops as WorkshopItem[] | undefined;
  const pastWorkshops = mentorDashboardData?.pastWorkshops as WorkshopItem[] | undefined;
  const mentorStats = mentorDashboardData?.mentorStats || {
    totalWorkshops: 0,
    completedWorkshops: 0,
    creditsEarned: 0,
    creditsPending: 0,
    studentsHelped: 0,
    hoursTaught: 0,
  };

  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedFeedbackWorkshopId, setSelectedFeedbackWorkshopId] = useState<
    string | null
  >(null);
  const [hasShownFeedbackModal, setHasShownFeedbackModal] = useState(false);

  useEffect(() => {
    if (
      eligibleWorkshops &&
      eligibleWorkshops.length > 0 &&
      !showFeedbackDialog &&
      !hasShownFeedbackModal &&
      session?.user?.id
    ) {
      const latest = eligibleWorkshops[0];
      if (latest?.shouldShowImmediately || latest?.hoursSinceEnd >= 1) {
        setSelectedFeedbackWorkshopId(latest.workshopId);
        setShowFeedbackDialog(true);
        setHasShownFeedbackModal(true);
      }
    }
  }, [
    eligibleWorkshops,
    showFeedbackDialog,
    hasShownFeedbackModal,
    session?.user?.id,
  ]);

  if (!isPending && !session) redirect("/login");

  return {
    router,
    session,
    isPending,
    isLoading: isPending || isLoadingUserData || (isMentor && isLoadingMentorData) || (isApprenant && isLoadingApprenticeData),
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
  };
}
