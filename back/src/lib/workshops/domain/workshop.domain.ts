import { WorkshopEntity } from "../repositories/workshop.repository.interface";
import { 
  calculateWorkshopEndTime, 
  calculateWorkshopStartTime 
} from "../utils/workshop-helpers";

/**
 * Domain logic for Workshops.
 * Centralizes all business rules following SOLID principles.
 */
export class WorkshopDomain {
  /**
   * Checks if a workshop has all required fields to be published.
   */
  static canBePublished(workshop: WorkshopEntity): { can: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    if (!workshop.title || workshop.title.length < 3) reasons.push("Titre trop court");
    if (!workshop.description || workshop.description.length < 30) reasons.push("Description trop courte (min 30 car.)");
    if (!workshop.topic) reasons.push("Domaine manquant");
    if (!workshop.date) reasons.push("Date manquante");
    if (!workshop.time) reasons.push("Heure manquante");
    
    // Check if date is in the future
    if (workshop.date && new Date(workshop.date) <= new Date()) {
      reasons.push("La date doit être dans le futur");
    }

    return {
      can: reasons.length === 0,
      reasons
    };
  }

  /**
   * Checks if the workshop is currently happening or about to start.
   */
  static isLive(workshop: WorkshopEntity, windowMinutes: number = 30): boolean {
    if (!workshop.date || !workshop.time) return false;
    
    const startTime = calculateWorkshopStartTime(workshop.date, workshop.time);
    const endTime = calculateWorkshopEndTime(workshop.date, workshop.time, workshop.duration);
    
    if (!startTime || !endTime) return false;
    
    const now = new Date();
    const bufferStart = new Date(startTime.getTime() - windowMinutes * 60000);
    
    return now >= bufferStart && now <= endTime;
  }

  /**
   * Checks if the workshop is full.
   */
  static isFull(workshop: WorkshopEntity, currentParticipants: number): boolean {
    if (!workshop.maxParticipants) return false;
    return currentParticipants >= workshop.maxParticipants;
  }

  /**
   * Determines if a user can join this workshop.
   */
  static canUserJoin(workshop: WorkshopEntity, userId: string, isFull: boolean): { can: boolean; reason?: string } {
    if (workshop.status !== "PUBLISHED") return { can: false, reason: "Cet atelier n'est pas publié" };
    if (workshop.creatorId === userId) return { can: false, reason: "Vous êtes le créateur de cet atelier" };
    if (workshop.apprenticeId) return { can: false, reason: "Cet atelier a déjà un apprenti" };
    if (isFull) return { can: false, reason: "Cet atelier est complet" };
    
    return { can: true };
  }
}
