export interface SegmentationCriteria {
    role?: "MENTOR" | "APPRENANT" | "ADMIN";
    status?: "PENDING" | "ACTIVE" | "SUSPENDED";
    isPublished?: boolean;
    hasPublishedWorkshop?: boolean;
    minCredits?: number;
    maxCredits?: number;
}
export interface BulkNotificationInput {
    criteria: SegmentationCriteria;
    title: string;
    message: string;
    type: string;
    actionUrl?: string;
}
