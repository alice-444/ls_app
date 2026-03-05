"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    },
  });

  const contactMutation = trpc.mentor.contactMentor.useMutation({
    onSuccess: (data: { conversationId: string }) => {
      toast.success("Votre message a été envoyé ! Redirection vers la messagerie...");
      reset();
      onOpenChange(false);
      setIsSubmitting(false);
      router.push(`/inbox/${data.conversationId}`);
    },
    onError: (error: { message?: string }) => {
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
          <DialogTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
            <MessageSquare className="h-5 w-5" />
            Contacter {mentorName}
          </DialogTitle>
          <DialogDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Envoyez un message à ce mentor pour poser vos questions sur ses
            ateliers ou son expertise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[#26547c] dark:text-[#e6e6e6]">Message *</Label>
            <Textarea
              id="message"
              placeholder="Ex: Bonjour, j'aimerais en savoir plus sur votre atelier de design..."
              rows={6}
              maxLength={1000}
              className="resize-none focus-visible:ring-[#ffb647]"
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
              className="rounded-full border-[#26547c]/20 text-[#26547c]"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#ffb647] hover:bg-[#ff9f1a] text-[#161616] rounded-full font-semibold"
            >
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
