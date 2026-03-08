"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  category: z.string().min(1, "Choisis une catégorie"),
  link: z.string().url("Entre une URL valide"),
  promoCode: z.string().optional(),
});

interface ProposeDealFormProps {
  onSuccess: () => void;
}

export function ProposeDealForm({ onSuccess }: ProposeDealFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "FOOD",
      link: "",
      promoCode: "",
    },
  });

  const proposeMutation = trpc.community.proposeDeal.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Offre proposée avec succès !");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    proposeMutation.mutate(values);
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
          className="bg-ls-blue/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={prefersReducedMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <CheckCircle2 className="w-10 h-10 text-ls-blue" />
        </motion.div>
        <h3 className="text-2xl font-black text-ls-heading">Super !</h3>
        <p className="text-ls-muted max-w-xs mx-auto">
          Merci pour cette offre. L'équipe va la vérifier et la publier pour tout le monde.
        </p>
        <Button 
          onClick={onSuccess}
          className="bg-ls-blue hover:bg-ls-blue/90 text-white font-bold h-11 rounded-full px-8 mt-4"
        >
          Fermer
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
              <FormLabel>Titre de l'offre</FormLabel>
              <FormControl>
                <Input placeholder="ex. 50% chez Burger King" className="rounded-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-full border-border h-11">
                    <SelectValue placeholder="Choisis une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="FOOD">Food & Drink</SelectItem>
                  <SelectItem value="SOFTWARE">Software & Tech</SelectItem>
                  <SelectItem value="CULTURE">Culture & Leisure</SelectItem>
                  <SelectItem value="SERVICES">Services</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Dis-nous en plus sur cette offre..." 
                  className="min-h-[100px] rounded-2xl border-border"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lien externe</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." className="rounded-full border-border" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promoCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code promo (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="STUDENT20" className="rounded-full border-border" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-ls-blue hover:bg-ls-blue/90 text-white font-bold h-11 rounded-full shadow-lg shadow-ls-blue/20"
          disabled={proposeMutation.isPending}
        >
          {proposeMutation.isPending ? "Envoi..." : "Envoyer la proposition"}
        </Button>
      </form>
    </Form>
  );
}
