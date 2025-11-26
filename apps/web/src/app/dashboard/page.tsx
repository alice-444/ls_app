"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
// @ts-ignore - useRouter is exported from next/navigation, this is a TypeScript resolution issue
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { getUserRole } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, X } from "lucide-react";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { WorkshopRequestCard } from "@/components/workshop/requests/WorkshopRequestCard";
import { EditWorkshopRequestDialog } from "@/components/workshop/dialogs/EditWorkshopRequestDialog";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
} from "@/lib/workshop-request-utils";
import { toast } from "sonner";
import {
  Edit,
  Users,
  Calendar,
  Clock,
  MapPin,
  LinkIcon,
  ArrowRight,
  Plus,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  Star,
  History,
  Copy as CopyIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CancelWorkshopRegistrationDialog } from "@/components/workshop/dialogs/CancelWorkshopRegistrationDialog";
import { RejectWorkshopRequestDialog } from "@/components/mentor/RejectWorkshopRequestDialog";
import {
  formatDate,
  formatTime,
  calculateEndTime,
  calculateCountdown,
  formatCountdown,
  getStatusBadge,
} from "@/lib/workshop-utils";
import { ApprenticeWorkshopDashboard } from "@/components/apprentice/ApprenticeWorkshopDashboard";
import { DeleteWorkshopDialog } from "@/components/workshop/dialogs/DeleteWorkshopDialog";
import { RescheduleWorkshopDialog } from "@/components/workshop/dialogs/RescheduleWorkshopDialog";
import { WorkshopCard } from "@/components/workshop/cards/WorkshopCard";
import { WorkshopDetails } from "@/components/workshop/WorkshopDetails";
import { WorkshopDropdownMenu } from "@/components/workshop/WorkshopDropdownMenu";
import { StatCard } from "@/components/dashboard/StatCard";
import { RequestBadges } from "@/components/dashboard/RequestBadges";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import { MiniProfileModal } from "@/components/apprentice/MiniProfileModal";

type UserRole = "apprenant" | "mentor" | "both";

