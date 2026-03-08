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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  link: z.string().url("Please enter a valid URL"),
  promoCode: z.string().optional(),
});

interface ProposeDealFormProps {
  onSuccess: () => void;
}

export function ProposeDealForm({ onSuccess }: ProposeDealFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      toast.success("Deal proposed successfully!");
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
      <div className="py-10 text-center space-y-4">
        <div className="bg-ls-blue/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-ls-blue" />
        </div>
        <h3 className="text-2xl font-black text-ls-heading">Awesome!</h3>
        <p className="text-ls-text-light max-w-xs mx-auto">
          Thanks for sharing this deal. Our team will review it and make it public for everyone soon.
        </p>
        <Button 
          onClick={onSuccess}
          className="bg-ls-blue hover:bg-ls-blue/90 text-white font-bold h-11 rounded-full px-8 mt-4"
        >
          Close
        </Button>
      </div>
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
              <FormLabel>Deal Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 50% off at Burger King" {...field} />
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
                  <SelectTrigger className="rounded-xl border-ls-border h-11">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
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
                  placeholder="Tell us more about this deal..." 
                  className="min-h-[100px] rounded-xl border-ls-border"
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
                <FormLabel>External Link</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." className="rounded-xl border-ls-border" {...field} />
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
                <FormLabel>Promo Code (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="STUDENT20" className="rounded-xl border-ls-border" {...field} />
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
          {proposeMutation.isPending ? "Sending..." : "Submit Proposal"}
        </Button>
      </form>
    </Form>
  );
}
