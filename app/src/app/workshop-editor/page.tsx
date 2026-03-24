"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
import ShinyText from "@/components/ui/ShinyText";
import { PageContainer } from "@/components/shared/layout";
import { motion } from "framer-motion";
import { CreateWorkshopForm } from "@/components/domains/WorkshopEditor/CreateWorkshopForm";
import { EditWorkshopForm } from "@/components/domains/WorkshopEditor/EditWorkshopForm";
import { DeleteWorkshopDialog } from "@/components/domains/WorkshopEditor/DeleteWorkshopDialog";
import { PublishWorkshopDialog } from "@/components/domains/WorkshopEditor/PublishWorkshopDialog";
import { trpc } from "@/utils/trpc";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-server-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { BackButton } from "@/components/shared/BackButton";
import Loader from "@/components/shared/Loader";
import type { WorkshopDetailed } from "@ls-app/shared";

type Workshop = WorkshopDetailed;

function WorkshopEditorContent() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const [userClickedCreate, setUserClickedCreate] = useState(false);
  const [userSelectedWorkshop, setUserSelectedWorkshop] =
    useState<Workshop | null>(null);
  const [deletingWorkshop, setDeletingWorkshop] = useState<Workshop | null>(null);
  const [publishingWorkshop, setPublishingWorkshop] = useState<Workshop | null>(
    null
  );

  const {
    data: workshops,
    isLoading,
    error,
    refetch,
  } = trpc.workshop.getMyWorkshops.useQuery(undefined, {
    enabled: !!session?.user?.id,
  }) as {
    data: WorkshopDetailed[] | undefined;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };

  const showFormFromUrl =
    searchParams.get("new") === "true" || searchParams.get("new") === "1";
  const editingWorkshopFromUrl = useMemo(() => {
    const editId = searchParams.get("id");
    if (!editId || !workshops) return null;
    const w = workshops.find((item: { id: string }) => item.id === editId);
    return w ?? null;
  }, [searchParams, workshops]);

  const showForm = showFormFromUrl || userClickedCreate;
  const editingWorkshop = userSelectedWorkshop ?? editingWorkshopFromUrl;

  if (showForm) {
    return (
      <PageContainer>
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <BackButton onClick={() => setUserClickedCreate(false)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              <ShinyText text="Créer un atelier" />
            </h1>
            <p className="text-base sm:text-lg text-ls-muted mt-2">
              Remplis le formulaire pour créer ton atelier
            </p>
          </motion.div>
        </div>

        <CreateWorkshopForm
          onSuccess={() => {
            setUserClickedCreate(false);
            refetch();
          }}
          onCancel={() => setUserClickedCreate(false)}
        />
      </PageContainer>
    );
  }

  if (editingWorkshop) {
    return (
      <PageContainer>
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <BackButton onClick={() => setUserSelectedWorkshop(null)} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              <ShinyText text="Modifier l'atelier" />
            </h1>
            <p className="text-base sm:text-lg text-ls-muted mt-2">
              Modifie les informations de ton atelier
            </p>
          </motion.div>
        </div>

        <EditWorkshopForm
          workshop={editingWorkshop}
          onSuccess={() => {
            setUserSelectedWorkshop(null);
            refetch();
          }}
          onCancel={() => setUserSelectedWorkshop(null)}
        />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Loader fullScreen message="Récupération de tes ateliers..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card className="border-destructive bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription className="text-ls-muted">
              {error.message}
            </CardDescription>
          </CardHeader>
        </Card>
      </PageContainer>
    );
  }

  const hasWorkshops = workshops && workshops.length > 0;
  const workshopsList: Workshop[] = workshops || [];

  return (
    <PageContainer>
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <ShinyText text="Atelab" />
          </h1>
          <p className="text-base sm:text-lg text-ls-muted mt-2">
            Ton espace pour créer et gérer tes ateliers
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-6">
        {hasWorkshops && (
          <Button
            onClick={() => setUserClickedCreate(true)}
            variant="cta" size="cta" className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvel atelier
          </Button>
        )}
      </div>

      {hasWorkshops ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {workshopsList.map((workshop, index) => {
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
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="hover:shadow-xl transition-all duration-200 border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md rounded-2xl overflow-hidden"
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
                        <DropdownMenuContent align="end" className="bg-card border border-border/50 rounded-2xl shadow-xl">
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
                              setUserSelectedWorkshop(workshop);
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
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-dashed border-2 border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-linear-to-br from-[#26547c] to-[#4A90E2] rounded-full w-fit mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2 text-ls-heading">
                Aucun atelier pour le moment
              </CardTitle>
              <CardDescription className="text-lg text-ls-muted">
                Commence ici 👇
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                onClick={() => setUserClickedCreate(true)}
                variant="cta" size="cta" className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Créer ton premier atelier
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
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
            ...publishingWorkshop,
            date: convertedDate,
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
    </PageContainer>
  );
}

export default function WorkshopEditorPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-brand" />
              <p className="text-ls-muted">Chargement...</p>
            </div>
          </div>
        </PageContainer>
      }
    >
      <WorkshopEditorContent />
    </Suspense>
  );
}
