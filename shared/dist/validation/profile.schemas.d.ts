import { z } from "zod";
export declare const SOCIAL_PLATFORMS: readonly [
  "linkedin",
  "twitter",
  "youtube",
  "github",
];
export declare const mentorProfileSchema: z.ZodObject<
  {
    name: z.ZodString;
    bio: z.ZodString;
    domain: z.ZodString;
    photoUrl: z.ZodOptional<
      z.ZodUnion<readonly [z.ZodString, z.ZodNull, z.ZodUndefined]>
    >;
    qualifications: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    experience: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    socialMediaLinks: z.ZodNullable<
      z.ZodOptional<
        z.ZodRecord<
          z.ZodEnum<{
            linkedin: "linkedin";
            twitter: "twitter";
            youtube: "youtube";
            github: "github";
          }>,
          z.ZodString
        >
      >
    >;
    areasOfExpertise: z.ZodArray<z.ZodString>;
    mentorshipTopics: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    displayName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    iceBreakerTags: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString>>>;
  },
  z.core.$strip
>;
export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;
