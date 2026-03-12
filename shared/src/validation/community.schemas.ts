import { z } from "zod";

export const studentDealSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(["FOOD", "SOFTWARE", "LEISURE", "SERVICES"]),
  link: z.string().url(),
  promoCode: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export const communitySpotSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  address: z.string().min(5).max(200),
  tags: z.array(z.string()).min(1).max(10),
  imageUrl: z.string().url().optional().nullable(),
});

export const communityEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  date: z.coerce.date(),
  location: z.string().min(3).max(200),
  link: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export const communityPollSchema = z.object({
  question: z.string().min(10).max(200),
  options: z
    .array(
      z.object({
        label: z.string().min(1).max(100),
      }),
    )
    .min(2)
    .max(10),
});
