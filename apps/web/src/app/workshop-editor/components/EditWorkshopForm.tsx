"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import {
  editWorkshopFrontendSchema,
  type EditWorkshopFrontendData,
} from "@/shared/validation";
import {
  WorkshopFormFields,
  convertDurationToMinutes,
  extractDurationParts,
} from "./WorkshopFormFields";

interface EditWorkshopFormProps {
  workshop: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditWorkshopForm({
  workshop,
  onSuccess,
  onCancel,
}: EditWorkshopFormProps) {
  const { hours, minutes } = extractDurationParts(workshop.duration);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditWorkshopFrontendData>({
    resolver: zodResolver(editWorkshopFrontendSchema),
    defaultValues: {
      workshopId: workshop.id,
      title: workshop.title || "",
      description: workshop.description || "",
      date: workshop.date
        ? new Date(workshop.date).toISOString().split("T")[0]
        : "",
      time: workshop.time || "",
      durationHours: hours,
      durationMinutes: minutes,
      location: workshop.location || "",
      isVirtual: workshop.isVirtual || false,
      maxParticipants: workshop.maxParticipants || undefined,
      materialsNeeded: workshop.materialsNeeded || "",
    },
  });

  const isVirtual = watch("isVirtual");
  const description = watch("description") || "";

  const updateMutation = trpc.workshop.update.useMutation({
    onSuccess: () => {
      toast.success("Atelier modifié avec succès!", {
        description: "Les modifications ont été enregistrées.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erreur lors de la modification", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: EditWorkshopFrontendData) => {
    const duration = convertDurationToMinutes(
      data.durationHours,
      data.durationMinutes
    );

    updateMutation.mutate({
      workshopId: data.workshopId,
      title: data.title,
      description: data.description || "",
      date: data.date ? new Date(data.date) : undefined,
      time: data.time || undefined,
      duration: duration || undefined,
      location: data.location || null,
      isVirtual: data.isVirtual,
      maxParticipants: data.maxParticipants || null,
      materialsNeeded: data.materialsNeeded || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Modifier l'atelier</CardTitle>
        <CardDescription>
          Mettez à jour les informations de votre atelier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <WorkshopFormFields
            register={register}
            control={control}
            errors={errors}
            isVirtual={isVirtual}
            description={description}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {(isSubmitting || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer les modifications
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || updateMutation.isPending}
              >
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
