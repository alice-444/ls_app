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
} from "lucide-react";
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

  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Total
                    </p>
                    <p className="text-2xl font-bold">
                      {workshops?.length || 0}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Publiés
                    </p>
                    <p className="text-2xl font-bold">
                      {workshops?.filter((w) => w.status === "PUBLISHED")
                        .length || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Brouillons
                    </p>
                    <p className="text-2xl font-bold">
                      {workshops?.filter((w) => w.status === "DRAFT").length ||
                        0}
                    </p>
                  </div>
                  <Edit className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Terminés
                    </p>
                    <p className="text-2xl font-bold">
                      {workshops?.filter((w) => w.status === "COMPLETED")
                        .length || 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {upcomingWorkshops.length > 0 && (
          <Card className="mb-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
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
                            <Users className="w-4 h-4" />0 /{" "}
                            {workshop.maxParticipants || "∞"} participants
                          </div>
                        </div>
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
      </div>
    </div>
  );
}
