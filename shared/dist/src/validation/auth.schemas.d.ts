import { z } from "zod";
export declare const signUpInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    username: z.ZodString;
}, z.core.$strip>;
export type SignUpInput = z.infer<typeof signUpInputSchema>;
export declare const signInInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type SignInInput = z.infer<typeof signInInputSchema>;
