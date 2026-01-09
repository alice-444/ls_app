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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import type { EditWorkshopRequestDialogProps } from "@/types/workshop-components";

const editRequestSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional()
    .nullable(),
  message: z
    .string()
    .max(500, "Le message ne peut pas dépasser 500 caractères")
    .optional()
    .nullable(),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
});

type EditRequestFormData = z.infer<typeof editRequestSchema>;

export function EditWorkshopRequestDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: EditWorkshopRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRequest = trpc.mentor.updateWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande modifiée et renvoyée avec succès !");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast.error(
        error.message || "Erreur lors de la modification de la demande"
      );
      setIsSubmitting(false);
    },
  });

  const form = useForm<EditRequestFormData>({
    resolver: zodResolver(editRequestSchema),
    defaultValues: {
      title: request.title || "",
      description: request.description || "",
      message: request.message || "",
      preferredDate: request.preferredDate
        ? new Date(request.preferredDate).toISOString().split("T")[0]
        : "",
      preferredTime: request.preferredTime || "",
    },
  });

  useEffect(() => {
    if (open && request) {
      form.reset({
        title: request.title || "",
        description: request.description || "",
        message: request.message || "",
        preferredDate: request.preferredDate
          ? new Date(request.preferredDate).toISOString().split("T")[0]
          : "",
        preferredTime: request.preferredTime || "",
      });
    }
  }, [open, request, form]);

  const onSubmit = async (data: EditRequestFormData) => {
    setIsSubmitting(true);

    const updateData: {
      title: string;
      description: string | null;
      message: string | null;
      preferredDate: string | null;
      preferredTime: string | null;
    } = {
      title: data.title,
      description: data.description || null,
      message: data.message || null,
      preferredDate: data.preferredDate || null,
      preferredTime: data.preferredTime || null,
    };

    await updateRequest.mutateAsync({
      requestId: request.id,
      ...updateData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Modifier et renvoyer la demande
          </DialogTitle>
          <DialogDescription>
            Modifiez votre demande d'atelier et renvoyez-la au même mentor. Elle
            sera remise en attente.
            {request.mentor?.user?.name && (
              <span className="block mt-2 text-sm font-medium">
                Mentor: {request.mentor.user.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Titre de la demande <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Ex: Atelier sur les bases de données"
              disabled={isSubmitting}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Décrivez ce que vous souhaitez apprendre..."
              rows={4}
              disabled={isSubmitting}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message au mentor (optionnel)</Label>
            <Textarea
              id="message"
              {...form.register("message")}
              placeholder="Ajoutez un message personnel au mentor..."
              rows={3}
              disabled={isSubmitting}
            />
            {form.formState.errors.message && (
              <p className="text-sm text-red-500">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Date préférée (optionnel)</Label>
              <Input
                id="preferredDate"
                type="date"
                {...form.register("preferredDate")}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Heure préférée (optionnel)</Label>
              <Input
                id="preferredTime"
                type="time"
                {...form.register("preferredTime")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Modifier et renvoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
