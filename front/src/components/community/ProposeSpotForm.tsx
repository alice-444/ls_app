"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  tags: z.array(z.string()).min(1, "Please select at least one tag"),
});

interface ProposeSpotFormProps {
  onSuccess: () => void;
}

const AVAILABLE_TAGS = ["Ultra Calme", "Prises dispo", "Café pas cher", "Ouvert tard", "Wi-Fi Gratuit"];

export function ProposeSpotForm({ onSuccess }: ProposeSpotFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      toast.success("Spot recommended successfully!");
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
      <div className="py-10 text-center space-y-4">
        <div className="bg-ls-success/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-ls-success" />
        </div>
        <h3 className="text-2xl font-black text-ls-heading">Perfect!</h3>
        <p className="text-ls-text-light max-w-xs mx-auto">
          Thanks for this recommendation. We'll check it out and add it to the Spot Finder very soon.
        </p>
        <Button 
          onClick={onSuccess}
          className="bg-ls-success hover:bg-ls-success/90 text-white font-bold h-11 rounded-full px-8 mt-4"
        >
          Got it
        </Button>
      </div>
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
              <FormLabel>Spot Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bibliothèque Sainte-Geneviève" className="rounded-xl border-ls-border h-11" {...field} />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="10 Place du Panthéon, Paris" className="rounded-xl border-ls-border h-11" {...field} />
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
                  placeholder="Why do you recommend this place?" 
                  className="min-h-[80px] rounded-xl border-ls-border"
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
                      field.value.includes(tag) ? "bg-ls-success text-white border-ls-success" : "hover:border-ls-success text-ls-text-light"
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
          {proposeMutation.isPending ? "Sending..." : "Submit Recommendation"}
        </Button>
      </form>
    </Form>
  );
}
