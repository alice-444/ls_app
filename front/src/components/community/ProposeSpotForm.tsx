"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Le nom doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  address: z.string().min(5, "L'adresse doit faire au moins 5 caractères"),
  tags: z.array(z.string()).min(1, "Choisis au moins un tag"),
});

interface ProposeSpotFormProps {
  onSuccess: () => void;
}

const AVAILABLE_TAGS = ["Ultra Calme", "Prises dispo", "Café pas cher", "Ouvert tard", "Wi-Fi Gratuit"];

export function ProposeSpotForm({ onSuccess }: Readonly<ProposeSpotFormProps>) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      tags: [],
    },
  });

  const proposeMutation = trpc.community.proposeSpot.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Spot recommandé avec succès !");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    proposeMutation.mutate(values);
  }

  const toggleTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    if (currentTags.includes(tag)) {
      form.setValue("tags", currentTags.filter(t => t !== tag));
    } else {
      form.setValue("tags", [...currentTags, tag]);
    }
    form.trigger("tags");
  };

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
        <h3 className="text-2xl font-black text-ls-heading">Parfait !</h3>
        <p className="text-ls-muted max-w-xs mx-auto">
          Merci pour cette recommandation. On va vérifier et l'ajouter au Spot Finder très bientôt.
        </p>
        <Button
          onClick={onSuccess}
          className="bg-ls-success hover:bg-ls-success/90 text-white font-bold h-11 rounded-full px-8 mt-4"
        >
          Compris
        </Button>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du spot</FormLabel>
              <FormControl>
                <Input placeholder="ex. Bibliothèque Sainte-Geneviève" className="rounded-full border-border h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="10 Place du Panthéon, Paris" className="rounded-full border-border h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Pourquoi recommandes-tu cet endroit ?"
                  className="min-h-[80px] rounded-2xl border-border"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={field.value.includes(tag) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-3 py-1 rounded-full transition-all border-ls-border font-bold text-[10px]",
                      field.value.includes(tag) ? "bg-ls-success text-white border-ls-success" : "hover:border-ls-success text-ls-muted"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-ls-success hover:bg-ls-success/90 text-white font-bold h-11 rounded-full mt-4 shadow-lg shadow-ls-success/20"
          disabled={proposeMutation.isPending}
        >
          {proposeMutation.isPending ? "Envoi..." : "Envoyer la recommandation"}
        </Button>
      </form>
    </Form>
  );
}
