"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Inbox,
  Calendar,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import {
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import { StatusBadge } from "./StatusBadge";
import { ApprenantDashboardSidebar } from "./ApprenantDashboardSidebar";
import { formatDate, formatTime } from "@/lib/workshop-utils";
import type { WorkshopDetailed, WorkshopBase } from "@/types/workshop";

interface Connection {
  connectionId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
  otherUserPhotoUrl?: string;
  otherUserRole?: string;
}

interface ApprenantDashboardProps {
  readonly creditBalance: { readonly balance: number } | undefined;
  readonly mentorConnections: Connection[];
  readonly workshopHistory: WorkshopBase[] | undefined;
  readonly acceptedConnections: Connection[] | undefined;
  readonly workshopRequests: any[] | undefined;
  readonly confirmedWorkshops: WorkshopDetailed[] | undefined;
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
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-[16px]">
        <ApprenantDashboardSidebar
          titleData={titleData}
          creditBalance={{ balance: 999 }}
          mentorConnections={mentorConnections}
          workshopHistory={workshopHistory}
          acceptedConnections={acceptedConnections}
        />
        <div className="flex flex-col gap-4 sm:gap-[16px] flex-1">
          {/* Section 1: Demandes en attente */}
          <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-6 w-6 text-brand" />
                    <h3 className="text-xl font-semibold text-ls-heading">
                      Mes demandes d&apos;atelier
                    </h3>
                  </div>
                  <p className="text-sm text-ls-muted">
                    Suis l&apos;état de tes demandes envoyées aux mentors.
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
                              variant="ctaDestructive"
                              size="ctaSm"
                              onClick={() => onCancelRequest(request.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-sm text-ls-muted italic">
                      Aucune demande en attente.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Ateliers Confirmés */}
          <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-ls-success" />
                    <h3 className="text-xl font-semibold text-ls-heading">
                      Prochains ateliers confirmés
                    </h3>
                  </div>
                  <p className="text-sm text-ls-muted">
                    Tes rendez-vous de mentorat programmés.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {confirmedWorkshops && confirmedWorkshops.length > 0 ? (
                    confirmedWorkshops.map((workshop) => (
                      <div
                        key={workshop.id}
                        className="bg-card/80 border border-border/50 rounded-2xl p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-black text-ls-heading text-lg leading-tight">
                              {workshop.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-ls-muted font-medium pt-1">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-brand" />
                                {formatDate(workshop.date)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-brand" />
                                {formatTime(workshop.time)} ({workshop.duration} min)
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-brand" />
                                {workshop.isVirtual ? "En ligne" : workshop.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="cta"
                              size="ctaSm"
                            >
                              <a href={`/workshop/${workshop.id}`}>Rejoindre</a>
                            </Button>
                            <Button
                              variant="ctaDestructive"
                              size="ctaSm"
                              onClick={() => onCancelConfirmed(workshop.id)}
                            >
                              <XCircle className="h-4 w-4" />
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-card/50 border-2 border-dashed border-border/50 rounded-2xl">
                      <p className="text-sm text-ls-muted italic">
                        Tu n&apos;as pas encore d&apos;ateliers confirmés.
                      </p>
                      <Button 
                        variant="link" 
                        className="text-brand font-bold mt-2"
                        onClick={() => router.push("/workshop-room")}
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
          <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-brand" />
                    <h3 className="text-xl font-semibold text-ls-heading">
                      Calendrier
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ctaOutline" size="ctaSm" onClick={() => navigateCalendar("prev")}>Précédent</Button>
                    <Button variant="ctaOutline" size="ctaSm" onClick={() => navigateCalendar("today")}>Aujourd&apos;hui</Button>
                    <Button variant="ctaOutline" size="ctaSm" onClick={() => navigateCalendar("next")}>Suivant</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <WorkshopCalendar
                    workshops={(confirmedWorkshops || []) as unknown as WorkshopDetailed[]}
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
  );
}
