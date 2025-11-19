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
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

const contactMentorSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
  subject: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || (val.length >= 3 && val.length <= 100),
      "Le sujet doit contenir entre 3 et 100 caractères, ou être vide"
    )
    .optional(),
});

type ContactMentorFormData = z.infer<typeof contactMentorSchema>;

interface ContactMentorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
}

export function ContactMentorDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
}: ContactMentorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactMentorFormData>({
    resolver: zodResolver(contactMentorSchema),
    defaultValues: {
      message: "",
      subject: "",
    },
  });

  const contactMutation = trpc.mentor.sendContactRequest.useMutation({
    onSuccess: () => {
      toast.success("Votre message a été envoyé avec succès !");
      reset();
      onOpenChange(false);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Erreur lors de l'envoi du message. Veuillez réessayer plus tard."
      );
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ContactMentorFormData) => {
    setIsSubmitting(true);
    contactMutation.mutate({
      mentorId,
      message: data.message,
      subject: data.subject || undefined,
    });
  };

  const messageLength = watch("message")?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px]"
        onClose={() => {
          reset();
          onOpenChange(false);
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contacter {mentorName}
          </DialogTitle>
          <DialogDescription>
            Envoyez un message à ce mentor pour poser vos questions sur ses
            ateliers ou son expertise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet (optionnel)</Label>
            <input
              id="subject"
              type="text"
              placeholder="Ex: Question sur votre atelier..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("subject")}
            />
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Votre message..."
              rows={6}
              maxLength={1000}
              {...register("message")}
            />
            <div className="flex justify-between items-center">
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {messageLength}/1000 caractères
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
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
