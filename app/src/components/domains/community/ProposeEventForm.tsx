"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  date: z.string().min(1, "Choisis une date"),
  location: z.string().min(3, "Le lieu doit faire au moins 3 caractères"),
  link: z.string().url("Entre une URL valide").optional().or(z.literal("")),
});

interface ProposeEventFormProps {
  onSuccess: () => void;
}

export function ProposeEventForm({ onSuccess }: Readonly<ProposeEventFormProps>) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      link: "",
    },
  });

  const proposeMutation = trpc.community.proposeEvent.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Événement proposé avec succès !");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    proposeMutation.mutate({
      ...values,
      date: new Date(values.date),
      link: values.link || undefined,
    });
  }

  if (isSubmitted) {
    return (
      <motion.div
        className="py-10 text-center space-y-4"
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      >
        <motion.div
          className="bg-ls-success/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={prefersReducedMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <CheckCircle2 className="w-10 h-10 text-ls-success" />
        </motion.div>
        <h3 className="text-2xl font-black text-ls-heading">Merci !</h3>
        <p className="text-ls-muted max-w-xs mx-auto">
          Ta proposition a été envoyée aux modérateurs. Elle apparaîtra dans l'Events Hub une fois approuvée.
        </p>
        <Button
          onClick={onSuccess}
          className="bg-ls-success hover:bg-ls-success/90 text-white font-bold h-11 rounded-full px-8 mt-4"
        >
          Compris !
        </Button>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de l'événement</FormLabel>
              <FormControl>
                <Input placeholder="ex. Meetup étudiant - Data Science" className="rounded-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date et heure</FormLabel>
                <FormControl>
                  <Input type="datetime-local" className="rounded-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <FormControl>
                  <Input placeholder="Paris, En ligne, etc." className="rounded-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décris l'événement (objectif, public, etc.)"
                  className="min-h-[100px] rounded-2xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lien externe (inscription, infos...)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="rounded-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="cta" size="cta" className="w-full font-bold h-11"
          disabled={proposeMutation.isPending}
        >
          {proposeMutation.isPending ? "Envoi..." : "Envoyer la proposition"}
        </Button>
      </form>
    </Form>
  );
}
