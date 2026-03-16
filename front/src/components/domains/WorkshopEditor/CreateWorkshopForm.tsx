"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import {
  createWorkshopFrontendSchema,
  type CreateWorkshopFrontendData,
} from "@ls-app/shared";
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
}: Readonly<CreateWorkshopFormProps>) {
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
      creditCost: 20,
    },
  });

  const isVirtual = watch("isVirtual");
  const description = watch("description") || "";

  const createMutation = trpc.workshop.create.useMutation({
    onSuccess: () => {
      toast.success("Atelier créé avec succès!", {
        description: "Ton atelier a été créé en mode brouillon.",
      });
      reset();
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast.error("Erreur lors de la création", {
        description: error.message || "Une erreur est survenue",
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
      topic: data.topic || null,
      date: data.date || null,
      time: data.time || null,
      duration,
      location: data.location || null,
      isVirtual: data.isVirtual,
      maxParticipants: data.maxParticipants || null,
      materialsNeeded: data.materialsNeeded || null,
      creditCost: data.creditCost ?? 20,
    });
  };

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Veuillez vérifier les champs du formulaire", {
      description: "Certains champs sont invalides.",
    });
  };

  return (
    <Card className="border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-ls-heading">
          Créer un nouvel atelier
        </CardTitle>
        <CardDescription className="text-ls-muted">
          Remplis les informations pour créer ton atelier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
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
              className="flex-1 rounded-full font-semibold"
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
                className="rounded-full"
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
