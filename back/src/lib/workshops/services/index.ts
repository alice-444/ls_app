export { WorkshopService } from "./workshop.service";
export type { IWorkshopService } from "./workshop.service.interface";
export type {
  CreateWorkshopInput,
  UpdateWorkshopInput,
  PublishWorkshopInput,
  UnpublishWorkshopInput,
  DeleteWorkshopInput,
} from "./workshop.service";
export {
  createWorkshopSchema,
  updateWorkshopSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
  cancelWorkshopSchema,
} from "./workshop.service";

// Sub-services (SRP)
export * from "./lifecycle";
export * from "./scheduling";
export * from "./query";
export { WorkshopAccessGuard } from "./guards/workshop-access.guard";
export type { IWorkshopAccessGuard } from "./guards/workshop-access.guard";
export { WorkshopEmailTemplates } from "./email/workshop-email.templates";

// Notification service
export { WorkshopNotificationService } from "./workshop-notification.service";

// Feedback services
export * from "./feedback";

// Rewards services
export * from "./rewards";

// Video services
export * from "./video";

