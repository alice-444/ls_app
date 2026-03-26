/**
 * Centralized mappings for admin labels.
 * Ensures consistency across the entire admin space.
 */

export const ADMIN_STATUS_LABELS: Record<string, string> = {
  // Common statuses
  PENDING: "En attente",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
  REVIEWED: "En cours",
  RESOLVED: "Résolu",
  DISMISSED: "Ignoré",

  // Workshop statuses
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",

  // Generic
  ALL: "Tous",
};

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MENTOR: "Mentor",
  APPRENANT: "Apprenant",
};

export const ADMIN_REPORT_REASON_LABELS: Record<string, string> = {
  HARASSMENT: "Harcèlement",
  SPAM: "Spam",
  INAPPROPRIATE_CONTENT: "Contenu inapproprié",
  FAKE_PROFILE: "Faux profil",
};

export const ADMIN_COMMUNITY_CATEGORIES: Record<string, string> = {
  FOOD: "Alimentation",
  SOFTWARE: "Logiciels / Outils",
  LEISURE: "Loisirs",
  SERVICES: "Services",
};

/**
 * Helper to get label with fallback to key
 */
export const getAdminLabel = (
  key: string | null | undefined,
  mapping: Record<string, string>,
): string => {
  if (!key) return "—";
  return mapping[key] || key;
};
