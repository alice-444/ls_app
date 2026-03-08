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
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import {
  formatWorkshopDate,
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import { StatusBadge } from "./StatusBadge";
import { ApprenantDashboardSidebar } from "./ApprenantDashboardSidebar";
import { formatDate, formatTime } from "@/lib/workshop-utils";

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
  readonly onCancelConfirmed: (workshopId: string) => void;
}

export function ApprenantDashboard({
  creditBalance,
  mentorConnections,
  workshopHistory,
  acceptedConnections,
  workshopRequests,
  confirmedWorkshops,
  onCancelRequest,
  onCancelConfirmed,
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
          {/* Section 1: Demandes en attente */}
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-6 w-6 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Mes demandes d&apos;atelier
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Suivez l'état de vos demandes envoyées aux mentors.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {workshopRequests && workshopRequests.length > 0 ? (
                    workshopRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-ls-bg/30 border border-ls-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-ls-heading truncate">
                            {request.title}
                          </p>
                          <p className="text-xs text-ls-text-light mt-1">
                            Souhaité le : {formatDate(request.preferredDate)}
                          </p>
                          {request.status === "REJECTED" && request.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100 text-xs text-red-600">
                              <span className="font-bold">Motif du refus :</span> "{request.rejectionReason}"
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={request.status} />
                          {request.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-red-200 text-red-600 hover:bg-red-50 h-8"
                              onClick={() => onCancelRequest(request.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-sm text-muted-foreground italic">
                      Aucune demande en attente.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Ateliers Confirmés (Nouveau pour PRP 22) */}
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-ls-success" />
                    <h3 className="text-xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Prochains ateliers confirmés
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vos rendez-vous de mentorat programmés.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {confirmedWorkshops && confirmedWorkshops.length > 0 ? (
                    confirmedWorkshops.map((workshop) => (
                      <div
                        key={workshop.id}
                        className="bg-white border border-ls-border rounded-2xl p-5 hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-black text-ls-heading text-lg leading-tight">
                              {workshop.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-ls-text-light font-medium pt-1">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-ls-blue" />
                                {formatDate(workshop.date)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-ls-blue" />
                                {formatTime(workshop.time)} ({workshop.duration} min)
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-ls-blue" />
                                {workshop.isVirtual ? "En ligne" : workshop.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="rounded-full bg-ls-blue hover:bg-ls-blue/90 font-bold h-9"
                            >
                              <a href={`/workshop/${workshop.id}`}>Rejoindre</a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-red-200 text-red-600 hover:bg-red-50 h-9 px-4"
                              onClick={() => onCancelConfirmed(workshop.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-ls-bg/20 border-2 border-dashed border-ls-border rounded-2xl">
                      <p className="text-sm text-muted-foreground italic">
                        Vous n'avez pas encore d'ateliers confirmés.
                      </p>
                      <Button 
                        variant="link" 
                        className="text-ls-blue font-bold mt-2"
                        onClick={() => router.push("/workshops")}
                      >
                        Parcourir le catalogue
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Calendrier */}
          <Card className="border border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-[#26547c] dark:text-[#e6e6e6]" />
                    <h3 className="text-xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                      Calendrier
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => navigateCalendar("prev")}>Précédent</Button>
                    <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => navigateCalendar("today")}>Aujourd'hui</Button>
                    <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => navigateCalendar("next")}>Suivant</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <WorkshopCalendar
                    workshops={confirmedWorkshops || []}
                    height="450px"
                    userRole="APPRENANT"
                    controlledDate={apprenantCalendarDate}
                    controlledView={apprenantCalendarView}
                    onDateChange={setApprenantCalendarDate}
                    onViewChange={(view) => {
                      if (["month", "week", "day", "agenda"].includes(view)) {
                        setApprenantCalendarView(view as any);
                      }
                    }}
                    onSelectEvent={(workshop) => router.push(`/workshop/${workshop.id}`)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
