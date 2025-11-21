"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Edit,
  Trash2,
  ArrowLeft,
  Video,
  FileText,
  User,
  CheckCircle,
  XCircle,
  EyeOff,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { getStatusBadge, formatDate, formatTime } from "@/lib/workshop-utils";
import { DeleteWorkshopDialog } from "@/components/workshop/DeleteWorkshopDialog";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { RejectWorkshopRequestDialog } from "@/components/mentor/RejectWorkshopRequestDialog";
import { WorkshopRequestCard } from "@/components/workshop/WorkshopRequestCard";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
} from "@/lib/workshop-request-utils";
import { CancelWorkshopRegistrationDialog } from "@/components/workshop/CancelWorkshopRegistrationDialog";
import { X } from "lucide-react";

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.id as string;
  const { data: session } = authClient.useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const utils = trpc.useUtils();
  const rejectRequest = trpc.mentor.rejectWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée avec succès");
      utils.mentor.getWorkshopRequests.invalidate();
      setShowRejectDialog(false);
      setRequestToReject(null);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const { data: workshopRequests } = trpc.mentor.getWorkshopRequests.useQuery(
    { workshopId },
    {
      enabled: !!workshopId && !!session?.user?.id,
    }
  );

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
      rejectRequest.mutate({ requestId: requestToReject });
    }
  };

  const {
    data: workshop,
    isLoading,
    refetch,
  } = trpc.workshop.getById.useQuery(
    { workshopId },
    {
      enabled: !!workshopId,
    }
  );

  const deleteMutation = trpc.workshop.delete.useMutation({
    onSuccess: () => {
      toast.success("Atelier supprimé avec succès");
      router.push("/my-workshops");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const unpublishMutation = trpc.workshop.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Atelier dépublié avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la dépublication");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ workshopId });
    setShowDeleteDialog(false);
  };

  const handleEdit = () => {
    router.push(`/workshop-editor?id=${workshopId}`);
  };

  const handleUnpublish = () => {
    unpublishMutation.mutate({ workshopId });
  };

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const { data: upcomingWorkshops } = trpc.workshop.getUpcomingWorkshops.useQuery(
    undefined,
    {
      enabled: userRole === "APPRENANT" && !!session?.user?.id,
    }
  );

  const cancelMutation = trpc.workshop.cancelConfirmed.useMutation({
    onSuccess: () => {
      toast.success("Inscription annulée avec succès");
      refetch();
      setShowCancelDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workshop) {
    const backUrl = userRole === "MENTOR" ? "/my-workshops" : "/workshop-room";
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Atelier introuvable
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            L'atelier que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => router.push(backUrl)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux ateliers
          </Button>
        </div>
      </div>
    );
  }

  const isApprentice = userRole === "APPRENANT";
  const isOwner =
    session?.user?.id && workshop?.creator?.userId === session.user.id;
  const canRequestParticipation = isApprentice && !isOwner && workshop?.status === "PUBLISHED" && !workshop?.apprenticeId;
  const shouldShowStatusBadge = isOwner;
  const isRegistered = isApprentice && workshop?.apprenticeId && 
    upcomingWorkshops?.some((w: any) => w.id === workshop.id);
  
  const isWorkshopPast = (): boolean => {
    if (!workshop?.date || !workshop?.time) return false;
    try {
      const date = typeof workshop.date === "string" ? new Date(workshop.date) : workshop.date;
      const [hours, minutes] = workshop.time.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      if (workshop.duration) {
        endTime.setMinutes(endTime.getMinutes() + workshop.duration);
      }
      return endTime < new Date();
    } catch {
      return false;
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = (reason?: string) => {
    if (workshop) {
      cancelMutation.mutate({
        workshopId: workshop.id,
        cancellationReason: reason,
      });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              const backUrl = isOwner ? "/my-workshops" : "/workshop-room";
              router.push(backUrl);
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux ateliers
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {workshop.title}
                </h1>
                {shouldShowStatusBadge && getStatusBadge(workshop.status)}
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Créé le{" "}
                {formatDate(workshop.createdAt, { includeWeekday: false })}
                {shouldShowStatusBadge && workshop.publishedAt && (
                  <span>
                    {" "}
                    • Publié le{" "}
                    {formatDate(workshop.publishedAt, {
                      includeWeekday: false,
                    })}
                  </span>
                )}
              </p>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Éditer
                </Button>
                {workshop.status === "PUBLISHED" && (
                  <Button
                    variant="outline"
                    onClick={handleUnpublish}
                    disabled={unpublishMutation.isPending}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Dépublier
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workshop.description ? (
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {workshop.description}
                  </p>
                ) : (
                  <p className="text-slate-500 italic">
                    Aucune description disponible
                  </p>
                )}
              </CardContent>
            </Card>

            {workshop.materialsNeeded && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Matériel nécessaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {workshop.materialsNeeded}
                  </p>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Demandes de participation
                  </CardTitle>
                  <CardDescription>
                    {workshopRequests?.filter((r: any) => r.status === "PENDING").length || 0} demande(s) en attente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workshopRequests &&
                  workshopRequests.filter((r: any) => r.status === "PENDING")
                    .length > 0 ? (
                    <div className="space-y-3">
                      {workshopRequests
                        .filter((r: any) => r.status === "PENDING")
                        .map((request: any) => (
                          <WorkshopRequestCard
                            key={request.id}
                            request={request}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                            isRejecting={rejectRequest.isPending}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Aucune demande de participation pour le moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants inscrits
                </CardTitle>
                <CardDescription>
                  {workshop.status === "PUBLISHED" && workshop.apprenticeId ? 1 : 0} / {workshop.maxParticipants || "∞"} participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workshop.status === "PUBLISHED" && workshop.apprenticeId && workshop.apprentice ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {workshop.apprentice.user?.name || "Apprenti"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {workshop.apprentice.user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>
                      {workshop.status === "DRAFT" 
                        ? "Les participants seront visibles une fois l'atelier publié"
                        : "Aucun participant inscrit pour le moment"}
                    </p>
                    {workshop.status === "PUBLISHED" && (
                      <p className="text-sm mt-2">
                        Les inscriptions seront visibles une fois l'atelier publié
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails de l'atelier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workshop.topic && (
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Thème / Topic
                      </p>
                      <p className="text-slate-900 dark:text-slate-100">
                        {workshop.topic}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Date
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {formatDate(workshop.date, { includeWeekday: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Heure
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {formatTime(workshop.time)}
                    </p>
                  </div>
                </div>

                {workshop.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Durée
                      </p>
                      <p className="text-slate-900 dark:text-slate-100">
                        {workshop.duration} minutes
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {workshop.isVirtual ? (
                    <Video className="w-5 h-5 text-slate-500 mt-0.5" />
                  ) : (
                    <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {workshop.isVirtual ? "En ligne" : "Lieu"}
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {workshop.location || "Non spécifié"}
                    </p>
                  </div>
                </div>

                {workshop.maxParticipants && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Participants max
                      </p>
                      <p className="text-slate-900 dark:text-slate-100">
                        {workshop.maxParticipants} personnes
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {workshop.creator && (
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/mentors/${workshop.creator.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Professeur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                      {workshop.creator.user?.name?.charAt(0).toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 hover:underline">
                        {workshop.creator.user?.name || "Animateur"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {workshop.creator.user?.email}
                      </p>
                    </div>
                  </div>
                  {workshop.creator.bio && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      {workshop.creator.bio}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Voir le profil complet{" "}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </p>
                </CardContent>
              </Card>
            )}

            {isRegistered && !isWorkshopPast() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Vous êtes inscrit à cet atelier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Vous êtes inscrit à cet atelier. Vous pouvez annuler votre inscription si nécessaire.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={handleCancelClick}
                    disabled={cancelMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                    Annuler mon inscription
                  </Button>
                </CardContent>
              </Card>
            )}

            {canRequestParticipation && workshop.creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Participer à cet atelier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Vous souhaitez participer à cet atelier ? Envoyez une demande
                    au mentor.
                  </p>
                  <Button
                    className="w-full gap-2"
                    onClick={() => setShowRequestDialog(true)}
                  >
                    <BookOpen className="h-4 w-4" />
                    Demander à participer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <DeleteWorkshopDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {canRequestParticipation && workshop?.creator && (
        <RequestWorkshopParticipationDialog
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
          mentorId={workshop.creator.id}
          mentorName={workshop.creator.user?.name || "Mentor"}
          preselectedWorkshopId={workshop.id}
        />
      )}

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

      {workshop && workshop.date && isRegistered && (
        <CancelWorkshopRegistrationDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancelConfirm}
          isLoading={cancelMutation.isPending}
          workshopTitle={workshop.title}
          workshopDate={
            typeof workshop.date === "string"
              ? new Date(workshop.date)
              : workshop.date
          }
        />
      )}
    </div>
  );
}
