"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Rocket,
} from "lucide-react";
import { CreateWorkshopForm } from "@/components/workshop-editor/CreateWorkshopForm";
import { EditWorkshopForm } from "@/components/workshop-editor/EditWorkshopForm";
import { DeleteWorkshopDialog } from "@/components/workshop-editor/DeleteWorkshopDialog";
import { PublishWorkshopDialog } from "@/components/workshop-editor/PublishWorkshopDialog";
import { trpc } from "@/utils/trpc";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BackButton } from "@/components/back-button";
import type { WorkshopBasic } from "@/types/workshop";

type Workshop = WorkshopBasic & {
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
};

export default function WorkshopEditorPage() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [deletingWorkshop, setDeletingWorkshop] = useState<Workshop | null>(null);
  const [publishingWorkshop, setPublishingWorkshop] = useState<Workshop | null>(
    null
  );

  const {
    data: workshops,
    isLoading,
    error,
    refetch,
  } = trpc.workshop.getMyWorkshops.useQuery(undefined);

  // Open form automatically if "new" query parameter is present
  useEffect(() => {
    const newParam = searchParams.get("new");
    const editId = searchParams.get("id");
    
    if (newParam === "true" || newParam === "1") {
      setShowForm(true);
    } else if (editId && workshops) {
      const workshopToEdit = workshops.find((w: { id: string }) => w.id === editId);
      if (workshopToEdit) {
        setEditingWorkshop(workshopToEdit as Workshop);
      }
    }
  }, [searchParams, workshops]);

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
          <div className="relative mb-6 sm:mb-8 lg:mb-10">
            <div className="relative h-[60px] sm:h-[70px] lg:h-[75px]">
              <div className="absolute left-0 top-0 h-[60px] sm:h-[70px] lg:h-[75px] w-full sm:w-[350px] lg:w-[461px]">
                <div className="absolute left-[120px] sm:left-[140px] lg:left-[163px] top-0 h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                  <div className="h-full w-full bg-[#26547c] rounded" />
                </div>
                <div className="absolute left-[85px] sm:left-[100px] lg:left-[116px] top-[30px] sm:top-[35px] lg:top-[38px] h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                  <div className="h-full w-full bg-[#26547c] rounded" />
                </div>
                <div className="absolute left-0 top-[-20px] sm:top-[-24px] lg:top-[-27px] h-[36px] sm:h-[40px] lg:h-[45px] w-[36px] sm:w-[40px] lg:w-[45px]">
                  <div className="h-full w-full bg-[#26547c] rounded-full opacity-20" />
                </div>
                <div className="absolute left-[40px] sm:left-[48px] lg:left-[56px] top-[2px] h-[52px] sm:h-[60px] lg:h-[66px] w-[280px] sm:w-[320px] lg:w-[405px]">
                  <div className="absolute right-[100px] sm:right-[120px] lg:right-[138px] top-[-6px] sm:top-[-7px] lg:top-[-8px] h-[64px] sm:h-[72px] lg:h-[80px] w-[240px] sm:w-[280px] lg:w-[320px] rotate-[359.6deg]">
                    <div className="h-[62px] sm:h-[70px] lg:h-[78px] w-[240px] sm:w-[280px] lg:w-[320px] bg-[#26547c] border-2 border-white rounded-tl-[28px] sm:rounded-tl-[32px] lg:rounded-tl-[36px] rounded-tr-[28px] sm:rounded-tr-[32px] lg:rounded-tr-[36px] rounded-bl-[4px] rounded-br-[4px]" />
                  </div>
                </div>
              </div>
              <div className="relative z-10 pt-2 sm:pt-3 lg:pt-4">
                <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-black text-white leading-[1.2] sm:leading-[1.3] lg:leading-[75px] whitespace-nowrap">
                  Créer un atelier
                </h1>
              </div>
            </div>
            <p className="text-[20px] sm:text-[22px] lg:text-[24px] text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-5 lg:mt-6">
              Remplissez le formulaire pour créer ton atelier
            </p>
          </div>

          <BackButton onClick={() => setShowForm(false)} />

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
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
          <div className="relative mb-6 sm:mb-8 lg:mb-10">
            <div className="relative h-[60px] sm:h-[70px] lg:h-[75px]">
              <div className="absolute left-0 top-0 h-[60px] sm:h-[70px] lg:h-[75px] w-full sm:w-[350px] lg:w-[461px]">
                <div className="absolute left-[120px] sm:left-[140px] lg:left-[163px] top-0 h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                  <div className="h-full w-full bg-[#26547c] rounded" />
                </div>
                <div className="absolute left-[85px] sm:left-[100px] lg:left-[116px] top-[30px] sm:top-[35px] lg:top-[38px] h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                  <div className="h-full w-full bg-[#26547c] rounded" />
                </div>
                <div className="absolute left-0 top-[-20px] sm:top-[-24px] lg:top-[-27px] h-[36px] sm:h-[40px] lg:h-[45px] w-[36px] sm:w-[40px] lg:w-[45px]">
                  <div className="h-full w-full bg-[#26547c] rounded-full opacity-20" />
                </div>
                <div className="absolute left-[40px] sm:left-[48px] lg:left-[56px] top-[2px] h-[52px] sm:h-[60px] lg:h-[66px] w-[280px] sm:w-[320px] lg:w-[405px]">
                  <div className="absolute right-[100px] sm:right-[120px] lg:right-[138px] top-[-6px] sm:top-[-7px] lg:top-[-8px] h-[64px] sm:h-[72px] lg:h-[80px] w-[240px] sm:w-[280px] lg:w-[320px] rotate-[359.6deg]">
                    <div className="h-[62px] sm:h-[70px] lg:h-[78px] w-[240px] sm:w-[280px] lg:w-[320px] bg-[#26547c] border-2 border-white rounded-tl-[28px] sm:rounded-tl-[32px] lg:rounded-tl-[36px] rounded-tr-[28px] sm:rounded-tr-[32px] lg:rounded-tr-[36px] rounded-bl-[4px] rounded-br-[4px]" />
                  </div>
                </div>
              </div>
              <div className="relative z-10 pt-2 sm:pt-3 lg:pt-4">
                <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-black text-white leading-[1.2] sm:leading-[1.3] lg:leading-[75px] whitespace-nowrap">
                  Modifier l'atelier
                </h1>
              </div>
            </div>
            <p className="text-[20px] sm:text-[22px] lg:text-[24px] text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-5 lg:mt-6">
              Modifiez les informations de ton atelier
            </p>
          </div>

          <BackButton onClick={() => setEditingWorkshop(null)} />

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
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#26547c]" />
            <p className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Chargement de vos ateliers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
          <Card className="bg-white dark:bg-[#1a1720] border border-[#f44336] dark:border-[#f44336] rounded-[16px]">
            <CardHeader>
              <CardTitle className="text-[#f44336] dark:text-[#f44336]">Erreur</CardTitle>
              <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                {error.message}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const hasWorkshops = workshops && workshops.length > 0;
  const workshopsList: Workshop[] = workshops || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12">
        <div className="relative mb-6 sm:mb-8 lg:mb-10">
          <div className="relative h-[60px] sm:h-[70px] lg:h-[75px]">
            <div className="absolute left-0 top-0 h-[60px] sm:h-[70px] lg:h-[75px] w-full sm:w-[350px] lg:w-[461px]">
              <div className="absolute left-[120px] sm:left-[140px] lg:left-[163px] top-0 h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                <div className="h-full w-full bg-[#26547c] rounded" />
              </div>
              <div className="absolute left-[85px] sm:left-[100px] lg:left-[116px] top-[30px] sm:top-[35px] lg:top-[38px] h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
                <div className="h-full w-full bg-[#26547c] rounded" />
              </div>
              <div className="absolute left-0 top-[-20px] sm:top-[-24px] lg:top-[-27px] h-[36px] sm:h-[40px] lg:h-[45px] w-[36px] sm:w-[40px] lg:w-[45px]">
                <div className="h-full w-full bg-[#26547c] rounded-full opacity-20" />
              </div>
              <div className="absolute left-[40px] sm:left-[48px] lg:left-[56px] top-[2px] h-[52px] sm:h-[60px] lg:h-[66px] w-[280px] sm:w-[320px] lg:w-[405px]">
                <div className="absolute right-[100px] sm:right-[120px] lg:right-[138px] top-[-6px] sm:top-[-7px] lg:top-[-8px] h-[64px] sm:h-[72px] lg:h-[80px] w-[240px] sm:w-[280px] lg:w-[320px] rotate-[359.6deg]">
                  <div className="h-[62px] sm:h-[70px] lg:h-[78px] w-[240px] sm:w-[280px] lg:w-[320px] bg-[#26547c] border-2 border-white rounded-tl-[28px] sm:rounded-tl-[32px] lg:rounded-tl-[36px] rounded-tr-[28px] sm:rounded-tr-[32px] lg:rounded-tr-[36px] rounded-bl-[4px] rounded-br-[4px]" />
                </div>
              </div>
            </div>
            <div className="relative z-10 pt-2 sm:pt-3 lg:pt-4">
              <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-black text-white leading-[1.2] sm:leading-[1.3] lg:leading-[75px] whitespace-nowrap">
                Atelab
              </h1>
            </div>
          </div>
          <p className="text-[20px] sm:text-[22px] lg:text-[24px] text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-5 lg:mt-6">
            Ton espace pour créer et gérer tes ateliers
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-6">
          {hasWorkshops && (
            <Button
              size="lg"
              onClick={() => setShowForm(true)}
              className="bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nouvel atelier
            </Button>
          )}
        </div>

        {hasWorkshops ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {workshopsList.map((workshop) => {
              let badgeVariant: "default" | "secondary" | "outline" = "outline";
              if (workshop.status === "PUBLISHED") {
                badgeVariant = "default";
              } else if (workshop.status === "DRAFT") {
                badgeVariant = "secondary";
              }

              let statusLabel: string = workshop.status;
              if (workshop.status === "PUBLISHED") {
                statusLabel = "Publié";
              } else if (workshop.status === "DRAFT") {
                statusLabel = "Brouillon";
              }

              return (
                <Card
                  key={workshop.id}
                  className="hover:shadow-lg transition-shadow bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={badgeVariant} className="text-xs">
                        {statusLabel}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
                          {workshop.status === "DRAFT" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setPublishingWorkshop(workshop);
                                }}
                                className="text-[#26547c] dark:text-[#4A90E2] focus:text-[#26547c] dark:focus:text-[#4A90E2]"
                              >
                                <Rocket className="mr-2 h-4 w-4" />
                                Publier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#d6dae4] dark:bg-[rgba(214,218,228,0.32)]" />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingWorkshop(workshop);
                            }}
                            className="text-[#26547c] dark:text-[#e6e6e6]"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Éditer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#d6dae4] dark:bg-[rgba(214,218,228,0.32)]" />
                          <DropdownMenuItem
                            className="text-[#f44336] dark:text-[#f44336] focus:text-[#f44336] dark:focus:text-[#f44336]"
                            onClick={() => {
                              setDeletingWorkshop(workshop);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-xl line-clamp-2 text-[#26547c] dark:text-[#e6e6e6]">
                      {workshop.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                      {workshop.description || "Aucune description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                      {workshop.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
                          <span>
                            {new Date(workshop.date).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>
                      )}
                      {workshop.time && workshop.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
                          <span>
                            {workshop.time} •{" "}
                            {Math.floor(workshop.duration / 60)}h
                            {workshop.duration % 60 > 0
                              ? ` ${workshop.duration % 60}min`
                              : ""}
                          </span>
                        </div>
                      )}
                      {!workshop.date && (
                        <div className="flex items-center gap-2 text-[#ffb647] dark:text-[#ffb647]">
                          <Calendar className="h-4 w-4" />
                          <span className="italic">Date non définie</span>
                        </div>
                      )}
                      {workshop.maxParticipants && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
                          <span>
                            {workshop.maxParticipants} participants max
                          </span>
                        </div>
                      )}
                      {workshop.isVirtual ? (
                        <div className="flex items-center gap-2 text-[#4A90E2] dark:text-[#4A90E2]">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">Atelier virtuel</span>
                        </div>
                      ) : (
                        workshop.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#26547c] dark:text-[#e6e6e6]" />
                            <span className="line-clamp-1">
                              {workshop.location}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[#1a1720] rounded-[16px]">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-linear-to-br from-[#26547c] to-[#4A90E2] rounded-full w-fit mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                Aucun atelier pour le moment
              </CardTitle>
              <CardDescription className="text-lg text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                Commencez ici 👇
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                size="lg"
                onClick={() => setShowForm(true)}
                className="bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Créer votre premier atelier
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <DeleteWorkshopDialog
        workshop={deletingWorkshop}
        open={!!deletingWorkshop}
        onOpenChange={(open) => {
          if (!open) setDeletingWorkshop(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
      <PublishWorkshopDialog
        workshop={(() => {
          if (!publishingWorkshop) return null;

          let convertedDate: Date | null = null;
          if (publishingWorkshop.date instanceof Date) {
            convertedDate = publishingWorkshop.date;
          } else if (publishingWorkshop.date) {
            convertedDate = new Date(publishingWorkshop.date);
          }

          return {
            id: publishingWorkshop.id,
            title: publishingWorkshop.title,
            description: publishingWorkshop.description,
            date: convertedDate,
            time: publishingWorkshop.time,
            duration: publishingWorkshop.duration,
            location: publishingWorkshop.location,
            isVirtual: publishingWorkshop.isVirtual,
            maxParticipants: publishingWorkshop.maxParticipants,
          };
        })()}
        open={!!publishingWorkshop}
        onOpenChange={(open) => {
          if (!open) setPublishingWorkshop(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
