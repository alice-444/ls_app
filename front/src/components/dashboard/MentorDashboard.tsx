"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Search,
  Users,
  GraduationCap,
  History,
  Inbox,
  Calendar,
  Coins,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import {
  formatWorkshopDate,
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import { AllWorkshopRequestsDialog } from "./AllWorkshopRequestsDialog";
import { StatusBadge } from "./StatusBadge";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { RejectWorkshopRequestDialog } from "@/components/mentor/RejectWorkshopRequestDialog";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

interface Connection {
  connectionId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
  otherUserPhotoUrl?: string;
  otherUserRole?: string;
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
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
}

interface WorkshopRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  preferredDate: string | Date | null;
  preferredTime?: string | null;
  apprenticeName?: string;
}

interface MentorDashboardProps {
  readonly mentorStats: {
    readonly creditsEarned: number;
    readonly studentsHelped: number;
  };
  readonly pastWorkshops: WorkshopItem[];
  readonly acceptedConnections: Connection[] | undefined;
  readonly mentorWorkshopRequests: WorkshopRequest[] | undefined;
  readonly mentorWorkshops: WorkshopItem[] | undefined;
}

export function MentorDashboard({
  mentorStats,
  pastWorkshops,
  acceptedConnections,
  mentorWorkshopRequests,
  mentorWorkshops,
}: MentorDashboardProps) {
  const router = useRouter();
  const [mentorCalendarDate, setMentorCalendarDate] = useState(new Date());
  const [mentorCalendarView, setMentorCalendarView] = useState<
    "month" | "week" | "day" | "agenda"
  >("month");
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
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors du refus");
    },
  });

  const navigateCalendar = createNavigateCalendar(
    mentorCalendarDate,
    mentorCalendarView,
    setMentorCalendarDate
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-[16px]">
        <div className="flex flex-col gap-4 sm:gap-[16px] w-full lg:w-[300px] shrink-0">
          <Card className="relative overflow-hidden bg-linear-to-br from-[#26547c] to-[#4A90E2] border-0 text-white rounded-[16px]">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
            <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
              <p className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-white">
                Crédits gagnés
              </p>
              <div className="flex items-end gap-2 sm:gap-4 mb-4 sm:mb-6">
                <p className="text-2xl sm:text-[28px] lg:text-[32px] font-medium leading-none">
                  {mentorStats?.creditsEarned || 0}{" "}
                  <span className="text-sm sm:text-base lg:text-[18px]">
                    crédits
                  </span>
                </p>
                <div className="relative flex items-center h-[33px] w-[33.5px]">
                  <div className="absolute left-0 top-[calc(50%+4.5px)] -translate-y-1/2 w-[24px] h-[24px]">
                    <Coins className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="absolute left-[28.36%] top-[calc(50%-4.5px)] -translate-y-1/2 w-[24px] h-[24px]">
                    <Coins className="w-6 h-6 text-white/60" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="w-full bg-white text-[#26547c] hover:bg-white/90 rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 border border-[#d6dae4]"
                  onClick={() => router.push("/my-workshops")}
                >
                  Voir mes ateliers
                  <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px] ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10 hover:text-white rounded-[32px] h-8 sm:h-9 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                  onClick={() => router.push("/mentor/analytics")}
                >
                  Analyse des gains
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {mentorStats && mentorStats.studentsHelped > 0 && (
            <Card className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                  <div className="flex items-center gap-2 sm:gap-[7.5px]">
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      {mentorStats.studentsHelped} apprenant
                      {mentorStats.studentsHelped > 1 ? "s" : ""} aidé(s)
                      {mentorStats.studentsHelped > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                    {Array.from({
                      length: Math.ceil(mentorStats.studentsHelped / 4),
                    }).map((_, rowIndex) => {
                      const startIndex = rowIndex * 4;
                      const endIndex = Math.min(
                        startIndex + 4,
                        mentorStats.studentsHelped
                      );
                      const avatarsInRow = endIndex - startIndex;

                      return (
                        <div
                          key={`student-row-${startIndex}-${endIndex}`}
                          className="flex items-center justify-center -space-x-2 w-full sm:w-[236px] h-[56px] sm:h-[64px]"
                        >
                          {Array.from({ length: avatarsInRow }).map(
                            (_, avatarIndex) => {
                              const globalIndex = startIndex + avatarIndex;
                              const colorIndex = globalIndex % 4;
                              const colors = [
                                "bg-gradient-to-br from-blue-400 to-blue-600",
                                "bg-gradient-to-br from-purple-400 to-purple-600",
                                "bg-gradient-to-br from-green-400 to-green-600",
                                "bg-gradient-to-br from-yellow-400 to-yellow-600",
                              ];

                              return (
                                <div
                                  key={`student-avatar-${globalIndex}`}
                                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full ${colors[colorIndex]} border-[2.4px] sm:border-[3.2px] border-white shrink-0`}
                                />
                              );
                            }
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] flex items-center justify-center gap-2 bg-white dark:bg-transparent"
                    onClick={() => router.push("/my-workshops")}
                  >
                    Voir mes ateliers
                    <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {pastWorkshops && pastWorkshops.length > 0 && (
            <Card className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                  <div className="flex items-center gap-2 sm:gap-[7.5px]">
                    <History className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Ateliers passés
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                    {pastWorkshops
                      .slice(0, 3)
                      .map((workshop, index: number) => (
                        <div
                          key={workshop.id}
                          className={`border-b border-[#d6dae4] dark:border-[#d6dae4] pb-3 sm:pb-4 ${
                            index === pastWorkshops.slice(0, 3).length - 1
                              ? "border-b-0 pb-0"
                              : ""
                          }`}
                        >
                          <p className="text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] mb-1 sm:mb-2">
                            {workshop.title}
                          </p>
                          <p className="text-xs sm:text-sm lg:text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                            {formatWorkshopDate(workshop.date)}
                          </p>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] flex items-center justify-center gap-2 bg-white dark:bg-transparent"
                    onClick={() => router.push("/my-workshops")}
                  >
                    Voir les ateliers
                    <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {acceptedConnections && acceptedConnections.length > 0 && (
            <Card className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                  <div className="flex items-center gap-2 sm:gap-[7.5px]">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      {acceptedConnections.length} connexion(s)
                      {acceptedConnections.length > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                    {acceptedConnections
                      .slice(0, 12)
                      .map((conn: Connection, index: number) => {
                        if (index % 4 === 0) {
                          const rowConnections = acceptedConnections.slice(
                            index,
                            index + 4
                          );
                          return (
                            <div
                              key={`connection-row-${rowConnections
                                .map((c) => c.connectionId)
                                .join("-")}`}
                              className="flex items-center justify-center -space-x-2 w-full sm:w-[236px] h-[56px] sm:h-[64px]"
                            >
                              {rowConnections.map((c, i: number) => {
                                const getConnectionColorClass = (
                                  index: number
                                ) => {
                                  if (index % 4 === 0) {
                                    return "bg-linear-to-br from-blue-400 to-blue-600";
                                  }
                                  if (index % 4 === 1) {
                                    return "bg-linear-to-br from-purple-400 to-purple-600";
                                  }
                                  if (index % 4 === 2) {
                                    return "bg-linear-to-br from-green-400 to-green-600";
                                  }
                                  return "bg-linear-to-br from-yellow-400 to-yellow-600";
                                };

                                return (
                                  <div
                                    key={c.connectionId}
                                    className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-[2.4px] sm:border-[3.2px] border-white shrink-0 ${getConnectionColorClass(
                                      i
                                    )}`}
                                    style={
                                      c.otherUserPhotoUrl
                                        ? {
                                            backgroundImage: `url(${c.otherUserPhotoUrl})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                          }
                                        : undefined
                                    }
                                  />
                                );
                              })}
                            </div>
                          );
                        }
                        return null;
                      })}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] flex items-center justify-center gap-2 bg-white dark:bg-transparent"
                    onClick={() => router.push("/network")}
                  >
                    Voir les connexions
                    <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:gap-[16px] flex-1">
          <Card className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                  <div className="flex items-center gap-2 sm:gap-[7.5px]">
                    <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Demande(s) reçue(s)
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.8px]">
                    Les demandes d'ateliers que vous avez reçues
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 flex items-center gap-2 bg-white dark:bg-[rgba(255,255,255,0.08)]">
                    <span className="text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Rechercher...
                    </span>
                    <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[#26547c] dark:text-[#e6e6e6]" />
                  </div>
                </div>

                <div className="flex flex-col gap-[16px]">
                  {mentorWorkshopRequests &&
                  mentorWorkshopRequests.length > 0 ? (
                    <>
                      {mentorWorkshopRequests
                        .slice(0, 3)
                        .map((request) => (
                          <div
                            key={request.id}
                            className="bg-white dark:bg-[rgba(255,255,255,0.08)] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] min-h-[126px] px-3 sm:px-4 lg:px-5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                          >
                            <div className="flex flex-col gap-2 sm:gap-[8px] justify-center flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-bold text-[#26547c] dark:text-[#e6e6e6] truncate">
                                {request.title}
                              </p>
                              <p className="text-xs sm:text-sm lg:text-base text-[#161616] dark:text-[#e6e6e6] line-clamp-2">
                                {request.description ||
                                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit"}
                              </p>
                              <p className="text-xs sm:text-sm lg:text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                                {formatWorkshopDate(request.preferredDate)}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              {request.status === "PENDING" ? (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-[32px] h-8 px-3"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowAcceptDialog(true);
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Accepter
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-[32px] h-8 px-3"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Refuser
                                  </Button>
                                </>
                              ) : (
                                <StatusBadge status={request.status} />
                              )}
                            </div>
                          </div>
                        ))}
                      {mentorWorkshopRequests.length > 3 && (
                        <Button
                          variant="outline"
                          className="w-full border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] flex items-center justify-center gap-2 bg-white dark:bg-transparent"
                          onClick={() => setShowAllRequestsDialog(true)}
                        >
                          <span className="truncate">
                            Voir toutes les demandes (
                            {mentorWorkshopRequests.length})
                          </span>
                          <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                      <p>Aucune demande reçue pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                  <div className="flex items-center gap-2 sm:gap-[7.5px]">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Calendrier de mes ateliers
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.8px]">
                    Vue d'ensemble de vos ateliers
                  </p>
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
                  <div className="flex items-center flex-wrap gap-0">
                    <Button
                      variant={
                        mentorCalendarView === "month" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        mentorCalendarView === "month"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-l-[8px] rounded-r-0 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-semibold`}
                      onClick={() => setMentorCalendarView("month")}
                    >
                      Mois
                    </Button>
                    <Button
                      variant={
                        mentorCalendarView === "week" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        mentorCalendarView === "week"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-none h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm`}
                      onClick={() => setMentorCalendarView("week")}
                    >
                      Semaine
                    </Button>
                    <Button
                      variant={
                        mentorCalendarView === "day" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        mentorCalendarView === "day"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-none h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm`}
                      onClick={() => setMentorCalendarView("day")}
                    >
                      Jour
                    </Button>
                    <Button
                      variant={
                        mentorCalendarView === "agenda" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        mentorCalendarView === "agenda"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-r-[8px] rounded-l-0 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm`}
                      onClick={() => setMentorCalendarView("agenda")}
                    >
                      Agenda
                    </Button>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p className="text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                    {formatCalendarMonthYear(mentorCalendarDate)}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <WorkshopCalendar
                    workshops={mentorWorkshops || []}
                    height="400px"
                    userRole="MENTOR"
                    controlledDate={mentorCalendarDate}
                    controlledView={mentorCalendarView}
                    onDateChange={setMentorCalendarDate}
                    onViewChange={(view) => {
                      if (
                        view === "month" ||
                        view === "week" ||
                        view === "day" ||
                        view === "agenda"
                      ) {
                        setMentorCalendarView(view);
                      }
                    }}
                    onSelectEvent={(workshop) => {
                      router.push(`/workshop/${workshop.id}`);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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
            onConfirm={() => rejectMutation.mutate({ requestId: selectedRequest.id })}
            isSubmitting={rejectMutation.isPending}
            apprenticeName={selectedRequest.apprenticeName}
            workshopTitle={selectedRequest.title}
          />
        </>
      )}
    </>
  );
}
