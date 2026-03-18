export const getSafeMessagingErrorMessage = (error: string): string => {
  if (error.includes("not found") || error.includes("Not found")) {
    return "Ressource introuvable";
  }
  if (
    error.includes("unauthorized") ||
    error.includes("Unauthorized") ||
    error.includes("Not a participant")
  ) {
    return "Vous n'êtes pas autorisé à effectuer cette action";
  }
  if (error.includes("validation") || error.includes("Validation")) {
    return "Les données fournies sont invalides";
  }
  if (error.includes("time limit") || error.includes("Time limit")) {
    return "Le délai pour cette action a expiré";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
};