// Données mockées
const mockUserData = {
  apprenant: {
    ateliersSuivis: 8,
    heuresApprentissage: 45,
    progression: 78,
    coursEnCours: 3,
    demandesAide: 2,
    mentorsSuivis: 4,
    prochainsAteliers: [
      {
        titre: "Mathématiques avancées",
        mentor: "Dr. Martin",
        date: "Demain, 14h",
      },
      {
        titre: "Programmation Python",
        mentor: "Sarah K.",
        date: "Vendredi, 16h",
      },
    ],
    recommandations: [
      {
        titre: "Calcul différentiel",
        niveau: "Intermédiaire",
        mentor: "Prof. Dubois",
      },
      { titre: "Algèbre linéaire", niveau: "Débutant", mentor: "Marie L." },
    ],
  },
  mentor: {
    ateliersDonnes: 12,
    heuresMentorat: 36,
    etudiantsAides: 8,
    noteMoyenne: 4.8,
    demandesEnAttente: 3,
    creditsGagnes: 240,
    prochainsAteliers: [
      {
        titre: "Aide en physique",
        etudiant: "Thomas R.",
        date: "Demain, 15h",
        statut: "confirmé",
      },
      {
        titre: "Révision maths",
        etudiant: "Emma S.",
        date: "Jeudi, 17h",
        statut: "confirmé",
      },
      {
        titre: "Introduction Python",
        etudiant: "Lucas M.",
        date: "Vendredi, 14h",
        statut: "à préparer",
      },
      {
        titre: "Calcul différentiel",
        etudiant: "Sophie K.",
        date: "Lundi, 16h",
        statut: "à préparer",
      },
    ],
    ateliersAPreparer: [
      {
        titre: "Introduction Python",
        etudiant: "Lucas M.",
        date: "Vendredi, 14h",
        matiere: "Informatique",
        niveau: "Débutant",
      },
    ],
    statistiques: {
      matieres: ["Mathématiques", "Physique", "Informatique"],
      heuresParSemaine: 8,
      disponibilite: "Lun-Ven, 14h-20h",
    },
  },
};

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

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session,
    refetchInterval: 60000,
  });

  const cancelWorkshopMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée avec succès");
      refetchConfirmedWorkshops();
      setShowCancelDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const selectedCancellationWorkshop = confirmedWorkshops?.find(
    (w: any) => w.id === showCancelDialog
  );

  const [previousRequestCount, setPreviousRequestCount] = useState<number>(0);
  const [previousPendingCount, setPreviousPendingCount] = useState<number>(0);

  useEffect(() => {
    if (mentorWorkshopRequests) {
      const currentCount = mentorWorkshopRequests.length;
      const currentPendingCount = mentorWorkshopRequests.filter(
        (r: any) => r.status === "PENDING"
      ).length;

      if (previousRequestCount > 0 && currentCount > previousRequestCount) {
        const newRequests = currentCount - previousRequestCount;
        toast.success(
          `${newRequests} nouvelle${newRequests > 1 ? "s" : ""} demande${
            newRequests > 1 ? "s" : ""
          } d'atelier reçue${newRequests > 1 ? "s" : ""}`,
          {
            duration: 5000,
          }
        );
      }

      if (
        previousPendingCount > 0 &&
        currentPendingCount !== previousPendingCount
      ) {
        if (currentPendingCount > previousPendingCount) {
          toast.info(
            `${currentPendingCount - previousPendingCount} nouvelle${
              currentPendingCount - previousPendingCount > 1 ? "s" : ""
            } demande${
              currentPendingCount - previousPendingCount > 1 ? "s" : ""
            } en attente`,
            {
              duration: 4000,
            }
          );
        }
      }

      setPreviousRequestCount(currentCount);
      setPreviousPendingCount(currentPendingCount);
    }
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
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const rescheduleWorkshopMutation = trpc.workshop.reschedule.useMutation({
    onSuccess: () => {
      toast.success("Atelier reprogrammé avec succès");
      utils.workshop.getMyWorkshops.invalidate();
      setShowRescheduleDialog(null);
    },
    onError: (error) => {
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
    onError: (error) => {
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
    onError: (error) => {
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
    if (!nextWorkshop || !nextWorkshop.date || !nextWorkshop.time) {
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

  const renderApprenantDashboard = () => (
    <>
      <Card className="bg-linear-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Ateliers passés
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {mockUserData.apprenant.coursEnCours}
            </div>
            <p className="text-xs text-blue-100 mb-2">Ateliers passés</p>
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Voir les ateliers
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Mes mentors
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {mockUserData.apprenant.mentorsSuivis}
            </div>
            <p className="text-xs text-purple-100 mb-2">Mentors suivis</p>
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Voir les mentors
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Mes demandes d'atelier
              <RequestBadges
                requests={workshopRequests}
                showPendingBadge={true}
              />
            </div>
          </CardTitle>
          <CardDescription>
            Vos demandes d'atelier envoyées aux mentors
            <RequestBadges
              requests={workshopRequests}
              showAutoUpdateText={true}
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {workshopRequests && workshopRequests.length > 0 ? (
            workshopRequests.map((request: any) => {
              const isRejected = request.status === "REJECTED";
              const isPending = request.status === "PENDING";
              return (
                <div key={request.id} className="space-y-2">
                  <WorkshopRequestCard
                    request={request}
                    variant="dashboard"
                    showTitle={true}
                    showDescription={true}
                    showMentor={true}
                  />
                  {isPending && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => {
                          if (
                            confirm(
                              "Êtes-vous sûr de vouloir annuler cette demande ?"
                            )
                          ) {
                            cancelRequestMutation.mutate({
                              requestId: request.id,
                            });
                          }
                        }}
                        disabled={cancelRequestMutation.isPending}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Annuler
                      </Button>
                    </div>
                  )}
                  {isRejected && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEditRequest(request);
                          setShowEditDialog(true);
                        }}
                        className="text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Éditer et renvoyer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push("/workshop-room");
                        }}
                        className="text-xs"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Créer une nouvelle demande
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Aucune demande d'atelier pour le moment</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/workshop-room")}
              >
                Parcourir les mentors
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEditRequest && (
        <EditWorkshopRequestDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setSelectedEditRequest(null);
              refetchApprenticeRequests();
            }
          }}
          request={selectedEditRequest}
          onSuccess={() => {
            refetchApprenticeRequests();
            utils.mentor.getMyWorkshopRequests.invalidate();
          }}
        />
      )}

      {(userRole === "apprenant" || userRole === "both") && (
        <div className="lg:col-span-full">
          <ApprenticeWorkshopDashboard />
        </div>
      )}
    </>
  );

  const renderMentorDashboard = () => (
    <>
      {nextWorkshop && nextWorkshop.date && nextWorkshop.time ? (
        <Card className="mb-6 bg-linear-to-br from-[#4A90E2] to-[#26547C] text-white border-0 shadow-lg lg:col-span-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white text-2xl mb-2">
                  <Calendar className="w-6 h-6" />
                  Prochaine session
                </CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  {countdown && !countdown.isPast
                    ? `Prochaine session dans ${formatCountdown(countdown)}`
                    : "Prochaine session"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <WorkshopDropdownMenu
                  workshop={nextWorkshop}
                  variant="hero"
                  onViewDetails={(id) => router.push(`/workshop/${id}`)}
                  onViewParticipants={(id) => setShowParticipantsDialog(id)}
                  onEdit={(id) => router.push(`/workshop-editor?edit=${id}`)}
                  onReschedule={(id) => setShowRescheduleDialog(id)}
                  onDelete={(id) => setShowDeleteDialog(id)}
                />
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/workshop/${nextWorkshop.id}`)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Voir les détails
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-bold text-2xl mb-4">{nextWorkshop.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <WorkshopDetails workshop={nextWorkshop} variant="hero" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        upcomingWorkshops.length === 0 && (
          <Card className="mb-6 border-2 border-dashed lg:col-span-full">
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Aucun atelier programmé
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Créez votre premier atelier pour commencer à partager vos
                connaissances
              </p>
              <Button
                onClick={() => router.push("/workshop-editor")}
                size="lg"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer un atelier
              </Button>
            </CardContent>
          </Card>
        )
      )}

      {(upcomingWorkshops.length > 1 || pastWorkshops.length > 0) && (
        <Card className="lg:col-span-full mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {workshopViewTab === "upcoming"
                    ? "Ateliers à venir"
                    : "Ateliers passés"}
                </CardTitle>
                <CardDescription>
                  {workshopViewTab === "upcoming"
                    ? `${upcomingWorkshops.length - 1} autre${
                        upcomingWorkshops.length - 1 > 1 ? "s" : ""
                      } atelier${
                        upcomingWorkshops.length - 1 > 1 ? "s" : ""
                      } programmé${upcomingWorkshops.length - 1 > 1 ? "s" : ""}`
                    : `${pastWorkshops.length} atelier${
                        pastWorkshops.length > 1 ? "s" : ""
                      } terminé${pastWorkshops.length > 1 ? "s" : ""}`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={
                    workshopViewTab === "upcoming" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setWorkshopViewTab("upcoming")}
                >
                  <Calendar className="w-4 h-4 mr-2" />À venir
                </Button>
                <Button
                  variant={workshopViewTab === "past" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWorkshopViewTab("past")}
                >
                  <History className="w-4 h-4 mr-2" />
                  Passés
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {workshopViewTab === "upcoming" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingWorkshops.slice(1).map((workshop: any) => (
                  <WorkshopCard
                    key={workshop.id}
                    workshop={workshop}
                    variant="default"
                    onViewDetails={(id) => router.push(`/workshop/${id}`)}
                    onViewParticipants={(id) => setShowParticipantsDialog(id)}
                    onEdit={(id) => router.push(`/workshop-editor?edit=${id}`)}
                    onReschedule={(id) => setShowRescheduleDialog(id)}
                    onDelete={(id) => setShowDeleteDialog(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastWorkshops.length > 0 ? (
                  pastWorkshops.map((workshop: any) => (
                    <WorkshopCard
                      key={workshop.id}
                      workshop={workshop}
                      variant="past"
                      onViewDetails={(id) => router.push(`/workshop/${id}`)}
                      onEdit={(id) =>
                        router.push(`/workshop-editor?edit=${id}`)
                      }
                      onDuplicate={(id) =>
                        router.push(`/workshop-editor?edit=${id}`)
                      }
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Aucun atelier passé pour le moment</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {mentorWorkshops && mentorWorkshops.length > 0 && (
        <Card className="lg:col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Vue calendrier
            </CardTitle>
            <CardDescription>
              Visualisez tous vos ateliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkshopCalendar
              workshops={mentorWorkshops}
              height="600px"
              userRole="MENTOR"
              onSelectEvent={(workshop) => {
                router.push(`/workshop/${workshop.id}`);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card className="md:col-span-2 lg:col-span-2 bg-linear-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Bienvenue dans votre espace mentor
          </CardTitle>
          <p>
            Continuez votre progression avec l'aide de nos mentors expérimentés
            !
          </p>
          <CardDescription className="text-blue-100">
            Prenez soin de vos étudiants et gérez vos ateliers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Progression globale</p>
              <div className="flex items-center gap-2">
                {mentorStats.averageRating ? (
                  <>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            mentorStats.averageRating &&
                            star <= Math.round(mentorStats.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-yellow-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-blue-100">
                      {mentorStats.averageRating}/5.0
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-blue-100">
                    Aucune note pour le moment
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-sm font-medium">Ateliers donnés</span>
              </div>
              <p className="text-xs text-blue-100">
                {mentorStats.completedWorkshops}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Étudiants aidés</span>
              </div>
              <p className="text-xs text-blue-100">
                {mentorStats.studentsHelped}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-yellow-500 to-orange-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Crédits gagnés
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {mentorStats.creditsEarned}
            </div>
            <p className="text-xs text-yellow-100 mb-1">Crédits disponibles</p>
            {mentorStats.creditsPending > 0 && (
              <p className="text-xs text-yellow-200 mb-2">
                {mentorStats.creditsPending} en attente
              </p>
            )}
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Utiliser mes crédits
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" />
            Heures enseignées
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {mentorStats.hoursTaught}
            </div>
            <p className="text-xs text-green-100">Heures totales</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            Étudiants aidés
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {mentorStats.studentsHelped}
            </div>
            <p className="text-xs text-purple-100">apprenants aidés</p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Ateliers à préparer
          </CardTitle>
          <CardDescription>
            Vos prochains ateliers nécessitant une préparation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mockUserData.mentor.ateliersAPreparer.map((atelier, index) => {
            const isPrepared = index === 0;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                  isPrepared
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex-1">
                  <h4
                    className={`font-medium text-sm ${
                      isPrepared ? "text-green-700 dark:text-green-300" : ""
                    }`}
                  >
                    {atelier.titre}
                  </h4>
                  <p
                    className={`text-xs ${
                      isPrepared
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {atelier.etudiant} • {atelier.matiere} • {atelier.niveau}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isPrepared ? "default" : "secondary"}
                    className={`text-xs ${isPrepared ? "bg-green-600" : ""}`}
                  >
                    {atelier.date}
                  </Badge>
                  <Button
                    size="sm"
                    className={`text-xs ${
                      isPrepared ? "bg-green-600 hover:bg-green-700" : ""
                    }`}
                  >
                    {isPrepared ? (
                      <>
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Préparé
                      </>
                    ) : (
                      "Préparer"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`text-xs ${
                      isPrepared
                        ? "text-slate-400 border-slate-300"
                        : "text-red-600 hover:text-red-700"
                    }`}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Mes statistiques
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-sm font-medium">Heures de mentorat</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.heuresMentorat}h
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-sm font-medium">Notes moyennes</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.noteMoyenne}/5.0
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Étudiants aidés</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.etudiantsAides}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-sm font-medium">Disponibilité</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.statistiques.disponibilite}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Demandes d'atelier reçues
              <RequestBadges requests={mentorWorkshopRequests} showPendingBadge={true} />
            </div>
          </CardTitle>
          <CardDescription>
            Les demandes d'atelier que vous avez reçues de la part des apprentis
            <RequestBadges requests={mentorWorkshopRequests} showAutoUpdateText={true} />
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mentorWorkshopRequests &&
          mentorWorkshopRequests.filter((r: any) => r.status === "PENDING")
            .length > 0 ? (
            mentorWorkshopRequests
              .filter((r: any) => r.status === "PENDING")
              .map((request: any) => (
                <WorkshopRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  isRejecting={rejectRequest.isPending}
                  variant="dashboard"
                  showTitle={true}
                  showDescription={true}
                  showPreferredDate={true}
                />
              ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune demande d'atelier en attente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <AcceptWorkshopRequestDialog
          open={showAcceptDialog}
          onOpenChange={(open) => {
            setShowAcceptDialog(open);
            if (!open) {
              setSelectedRequest(null);
              setSelectedRequestId(null);
              utils.mentor.getMentorWorkshopRequests.invalidate();
              refetchMentorRequests();
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
          onSuccess={() => {
            refetchMentorRequests();
            toast.success("Demande acceptée avec succès !");
          }}
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

      {showDeleteDialog && (
        <DeleteWorkshopDialog
          open={showDeleteDialog !== null}
          onOpenChange={(open) => !open && setShowDeleteDialog(null)}
          onConfirm={() => {
            if (showDeleteDialog) {
              deleteWorkshopMutation.mutate({ workshopId: showDeleteDialog });
            }
          }}
          isLoading={deleteWorkshopMutation.isPending}
        />
      )}

      {showRescheduleDialog &&
        (() => {
          const workshop = mentorWorkshops?.find(
            (w: any) => w.id === showRescheduleDialog
          );
          if (!workshop) return null;
          return (
            <RescheduleWorkshopDialog
              open={showRescheduleDialog !== null}
              onOpenChange={(open) => !open && setShowRescheduleDialog(null)}
              onConfirm={(data) => {
                if (showRescheduleDialog) {
                  rescheduleWorkshopMutation.mutate({
                    workshopId: showRescheduleDialog,
                    ...data,
                  });
                }
              }}
              isLoading={rescheduleWorkshopMutation.isPending}
              workshopTitle={workshop.title}
              oldDate={workshop.date ? new Date(workshop.date) : new Date()}
              oldTime={workshop.time || ""}
              oldDuration={workshop.duration || 60}
              oldLocation={workshop.location || null}
              isVirtual={workshop.isVirtual || false}
            />
          );
        })()}

      {showParticipantsDialog &&
        (() => {
          const workshop = mentorWorkshops?.find(
            (w: any) => w.id === showParticipantsDialog
          );
          if (!workshop) return null;
          return (
            <Dialog
              open={showParticipantsDialog !== null}
              onOpenChange={(open) => !open && setShowParticipantsDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Participants inscrits</DialogTitle>
                  <DialogDescription>
                    {workshop.apprenticeId ? 1 : 0} /{" "}
                    {workshop.maxParticipants || "∞"} participants
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  {workshop.apprenticeId && workshop.apprentice ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                if (workshop.apprentice?.user?.id) {
                                  setMiniProfileApprenticeId(
                                    workshop.apprentice.user.id
                                  );
                                }
                              }}
                              className="font-medium text-sm hover:underline text-left"
                            >
                              {workshop.apprentice.user?.name || "Apprenti"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun participant inscrit pour le moment</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })()}

      {miniProfileApprenticeId && (
        <MiniProfileModal
          open={!!miniProfileApprenticeId}
          onOpenChange={(open) => {
            if (!open) {
              setMiniProfileApprenticeId(null);
            }
          }}
          apprenticeUserId={miniProfileApprenticeId}
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Bonjour, {session?.user.name} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Votre espace d'entraide étudiant
            </p>
          </div>

          <div className="flex items-center gap-3">
            {creditBalance !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span>{creditBalance.balance} Credits</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/buy-credits")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Acheter
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant={userRole === "apprenant" ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleChange("apprenant")}
                disabled={
                  actualUserRole !== "APPRENANT" && actualUserRole !== null
                }
              >
                Apprenant
              </Button>
              <Button
                variant={userRole === "mentor" ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleChange("mentor")}
                disabled={actualUserRole !== "MENTOR" && actualUserRole !== null}
              >
                Mentor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {userRole === "apprenant" && renderApprenantDashboard()}
        {userRole === "mentor" && renderMentorDashboard()}
      </div>

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
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 flex items-center justify-center p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label="Créer un atelier"
            title="Créer un atelier"
          >
            <Plus className="w-7 h-7" />
          </Button>
        )}
    </div>
  );
}
