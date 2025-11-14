"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Users,
  MapPin,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { CreateWorkshopForm } from "./components/CreateWorkshopForm";
import { EditWorkshopForm } from "./components/EditWorkshopForm";
import { trpc } from "@/utils/trpc";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function WorkshopEditorPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<any | null>(null);

  const {
    data: workshops,
    isLoading,
    error,
    refetch,
  } = trpc.workshop.getMyWorkshops.useQuery();

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Workshop Studio
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Créer un nouvel atelier
            </p>
          </div>

          <CreateWorkshopForm
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  if (editingWorkshop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Workshop Studio
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Modifier l'atelier
            </p>
          </div>

          <EditWorkshopForm
            workshop={editingWorkshop}
            onSuccess={() => {
              setEditingWorkshop(null);
              refetch();
            }}
            onCancel={() => setEditingWorkshop(null)}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-slate-600 dark:text-slate-400">
              Chargement de vos ateliers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Erreur</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const hasWorkshops = workshops && workshops.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Workshop Studio
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Ton espace pour créer et gérer tes ateliers.
            </p>
          </div>
          {hasWorkshops && (
            <Button size="lg" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Nouvel atelier
            </Button>
          )}
        </div>

        {hasWorkshops ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <Card
                key={workshop.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={
                        workshop.status === "PUBLISHED"
                          ? "default"
                          : workshop.status === "DRAFT"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {workshop.status === "PUBLISHED"
                        ? "Publié"
                        : workshop.status === "DRAFT"
                        ? "Brouillon"
                        : workshop.status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingWorkshop(workshop);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Éditer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            // TODO: Implement delete functionality
                            console.log("Delete workshop:", workshop.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">
                    {workshop.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {workshop.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {workshop.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(workshop.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}
                    {workshop.time && workshop.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {workshop.time} • {Math.floor(workshop.duration / 60)}
                          h
                          {workshop.duration % 60 > 0
                            ? ` ${workshop.duration % 60}min`
                            : ""}
                        </span>
                      </div>
                    )}
                    {!workshop.date && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Calendar className="h-4 w-4" />
                        <span className="italic">Date non définie</span>
                      </div>
                    )}
                    {workshop.maxParticipants && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{workshop.maxParticipants} participants max</span>
                      </div>
                    )}
                    {workshop.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {workshop.location}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-indigo-600 rounded-full w-fit mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">
                Aucun atelier pour le moment
              </CardTitle>
              <CardDescription className="text-lg">
                Commencez ici 👇
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Créer votre premier atelier
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
