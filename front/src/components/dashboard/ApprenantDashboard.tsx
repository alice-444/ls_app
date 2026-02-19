"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowRight,
  Plus,
  Search,
  Trash2,
  Users,
  Coins,
  Inbox,
  Calendar,
  History,
  Trophy,
  Sparkles,
  Info,
  HelpCircle,
} from "lucide-react";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import {
  formatWorkshopDate,
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import { StatusBadge } from "./StatusBadge";

const getAvatarColorClass = (index: number) => {
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

interface ApprenantDashboardProps {
  readonly creditBalance: { readonly balance: number } | undefined;
  readonly mentorConnections: any[];
  readonly workshopHistory: any[] | undefined;
  readonly acceptedConnections: any[] | undefined;
  readonly workshopRequests: any[] | undefined;
  readonly confirmedWorkshops: any[] | undefined;
  readonly onCancelRequest: (requestId: string) => void;
}

export function ApprenantDashboard({
  creditBalance,
  mentorConnections,
  workshopHistory,
  acceptedConnections,
  workshopRequests,
  confirmedWorkshops,
  onCancelRequest,
}: ApprenantDashboardProps) {
  const router = useRouter();
  const [apprenantCalendarDate, setApprenantCalendarDate] = useState(
    new Date()
  );
  const [apprenantCalendarView, setApprenantCalendarView] = useState<
    "month" | "week" | "day" | "agenda"
  >("month");

  const { data: titleData } = trpc.user.getTitle.useQuery(undefined, {
    enabled: true,
  });

  const navigateCalendar = createNavigateCalendar(
    apprenantCalendarDate,
    apprenantCalendarView,
    setApprenantCalendarDate
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-[16px]">
        <div className="flex flex-col gap-4 sm:gap-[16px] w-full lg:w-[300px] shrink-0">
          {titleData?.title && (
            <div className="relative overflow-hidden rounded-[16px] bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] shadow-lg shadow-[#FF8C42]/20 dark:shadow-[#FF8C42]/25 dark:shadow-xl dark:ring-1 dark:ring-white/15 dark:ring-inset">
              <div className="absolute inset-0 opacity-50 pointer-events-none dark:opacity-60">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-3xl dark:bg-white/40" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/25 rounded-full blur-2xl dark:bg-white/35" />
              </div>
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md pointer-events-none dark:bg-black/10 dark:backdrop-blur-lg" aria-hidden />
              <div className="relative z-10 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/35 backdrop-blur-md dark:bg-white/45 dark:backdrop-blur-lg dark:ring-1 dark:ring-white/30">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white/95 dark:text-white">
                    Chaque atelier te fait grandir
                  </span>
                </div>
                <p className="text-xl sm:text-2xl lg:text-[28px] font-black text-white leading-tight drop-shadow-sm dark:drop-shadow-md dark:text-white">
                  Tu es {titleData.title}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-white/90 font-medium dark:text-white/95">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Le prochain palier t&apos;attend — continue à participer aux ateliers
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    className="group w-full min-w-0 bg-white/95 backdrop-blur-md text-[#FF8C42] font-semibold rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm border-0 shadow-md transition-all duration-300 hover:bg-white hover:shadow-[0_0_24px_rgba(255,140,66,0.35)] hover:ring-2 hover:ring-white/60 hover:ring-offset-2 hover:ring-offset-transparent dark:bg-white/90 dark:hover:bg-white dark:hover:shadow-[0_0_28px_rgba(255,140,66,0.4)] dark:hover:ring-white/70"
                    onClick={() => router.push("/workshop-room")}
                  >
                    Accéder à l&apos;e-Atelier
                    <ArrowRight className="h-4 w-4 ml-2 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full min-w-0 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 font-semibold rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm border border-white/40 shadow-sm dark:bg-white/25 dark:border-white/50 dark:hover:bg-white/40 dark:backdrop-blur-lg"
                    onClick={() => router.push("/paliers")}
                  >
                    <Info className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Paliers et récompenses</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Carte Solde — glassmorphisme */}
          <Card className="relative overflow-hidden bg-linear-to-br from-[#C9A0DC] via-[#b890d8] to-[#a67fd4] border-0 text-white rounded-[16px] shadow-lg shadow-[#C9A0DC]/25 dark:shadow-[#C9A0DC]/30 dark:shadow-xl dark:ring-1 dark:ring-white/15 dark:ring-inset">
            <div className="absolute inset-0 opacity-50 pointer-events-none dark:opacity-60">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/25 rounded-full blur-3xl dark:bg-white/35" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-2xl dark:bg-white/30" />
            </div>
            <div className="absolute inset-0 bg-white/20 backdrop-blur-md pointer-events-none dark:bg-black/15 dark:backdrop-blur-lg" aria-hidden />
            <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
              <p className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-white">
                Votre solde actuel
              </p>
              <div className="flex items-end gap-2 sm:gap-4 mb-4 sm:mb-6">
                <p className="text-2xl sm:text-[28px] lg:text-[32px] font-medium leading-none">
                  {creditBalance?.balance || 0}{" "}
                  <span className="text-sm sm:text-base lg:text-[18px]">
                    crédit(s)
                  </span>
                </p>
                <div className="relative flex items-center h-[33px] w-[33.5px]">
                  <div className="absolute left-0 top-[calc(50%+4.5px)] -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-white/35 backdrop-blur-md flex items-center justify-center dark:bg-white/45 dark:backdrop-blur-lg dark:ring-1 dark:ring-white/30">
                    <Coins className="w-5 h-5 text-white/90 dark:text-white" />
                  </div>
                  <div className="absolute left-[28.36%] top-[calc(50%-4.5px)] -translate-y-1/2 w-[24px] h-[24px]">
                    <Coins className="w-6 h-6 text-white/60" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="group w-full min-w-0 bg-white/95 backdrop-blur-md text-[#C9A0DC] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 border-0 shadow-md transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(201,160,220,0.4)] hover:ring-2 hover:ring-white/60 hover:ring-offset-2 hover:ring-offset-transparent dark:bg-white/90 dark:hover:bg-white dark:text-[#a67fd4] dark:hover:shadow-[0_0_24px_rgba(201,160,220,0.35)] dark:hover:ring-white/70"
                  onClick={() => router.push("/buy-credits")}
                >
                  Gérer mon solde
                  <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px] ml-2 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
                <Button
                  variant="outline"
                  className="group w-full min-w-0 bg-white/20 backdrop-blur-md text-white rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 border border-white/40 shadow-sm transition-all duration-300 hover:bg-white/40 hover:border-white/60 hover:shadow-md hover:ring-2 hover:ring-white/40 dark:bg-white/25 dark:border-white/50 dark:hover:bg-white/45 dark:hover:ring-white/50"
                  onClick={() => router.push("/help")}
                >
                  <HelpCircle className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="truncate">Comment ça marche ?</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {mentorConnections && mentorConnections.length > 0 && (
            <Card className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                  <div className="flex items-center gap-2 sm:gap-[7.5px]">
                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      {mentorConnections.length} mentor
                      {mentorConnections.length > 1 ? "s" : ""} suivi
                      {mentorConnections.length > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                    {mentorConnections
                      .slice(0, 12)
                      .map((conn: any, index: number) => {
                        if (index % 4 === 0) {
                          const rowConnections = mentorConnections.slice(
                            index,
                            index + 4
                          );
                          return (
                            <div
                              key={`mentor-row-${rowConnections
                                .map((c: any) => c.connectionId)
                                .join("-")}`}
                              className="flex items-center justify-center -space-x-2 w-full sm:w-[236px] h-[56px] sm:h-[64px]"
                            >
                              {rowConnections.map((c: any, i: number) => (
                                <div
                                  key={c.connectionId}
                                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-[2.4px] sm:border-[3.2px] border-white shrink-0 ${getAvatarColorClass(
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
                              ))}
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
                    Voir mes connexions
                    <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {workshopHistory && workshopHistory.length > 0 && (
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
                    {workshopHistory
                      .slice(0, 3)
                      .map((workshop: any, index: number) => (
                        <div
                          key={workshop.id}
                          className={`border-b border-[#d6dae4] dark:border-[#d6dae4] pb-3 sm:pb-4 ${
                            index === workshopHistory.slice(0, 3).length - 1
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
                    onClick={() => router.push("/workshop-room")}
                  >
                    Accéder à l&apos;e-Atelier
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
                      {acceptedConnections.length} connexion
                      {acceptedConnections.length > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                    {acceptedConnections
                      .slice(0, 12)
                      .map((conn: any, index: number) => {
                        if (index % 4 === 0) {
                          const rowConnections = acceptedConnections.slice(
                            index,
                            index + 4
                          );
                          return (
                            <div
                              key={`connection-row-${rowConnections
                                .map((c: any) => c.connectionId)
                                .join("-")}`}
                              className="flex items-center justify-center -space-x-2 w-full sm:w-[236px] h-[56px] sm:h-[64px]"
                            >
                              {rowConnections.map((c: any, i: number) => (
                                <div
                                  key={c.connectionId}
                                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-[2.4px] sm:border-[3.2px] border-white shrink-0 ${getAvatarColorClass(
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
                              ))}
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
                      Mes demandes d&apos;atelier
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.8px]">
                    Vos demandes d&apos;ateliers envoyées aux mentors
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 flex items-center gap-2 bg-white dark:bg-[rgba(255,255,255,0.08)]">
                    <span className="text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Rechercher...
                    </span>
                    <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[#26547c] dark:text-[#e6e6e6]" />
                  </div>
                  <Button
                    variant="outline"
                    className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] flex items-center gap-2 shrink-0 bg-white dark:bg-transparent"
                    onClick={() => router.push("/workshop-room")}
                  >
                    <span className="hidden sm:inline">Nouvelle conversation</span>
                    <span className="sm:hidden">Nouvelle</span>
                    <Plus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </Button>
                </div>

                <div className="flex flex-col gap-[16px]">
                  {workshopRequests && workshopRequests.length > 0 ? (
                    <>
                      {workshopRequests.map((request: any) => (
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
                          <div className="shrink-0">
                            {request.status === "ACCEPTED" ||
                            request.status === "PENDING" ||
                            request.status === "REJECTED" ? (
                              <StatusBadge status={request.status} />
                            ) : (
                              <Button
                                variant="outline"
                                className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-xs sm:text-sm lg:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] flex items-center gap-2 shrink-0 bg-white dark:bg-transparent"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Êtes-vous sûr de vouloir annuler cette demande ?"
                                    )
                                  ) {
                                    onCancelRequest(request.id);
                                  }
                                }}
                              >
                                Annuler
                                <Trash2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                      <p>Aucune demande pour le moment</p>
                      <Button
                        variant="outline"
                        className="mt-4 border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] bg-white dark:bg-transparent"
                        onClick={() => router.push("/workshop-room")}
                      >
                        Nouvelle conversation
                        <Plus className="h-4 w-4 ml-2" />
                      </Button>
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
                    Vue d&apos;ensemble de mes ateliers
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
                      Aujourd&apos;hui
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
                        apprenantCalendarView === "month" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        apprenantCalendarView === "month"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-l-[8px] rounded-r-0 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-semibold`}
                      onClick={() => setApprenantCalendarView("month")}
                    >
                      Mois
                    </Button>
                    <Button
                      variant={
                        apprenantCalendarView === "week" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        apprenantCalendarView === "week"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-none h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm`}
                      onClick={() => setApprenantCalendarView("week")}
                    >
                      Semaine
                    </Button>
                    <Button
                      variant={
                        apprenantCalendarView === "day" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        apprenantCalendarView === "day"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-none h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm`}
                      onClick={() => setApprenantCalendarView("day")}
                    >
                      Jour
                    </Button>
                    <Button
                      variant={
                        apprenantCalendarView === "agenda"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`${
                        apprenantCalendarView === "agenda"
                          ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                          : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                      } rounded-r-[8px] rounded-l-0 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm`}
                      onClick={() => setApprenantCalendarView("agenda")}
                    >
                      Agenda
                    </Button>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p className="text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                    {formatCalendarMonthYear(apprenantCalendarDate)}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <WorkshopCalendar
                    workshops={confirmedWorkshops || []}
                    height="400px"
                    userRole="APPRENANT"
                    controlledDate={apprenantCalendarDate}
                    controlledView={apprenantCalendarView}
                    onDateChange={setApprenantCalendarDate}
                    onViewChange={(view) => {
                      if (
                        view === "month" ||
                        view === "week" ||
                        view === "day" ||
                        view === "agenda"
                      ) {
                        setApprenantCalendarView(view);
                      }
                    }}
                    onSelectEvent={(workshop) => {
                      router.push(`/workshop/${workshop.id}`);
                    }}
                  />
                </div>
                {(!confirmedWorkshops || confirmedWorkshops.length === 0) && (
                  <p className="text-center text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                    Aucun atelier confirmé. Vos ateliers apparaîtront ici une fois
                    vos demandes acceptées.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
