"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const navigateCalendar = createNavigateCalendar(
    apprenantCalendarDate,
    apprenantCalendarView,
    setApprenantCalendarDate
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-[16px]">
      <div className="flex flex-col gap-4 sm:gap-[16px] w-full lg:w-[300px] shrink-0">
        <Card className="relative overflow-hidden bg-linear-to-br from-[#26547c] to-[#4A90E2] border-0 text-white rounded-[16px]">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
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
                <div className="absolute left-0 top-[calc(50%+4.5px)] -translate-y-1/2 w-[24px] h-[24px]">
                  <Coins className="w-6 h-6 text-white/80" />
                </div>
                <div className="absolute left-[28.36%] top-[calc(50%-4.5px)] -translate-y-1/2 w-[24px] h-[24px]">
                  <Coins className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full bg-white text-[#26547c] hover:bg-white/90 rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 border border-[#d6dae4]"
              onClick={() => router.push("/buy-credits")}
            >
              Gérer mon solde
              <Coins className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </Button>
          </CardContent>
        </Card>

        {mentorConnections && mentorConnections.length > 0 && (
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                <div className="flex items-center gap-2 sm:gap-[7.5px]">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c]" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c]">
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
                  className="w-full border border-[#d6dae4] rounded-[32px] h-10 px-4 py-2 text-base font-semibold text-[#26547c] flex items-center justify-center gap-2 bg-white"
                  onClick={() => router.push("/network")}
                >
                  Voir mes connexions
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {workshopHistory && workshopHistory.length > 0 && (
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                <div className="flex items-center gap-2 sm:gap-[7.5px]">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c]" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c]">
                    Ateliers passés
                  </h3>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
                  {workshopHistory
                    .slice(0, 3)
                    .map((workshop: any, index: number) => (
                      <div
                        key={workshop.id}
                        className={`border-b border-[#d6dae4] pb-3 sm:pb-4 ${
                          index === workshopHistory.slice(0, 3).length - 1
                            ? "border-b-0 pb-0"
                            : ""
                        }`}
                      >
                        <p className="text-sm sm:text-base font-semibold text-[#26547c] mb-1 sm:mb-2">
                          {workshop.title}
                        </p>
                        <p className="text-xs sm:text-sm lg:text-base text-[rgba(38,84,124,0.64)]">
                          {formatWorkshopDate(workshop.date)}
                        </p>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full border border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] flex items-center justify-center gap-2 bg-white"
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
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
                <div className="flex items-center gap-2 sm:gap-[7.5px]">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c]" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c]">
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
                                className={`w-16 h-16 rounded-full border-[3.2px] border-white shrink-0 ${getAvatarColorClass(
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
                  className="w-full border border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] flex items-center justify-center gap-2 bg-white"
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
        {workshopRequests && workshopRequests.length > 0 && (
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px] mb-4 sm:mb-6 lg:mb-8">
                <div className="flex items-center gap-2 sm:gap-[7.5px]">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c]" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#26547c]">
                    Mes demandes d'atelier
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-[#26547c] tracking-[-0.8px]">
                  Vos demandes d'ateliers envoyées aux mentors
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex-1 border border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 flex items-center gap-2 bg-white">
                  <span className="text-sm sm:text-base font-semibold text-[#26547c]">
                    Rechercher...
                  </span>
                  <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[#26547c]" />
                </div>
                <Button
                  variant="outline"
                  className="border border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-[#26547c] flex items-center gap-2 shrink-0 bg-white w-full sm:w-auto"
                  onClick={() => router.push("/workshop-room")}
                >
                  <span className="hidden sm:inline">
                    Nouvelle conversation
                  </span>
                  <span className="sm:hidden">Nouvelle</span>
                  <Plus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </Button>
              </div>

              <div className="flex flex-col gap-[16px]">
                {workshopRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="bg-white border border-[#d6dae4] rounded-[16px] min-h-[126px] px-3 sm:px-4 lg:px-5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex flex-col gap-2 sm:gap-[8px] justify-center flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-[#26547c] truncate">
                        {request.title}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-[#161616] line-clamp-2">
                        {request.description ||
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit"}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-[rgba(38,84,124,0.64)]">
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
                          className="border border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 py-2 text-xs sm:text-sm lg:text-base font-semibold text-[#26547c] flex items-center gap-2 shrink-0"
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
              </div>
            </CardContent>
          </Card>
        )}

        {confirmedWorkshops && confirmedWorkshops.length > 0 && (
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col gap-[16px] mb-8">
                <div className="flex items-center gap-[7.5px]">
                  <BookOpen className="h-8 w-8 text-[#26547c]" />
                  <h3 className="text-2xl font-semibold text-[#26547c]">
                    Calendrier de mes ateliers
                  </h3>
                </div>
                <p className="text-base text-[#26547c] tracking-[-0.8px]">
                  Vue d'ensemble de mes ateliers
                </p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-[#d6dae4] rounded-[32px] h-10 px-4 text-base font-semibold text-[#26547c]"
                    onClick={() => navigateCalendar("today")}
                  >
                    Aujourd'hui
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-[#d6dae4] rounded-[32px] h-10 px-4 text-base font-semibold text-[#26547c]"
                    onClick={() => navigateCalendar("prev")}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-[#d6dae4] rounded-[32px] h-10 px-4 text-base font-semibold text-[#26547c]"
                    onClick={() => navigateCalendar("next")}
                  >
                    Suivant
                  </Button>
                </div>
                <div className="flex items-center">
                  <Button
                    variant={
                      apprenantCalendarView === "month" ? "default" : "outline"
                    }
                    size="sm"
                    className={`${
                      apprenantCalendarView === "month"
                        ? "bg-[#ffb647] border border-[#ffb647] text-white"
                        : "border border-[#ffb647] text-[#ffb647]"
                    } rounded-l-[8px] rounded-r-0 h-10 px-4 text-sm font-semibold`}
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
                        ? "bg-[#ffb647] border border-[#ffb647] text-white"
                        : "border border-[#ffb647] text-[#ffb647]"
                    } rounded-none h-10 px-4 text-sm`}
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
                        ? "bg-[#ffb647] border border-[#ffb647] text-white"
                        : "border border-[#ffb647] text-[#ffb647]"
                    } rounded-none h-10 px-4 text-sm`}
                    onClick={() => setApprenantCalendarView("day")}
                  >
                    Jour
                  </Button>
                  <Button
                    variant={
                      apprenantCalendarView === "agenda" ? "default" : "outline"
                    }
                    size="sm"
                    className={`${
                      apprenantCalendarView === "agenda"
                        ? "bg-[#ffb647] border border-[#ffb647] text-white"
                        : "border border-[#ffb647] text-[#ffb647]"
                    } rounded-r-[8px] rounded-l-0 h-10 px-4 text-sm`}
                    onClick={() => setApprenantCalendarView("agenda")}
                  >
                    Agenda
                  </Button>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <p className="text-sm sm:text-base font-semibold text-[#26547c]">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
