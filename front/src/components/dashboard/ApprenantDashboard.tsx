"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Trash2,
  Inbox,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import {
  formatWorkshopDate,
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import { StatusBadge } from "./StatusBadge";
import { ApprenantDashboardSidebar } from "./ApprenantDashboardSidebar";

interface Connection {
  connectionId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
  otherUserPhotoUrl?: string;
  otherUserRole?: string;
}

interface WorkshopHistoryItem {
  id: string;
  title: string;
  date: string | Date | null;
}

interface WorkshopRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  preferredDate: string | Date | null;
  rejectionReason?: string | null;
}

interface ConfirmedWorkshop {
  id: string;
  title: string;
  description: string | null;
  date: string | Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
}

interface ApprenantDashboardProps {
  readonly creditBalance: { readonly balance: number } | undefined;
  readonly mentorConnections: Connection[];
  readonly workshopHistory: WorkshopHistoryItem[] | undefined;
  readonly acceptedConnections: Connection[] | undefined;
  readonly workshopRequests: WorkshopRequest[] | undefined;
  readonly confirmedWorkshops: ConfirmedWorkshop[] | undefined;
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
  const [apprenantCalendarDate, setApprenantCalendarDate] = useState(new Date());
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
        <ApprenantDashboardSidebar
          titleData={titleData}
          creditBalance={creditBalance}
          mentorConnections={mentorConnections}
          workshopHistory={workshopHistory}
          acceptedConnections={acceptedConnections}
        />

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
                    workshopRequests.map((request) => (
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
                          {request.status === "REJECTED" && request.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-md">
                              <p className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Motif du refus :
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-300 italic mt-1">
                                "{request.rejectionReason}"
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <StatusBadge status={request.status} />
                          {request.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#d6dae4] rounded-[32px] text-[#26547c] dark:text-[#e6e6e6] hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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
                              <Trash2 className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                          {request.status === "ACCEPTED" && (
                            <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] italic">
                              Annulation possible via l'atelier
                            </p>
                          )}
                        </div>
                      </div>
                    ))
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
                    {(["today", "prev", "next"] as const).map((action) => (
                      <Button
                        key={action}
                        variant="outline"
                        size="sm"
                        className="border border-[#d6dae4] dark:border-[#d6dae4] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]"
                        onClick={() => navigateCalendar(action)}
                      >
                        {action === "today"
                          ? "Aujourd'hui"
                          : action === "prev"
                          ? "Précédent"
                          : "Suivant"}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center flex-wrap gap-0">
                    {(
                      [
                        { view: "month", label: "Mois", roundedClass: "rounded-l-[8px] rounded-r-0" },
                        { view: "week", label: "Semaine", roundedClass: "rounded-none" },
                        { view: "day", label: "Jour", roundedClass: "rounded-none" },
                        { view: "agenda", label: "Agenda", roundedClass: "rounded-r-[8px] rounded-l-0" },
                      ] as const
                    ).map(({ view, label, roundedClass }) => (
                      <Button
                        key={view}
                        variant={apprenantCalendarView === view ? "default" : "outline"}
                        size="sm"
                        className={`${
                          apprenantCalendarView === view
                            ? "bg-[#ffb647] border border-[#ffb647] text-[#161616]"
                            : "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]"
                        } ${roundedClass} h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-semibold`}
                        onClick={() => setApprenantCalendarView(view)}
                      >
                        {label}
                      </Button>
                    ))}
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
                    Aucun atelier confirmé. Vos ateliers apparaîtront ici une
                    fois vos demandes acceptées.
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
