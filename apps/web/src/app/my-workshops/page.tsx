"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getStatusBadge, formatDate } from "@/lib/workshop-utils";
import { DeleteWorkshopDialog } from "@/components/workshop/DeleteWorkshopDialog";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Search,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { RejectWorkshopRequestDialog } from "@/components/mentor/RejectWorkshopRequestDialog";
import { WorkshopRequestCard } from "@/components/workshop/WorkshopRequestCard";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
} from "@/lib/workshop-request-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortField = "date" | "title" | "status" | "createdAt";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

function WorkshopRequests({
  workshopId,
  workshopStatus,
  expandedWorkshopId,
  setExpandedWorkshopId,
  onAcceptRequest,
  onRejectRequest,
  isRejecting,
}: {
  workshopId: string;
  workshopStatus: string;
  expandedWorkshopId: string | null;
  setExpandedWorkshopId: (id: string | null) => void;
  onAcceptRequest: (request: any) => void;
  onRejectRequest: (requestId: string) => void;
  isRejecting: boolean;
}) {
  if (workshopStatus !== "PUBLISHED") {
    return null;
  }

  const { data: requests } = trpc.mentor.getWorkshopRequests.useQuery(
    { workshopId },
    { enabled: !!workshopId && workshopStatus === "PUBLISHED" }
  );

  const pendingRequests =
    requests?.filter((r: any) => r.status === "PENDING") || [];
  
  const displayRequests = pendingRequests;

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Demandes de participation ({displayRequests.length})
          </span>
          {pendingRequests.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              {pendingRequests.length} en attente
            </Badge>
          )}
        </div>
        {displayRequests.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setExpandedWorkshopId(
                expandedWorkshopId === workshopId ? null : workshopId
              )
            }
          >
            {expandedWorkshopId === workshopId ? "Masquer" : "Voir"}
          </Button>
        )}
      </div>
      {displayRequests.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Aucune demande de participation en attente
        </p>
      ) : (
        expandedWorkshopId === workshopId && (
          <div className="space-y-2 mt-2">
            {displayRequests.map((request: any) => (
              <WorkshopRequestCard
                key={request.id}
                request={request}
                onAccept={onAcceptRequest}
                onReject={onRejectRequest}
                isRejecting={isRejecting}
                variant="compact"
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function MyWorkshopsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data: workshops,
    isLoading,
    refetch,
  } = trpc.workshop.getMyWorkshops.useQuery(undefined, {
    enabled: !!session,
  });

  const { data: mentorRequests } =
    trpc.mentor.getMentorWorkshopRequests.useQuery(undefined, {
      enabled: !!session,
    });

  const pendingRequestsCount =
    mentorRequests?.filter((r: any) => r.status === "PENDING").length || 0;

  const deleteMutation = trpc.workshop.delete.useMutation({
    onSuccess: () => {
      toast.success("Atelier supprimé avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const publishMutation = trpc.workshop.publish.useMutation({
    onSuccess: () => {
      toast.success("Atelier publié avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la publication");
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

  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [expandedWorkshopId, setExpandedWorkshopId] = useState<string | null>(
    null
  );

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

  const filteredAndSortedWorkshops = useMemo(() => {
    if (!workshops) return [];

    let result = [...workshops];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (workshop) =>
          workshop.title.toLowerCase().includes(query) ||
          workshop.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((workshop) => workshop.status === statusFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [workshops, searchQuery, statusFilter, sortField, sortOrder]);

  const upcomingWorkshops = useMemo(() => {
    if (!workshops) return [];
    const now = new Date();
    return workshops
      .filter((w) => w.date && new Date(w.date) > now)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .slice(0, 5);
  }, [workshops]);

  const handleDelete = (workshopId: string) => {
    deleteMutation.mutate({ workshopId });
    setShowDeleteDialog(null);
  };

  const handlePublish = (workshopId: string) => {
    publishMutation.mutate({ workshopId });
  };

  const handleUnpublish = (workshopId: string) => {
    unpublishMutation.mutate({ workshopId });
  };

  const handleEdit = (workshopId: string) => {
    router.push(`/workshop-editor?id=${workshopId}`);
  };

  const handleViewDetails = (workshopId: string) => {
    router.push(`/workshop/${workshopId}`);
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Mes Ateliers
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Gérez et organisez vos ateliers de partage de connaissances
              </p>
            </div>
            <Button
              onClick={() => router.push("/workshop-editor")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer un atelier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="border-l-4 border-l-[#26547C]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-[#26547C]">
                      {workshops?.length || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-[#26547C]/10 rounded-full">
                    <Calendar className="w-6 h-6 text-[#26547C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#4A90E2]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Publiés
                    </p>
                    <p className="text-2xl font-bold text-[#4A90E2]">
                      {workshops?.filter((w) => w.status === "PUBLISHED")
                        .length || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-[#4A90E2]/10 rounded-full">
                    <CheckCircle className="w-6 h-6 text-[#4A90E2]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FF8C42]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Brouillons
                    </p>
                    <p className="text-2xl font-bold text-[#FF8C42]">
                      {workshops?.filter((w) => w.status === "DRAFT").length ||
                        0}
                    </p>
                  </div>
                  <div className="p-2 bg-[#FF8C42]/10 rounded-full">
                    <Edit className="w-6 h-6 text-[#FF8C42]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#C9A0DC]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Terminés
                    </p>
                    <p className="text-2xl font-bold text-[#C9A0DC]">
                      {workshops?.filter((w) => w.status === "COMPLETED")
                        .length || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-[#C9A0DC]/10 rounded-full">
                    <Clock className="w-6 h-6 text-[#C9A0DC]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FFB647]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      En attente
                    </p>
                    <p className="text-2xl font-bold text-[#FFB647]">
                      {pendingRequestsCount}
                    </p>
                  </div>
                  <div className="p-2 bg-[#FFB647]/10 rounded-full">
                    <BookOpen className="w-6 h-6 text-[#FFB647]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {upcomingWorkshops.length > 0 && (
          <Card className="mb-6 bg-linear-to-br from-[#4A90E2] to-[#26547C] text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5" />
                Ateliers à venir
              </CardTitle>
              <CardDescription className="text-blue-100">
                Vos prochains ateliers programmés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingWorkshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                    onClick={() => router.push(`/workshop/${workshop.id}`)}
                  >
                    <h3 className="font-semibold text-lg mb-2">
                      {workshop.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-blue-100 mb-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(workshop.date)}
                    </div>
                    {workshop.time && (
                      <div className="flex items-center gap-2 text-sm text-blue-100">
                        <Clock className="w-4 h-4" />
                        {workshop.time}
                        {workshop.duration && ` • ${workshop.duration}min`}
                      </div>
                    )}
                    <div className="mt-2">
                      {getStatusBadge(workshop.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un atelier par titre ou description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortField}
                  onValueChange={(value) => setSortField(value as SortField)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Titre</SelectItem>
                    <SelectItem value="status">Statut</SelectItem>
                    <SelectItem value="createdAt">Date de création</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="w-full md:w-auto"
                >
                  {sortOrder === "asc" ? "↑ Croissant" : "↓ Décroissant"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tous les ateliers</CardTitle>
            <CardDescription>
              {filteredAndSortedWorkshops.length} atelier(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAndSortedWorkshops.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Aucun atelier trouvé
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Essayez de modifier vos filtres de recherche"
                    : "Commencez par créer votre premier atelier"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button onClick={() => router.push("/workshop-editor")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un atelier
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedWorkshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() =>
                                router.push(`/workshop/${workshop.id}`)
                              }
                            >
                              {workshop.title}
                            </h3>
                            {workshop.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {workshop.description}
                              </p>
                            )}
                          </div>
                          <div>{getStatusBadge(workshop.status)}</div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(workshop.date)}
                          </div>
                          {workshop.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {workshop.time}
                            </div>
                          )}
                          {workshop.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {workshop.duration} min
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {workshop.status === "PUBLISHED" && workshop.apprenticeId ? 1 : 0} /{" "}
                            {workshop.maxParticipants || "∞"} participants
                          </div>
                        </div>
                        <WorkshopRequests
                          workshopId={workshop.id}
                          workshopStatus={workshop.status}
                          expandedWorkshopId={expandedWorkshopId}
                          setExpandedWorkshopId={setExpandedWorkshopId}
                          onAcceptRequest={handleAcceptRequest}
                          onRejectRequest={handleRejectRequest}
                          isRejecting={rejectRequest.isPending}
                        />
                      </div>

                      <div className="flex gap-2 lg:flex-col xl:flex-row">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(workshop.id)}
                          className="flex-1 lg:flex-none"
                        >
                          <Eye className="w-4 h-4 lg:mr-0 xl:mr-2" />
                          <span className="lg:hidden xl:inline">Détails</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(workshop.id)}
                          className="flex-1 lg:flex-none"
                        >
                          <Edit className="w-4 h-4 lg:mr-0 xl:mr-2" />
                          <span className="lg:hidden xl:inline">Éditer</span>
                        </Button>
                        {workshop.status === "DRAFT" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePublish(workshop.id)}
                            disabled={publishMutation.isPending}
                            className="flex-1 lg:flex-none"
                          >
                            <CheckCircle className="w-4 h-4 lg:mr-0 xl:mr-2" />
                            <span className="lg:hidden xl:inline">Publier</span>
                          </Button>
                        )}
                        {workshop.status === "PUBLISHED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnpublish(workshop.id)}
                            disabled={unpublishMutation.isPending}
                            className="flex-1 lg:flex-none"
                          >
                            <EyeOff className="w-4 h-4 lg:mr-0 xl:mr-2" />
                            <span className="lg:hidden xl:inline">
                              Dépublier
                            </span>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteDialog(workshop.id)}
                          disabled={deleteMutation.isPending}
                          className="flex-1 lg:flex-none"
                        >
                          <Trash2 className="w-4 h-4 lg:mr-0 xl:mr-2" />
                          <span className="lg:hidden xl:inline">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <DeleteWorkshopDialog
          open={showDeleteDialog !== null}
          onOpenChange={(open) => !open && setShowDeleteDialog(null)}
          onConfirm={() => showDeleteDialog && handleDelete(showDeleteDialog)}
          isLoading={deleteMutation.isPending}
        />

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
      </div>
    </div>
  );
}
