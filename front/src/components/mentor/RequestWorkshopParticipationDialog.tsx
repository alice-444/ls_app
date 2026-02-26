"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  BookOpen,
  Calendar,
  Clock,
  Coins,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { formatDate, formatTime } from "@/lib/workshop-utils";
import type { WorkshopBasic } from "@/types/workshop";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const requestParticipationSchema = z.object({
  workshopId: z.string().min(1, "Veuillez sélectionner un atelier"),
  message: z
    .string()
    .trim()
    .max(500, "Le message ne peut pas dépasser 500 caractères")
    .optional()
    .nullable(),
});

type RequestParticipationFormData = z.infer<typeof requestParticipationSchema>;

interface RequestWorkshopParticipationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
  preselectedWorkshopId?: string | null;
  onSuccess?: () => void;
}

const WORKSHOP_REQUEST_COST = 10;

export function RequestWorkshopParticipationDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
  preselectedWorkshopId,
  onSuccess,
}: RequestWorkshopParticipationDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: workshopsData, isLoading: isLoadingWorkshops } =
    trpc.mentor.getPublicWorkshops.useQuery(
      { mentorId },
      {
        enabled: open && !!mentorId,
      }
    );

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: open,
  });

  const submitRequest = trpc.mentor.submitWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande de participation envoyée avec succès !");
      onOpenChange(false);
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de l'envoi de la demande");
      setIsSubmitting(false);
    },
  });

  const form = useForm<RequestParticipationFormData>({
    resolver: zodResolver(requestParticipationSchema),
    defaultValues: {
      workshopId: "",
      message: "",
    },
  });

  useEffect(() => {
    if (preselectedWorkshopId && workshopsData?.upcoming) {
      const workshopExists = workshopsData.upcoming.some(
        (w: WorkshopBasic) => w.id === preselectedWorkshopId
      );
      if (workshopExists) {
        form.setValue("workshopId", preselectedWorkshopId);
      }
    }
  }, [preselectedWorkshopId, workshopsData, form]);

  const onSubmit = async (data: RequestParticipationFormData) => {
    setIsSubmitting(true);

    const selectedWorkshop = workshopsData?.upcoming.find(
      (w: WorkshopBasic) => w.id === data.workshopId
    );

    if (!selectedWorkshop) {
      toast.error("Atelier introuvable");
      setIsSubmitting(false);
      return;
    }

    submitRequest.mutate({
      mentorId,
      title: selectedWorkshop.title,
      description: selectedWorkshop.description || null,
      message: data.message || null,
      preferredDate: selectedWorkshop.date
        ? typeof selectedWorkshop.date === "string"
          ? selectedWorkshop.date
          : new Date(selectedWorkshop.date).toISOString().split("T")[0]
        : null,
      preferredTime: selectedWorkshop.time || null,
      workshopId: selectedWorkshop.id,
    });
  };

  const upcomingWorkshops = workshopsData?.upcoming || [];
  const hasWorkshops = upcomingWorkshops.length > 0;
  const currentBalance = creditBalance?.balance || 0;
  const hasInsufficientCredits = currentBalance < WORKSHOP_REQUEST_COST;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Demander à participer à un atelier
          </DialogTitle>
          <DialogDescription>
            Choisissez un atelier publié par {mentorName} et envoyez une demande
            de participation.
          </DialogDescription>
        </DialogHeader>

        {isLoadingWorkshops ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasWorkshops ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun atelier à venir disponible pour le moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Les ateliers publiés par {mentorName} apparaîtront ici une fois
              qu'ils seront disponibles.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workshopId">
                Sélectionner un atelier <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch("workshopId")}
                onValueChange={(value) => form.setValue("workshopId", value)}
              >
                <SelectTrigger id="workshopId">
                  <SelectValue placeholder="Choisir un atelier" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingWorkshops.map((workshop: WorkshopBasic) => (
                    <SelectItem key={workshop.id} value={workshop.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{workshop.title}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {workshop.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(workshop.date)}
                            </span>
                          )}
                          {workshop.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(workshop.time)}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.workshopId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.workshopId.message}
                </p>
              )}
            </div>

            {form.watch("workshopId") && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                {(() => {
                  const selectedWorkshop = upcomingWorkshops.find(
                    (w: WorkshopBasic) => w.id === form.watch("workshopId")
                  );
                  if (!selectedWorkshop) return null;
                  return (
                    <>
                      <p className="text-sm font-medium">
                        {selectedWorkshop.title}
                      </p>
                      {selectedWorkshop.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {selectedWorkshop.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        {selectedWorkshop.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(selectedWorkshop.date)}
                          </span>
                        )}
                        {selectedWorkshop.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(selectedWorkshop.time)}
                            {selectedWorkshop.duration &&
                              ` • ${selectedWorkshop.duration} min`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          Coût: {WORKSHOP_REQUEST_COST} crédits
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {hasInsufficientCredits && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <p>
                        Crédits insuffisants. Vous avez {currentBalance} crédit
                        {currentBalance > 1 ? "s" : ""} mais{" "}
                        {WORKSHOP_REQUEST_COST} crédits sont requis.
                      </p>
                      <p className="text-sm mt-1">
                        Veuillez acheter plus de crédits pour continuer.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        router.push("/buy-credits");
                      }}
                      className="w-full"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Acheter des crédits
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                placeholder="Ajoutez un message personnel pour le mentor..."
                rows={4}
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || hasInsufficientCredits}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Envoyer la demande"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
