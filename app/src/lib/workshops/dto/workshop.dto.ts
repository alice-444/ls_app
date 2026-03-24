/**
 * @file workshop.dto.ts
 * Standardized Data Transfer Objects for Workshop-related data.
 */

import { UserResponseDTO, mapUserToDTO } from "../../users/dto/user.dto";

export interface WorkshopResponseDTO {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  date: Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  materialsNeeded: string | null;
  creditCost: number | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  
  // Relations
  creatorId: string;
  apprenticeId: string | null;
  creator?: UserResponseDTO | null;
  apprentice?: UserResponseDTO | null;
  
  // Computed fields for frontend
  apprenticeAttendanceStatus?: "PENDING" | "PRESENT" | "NO_SHOW" | null;
  averageRating?: number | null;
  feedbackCount?: number;
  dailyRoomId?: string | null;
}

/**
 * Mapper function to convert WorkshopEntity to WorkshopResponseDTO.
 * Follows SOLID by separating data structure from business logic.
 */
export function mapWorkshopToDTO(workshop: any): WorkshopResponseDTO {
  if (!workshop) return null as any;

  return {
    id: workshop.id,
    title: workshop.title,
    description: workshop.description,
    topic: workshop.topic,
    date: workshop.date ? new Date(workshop.date) : null,
    time: workshop.time,
    duration: workshop.duration,
    location: workshop.location,
    isVirtual: workshop.isVirtual,
    maxParticipants: workshop.maxParticipants,
    status: workshop.status,
    materialsNeeded: workshop.materialsNeeded,
    creditCost: workshop.creditCost,
    createdAt: new Date(workshop.createdAt),
    updatedAt: new Date(workshop.updatedAt),
    publishedAt: workshop.publishedAt ? new Date(workshop.publishedAt) : null,
    
    creatorId: workshop.creatorId,
    apprenticeId: workshop.apprenticeId,
    
    // Map relations using user mapper
    creator: workshop.creator ? mapUserToDTO(workshop.creator) : null,
    apprentice: workshop.apprentice ? mapUserToDTO(workshop.apprentice) : null,
    
    // Pass-through optional fields
    apprenticeAttendanceStatus: workshop.apprenticeAttendanceStatus,
    averageRating: workshop.averageRating,
    feedbackCount: workshop.feedbackCount,
    dailyRoomId: workshop.dailyRoomId,
  };
}

export interface WorkshopRequestResponseDTO {
  id: string;
  title: string;
  description: string | null;
  message: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  rejectionReason: string | null;
  createdAt: Date;
  
  apprenticeId: string;
  mentorId: string;
  workshopId: string | null;
  
  apprentice?: UserResponseDTO | null;
  mentor?: UserResponseDTO | null;
}

export function mapWorkshopRequestToDTO(request: any): WorkshopRequestResponseDTO {
  if (!request) return null as any;

  return {
    id: request.id,
    title: request.title,
    description: request.description,
    message: request.message,
    preferredDate: request.preferredDate ? new Date(request.preferredDate) : null,
    preferredTime: request.preferredTime,
    status: request.status,
    rejectionReason: request.rejectionReason,
    createdAt: new Date(request.createdAt),
    
    apprenticeId: request.apprenticeId,
    mentorId: request.mentorId,
    workshopId: request.workshopId,
    
    apprentice: request.apprentice ? mapUserToDTO(request.apprentice) : null,
    mentor: request.mentor ? mapUserToDTO(request.mentor) : null,
  };
}
