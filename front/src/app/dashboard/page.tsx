"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { getUserRole } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { calculateEndTime, calculateCountdown } from "@/lib/workshop-utils";
import { CancelWorkshopRegistrationDialog } from "@/components/workshop/dialogs/CancelWorkshopRegistrationDialog";
import { SubmitFeedbackDialog } from "@/components/workshop/SubmitFeedbackDialog";
import { ApprenantDashboard } from "@/components/dashboard/ApprenantDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";

type UserRole = "apprenant" | "mentor" | "both";

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  const { data: actualUserRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const getInitialUserRole = (
    role: "MENTOR" | "APPRENANT" | null
  ): UserRole => {
    if (role === "MENTOR") {
      return "mentor";
    }
    if (role === "APPRENANT") {
      return "apprenant";
    }
    return "both";
  };

  const [userRole, setUserRole] = useState<UserRole>(() =>
    getInitialUserRole(actualUserRole || null)
  );

  useEffect(() => {
    if (actualUserRole) {
      const initialRole = getInitialUserRole(actualUserRole);
      setUserRole(initialRole);
    }
  }, [actualUserRole]);

  const { data: workshopRequests, refetch: refetchApprenticeRequests } =
    trpc.mentor.getMyWorkshopRequests.useQuery(undefined, {
      enabled:
        !!session && userRole === "apprenant" && actualUserRole === "APPRENANT",
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    });

  const previousApprenticeRequestsRef = useRef<any[] | null>(null);

  useEffect(() => {
    const previousApprenticeRequests = previousApprenticeRequestsRef.current;

    if (workshopRequests && previousApprenticeRequests) {
      workshopRequests.forEach((currentRequest: any) => {
        const previousRequest = previousApprenticeRequests.find(
          (r: any) => r.id === currentRequest.id
        );

        if (previousRequest) {
          if (
            previousRequest.status === "PENDING" &&
            currentRequest.status === "ACCEPTED"
          ) {
            toast.success(
              `Votre demande "${currentRequest.title}" a été acceptée !`,
              {
                description:
                  "L'atelier a été programmé. Consultez vos ateliers confirmés.",
                duration: 6000,
              }
            );
          }

          if (
            previousRequest.status === "PENDING" &&
            currentRequest.status === "REJECTED"
          ) {
            toast.error(
              `Votre demande "${currentRequest.title}" a été refusée`,
              {
                description:
                  "Vous pouvez modifier et renvoyer votre demande ou choisir un autre mentor.",
                duration: 8000,
              }
            );
          }
        }
      });
    }

    if (workshopRequests) {
      previousApprenticeRequestsRef.current = [...workshopRequests];
    }
  }, [workshopRequests]);

  const { data: mentorWorkshopRequests, refetch: refetchMentorRequests } =
    trpc.mentor.getMentorWorkshopRequests.useQuery(undefined, {
      enabled:
        !!session &&
        (userRole === "mentor" || userRole === "both") &&
        actualUserRole === "MENTOR",
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    });

  const { data: mentorWorkshops } = trpc.workshop.getMyWorkshops.useQuery(
    undefined,
    {
      enabled:
        !!session &&
        (userRole === "mentor" || userRole === "both") &&
        actualUserRole === "MENTOR",
    }
  );

  const { data: confirmedWorkshops, refetch: refetchConfirmedWorkshops } =
    trpc.workshop.getConfirmedWorkshops.useQuery(undefined, {
      enabled:
        !!session &&
        (userRole === "apprenant" || userRole === "both") &&
        actualUserRole === "APPRENANT",
    });

  const { data: workshopHistory } = trpc.workshop.getWorkshopHistory.useQuery(
    undefined,
    {
      enabled:
        !!session &&
        (userRole === "apprenant" || userRole === "both") &&
        actualUserRole === "APPRENANT",
    }
  );

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session,
    refetchInterval: 60000,
  });

  const { data: acceptedConnections } =
    trpc.connection.getAcceptedConnections.useQuery(undefined, {
      enabled: !!session,
    });

  // Filter mentors from connections for apprenant
  const mentorConnections = useMemo(() => {
    if (!acceptedConnections) return [];
    return acceptedConnections.filter(
      (conn: any) => conn.otherUserRole === "MENTOR"
    );
  }, [acceptedConnections]);

  const cancelWorkshopMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée avec succès");
      refetchConfirmedWorkshops();
      setShowCancelDialog(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const selectedCancellationWorkshop = confirmedWorkshops?.find(
    (w: any) => w.id === showCancelDialog
  );

  const [previousRequestCount, setPreviousRequestCount] = useState<number>(0);
  const [previousPendingCount, setPreviousPendingCount] = useState<number>(0);

  const getPendingCount = (requests: any[]) => {
    return requests.filter((r: any) => r.status === "PENDING").length;
  };

  const showNewRequestsNotification = (
    currentCount: number,
    previousCount: number
  ) => {
    if (previousCount > 0 && currentCount > previousCount) {
      const newRequests = currentCount - previousCount;
      const plural = newRequests > 1 ? "s" : "";
      toast.success(
        `${newRequests} nouvelle${plural} demande${plural} d'atelier reçue${plural}`,
        {
          duration: 5000,
        }
      );
    }
  };

  const showNewPendingNotification = (
    currentPending: number,
    previousPending: number
  ) => {
    if (previousPending > 0 && currentPending > previousPending) {
      const newPending = currentPending - previousPending;
      const plural = newPending > 1 ? "s" : "";
      toast.info(`${newPending} nouvelle${plural} demande${plural} en attente`, {
        duration: 4000,
      });
    }
  };

  useEffect(() => {
    if (!mentorWorkshopRequests) {
      return;
    }

    const currentCount = mentorWorkshopRequests.length;
    const currentPendingCount = getPendingCount(mentorWorkshopRequests);

    showNewRequestsNotification(currentCount, previousRequestCount);
    showNewPendingNotification(currentPendingCount, previousPendingCount);

    setPreviousRequestCount(currentCount);
    setPreviousPendingCount(currentPendingCount);
  }, [mentorWorkshopRequests, previousRequestCount, previousPendingCount]);

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [selectedEditRequest, setSelectedEditRequest] = useState<any | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState<
    string | null
  >(null);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState<
    string | null
  >(null);
  const [workshopViewTab, setWorkshopViewTab] = useState<"upcoming" | "past">(
    "upcoming"
  );
  const [miniProfileApprenticeId, setMiniProfileApprenticeId] = useState<
    string | null
  >(null);

  const utils = trpc.useUtils();

  const deleteWorkshopMutation = trpc.workshop.delete.useMutation({
    onSuccess: () => {
      toast.success("Atelier supprimé avec succès");
      utils.workshop.getMyWorkshops.invalidate();
      setShowDeleteDialog(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const rescheduleWorkshopMutation = trpc.workshop.reschedule.useMutation({
    onSuccess: () => {
      toast.success("Atelier reprogrammé avec succès");
      utils.workshop.getMyWorkshops.invalidate();
      setShowRescheduleDialog(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la reprogrammation");
    },
  });

  const cancelRequestMutation = trpc.mentor.cancelWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande annulée avec succès");
      utils.mentor.getMyWorkshopRequests.invalidate();
      utils.workshop.getAvailableWorkshops.invalidate();
      refetchApprenticeRequests();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'annulation de la demande");
    },
  });

  const rejectRequest = trpc.mentor.rejectWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée avec succès");
      utils.mentor.getMentorWorkshopRequests.invalidate();
      refetchMentorRequests();
      setShowRejectDialog(false);
      setRequestToReject(null);
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleAcceptRequest = (request: any) => {
    setSelectedRequest(request);
    setSelectedRequestId(request.id);
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

  // const privateData = useQuery(trpc.privateData.queryOptions());

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending]);

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
      const mostRecentWorkshop = eligibleWorkshops[0];
      if (
        mostRecentWorkshop &&
        (mostRecentWorkshop.shouldShowImmediately ||
          mostRecentWorkshop.hoursSinceEnd >= 1)
      ) {
        setSelectedFeedbackWorkshopId(mostRecentWorkshop.workshopId);
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

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
  };

  const upcomingWorkshops = useMemo(() => {
    if (!mentorWorkshops) return [];
    const now = new Date();
    return mentorWorkshops
      .filter((w: any) => {
        if (w.status === "CANCELLED") return false;
        if (w.status !== "PUBLISHED" && w.status !== "COMPLETED") return false;
        if (!w.date || !w.time) return false;
        const duration = w.duration || 60;
        const endTime = calculateEndTime(w.date, w.time, duration);
        if (!endTime || endTime <= now) return false;
        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [mentorWorkshops]);

  const pastWorkshops = useMemo(() => {
    if (!mentorWorkshops) return [];
    const now = new Date();
    return mentorWorkshops
      .filter((w: any) => {
        if (w.status === "CANCELLED") return true;
        if (w.status === "COMPLETED") return true;
        if (w.status === "PUBLISHED" && w.date && w.time) {
          const duration = w.duration || 60;
          const endTime = calculateEndTime(w.date, w.time, duration);
          return endTime && endTime < now;
        }
        return false;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.date || b.createdAt).getTime() -
          new Date(a.date || a.createdAt).getTime()
      );
  }, [mentorWorkshops]);

  const nextWorkshop = useMemo(() => {
    return upcomingWorkshops.length > 0 ? upcomingWorkshops[0] : null;
  }, [upcomingWorkshops]);

  const [countdown, setCountdown] =
    useState<ReturnType<typeof calculateCountdown>>(null);

  useEffect(() => {
    if (!nextWorkshop?.date || !nextWorkshop?.time) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const result = calculateCountdown(nextWorkshop.date, nextWorkshop.time);
      setCountdown(result);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextWorkshop]);

  const mentorStats = useMemo(() => {
    if (!mentorWorkshops) {
      return {
        totalWorkshops: 0,
        completedWorkshops: 0,
        creditsEarned: 0,
        creditsPending: 0,
        studentsHelped: 0,
        hoursTaught: 0,
        averageRating: null,
      };
    }

    const now = new Date();
    const completedWorkshops = mentorWorkshops.filter((w: any) => {
      if (w.status === "COMPLETED") return true;
      if (w.status === "PUBLISHED" && w.date && w.time) {
        const duration = w.duration || 60;
        const endTime = calculateEndTime(w.date, w.time, duration);
        return endTime && endTime < now;
      }
      return false;
    });

    const pendingWorkshops = mentorWorkshops.filter((w: any) => {
      if (w.status !== "PUBLISHED") return false;
      if (!w.date || !w.time) return false;
      const duration = w.duration || 60;
      const endTime = calculateEndTime(w.date, w.time, duration);
      return endTime && endTime >= now;
    });

    const creditsEarned = completedWorkshops.length * 20;
    const creditsPending = pendingWorkshops.length * 20;

    const uniqueStudents = new Set<string>();
    mentorWorkshops.forEach((w: any) => {
      if (w.apprenticeId) {
        uniqueStudents.add(w.apprenticeId);
      }
    });

    const hoursTaught = completedWorkshops.reduce((total: number, w: any) => {
      const duration = w.duration || 60;
      return total + duration / 60;
    }, 0);

    return {
      totalWorkshops: mentorWorkshops.length,
      completedWorkshops: completedWorkshops.length,
      creditsEarned,
      creditsPending,
      studentsHelped: uniqueStudents.size,
      hoursTaught: Math.round(hoursTaught * 10) / 10,
      averageRating: null,
    };
  }, [mentorWorkshops]);
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1127px] mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-12">
        <div className="relative mb-6 sm:mb-8 lg:mb-10">
          <div className="relative h-[60px] sm:h-[70px] lg:h-[75px]">
            <div className="absolute left-0 top-0 h-[60px] sm:h-[70px] lg:h-[75px] w-full sm:w-[350px] lg:w-[461px]">
              <div className="absolute left-[120px] sm:left-[140px] lg:left-[163px] top-0 h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                <div className="h-full w-full bg-[#26547c] rounded" />
              </div>
              <div className="absolute left-[85px] sm:left-[100px] lg:left-[116px] top-[30px] sm:top-[35px] lg:top-[38px] h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                <div className="h-full w-full bg-[#26547c] rounded" />
              </div>
              <div className="absolute left-0 top-[-20px] sm:top-[-24px] lg:top-[-27px] h-[36px] sm:h-[40px] lg:h-[45px] w-[36px] sm:w-[40px] lg:w-[45px]">
                <div className="h-full w-full bg-[#26547c] rounded-full opacity-20" />
              </div>
              <div className="absolute left-[40px] sm:left-[48px] lg:left-[56px] top-[2px] h-[52px] sm:h-[60px] lg:h-[66px] w-[280px] sm:w-[320px] lg:w-[405px]">
                <div className="absolute right-[100px] sm:right-[120px] lg:right-[138px] top-[-6px] sm:top-[-7px] lg:top-[-8px] h-[64px] sm:h-[72px] lg:h-[80px] w-[240px] sm:w-[280px] lg:w-[320px] rotate-[359.6deg]">
                  <div className="h-[62px] sm:h-[70px] lg:h-[78px] w-[240px] sm:w-[280px] lg:w-[320px] bg-[#26547c] border-2 border-white rounded-tl-[28px] sm:rounded-tl-[32px] lg:rounded-tl-[36px] rounded-tr-[28px] sm:rounded-tr-[32px] lg:rounded-tr-[36px] rounded-bl-[4px] rounded-br-[4px]" />
                </div>
              </div>
            </div>
            <div className="relative z-10 pt-2 sm:pt-3 lg:pt-4">
              <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-black text-white leading-[1.2] sm:leading-[1.3] lg:leading-[75px] whitespace-nowrap">
                Tableau de bord
              </h1>
            </div>
          </div>
          <p className="text-base sm:text-lg lg:text-[24px] text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-5 lg:mt-6">
            Planifiez, hiérarchisez et accomplissez vos tâches en toute
            simplicité
          </p>
        </div>

        {/* Main content layout */}
        {(() => {
          if (userRole === "apprenant" && actualUserRole === "APPRENANT") {
            return (
              <ApprenantDashboard
                creditBalance={creditBalance}
                mentorConnections={mentorConnections}
                workshopHistory={workshopHistory}
                acceptedConnections={acceptedConnections}
                workshopRequests={workshopRequests}
                confirmedWorkshops={confirmedWorkshops}
                onCancelRequest={(requestId) => {
                  cancelRequestMutation.mutate({ requestId });
                }}
              />
            );
          }
          if (userRole === "mentor" && actualUserRole === "MENTOR") {
            return (
              <MentorDashboard
                mentorStats={mentorStats}
                pastWorkshops={pastWorkshops}
                acceptedConnections={acceptedConnections}
                mentorWorkshopRequests={mentorWorkshopRequests}
                mentorWorkshops={mentorWorkshops}
              />
            );
          }
          return null;
        })()}

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
                ? new Date(selectedCancellationWorkshop.date)
                : new Date()
            }
          />
        )}

        {(userRole === "mentor" || userRole === "both") &&
          actualUserRole === "MENTOR" && (
            <Button
              onClick={() => router.push("/workshop-editor")}
              size="lg"
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg dark:shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center p-0 bg-linear-to-br from-[#26547c] to-[#4A90E2] hover:from-[#1e4260] hover:to-[#3a7bc4] dark:from-[#26547c] dark:to-[#4A90E2] dark:hover:from-[#1e4260] dark:hover:to-[#3a7bc4] text-white border-0"
              aria-label="Atelab"
              title="Atelab"
            >
              <Plus className="w-5 h-5 sm:w-7 sm:h-7" />
            </Button>
          )}
      </div>
    </div>
  );
}
