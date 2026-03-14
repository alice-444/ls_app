import { z } from "zod";
export declare const workshopFieldSchemas: {
    readonly title: z.ZodString;
    readonly description: z.ZodString;
    readonly date: z.ZodCoercedDate<unknown>;
    readonly time: z.ZodString;
    readonly duration: z.ZodNumber;
    readonly location: z.ZodString;
    readonly isVirtual: z.ZodBoolean;
    readonly maxParticipants: z.ZodNumber;
    readonly materialsNeeded: z.ZodString;
    readonly topic: z.ZodString;
    readonly creditCost: z.ZodNumber;
};
export declare const createWorkshopBackendSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    topic: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    date: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    time: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    duration: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isVirtual: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    maxParticipants: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    materialsNeeded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    creditCost: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateWorkshopBackendSchema: z.ZodObject<{
    workshopId: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    topic: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    time: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isVirtual: z.ZodOptional<z.ZodBoolean>;
    maxParticipants: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    materialsNeeded: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    creditCost: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const createWorkshopFrontendSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    time: z.ZodOptional<z.ZodString>;
    durationHours: z.ZodNumber;
    durationMinutes: z.ZodNumber;
    location: z.ZodOptional<z.ZodString>;
    isVirtual: z.ZodBoolean;
    maxParticipants: z.ZodOptional<z.ZodNumber>;
    materialsNeeded: z.ZodOptional<z.ZodString>;
    topic: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    creditCost: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const editWorkshopFrontendSchema: z.ZodObject<{
    workshopId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    time: z.ZodOptional<z.ZodString>;
    durationHours: z.ZodNumber;
    durationMinutes: z.ZodNumber;
    location: z.ZodOptional<z.ZodString>;
    isVirtual: z.ZodBoolean;
    maxParticipants: z.ZodOptional<z.ZodNumber>;
    materialsNeeded: z.ZodOptional<z.ZodString>;
    topic: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    creditCost: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const publishWorkshopSchema: z.ZodObject<{
    workshopId: z.ZodString;
}, z.core.$strip>;
export declare const unpublishWorkshopSchema: z.ZodObject<{
    workshopId: z.ZodString;
}, z.core.$strip>;
export declare const deleteWorkshopSchema: z.ZodObject<{
    workshopId: z.ZodString;
}, z.core.$strip>;
export declare const cancelWorkshopSchema: z.ZodObject<{
    workshopId: z.ZodString;
}, z.core.$strip>;
export type CreateWorkshopBackendInput = z.infer<typeof createWorkshopBackendSchema>;
export type UpdateWorkshopBackendInput = z.infer<typeof updateWorkshopBackendSchema>;
export type CreateWorkshopFrontendData = z.infer<typeof createWorkshopFrontendSchema>;
export type EditWorkshopFrontendData = z.infer<typeof editWorkshopFrontendSchema>;
export type PublishWorkshopInput = z.infer<typeof publishWorkshopSchema>;
export type UnpublishWorkshopInput = z.infer<typeof unpublishWorkshopSchema>;
export type DeleteWorkshopInput = z.infer<typeof deleteWorkshopSchema>;
export type CancelWorkshopInput = z.infer<typeof cancelWorkshopSchema>;
