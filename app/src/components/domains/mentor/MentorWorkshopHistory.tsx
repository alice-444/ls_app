"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-server-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  GraduationCap,
  ArrowRight,
  Lock,
  BookOpen,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/workshop-utils";
import { renderStars } from "@/lib/rating-utils";
import { useRouter } from "next/navigation";
import type {
  WorkshopBase,
  WorkshopDetailed,
} from "@ls-app/shared";
import { RequestWorkshopParticipationDialog } from "./RequestWorkshopParticipationDialog";

interface MentorWorkshopHistoryProps {
  mentorId: string;
  mentorName?: string;
}

export function MentorWorkshopHistory({
  mentorId,
  mentorName = "",
}: Readonly<MentorWorkshopHistoryProps>) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const isApprentice = userRole === "APPRENANT";

  const {
    data: workshopsData,
    isLoading,
    error,
  } = trpc.mentor.getPublicWorkshops.useQuery(
    { mentorId },
    {
      enabled: !!mentorId && !!session,
    }
  );

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Historique des ateliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">
              Authentification requise
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Vous devez être connecté pour voir l'historique des ateliers.
            </p>
            <Button onClick={() => router.push("/login")}>Se connecter</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Historique des ateliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !workshopsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Historique des ateliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Erreur lors du chargement des ateliers.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { upcoming, past } = workshopsData;
  const hasWorkshops = upcoming.length > 0 || past.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Historique des ateliers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasWorkshops ? (
          <>
            {upcoming.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 text-lg">
                  Ateliers à venir ({upcoming.length})
                </h3>
                <div className="space-y-4">
                  {upcoming.map((workshop: WorkshopBase) => (
                    <div
                      key={workshop.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">
                            {workshop.title}
                          </h4>
                          {workshop.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {workshop.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {isApprentice && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedWorkshopId(workshop.id);
                                setShowRequestDialog(true);
                              }}
                              className="gap-1"
                            >
                              <BookOpen className="h-4 w-4" />
                              Demander à participer
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/workshop/${workshop.id}`)
                            }
                          >
                            Voir détails
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {workshop.date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(workshop.date)}</span>
                          </div>
                        )}
                        {workshop.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatTime(workshop.time)}
                              {workshop.duration &&
                                ` • ${workshop.duration} min`}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {workshop.isVirtual ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>
                            {workshop.isVirtual
                              ? "En ligne"
                              : workshop.location || "Lieu à définir"}
                          </span>
                        </div>
                        {workshop.maxParticipants && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Max {workshop.maxParticipants} participants
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                  )}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-lg">
                  Ateliers passés ({past.length})
                </h3>
                <div className="space-y-4">
                  {past.map((workshop: WorkshopDetailed) => (
                    <div
                      key={workshop.id}
                      className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">
                            {workshop.title}
                          </h4>
                          {workshop.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {workshop.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/workshop/${workshop.id}`)
                          }
                          className="ml-4"
                        >
                          Voir détails
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        {workshop.date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(workshop.date)}</span>
                          </div>
                        )}
                        {workshop.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatTime(workshop.time)}
                              {workshop.duration &&
                                ` • ${workshop.duration} min`}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {workshop.isVirtual ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>
                            {workshop.isVirtual
                              ? "En ligne"
                              : workshop.location || "Lieu à définir"}
                          </span>
                        </div>
                      </div>
                      {(workshop.feedbackCount ?? 0) > 0 &&
                        workshop.averageRating && (
                          <div className="flex items-center gap-2 pt-3 border-t">
                            <div className="flex items-center">
                              {renderStars(workshop.averageRating, "sm")}
                            </div>
                            <span className="text-sm font-medium">
                              {workshop.averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({workshop.feedbackCount} avis)
                            </span>
                          </div>
                        )}
                    </div>
                  )
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Aucun atelier public disponible pour le moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Les ateliers publics apparaîtront ici une fois qu'ils seront
              publiés par le mentor.
            </p>
          </div>
        )}
      </CardContent>

      {isApprentice && (
        <RequestWorkshopParticipationDialog
          open={showRequestDialog}
          onOpenChange={(open) => {
            setShowRequestDialog(open);
            if (!open) {
              setSelectedWorkshopId(null);
            }
          }}
          mentorId={mentorId}
          mentorName={mentorName}
          workshopId={selectedWorkshopId}
        />
      )}
    </Card>
  );
}
