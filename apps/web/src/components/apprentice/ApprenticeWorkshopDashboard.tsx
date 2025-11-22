"use client";

import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock as ClockIcon,
  History,
  Coins,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import {
  formatDate,
  formatTime,
  calculateEndTime,
  formatTimeRange,
} from "@/lib/workshop-utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CancelWorkshopRegistrationDialog } from "@/components/workshop/CancelWorkshopRegistrationDialog";
import { toast } from "sonner";
import { useState } from "react";
import { X, Users, Plus } from "lucide-react";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  date: Date | string | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  creator?: {
    user?: {
      name: string | null;
    };
  };
  requestId?: string | null;
  createdAt?: Date | string;
}

function getWorkshopStatus(workshop: Workshop): "confirmed" | "pending" {
  if (workshop.date && workshop.time) {
    return "confirmed";
  }
  return "pending";
}

export function ApprenticeWorkshopDashboard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  
  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const [cancelDialogWorkshop, setCancelDialogWorkshop] =
    useState<Workshop | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedWorkshopForRequest, setSelectedWorkshopForRequest] = useState<{
    workshopId: string | null;
    mentorId: string;
    mentorName: string;
  } | null>(null);

  const { data: upcomingWorkshops, isLoading: isLoadingUpcoming } =
    trpc.workshop.getUpcomingWorkshops.useQuery(undefined, {
      enabled: !!session && userRole === "APPRENANT",
      refetchOnWindowFocus: true,
    });

  const { data: availableWorkshops, isLoading: isLoadingAvailable } =
    trpc.workshop.getAvailableWorkshops.useQuery(undefined, {
      enabled: !!session && userRole === "APPRENANT",
      refetchOnWindowFocus: true,
    });

  const { data: workshopHistory, isLoading: isLoadingHistory } =
    trpc.workshop.getWorkshopHistory.useQuery(undefined, {
      enabled: !!session && userRole === "APPRENANT",
      refetchOnWindowFocus: true,
    });

  const utils = trpc.useUtils();

  const cancelMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée avec succès");
      utils.workshop.getUpcomingWorkshops.invalidate();
      setCancelDialogWorkshop(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const handleCancelClick = (workshop: Workshop) => {
    setCancelDialogWorkshop(workshop);
  };

  const handleCancelConfirm = (reason?: string) => {
    if (cancelDialogWorkshop) {
      cancelMutation.mutate({
        workshopId: cancelDialogWorkshop.id,
        cancellationReason: reason,
      });
    }
  };

  function isWorkshopPast(workshop: Workshop): boolean {
    if (!workshop.date || !workshop.time) return false;
    const endTime = calculateEndTime(
      workshop.date,
      workshop.time,
      workshop.duration
    );
    if (!endTime) return false;
    return endTime < new Date();
  }

  const handleJoinWorkshop = (workshop: any) => {
    if (workshop.creator?.id && workshop.creator?.user?.name) {
      setSelectedWorkshopForRequest({
        workshopId: workshop.id,
        mentorId: workshop.creator.id,
        mentorName: workshop.creator.user.name,
      });
      setShowRequestDialog(true);
    }
  };

  if (isLoadingUpcoming || isLoadingAvailable || isLoadingHistory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  function getWorkshopFinalStatus(workshop: Workshop): string {
    if (workshop.status === "CANCELLED") {
      return "Annulé";
    }
    return "Terminé";
  }

  // TODO: Implement credit balance
  const creditBalance = 150;
  const isLowBalance = creditBalance <= 0 || creditBalance < 50;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-linear-to-br from-violet-600 to-indigo-600 text-white border-0 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  {isLowBalance && (
                    <Badge
                      variant="destructive"
                      className="bg-red-500/90 hover:bg-red-500 text-white border-0"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Solde faible
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-violet-100 font-medium mb-1">
                    Solde de crédits
                  </p>
                  <p className="text-4xl font-bold tracking-tight">
                    {creditBalance}
                  </p>
                </div>
                {isLowBalance && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    Recharger
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {workshopHistory?.length || 0}
                </span>
                <span className="text-sm text-muted-foreground mb-1.5">
                  ateliers terminés
                </span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Niveau actuel</span>
                  <span className="font-medium">Débutant</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[25%] rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <History className="w-4 h-4 text-muted-foreground" />
                Historique récent
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {workshopHistory && workshopHistory.length > 0 ? (
                <div className="divide-y">
                  {workshopHistory.slice(0, 3).map((workshop: Workshop) => {
                    const finalStatus = getWorkshopFinalStatus(workshop);
                    return (
                      <div
                        key={workshop.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm line-clamp-1 text-slate-900 dark:text-slate-100">
                            {workshop.title}
                          </h4>
                          <Badge
                            variant={
                              finalStatus === "Annulé"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px] h-5 px-1.5"
                          >
                            {finalStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(workshop.date)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              router.push(`/workshop/${workshop.id}`)
                            }
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400 hover:text-indigo-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {workshopHistory.length > 3 && (
                    <div className="p-3 text-center border-t bg-slate-50/50 dark:bg-slate-900/30">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-auto p-0"
                      >
                        Voir tout ({workshopHistory.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 px-4 text-muted-foreground">
                  <p className="text-sm">Aucun historique</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Users className="w-4 h-4 text-muted-foreground" />
                Mon Réseau
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connectez-vous avec des mentors et des apprenants
                </p>
                <div className="flex -space-x-2 overflow-hidden py-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-500"
                    >
                      ?
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => router.push("/workshop-room")}
                >
                  <Users className="w-3 h-3 mr-2" />
                  Construire mon réseau
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-md bg-white dark:bg-slate-950 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Mes Ateliers à Venir
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Vos prochaines sessions d'apprentissage
                  </CardDescription>
                </div>
                {upcomingWorkshops && upcomingWorkshops.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800"
                  >
                    {upcomingWorkshops.length} à venir
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingWorkshops && upcomingWorkshops.length > 0 ? (
                <div className="space-y-4">
                  {upcomingWorkshops.map((workshop: Workshop) => {
                    const status = getWorkshopStatus(workshop);
                    return (
                      <div
                        key={workshop.id}
                        className="group relative bg-white dark:bg-slate-900 border rounded-xl p-5 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        <div
                          className={`absolute top-0 left-0 w-1 h-full rounded-l-xl transition-colors ${
                            status === "confirmed"
                              ? "bg-emerald-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pl-2">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between md:justify-start md:gap-3">
                              <h3 className="font-semibold text-lg leading-tight text-slate-900 dark:text-slate-100">
                                {workshop.title}
                              </h3>
                              {status === "confirmed" ? (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shadow-none">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Confirmé
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 shadow-none">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  En attente
                                </Badge>
                              )}
                            </div>

                            {workshop.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {workshop.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                              {status === "confirmed" ? (
                                <>
                                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span className="font-medium">
                                      {formatDate(workshop.date)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    <span>
                                      {formatTimeRange(
                                        workshop.time,
                                        workshop.duration
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                    {workshop.isVirtual ? (
                                      <ExternalLink className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <MapPin className="w-4 h-4 text-slate-500" />
                                    )}
                                    <span>
                                      {workshop.isVirtual
                                        ? "En ligne"
                                        : workshop.location ||
                                          "Lieu à confirmer"}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md text-sm">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>En attente de validation</span>
                                </div>
                              )}
                            </div>

                            {workshop.creator?.user?.name && (
                              <div className="flex items-center gap-2 pt-1">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                  {workshop.creator.user.name.charAt(0)}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  Mentor:{" "}
                                  <span className="font-medium text-foreground">
                                    {workshop.creator.user.name}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 mt-2 md:mt-0 md:min-w-[120px]">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(`/workshop/${workshop.id}`)
                              }
                              className="w-full shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Détails
                            </Button>
                            {status === "confirmed" &&
                              !isWorkshopPast(workshop) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/30"
                                  onClick={() => handleCancelClick(workshop)}
                                >
                                  Annuler
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                  <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun atelier programmé
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Découvrez nos ateliers disponibles et commencez votre
                    apprentissage dès maintenant !
                  </p>
                  <Button
                    onClick={() => router.push("/workshop-room")}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Parcourir le Catalogue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Ateliers à la une
              </h2>
              <Button
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={() => router.push("/workshop-room")}
              >
                Tout voir <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {availableWorkshops && availableWorkshops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableWorkshops.map((workshop: any) => (
                  <Card
                    key={workshop.id}
                    className="group overflow-hidden border hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white dark:bg-slate-950"
                  >
                    <div className="h-2 bg-linear-to-r from-blue-500 to-cyan-500"></div>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        {workshop.topic && (
                          <Badge
                            variant="secondary"
                            className="mb-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border-0"
                          >
                            {workshop.topic}
                          </Badge>
                        )}
                        {workshop.maxParticipants && (
                          <Badge
                            variant="outline"
                            className="text-xs border-slate-200 text-slate-500"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {workshop.apprenticeId ? 1 : 0}/
                            {workshop.maxParticipants}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {workshop.title}
                      </CardTitle>
                      {workshop.creator?.user?.name && (
                        <CardDescription className="flex items-center gap-1.5 mt-1">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {workshop.creator.user.name.charAt(0)}
                          </div>
                          {workshop.creator.user.name}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      {workshop.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                          {workshop.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm">
                        {workshop.date && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 opacity-70 text-indigo-500" />
                            {formatDate(workshop.date)}
                          </div>
                        )}
                        {workshop.time && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4 opacity-70 text-indigo-500" />
                            {formatTimeRange(workshop.time, workshop.duration)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0 mt-auto flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
                        onClick={() => router.push(`/workshop/${workshop.id}`)}
                      >
                        Détails
                      </Button>
                      <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        onClick={() => handleJoinWorkshop(workshop)}
                      >
                        Rejoindre
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Aucun atelier disponible
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Tous les ateliers ouverts sont déjà complets ou vous y êtes
                    déjà inscrit.
                  </p>
                  <Button onClick={() => router.push("/workshop-room")}>
                    Voir tous les ateliers
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {cancelDialogWorkshop && cancelDialogWorkshop.date && (
        <CancelWorkshopRegistrationDialog
          open={!!cancelDialogWorkshop}
          onOpenChange={(open) => {
            if (!open) {
              setCancelDialogWorkshop(null);
            }
          }}
          onConfirm={handleCancelConfirm}
          isLoading={cancelMutation.isPending}
          workshopTitle={cancelDialogWorkshop.title}
          workshopDate={
            typeof cancelDialogWorkshop.date === "string"
              ? new Date(cancelDialogWorkshop.date)
              : cancelDialogWorkshop.date
          }
        />
      )}

      {selectedWorkshopForRequest && (
        <RequestWorkshopParticipationDialog
          open={showRequestDialog}
          onOpenChange={(open) => {
            setShowRequestDialog(open);
            if (!open) {
              setSelectedWorkshopForRequest(null);
            }
          }}
          mentorId={selectedWorkshopForRequest.mentorId}
          mentorName={selectedWorkshopForRequest.mentorName}
          preselectedWorkshopId={selectedWorkshopForRequest.workshopId}
          onSuccess={() => {
            utils.workshop.getAvailableWorkshops.invalidate();
            utils.workshop.getUpcomingWorkshops.invalidate();
            utils.mentor.getMyWorkshopRequests.invalidate();
          }}
        />
      )}
    </div>
  );
}
