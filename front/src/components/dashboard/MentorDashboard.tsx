"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Search, Users } from "lucide-react";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import {
  formatWorkshopDate,
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import { AllWorkshopRequestsDialog } from "./AllWorkshopRequestsDialog";
import { StatusBadge } from "./StatusBadge";

interface MentorDashboardProps {
  readonly mentorStats: {
    readonly creditsEarned: number;
    readonly studentsHelped: number;
  };
  readonly pastWorkshops: any[];
  readonly acceptedConnections: any[] | undefined;
  readonly mentorWorkshopRequests: any[] | undefined;
  readonly mentorWorkshops: any[] | undefined;
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

  const navigateCalendar = createNavigateCalendar(
    mentorCalendarDate,
    mentorCalendarView,
    setMentorCalendarDate
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-[16px]">
        <div className="flex flex-col gap-[16px] w-full lg:w-[300px] shrink-0">
          <Card className="relative overflow-hidden bg-linear-to-br from-[#26547c] to-[#4A90E2] border-0 text-white rounded-[16px]">
            <CardContent className="p-8">
              <p className="text-base font-semibold mb-4 text-white">
                Crédits gagnés
              </p>
              <div className="flex items-end gap-4 mb-6">
                <p className="text-[32px] font-medium leading-none">
                  {mentorStats?.creditsEarned || 0}{" "}
                  <span className="text-[18px]">crédits</span>
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-white/20 rounded-full" />
                  <div className="w-6 h-6 bg-white/20 rounded-full" />
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full bg-white text-[#26547c] hover:bg-white/90 rounded-[32px] h-10 px-4 py-2 text-base font-semibold flex items-center justify-center gap-2 border border-[#d6dae4]"
                onClick={() => router.push("/my-workshops")}
              >
                Voir mes ateliers
                <ArrowRight className="h-[18px] w-[18px] ml-2" />
              </Button>
            </CardContent>
          </Card>

          {mentorStats && mentorStats.studentsHelped > 0 && (
            <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
              <CardContent className="p-8">
                <div className="flex flex-col gap-[32px]">
                  <div className="flex items-center gap-[7.5px]">
                    <BookOpen className="h-8 w-8 text-[#26547c]" />
                    <h3 className="text-2xl font-semibold text-[#26547c]">
                      {mentorStats.studentsHelped} apprenant
                      {mentorStats.studentsHelped > 1 ? "s" : ""} aidé(s)
                      {mentorStats.studentsHelped > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-[16px]">
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
                          key={rowIndex}
                          className="flex items-center justify-center -space-x-2 w-[236px] h-[64px]"
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
                                  key={avatarIndex}
                                  className={`w-16 h-16 rounded-full ${colors[colorIndex]} border-[3.2px] border-white shrink-0`}
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
                    className="w-full border border-[#d6dae4] rounded-[32px] h-10 px-4 py-2 text-base font-semibold text-[#26547c] flex items-center justify-center gap-2 bg-white"
                    onClick={() => router.push("/my-workshops")}
                  >
                    Voir mes ateliers
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {pastWorkshops && pastWorkshops.length > 0 && (
            <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
              <CardContent className="p-8">
                <div className="flex flex-col gap-[32px]">
                  <div className="flex items-center gap-[7.5px]">
                    <BookOpen className="h-8 w-8 text-[#26547c]" />
                    <h3 className="text-2xl font-semibold text-[#26547c]">
                      Ateliers passés
                    </h3>
                  </div>
                  <div className="flex flex-col gap-[16px]">
                    {pastWorkshops
                      .slice(0, 3)
                      .map((workshop: any, index: number) => (
                        <div
                          key={workshop.id}
                          className={`border-b border-[#d6dae4] pb-4 ${
                            index === pastWorkshops.slice(0, 3).length - 1
                              ? "border-b-0 pb-0"
                              : ""
                          }`}
                        >
                          <p className="text-base font-semibold text-[#26547c] mb-2">
                            {workshop.title}
                          </p>
                          <p className="text-base text-[rgba(38,84,124,0.64)]">
                            {formatWorkshopDate(workshop.date)}
                          </p>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border border-[#d6dae4] rounded-[32px] h-10 px-4 py-2 text-base font-semibold text-[#26547c] flex items-center justify-center gap-2 bg-white"
                    onClick={() => router.push("/my-workshops")}
                  >
                    Voir les ateliers
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {acceptedConnections && acceptedConnections.length > 0 && (
            <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
              <CardContent className="p-8">
                <div className="flex flex-col gap-[32px]">
                  <div className="flex items-center gap-[7.5px]">
                    <Users className="h-8 w-8 text-[#26547c]" />
                    <h3 className="text-2xl font-semibold text-[#26547c]">
                      {acceptedConnections.length} connexion(s)
                      {acceptedConnections.length > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-[16px]">
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
                              key={index}
                              className="flex items-center justify-center -space-x-2 w-[236px] h-[64px]"
                            >
                              {rowConnections.map((c: any, i: number) => {
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
                                    className={`w-16 h-16 rounded-full border-[3.2px] border-white shrink-0 ${getConnectionColorClass(
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
                    className="w-full border border-[#d6dae4] rounded-[32px] h-10 px-4 py-2 text-base font-semibold text-[#26547c] flex items-center justify-center gap-2 bg-white"
                    onClick={() => router.push("/network")}
                  >
                    Voir les connexions
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-[16px] flex-1">
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col gap-[32px]">
                <div className="flex flex-col gap-[16px]">
                  <div className="flex items-center gap-[7.5px]">
                    <BookOpen className="h-8 w-8 text-[#26547c]" />
                    <h3 className="text-2xl font-semibold text-[#26547c]">
                      Demande(s) reçue(s)
                    </h3>
                  </div>
                  <p className="text-base text-[#26547c] tracking-[-0.8px]">
                    Les demandes d'ateliers que vous avez reçues
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 border border-[#d6dae4] rounded-[32px] h-10 px-4 py-2 flex items-center gap-2 bg-white">
                    <span className="text-base font-semibold text-[#26547c]">
                      Rechercher...
                    </span>
                    <Search className="h-[18px] w-[18px] text-[#26547c]" />
                  </div>
                </div>

                <div className="flex flex-col gap-[16px]">
                  {mentorWorkshopRequests &&
                  mentorWorkshopRequests.length > 0 ? (
                    <>
                      {mentorWorkshopRequests
                        .slice(0, 3)
                        .map((request: any) => (
                          <div
                            key={request.id}
                            className="bg-white border border-[#d6dae4] rounded-[16px] h-[126px] px-5 py-2 flex items-center justify-between"
                          >
                            <div className="flex flex-col gap-[8px] justify-center">
                              <p className="text-base font-bold text-[#26547c]">
                                {request.title}
                              </p>
                              <p className="text-base text-[#161616]">
                                {request.description ||
                                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit"}
                              </p>
                              <p className="text-base text-[rgba(38,84,124,0.64)]">
                                {formatWorkshopDate(request.preferredDate)}
                              </p>
                            </div>
                            {request.status === "ACCEPTED" ||
                            request.status === "PENDING" ||
                            request.status === "REJECTED" ? (
                              <StatusBadge status={request.status} />
                            ) : null}
                          </div>
                        ))}
                      {mentorWorkshopRequests.length > 3 && (
                        <Button
                          variant="outline"
                          className="w-full border border-[#d6dae4] rounded-[32px] h-10 px-4 py-2 text-base font-semibold text-[#26547c] flex items-center justify-center gap-2 bg-white"
                          onClick={() => setShowAllRequestsDialog(true)}
                        >
                          Voir toutes les demandes (
                          {mentorWorkshopRequests.length})
                          <ArrowRight className="h-[18px] w-[18px]" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-[rgba(38,84,124,0.64)]">
                      <p>Aucune demande reçue pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#d6dae4] rounded-[16px] bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col gap-[32px]">
                <div className="flex flex-col gap-[16px]">
                  <div className="flex items-center gap-[7.5px]">
                    <BookOpen className="h-8 w-8 text-[#26547c]" />
                    <h3 className="text-2xl font-semibold text-[#26547c]">
                      Calendrier de mes ateliers
                    </h3>
                  </div>
                  <p className="text-base text-[#26547c] tracking-[-0.8px]">
                    Vue d'ensemble de vos ateliers
                  </p>
                </div>

                <div className="flex items-center justify-between">
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
                        mentorCalendarView === "month" ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        mentorCalendarView === "month"
                          ? "bg-[#ffb647] border border-[#ffb647] text-white"
                          : "border border-[#ffb647] text-[#ffb647]"
                      } rounded-l-[8px] rounded-r-0 h-10 px-4 text-sm font-semibold`}
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
                          ? "bg-[#ffb647] border border-[#ffb647] text-white"
                          : "border border-[#ffb647] text-[#ffb647]"
                      } rounded-none h-10 px-4 text-sm`}
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
                          ? "bg-[#ffb647] border border-[#ffb647] text-white"
                          : "border border-[#ffb647] text-[#ffb647]"
                      } rounded-none h-10 px-4 text-sm`}
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
                          ? "bg-[#ffb647] border border-[#ffb647] text-white"
                          : "border border-[#ffb647] text-[#ffb647]"
                      } rounded-r-[8px] rounded-l-0 h-10 px-4 text-sm`}
                      onClick={() => setMentorCalendarView("agenda")}
                    >
                      Agenda
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-base font-semibold text-[#26547c]">
                    {formatCalendarMonthYear(mentorCalendarDate)}
                  </p>
                </div>

                <WorkshopCalendar
                  workshops={mentorWorkshops || []}
                  height="600px"
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
            </CardContent>
          </Card>
        </div>
      </div>

      <AllWorkshopRequestsDialog
        open={showAllRequestsDialog}
        onOpenChange={setShowAllRequestsDialog}
        requests={mentorWorkshopRequests}
      />
    </>
  );
}
