"use client";

import { useState, useMemo, useEffect } from "react";
// @ts-ignore - useRouter is exported from next/navigation, this is a TypeScript resolution issue
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import {
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getStatusBadge,
  formatDate,
  formatTime,
  calculateCountdown,
  formatCountdown,
  calculateEndTime,
} from "@/lib/workshop-utils";
import { DeleteWorkshopDialog } from "@/components/workshop/dialogs/DeleteWorkshopDialog";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  CheckCircle,
  Search,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { RejectWorkshopRequestDialog } from "@/components/mentor/RejectWorkshopRequestDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import { WorkshopStatsCards } from "@/components/workshop/stats/WorkshopStatsCards";
import { WorkshopRequests } from "@/components/workshop/requests/WorkshopRequests";

type SortField = "date" | "title" | "status" | "createdAt";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export default function MyWorkshopsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data: workshops,
    isLoading,
    refetch,
    error: workshopsError,
  } = trpc.workshop.getMyWorkshops.useQuery(undefined, {
    enabled: !!session && userRole === "MENTOR",
    retry: false,
  } as any);

  const { data: mentorRequests } =
    trpc.mentor.getMentorWorkshopRequests.useQuery(undefined, {
      enabled: !!session,
    } as any);

  const pendingRequestsCount =
    mentorRequests?.filter((r: any) => r.status === "PENDING").length || 0;

  const deleteMutation = trpc.workshop.delete.useMutation();
  const publishMutation = trpc.workshop.publish.useMutation();
  const unpublishMutation = trpc.workshop.unpublish.useMutation();

  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [expandedWorkshopId, setExpandedWorkshopId] = useState<string | null>(
    null
  );

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<
    "month" | "week" | "day" | "agenda"
  >("month");

  const navigateCalendar = createNavigateCalendar(
    calendarDate,
    calendarView,
    setCalendarDate
  );

  const utils = trpc.useUtils();
  const rejectRequest = trpc.mentor.rejectWorkshopRequest.useMutation();

  const handleAcceptRequest = (request: any) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const handleRejectRequest = (requestId: string) => {
    setRequestToReject(requestId);
    setShowRejectDialog(true);
  };

  const confirmRejectRequest = () => {
    if (requestToReject) {
      rejectRequest.mutate(
        { requestId: requestToReject },
        {
          onSuccess: () => {
            toast.success("Demande refusée avec succès");
            utils.mentor.getWorkshopRequests.invalidate();
            setShowRejectDialog(false);
            setRequestToReject(null);
          },
          onError: (error: { message: string }) => {
            toast.error(`Erreur: ${error.message}`);
          },
        }
      );
    }
  };

  const filteredAndSortedWorkshops = useMemo(() => {
    if (!workshops) return [];

    let result = [...workshops];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (workshop) =>
          workshop.title.toLowerCase().includes(query) ||
          workshop.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((workshop) => workshop.status === statusFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date": {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [workshops, searchQuery, statusFilter, sortField, sortOrder]);

  const upcomingWorkshops = useMemo(() => {
    if (!workshops) return [];
    const now = new Date();
    const filtered = workshops
      .filter((w: NonNullable<typeof workshops>[number]) => {
        if (w.status !== "PUBLISHED") return false;

        if (!w.date || !w.time) return false;

        const duration = w.duration || 60;
        const endTime = calculateEndTime(w.date, w.time, duration);

        if (!endTime || endTime <= now) return false;

        return true;
      })
      .sort(
        (
          a: NonNullable<typeof workshops>[number],
          b: NonNullable<typeof workshops>[number]
        ) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        }
      );
    return filtered;
  }, [workshops]);

  const nextWorkshop = useMemo(() => {
    if (!upcomingWorkshops || upcomingWorkshops.length === 0) return null;
    return upcomingWorkshops[0];
  }, [upcomingWorkshops]);

  const [countdown, setCountdown] =
    useState<ReturnType<typeof calculateCountdown>>(null);

  useEffect(() => {
    if (!nextWorkshop?.date || !nextWorkshop?.time) {
      setCountdown(null);
      return;
    }

    const initialCountdown = calculateCountdown(
      nextWorkshop.date,
      nextWorkshop.time
    );
    setCountdown(initialCountdown);

    const interval = setInterval(() => {
      const newCountdown = calculateCountdown(
        nextWorkshop.date,
        nextWorkshop.time
      );
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextWorkshop]);

  const handleDelete = (workshopId: string) => {
    deleteMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier supprimé avec succès");
          refetch();
          setShowDeleteDialog(null);
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la suppression");
        },
      }
    );
  };

  const handlePublish = (workshopId: string) => {
    publishMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier publié avec succès");
          refetch();
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la publication");
        },
      }
    );
  };

  const handleUnpublish = (workshopId: string) => {
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

  const handleEdit = (workshopId: string) => {
    router.push(`/workshop-editor?id=${workshopId}`);
  };

  const handleViewDetails = (workshopId: string) => {
    router.push(`/workshop/${workshopId}`);
  };

  if (isSessionLoading || isLoading || isLoadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (userRole !== "MENTOR") {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
          <Card className="border-[#ffb647] bg-white dark:bg-[#1a1720] border border-[#d6dae4]">
            <CardHeader>
              <CardTitle className="text-[#ffb647] dark:text-[#ffb647]">
                Accès réservé aux mentors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#161616] dark:text-[#e6e6e6] mb-4">
                Cette page est réservée aux mentors. Votre rôle actuel est :{" "}
                <strong>{userRole || "Non défini"}</strong>
              </p>
              <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-4">
                Si vous devriez avoir accès à cette page, veuillez vérifier
                votre profil et sélectionner le rôle MENTOR.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Retour au dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (workshopsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
          <Card className="border-[#f44336] bg-white dark:bg-[#1a1720] border border-[#d6dae4]">
            <CardHeader>
              <CardTitle className="text-[#f44336] dark:text-[#f44336]">
                Erreur d'accès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#161616] dark:text-[#e6e6e6] mb-4">
                {workshopsError.message || "Une erreur est survenue"}
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Retour au dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
        <div className="relative mb-10">
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
                Mes Ateliers
              </h1>
            </div>
          </div>
          <p className="text-[20px] sm:text-[22px] lg:text-[24px] text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-5 lg:mt-6">
            Gère et organise tes ateliers
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-6">
            <Button
              onClick={() => router.push("/workshop-editor")}
              className="flex items-center gap-2 bg-[#ffb647] hover:bg-[#ff9f1a] text-[#161616] rounded-[32px] h-10 px-4 py-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Créer un atelier
            </Button>
          </div>

          <WorkshopStatsCards
            total={workshops?.length || 0}
            published={
              workshops?.filter(
                (w: NonNullable<typeof workshops>[number]) =>
                  w.status === "PUBLISHED"
              ).length || 0
            }
            drafts={
              workshops?.filter(
                (w: NonNullable<typeof workshops>[number]) =>
                  w.status === "DRAFT"
              ).length || 0
            }
            completed={
              workshops?.filter(
                (w: NonNullable<typeof workshops>[number]) =>
                  w.status === "COMPLETED"
              ).length || 0
            }
            pendingRequests={pendingRequestsCount}
          />
        </div>

        {nextWorkshop ? (
          <Card className="mb-6 bg-linear-to-br from-[#4A90E2] to-[#26547C] text-white border-0 shadow-xl rounded-[16px] overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
            </div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl mb-2 font-bold">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    Prochaine session
                  </CardTitle>
                  <CardDescription className="text-white/90 text-sm sm:text-base font-medium">
                    {countdown && !countdown.isPast ? (
                      <span className="inline-flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Prochaine session dans {formatCountdown(countdown)}
                      </span>
                    ) : (
                      "Prochaine session"
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/workshop/${nextWorkshop.id}`)}
                  className="bg-white hover:bg-white/90 text-[#26547c] border-0 rounded-[32px] h-10 px-4 sm:px-6 font-semibold shadow-md hover:shadow-lg transition-all shrink-0"
                >
                  Voir les détails
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <div className="bg-white/15 backdrop-blur-md rounded-[12px] p-4 sm:p-6 border border-white/20">
                <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-white">
                  {nextWorkshop.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {nextWorkshop.date && (
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="p-1.5 bg-white/20 rounded-lg">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-white">
                        {formatDate(nextWorkshop.date, {
                          includeWeekday: true,
                        })}
                      </span>
                    </div>
                  )}
                  {nextWorkshop.time && (
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="p-1.5 bg-white/20 rounded-lg">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-white">
                        {formatTime(nextWorkshop.time)}
                        {nextWorkshop.duration &&
                          ` • ${nextWorkshop.duration} min`}
                      </span>
                    </div>
                  )}
                  {nextWorkshop.isVirtual ? (
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="p-1.5 bg-white/20 rounded-lg">
                        <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-white">
                        Atelier en ligne
                      </span>
                    </div>
                  ) : (
                    nextWorkshop.location && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="font-semibold text-sm sm:text-base text-white truncate">
                          {nextWorkshop.location}
                        </span>
                      </div>
                    )
                  )}
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-white">
                      Inscrits: {nextWorkshop.apprenticeId ? 1 : 0} /{" "}
                      {nextWorkshop.maxParticipants || "∞"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-2 border-dashed border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[#1a1720] rounded-[16px]">
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-4" />
              <h3 className="text-xl font-semibold text-[#161616] dark:text-[#e6e6e6] mb-2">
                Aucun atelier programmé
              </h3>
              <p className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-6">
                Créez votre premier atelier pour commencer à partager vos
                connaissances
              </p>
              <Button
                onClick={() => router.push("/workshop-editor")}
                size="lg"
                className="gap-2 bg-[#ffb647] hover:bg-[#ff9f1a] text-[#161616] rounded-[32px] font-semibold"
              >
                <Plus className="w-5 h-5" />
                Créer un atelier
              </Button>
            </CardContent>
          </Card>
        )}

        {upcomingWorkshops.length > 1 && (
          <Card className="mb-6 bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                <Calendar className="w-5 h-5" />
                Autres ateliers à venir ({upcomingWorkshops.length - 1})
              </CardTitle>
              <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                Vos prochains ateliers programmés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingWorkshops
                  .slice(1)
                  .map(
                    (
                      workshop: NonNullable<typeof upcomingWorkshops>[number]
                    ) => (
                      <Card
                        key={workshop.id}
                        className="hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]"
                        onClick={() => router.push(`/workshop/${workshop.id}`)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-2 text-[#26547c] dark:text-[#e6e6e6]">
                            {workshop.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(workshop.date, {
                                includeWeekday: true,
                              })}
                            </div>
                            {workshop.time && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {formatTime(workshop.time)}
                                {workshop.duration &&
                                  ` • ${workshop.duration} min`}
                              </div>
                            )}
                            {workshop.isVirtual ? (
                              <div className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                <span>En ligne</span>
                              </div>
                            ) : (
                              workshop.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">
                                    {workshop.location}
                                  </span>
                                </div>
                              )
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>
                                Inscrits: {workshop.apprenticeId ? 1 : 0} /{" "}
                                {workshop.maxParticipants || "∞"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]" />
                <Input
                  placeholder="Rechercher un atelier par titre ou description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-[rgba(255,255,255,0.08)] border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#161616] dark:text-[#e6e6e6]"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortField}
                  onValueChange={(value) => setSortField(value as SortField)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Titre</SelectItem>
                    <SelectItem value="status">Statut</SelectItem>
                    <SelectItem value="createdAt">Date de création</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="w-full md:w-auto border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.08)] dark:hover:bg-[rgba(255,182,71,0.08)] rounded-[32px]"
                >
                  {sortOrder === "asc" ? "↑ Croissant" : "↓ Décroissant"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
          <CardHeader>
            <CardTitle className="text-[#26547c] dark:text-[#e6e6e6]">
              Tous les ateliers
            </CardTitle>
            <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              {filteredAndSortedWorkshops.length} atelier(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAndSortedWorkshops.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-4" />
                <h3 className="text-lg font-semibold text-[#161616] dark:text-[#e6e6e6] mb-2">
                  Aucun atelier trouvé
                </h3>
                <p className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Essayez de modifier les filtres de recherche"
                    : "Commencez par créer ton premier atelier"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button
                    onClick={() => router.push("/workshop-editor")}
                    className="bg-[#ffb647] hover:bg-[#ff9f1a] text-[#161616] rounded-[32px] font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un atelier
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedWorkshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] p-4 hover:bg-[rgba(255,182,71,0.08)] dark:hover:bg-[rgba(255,182,71,0.08)] transition-colors bg-white dark:bg-[#1a1720]"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/workshop/${workshop.id}`}
                              className="text-lg font-semibold text-[#26547c] dark:text-[#e6e6e6] mb-1 truncate cursor-pointer hover:text-[#4A90E2] transition-colors block"
                            >
                              {workshop.title}
                            </Link>
                            {workshop.description && (
                              <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] line-clamp-2">
                                {workshop.description}
                              </p>
                            )}
                          </div>
                          <div>{getStatusBadge(workshop.status)}</div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(workshop.date)}
                          </div>
                          {workshop.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {workshop.time}
                            </div>
                          )}
                          {workshop.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {workshop.duration} min
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {workshop.status === "PUBLISHED" &&
                            workshop.apprenticeId
                              ? 1
                              : 0}{" "}
                            / {workshop.maxParticipants || "∞"} participants
                          </div>
                        </div>
                        <WorkshopRequests
                          workshopId={workshop.id}
                          workshopStatus={workshop.status}
                          expandedWorkshopId={expandedWorkshopId}
                          setExpandedWorkshopId={setExpandedWorkshopId}
                          onAcceptRequest={handleAcceptRequest}
                          onRejectRequest={handleRejectRequest}
                          isRejecting={rejectRequest.isPending}
                        />
                      </div>

                      <div className="flex gap-2 lg:flex-col xl:flex-row">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(workshop.id)}
                          className="flex-1 lg:flex-none border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] transition-all"
                        >
                          <Eye className="w-4 h-4 lg:mr-0 xl:mr-2" />
                          <span className="lg:hidden xl:inline">Détails</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(workshop.id)}
                          className="flex-1 lg:flex-none border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] transition-all"
                        >
                          <Edit className="w-4 h-4 lg:mr-0 xl:mr-2" />
                          <span className="lg:hidden xl:inline">Éditer</span>
                        </Button>
                        {workshop.status === "DRAFT" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePublish(workshop.id)}
                            disabled={publishMutation.isPending}
                            className="flex-1 lg:flex-none bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 lg:mr-0 xl:mr-2" />
                            <span className="lg:hidden xl:inline">Publier</span>
                          </Button>
                        )}
                        {workshop.status === "PUBLISHED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnpublish(workshop.id)}
                            disabled={unpublishMutation.isPending}
                            className="flex-1 lg:flex-none border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] transition-all"
                          >
                            <EyeOff className="w-4 h-4 lg:mr-0 xl:mr-2" />
                            <span className="lg:hidden xl:inline">
                              Dépublier
                            </span>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteDialog(workshop.id)}
                          disabled={deleteMutation.isPending}
                          className="flex-1 lg:flex-none bg-[#f44336] hover:bg-[#d32f2f] dark:bg-[#f44336] dark:hover:bg-[#d32f2f] text-white dark:text-white rounded-[32px] shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 lg:mr-0 xl:mr-2" />
                          <span className="lg:hidden xl:inline">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:gap-[16px]">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                  <Calendar className="w-5 h-5" />
                  Vue calendrier
                </CardTitle>
                <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  Visualisez tous vos ateliers dans un calendrier
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]"
                    onClick={() => navigateCalendar("today")}
                  >
                    Aujourd'hui
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]"
                    onClick={() => navigateCalendar("prev")}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]"
                    onClick={() => navigateCalendar("next")}
                  >
                    Suivant
                  </Button>
                </div>
                <div className="flex items-center">
                  <Button
                    variant={calendarView === "month" ? "default" : "outline"}
                    size="sm"
                    className={`${
                      calendarView === "month"
                        ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                        : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                    } rounded-l-[8px] rounded-r-0 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold`}
                    onClick={() => setCalendarView("month")}
                  >
                    Mois
                  </Button>
                  <Button
                    variant={calendarView === "week" ? "default" : "outline"}
                    size="sm"
                    className={`${
                      calendarView === "week"
                        ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                        : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                    } rounded-none h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm`}
                    onClick={() => setCalendarView("week")}
                  >
                    Semaine
                  </Button>
                  <Button
                    variant={calendarView === "day" ? "default" : "outline"}
                    size="sm"
                    className={`${
                      calendarView === "day"
                        ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                        : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                    } rounded-none h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm`}
                    onClick={() => setCalendarView("day")}
                  >
                    Jour
                  </Button>
                  <Button
                    variant={calendarView === "agenda" ? "default" : "outline"}
                    size="sm"
                    className={`${
                      calendarView === "agenda"
                        ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                        : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                    } rounded-r-[8px] rounded-l-0 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm`}
                    onClick={() => setCalendarView("agenda")}
                  >
                    Agenda
                  </Button>
                </div>
              </div>
              <div className="mb-3 sm:mb-4">
                <p className="text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                  {formatCalendarMonthYear(calendarDate)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {workshops && workshops.length > 0 ? (
              <div className="overflow-x-auto">
                <WorkshopCalendar
                  workshops={workshops}
                  height="600px"
                  userRole="MENTOR"
                  controlledDate={calendarDate}
                  controlledView={calendarView}
                  onDateChange={setCalendarDate}
                  onViewChange={(view) => {
                    if (
                      view === "month" ||
                      view === "week" ||
                      view === "day" ||
                      view === "agenda"
                    ) {
                      setCalendarView(view);
                    }
                  }}
                  onSelectEvent={(workshop) => {
                    router.push(`/workshop/${workshop.id}`);
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-4" />
                <p className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  Aucun atelier à afficher
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <DeleteWorkshopDialog
          open={showDeleteDialog !== null}
          onOpenChange={(open) => !open && setShowDeleteDialog(null)}
          onConfirm={() => showDeleteDialog && handleDelete(showDeleteDialog)}
          isLoading={deleteMutation.isPending}
        />

        {selectedRequest && (
          <AcceptWorkshopRequestDialog
            open={showAcceptDialog}
            onOpenChange={(open) => {
              setShowAcceptDialog(open);
              if (!open) {
                setSelectedRequest(null);
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
            setShowRejectDialog(open);
            if (!open) setRequestToReject(null);
          }}
          onConfirm={confirmRejectRequest}
          isSubmitting={rejectRequest.isPending}
        />
      </div>
    </div>
  );
}
