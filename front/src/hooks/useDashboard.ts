"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { getUserData } from "@/lib/api-client";
import { toast } from "sonner";
import { calculateEndTime, calculateCountdown } from "@/lib/workshop-utils";

type UserRole = "apprenant" | "mentor" | "both";

interface WorkshopRequest {
  id: string;
  title: string;
  status: string;
  rejectionReason?: string | null;
  [key: string]: unknown;
}

function mapServerRole(role: "MENTOR" | "APPRENANT" | "ADMIN" | null): UserRole {
  if (role === "MENTOR") return "mentor";
  if (role === "APPRENANT") return "apprenant";
  return "both";
}

export function useDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  const { data: userData } = useQuery({
    queryKey: ["userData", session?.user?.id],
    queryFn: getUserData,
    enabled: !!session?.user?.id,
  });

  const actualUserRole = userData?.role || null;
  const userStatus = userData?.status || "ACTIVE";

  const [userRole, setUserRole] = useState<UserRole>(() =>
    mapServerRole(actualUserRole || null)
  );

  useEffect(() => {
    if (actualUserRole === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (actualUserRole) {
      setUserRole(mapServerRole(actualUserRole));
    } else if (session && !isPending && actualUserRole === null) {
      // If user is logged in but has no role, redirect to onboarding
      router.replace("/onboarding");
    }
  }, [actualUserRole, session, isPending, router]);

  const isMentor =
    (userRole === "mentor" || userRole === "both") &&
    actualUserRole === "MENTOR";
  const isApprenant =
    (userRole === "apprenant" || userRole === "both") &&
    actualUserRole === "APPRENANT";

  // --- Apprentice data ---
  const { data: workshopRequests, refetch: refetchApprenticeRequests } =
    trpc.apprentice.getMyRequests.useQuery(undefined, {
      enabled: !!session && userRole === "apprenant" && isApprenant,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    });

  const previousApprenticeRequestsRef = useRef<WorkshopRequest[] | null>(null);

  useEffect(() => {
    const prev = previousApprenticeRequestsRef.current;
    if (workshopRequests && prev) {
      for (const req of workshopRequests as WorkshopRequest[]) {
        const prevReq = prev.find((r) => r.id === req.id);
        if (!prevReq) continue;
        if (prevReq.status === "PENDING" && req.status === "ACCEPTED") {
          toast.success(`Votre demande "${req.title}" a été acceptée !`, {
            description:
              "L'atelier a été programmé. Consultez vos ateliers confirmés.",
            duration: 6000,
          });
        }
        if (prevReq.status === "PENDING" && req.status === "REJECTED") {
          toast.error(`Votre demande "${req.title}" a été refusée`, {
            description: req.rejectionReason
              ? `Motif: ${req.rejectionReason}`
              : "Vous pouvez modifier et renvoyer votre demande ou choisir un autre mentor.",
            duration: 8000,
          });
        }
      }
    }
    if (workshopRequests)
      previousApprenticeRequestsRef.current = [
        ...(workshopRequests as WorkshopRequest[]),
      ];
  }, [workshopRequests]);

  const { data: confirmedWorkshops, refetch: refetchConfirmedWorkshops } =
    trpc.apprentice.getMyWorkshops.useQuery(undefined, {
      enabled: !!session && isApprenant,
    });

  const { data: workshopHistory } = trpc.workshop.getWorkshopHistory.useQuery(
    undefined,
    { enabled: !!session && isApprenant }
  );

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session,
    refetchInterval: 60000,
  });

  const { data: acceptedConnections } =
    trpc.connection.getAcceptedConnections.useQuery(undefined, {
      enabled: !!session,
    });

  const mentorConnections = useMemo(() => {
    if (!acceptedConnections) return [];
    return acceptedConnections.filter(
      (conn: { otherUserRole?: string }) => conn.otherUserRole === "MENTOR"
    );
  }, [acceptedConnections]);

  const cancelWorkshopMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée avec succès");
      refetchConfirmedWorkshops();
      setShowCancelDialog(null);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const cancelRequestMutation = trpc.apprentice.cancelRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande annulée avec succès");
      refetchApprenticeRequests();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de l'annulation de la demande");
    },
  });

  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const selectedCancellationWorkshop = (confirmedWorkshops as { id: string; title: string; date?: string | Date }[] | undefined)?.find(
    (w) => w.id === showCancelDialog
  );

  // --- Mentor data ---
  const { data: mentorWorkshopRequests } =
    trpc.mentor.getReceivedRequests.useQuery(undefined, {
      enabled: !!session && isMentor,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    });

  const { data: mentorWorkshops } = trpc.workshop.getMyWorkshops.useQuery(
    undefined,
    { enabled: !!session && isMentor }
  );

  // Mentor request notifications
  const [previousRequestCount, setPreviousRequestCount] = useState(0);
  const [previousPendingCount, setPreviousPendingCount] = useState(0);

  useEffect(() => {
    if (!mentorWorkshopRequests) return;
    const currentCount = (mentorWorkshopRequests as WorkshopRequest[]).length;
    const currentPending = (mentorWorkshopRequests as WorkshopRequest[]).filter(
      (r) => r.status === "PENDING"
    ).length;

    if (previousRequestCount > 0 && currentCount > previousRequestCount) {
      const n = currentCount - previousRequestCount;
      toast.success(
        `${n} nouvelle${n > 1 ? "s" : ""} demande${n > 1 ? "s" : ""} d'atelier reçue${n > 1 ? "s" : ""}`,
        { duration: 5000 }
      );
    }
    if (previousPendingCount > 0 && currentPending > previousPendingCount) {
      const n = currentPending - previousPendingCount;
      toast.info(
        `${n} nouvelle${n > 1 ? "s" : ""} demande${n > 1 ? "s" : ""} en attente`,
        { duration: 4000 }
      );
    }

    setPreviousRequestCount(currentCount);
    setPreviousPendingCount(currentPending);
  }, [mentorWorkshopRequests, previousRequestCount, previousPendingCount]);

  // Mentor computed stats
  const mentorStats = useMemo(() => {
    if (!mentorWorkshops)
      return {
        totalWorkshops: 0,
        completedWorkshops: 0,
        creditsEarned: 0,
        creditsPending: 0,
        studentsHelped: 0,
        hoursTaught: 0,
        averageRating: null,
      };

    const now = new Date();
    const workshops = mentorWorkshops as {
      status: string;
      date?: string | Date;
      time?: string;
      duration?: number;
      apprenticeId?: string;
    }[];

    const completed = workshops.filter((w) => {
      if (w.status === "COMPLETED") return true;
      if (w.status === "PUBLISHED" && w.date && w.time) {
        return (calculateEndTime(w.date, w.time, w.duration || 60) ?? now) < now;
      }
      return false;
    });

    const pending = workshops.filter((w) => {
      if (w.status !== "PUBLISHED" || !w.date || !w.time) return false;
      return (calculateEndTime(w.date, w.time, w.duration || 60) ?? now) >= now;
    });

    const uniqueStudents = new Set(
      workshops.map((w) => w.apprenticeId).filter(Boolean)
    );

    const hoursTaught = completed.reduce(
      (t, w) => t + (w.duration || 60) / 60,
      0
    );

    return {
      totalWorkshops: workshops.length,
      completedWorkshops: completed.length,
      creditsEarned: completed.length * 20,
      creditsPending: pending.length * 20,
      studentsHelped: uniqueStudents.size,
      hoursTaught: Math.round(hoursTaught * 10) / 10,
      averageRating: null,
    };
  }, [mentorWorkshops]);

  // Feedback
  const { data: eligibleWorkshops } =
    trpc.workshopFeedback.getEligibleWorkshopsForFeedback.useQuery(undefined, {
      enabled:
        !!session?.user?.id &&
        (userRole === "apprenant" || actualUserRole === "APPRENANT"),
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
    });

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
      if (
        latest &&
        (latest.shouldShowImmediately || latest.hoursSinceEnd >= 1)
      ) {
        setSelectedFeedbackWorkshopId(latest.workshopId);
        setShowFeedbackDialog(true);
        setHasShownFeedbackModal(true);
      }
    }
  }, [eligibleWorkshops, showFeedbackDialog, hasShownFeedbackModal, session?.user?.id]);

  // Auth redirect
  useEffect(() => {
    if (!session && !isPending) router.push("/login");
  }, [session, isPending, router]);

  return {
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
  };
}
