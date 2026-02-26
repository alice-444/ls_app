"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

const requestWorkshopSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z
    .string()
    .trim()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional()
    .nullable(),
  message: z
    .string()
    .trim()
    .max(500, "Le message ne peut pas dépasser 500 caractères")
    .optional()
    .nullable(),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
});

type RequestWorkshopFormData = z.infer<typeof requestWorkshopSchema>;

interface RequestWorkshopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
}

export function RequestWorkshopDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
}: RequestWorkshopDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RequestWorkshopFormData>({
    resolver: zodResolver(requestWorkshopSchema),
    defaultValues: {
      title: "",
      description: "",
      message: "",
      preferredDate: "",
      preferredTime: "",
    },
  });

  const requestMutation = trpc.mentor.submitWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande d'atelier envoyée avec succès !", {
        description: "Votre demande a été transmise au mentor.",
      });
      reset();
      onOpenChange(false);
      setIsSubmitting(false);
    },
    onError: (error: { message?: string }) => {
      toast.error(
        error.message ||
          "Erreur lors de l'envoi de la demande. Veuillez réessayer plus tard."
      );
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: RequestWorkshopFormData) => {
    setIsSubmitting(true);
    requestMutation.mutate({
      mentorId,
      title: data.title,
      description: data.description || null,
      message: data.message || null,
      preferredDate: data.preferredDate || null,
      preferredTime: data.preferredTime || null,
    });
  };

  const titleLength = watch("title")?.length || 0;
  const descriptionLength = watch("description")?.length || 0;
  const messageLength = watch("message")?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onClose={() => {
          reset();
          onOpenChange(false);
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Demander un atelier à {mentorName}
          </DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire pour demander un atelier personnalisé à ce
            mentor. Votre demande sera envoyée directement au mentor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Titre de l'atelier <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Ex: Introduction à la programmation Python"
              {...register("title")}
            />
            <div className="flex justify-between items-center">
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {titleLength}/200 caractères
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez ce que vous souhaitez apprendre ou les sujets que vous aimeriez aborder..."
              rows={4}
              maxLength={1000}
              {...register("description")}
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {descriptionLength}/1000 caractères
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Date préférée (optionnel)</Label>
              <Input
                id="preferredDate"
                type="date"
                {...register("preferredDate")}
              />
              {errors.preferredDate && (
                <p className="text-sm text-red-500">
                  {errors.preferredDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Heure préférée (optionnel)</Label>
              <Input
                id="preferredTime"
                type="time"
                {...register("preferredTime")}
              />
              {errors.preferredTime && (
                <p className="text-sm text-red-500">
                  {errors.preferredTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message additionnel (optionnel)</Label>
            <Textarea
              id="message"
              placeholder="Ajoutez toute information supplémentaire que vous souhaitez partager avec le mentor..."
              rows={3}
              maxLength={500}
              {...register("message")}
            />
            <div className="flex justify-between items-center">
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {messageLength}/500 caractères
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Envoyer la demande
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
