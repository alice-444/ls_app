"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { getUserData } from "@/lib/api-client";
import { toast } from "sonner";
import { calculateEndTime } from "@/lib/workshop-utils";

type UserRole = "apprenant" | "mentor" | "both";

interface WorkshopRequest {
  id: string;
  title: string;
  status: string;
  rejectionReason?: string | null;
  apprenticeName?: string;
  [key: string]: any;
}

interface WorkshopItem {
  id: string;
  title: string;
  description: string | null;
  date: string | Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  status?: string;
  apprenticeId?: string | null;
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

  const { data: userData, isLoading: isLoadingUserData } = useQuery({
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
    if (isLoadingUserData || isPending || !session) return;

    if (actualUserRole === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (actualUserRole) {
      setUserRole(mapServerRole(actualUserRole));
    } else {
      // Uniquement si les données sont chargées et que le rôle est vraiment null
      router.replace("/onboarding");
    }
  }, [actualUserRole, session, isPending, isLoadingUserData, router]);

  const isMentor =
    (userRole === "mentor" || userRole === "both") &&
    actualUserRole === "MENTOR";
  const isApprenant =
    (userRole === "apprenant" || userRole === "both") &&
    actualUserRole === "APPRENANT";

  // --- Apprentice data ---
  const { data: rawWorkshopRequests, refetch: refetchApprenticeRequests } =
    trpc.apprentice.getMyRequests.useQuery(undefined, {
      enabled: !!session && isApprenant,
      refetchInterval: 10000,
    });

  const workshopRequests = useMemo(() => rawWorkshopRequests as WorkshopRequest[] | undefined, [rawWorkshopRequests]);

  const previousApprenticeRequestsRef = useRef<WorkshopRequest[] | null>(null);

  useEffect(() => {
    const prev = previousApprenticeRequestsRef.current;
    if (workshopRequests && prev) {
      for (const req of workshopRequests) {
        const prevReq = prev.find((r) => r.id === req.id);
        if (!prevReq) continue;
        if (prevReq.status === "PENDING" && req.status === "ACCEPTED") {
          toast.success(`Votre demande "${req.title}" a été acceptée !`, {
            description: "L'atelier a été programmé.",
            duration: 6000,
          });
        }
        if (prevReq.status === "PENDING" && req.status === "REJECTED") {
          toast.error(`Votre demande "${req.title}" a été refusée`, {
            description: req.rejectionReason || "Consultez le dashboard pour plus d'infos.",
            duration: 8000,
          });
        }
      }
    }
    if (workshopRequests)
      previousApprenticeRequestsRef.current = [...workshopRequests];
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
      (conn: any) => conn.otherUserRole === "MENTOR"
    );
  }, [acceptedConnections]);

  const cancelWorkshopMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée");
      refetchConfirmedWorkshops();
      setShowCancelDialog(null);
    },
  });

  const cancelRequestMutation = trpc.apprentice.cancelRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande annulée");
      refetchApprenticeRequests();
    },
  });

  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const selectedCancellationWorkshop = (confirmedWorkshops as WorkshopItem[] | undefined)?.find(
    (w) => w.id === showCancelDialog
  );

  // --- Mentor data ---
  const { data: rawMentorRequests } =
    trpc.mentor.getReceivedRequests.useQuery(undefined, {
      enabled: !!session && isMentor,
      refetchInterval: 10000,
    });

  const mentorWorkshopRequests = useMemo(() => {
    if (!rawMentorRequests) return undefined;
    return (rawMentorRequests as any[]).map(req => ({
      ...req,
      apprenticeName: req.apprentice?.displayName || req.apprentice?.name || "Un apprenti"
    })) as WorkshopRequest[];
  }, [rawMentorRequests]);

  const { data: mentorWorkshops } = trpc.workshop.getMyWorkshops.useQuery(
    undefined,
    { enabled: !!session && isMentor }
  );

  const pastWorkshops = useMemo(() => {
    if (!mentorWorkshops) return [];
    const now = new Date();
    return (mentorWorkshops as WorkshopItem[]).filter(w => {
      if (w.status === "COMPLETED") return true;
      if (w.status === "PUBLISHED" && w.date && w.time) {
        const endTime = calculateEndTime(w.date, w.time, w.duration || 60);
        return endTime && endTime < now;
      }
      return false;
    });
  }, [mentorWorkshops]);

  // Mentor Stats
  const mentorStats = useMemo(() => {
    if (!mentorWorkshops)
      return { totalWorkshops: 0, completedWorkshops: 0, creditsEarned: 0, creditsPending: 0, studentsHelped: 0, hoursTaught: 0 };

    const now = new Date();
    const workshops = mentorWorkshops as WorkshopItem[];
    const completed = workshops.filter(w => w.status === "COMPLETED" || (w.status === "PUBLISHED" && calculateEndTime(w.date!, w.time!, w.duration || 60)! < now));
    const pending = workshops.filter(w => w.status === "PUBLISHED" && calculateEndTime(w.date!, w.time!, w.duration || 60)! >= now);
    const students = new Set(workshops.map(w => w.apprenticeId).filter(Boolean));

    return {
      totalWorkshops: workshops.length,
      completedWorkshops: completed.length,
      creditsEarned: completed.length * 20,
      creditsPending: pending.length * 20,
      studentsHelped: students.size,
      hoursTaught: Math.round(completed.reduce((acc, w) => acc + (w.duration || 60) / 60, 0) * 10) / 10
    };
  }, [mentorWorkshops]);

  // Feedback
  const { data: eligibleWorkshops } =
    trpc.workshopFeedback.getEligibleWorkshopsForFeedback.useQuery(undefined, {
      enabled: !!session?.user?.id && isApprenant,
      refetchInterval: 5000,
    });

  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedFeedbackWorkshopId, setSelectedFeedbackWorkshopId] = useState<string | null>(null);
  const [hasShownFeedbackModal, setHasShownFeedbackModal] = useState(false);

  useEffect(() => {
    if (eligibleWorkshops?.length > 0 && !showFeedbackDialog && !hasShownFeedbackModal && session?.user?.id) {
      const latest = eligibleWorkshops[0];
      if (latest?.shouldShowImmediately || latest?.hoursSinceEnd >= 1) {
        setSelectedFeedbackWorkshopId(latest.workshopId);
        setShowFeedbackDialog(true);
        setHasShownFeedbackModal(true);
      }
    }
  }, [eligibleWorkshops, showFeedbackDialog, hasShownFeedbackModal, session?.user?.id]);

  useEffect(() => {
    if (!session && !isPending) router.push("/login");
  }, [session, isPending, router]);

  return {
    router, session, isPending, queryClient, userRole, actualUserRole, userStatus, isMentor, isApprenant,
    workshopRequests, confirmedWorkshops, workshopHistory, creditBalance, acceptedConnections, mentorConnections,
    cancelWorkshopMutation, cancelRequestMutation, showCancelDialog, setShowCancelDialog, selectedCancellationWorkshop,
    mentorWorkshopRequests, mentorWorkshops, mentorStats, pastWorkshops,
    showFeedbackDialog, setShowFeedbackDialog, selectedFeedbackWorkshopId, setSelectedFeedbackWorkshopId,
    hasShownFeedbackModal, setHasShownFeedbackModal,
  };
}
