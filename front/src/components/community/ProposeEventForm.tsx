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
import { CheckCircle2, PartyPopper } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Please select a date"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

interface ProposeEventFormProps {
  onSuccess: () => void;
}

export function ProposeEventForm({ onSuccess }: ProposeEventFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
      toast.success("Event proposed successfully!");
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
      <div className="py-10 text-center space-y-4">
        <div className="bg-ls-success/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-ls-success" />
        </div>
        <h3 className="text-2xl font-black text-ls-heading">Thank you!</h3>
        <p className="text-ls-text-light max-w-xs mx-auto">
          Your event proposal has been sent to our moderators. It will appear in the Events Hub once approved.
        </p>
        <Button 
          onClick={onSuccess}
          className="bg-ls-success hover:bg-ls-success/90 text-white font-bold h-11 rounded-full px-8 mt-4"
        >
          Got it!
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
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Student Meetup - Data Science" {...field} />
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
                <FormLabel>Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
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
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Paris, Online, etc." {...field} />
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
                  placeholder="Describe the event (purpose, audience, etc.)" 
                  className="min-h-[100px]"
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
              <FormLabel>External Link (Registration, Info...)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-brand hover:bg-brand/90 text-white font-bold h-11 rounded-full"
          disabled={proposeMutation.isPending}
        >
          {proposeMutation.isPending ? "Sending..." : "Submit Proposal"}
        </Button>
      </form>
    </Form>
  );
}
