/**
 * Limites d'affichage pour le Community Hub.
 * Utilisées par le backend (Prisma take) et le frontend (slice).
 */
export const COMMUNITY_HUB_LIMITS = {
  upcomingWorkshops: 4,
  communityEvents: 6,
  deals: 8,
  spots: 6,
  featuredMembers: 5,
} as const;
