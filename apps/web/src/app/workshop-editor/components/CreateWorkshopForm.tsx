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
  createWorkshopFrontendSchema,
  type CreateWorkshopFrontendData,
} from "@/shared/validation";
import {
  WorkshopFormFields,
  convertDurationToMinutes,
} from "./WorkshopFormFields";

interface CreateWorkshopFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateWorkshopForm({
  onSuccess,
  onCancel,
}: CreateWorkshopFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateWorkshopFrontendData>({
    resolver: zodResolver(createWorkshopFrontendSchema),
    defaultValues: {
      isVirtual: false,
      durationHours: 0,
      durationMinutes: 0,
    },
  });

  const isVirtual = watch("isVirtual");
  const description = watch("description") || "";

  const createMutation = trpc.workshop.create.useMutation({
    onSuccess: () => {
      toast.success("Atelier créé avec succès!", {
        description: "Votre atelier a été créé en mode brouillon.",
      });
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erreur lors de la création", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: CreateWorkshopFrontendData) => {
    const duration = convertDurationToMinutes(
      data.durationHours,
      data.durationMinutes
    );

    createMutation.mutate({
      title: data.title,
      description: data.description || "",
      date: data.date ? new Date(data.date) : null,
      time: data.time || null,
      duration,
      location: data.location || null,
      isVirtual: data.isVirtual,
      maxParticipants: data.maxParticipants || null,
      materialsNeeded: data.materialsNeeded || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Créer un nouvel atelier</CardTitle>
        <CardDescription>
          Remplissez les informations pour créer votre atelier
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
              disabled={isSubmitting || createMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer l'atelier
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || createMutation.isPending}
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
