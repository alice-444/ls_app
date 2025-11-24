import { logger } from "./logger";
import { failure, type Result } from "./types";

export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  CONFLICT = "CONFLICT",
  DATABASE = "DATABASE",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
  INTERNAL = "INTERNAL",
}

export interface ErrorContext {
  category: ErrorCategory;
  operation: string;
  userId?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  originalError?: Error | unknown;
}

function getUserFriendlyMessage(
  category: ErrorCategory,
  operation: string,
  originalMessage?: string
): string {
  const operationMap: Record<string, string> = {
    createWorkshop: "créer l'atelier",
    updateWorkshop: "mettre à jour l'atelier",
    deleteWorkshop: "supprimer l'atelier",
    publishWorkshop: "publier l'atelier",
    acceptWorkshopRequest: "accepter la demande d'atelier",
    rejectWorkshopRequest: "rejeter la demande d'atelier",
    cancelWorkshopRequest: "annuler la demande d'atelier",
    submitWorkshopRequest: "soumettre la demande d'atelier",
    updateWorkshopRequest: "mettre à jour la demande d'atelier",
    cancelConfirmedWorkshop: "annuler l'atelier",
    rescheduleWorkshop: "reprogrammer l'atelier",
    updateWorkshopScheduling: "mettre à jour la planification",
    createNotification: "créer la notification",
    sendMessage: "envoyer le message",
    createConversation: "créer la conversation",
    sendContactRequest: "envoyer la demande de contact",
  };

  const operationLabel = operationMap[operation] || operation;

  switch (category) {
    case ErrorCategory.VALIDATION:
      return (
        originalMessage ||
        `Les données fournies pour ${operationLabel} sont invalides.`
      );
    case ErrorCategory.NOT_FOUND:
      return (
        originalMessage ||
        `La ressource demandée pour ${operationLabel} est introuvable.`
      );
    case ErrorCategory.UNAUTHORIZED:
      return originalMessage || `Vous n'êtes pas autorisé à ${operationLabel}.`;
    case ErrorCategory.CONFLICT:
      return (
        originalMessage || `Un conflit a été détecté lors de ${operationLabel}.`
      );
    case ErrorCategory.DATABASE:
      return `Une erreur de base de données s'est produite lors de ${operationLabel}. Veuillez réessayer.`;
    case ErrorCategory.EXTERNAL_SERVICE:
      return `Un service externe est temporairement indisponible. Veuillez réessayer plus tard.`;
    case ErrorCategory.INTERNAL:
    default:
      return `Une erreur inattendue s'est produite lors de ${operationLabel}. Veuillez réessayer.`;
  }
}

function getStatusCode(
  category: ErrorCategory,
  defaultStatus?: number
): number {
  if (defaultStatus) return defaultStatus;

  switch (category) {
    case ErrorCategory.VALIDATION:
      return 400;
    case ErrorCategory.NOT_FOUND:
      return 404;
    case ErrorCategory.UNAUTHORIZED:
      return 403;
    case ErrorCategory.CONFLICT:
      return 409;
    case ErrorCategory.DATABASE:
      return 500;
    case ErrorCategory.EXTERNAL_SERVICE:
      return 503;
    case ErrorCategory.INTERNAL:
    default:
      return 500;
  }
}

function categorizeError(error: unknown, operation: string): ErrorCategory {
  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  // Database errors
  if (
    errorMessage.includes("prisma") ||
    errorMessage.includes("database") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("query") ||
    errorMessage.includes("constraint")
  ) {
    return ErrorCategory.DATABASE;
  }

  // Not found errors
  if (
    errorMessage.includes("not found") ||
    errorMessage.includes("introuvable") ||
    errorMessage.includes("does not exist")
  ) {
    return ErrorCategory.NOT_FOUND;
  }

  // Unauthorized errors
  if (
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("not authorized") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("permission") ||
    errorMessage.includes("access denied")
  ) {
    return ErrorCategory.UNAUTHORIZED;
  }

  // Validation errors
  if (
    errorMessage.includes("validation") ||
    errorMessage.includes("invalid") ||
    errorMessage.includes("required") ||
    errorMessage.includes("zod")
  ) {
    return ErrorCategory.VALIDATION;
  }

  // Conflict errors
  if (
    errorMessage.includes("conflict") ||
    errorMessage.includes("duplicate") ||
    errorMessage.includes("already exists") ||
    errorMessage.includes("unique constraint")
  ) {
    return ErrorCategory.CONFLICT;
  }

  return ErrorCategory.INTERNAL;
}

export function handleError(
  error: unknown,
  context: ErrorContext
): Result<never> {
  const category =
    context.category || categorizeError(error, context.operation);
  const statusCode = getStatusCode(category);
  const userMessage = getUserFriendlyMessage(
    category,
    context.operation,
    error instanceof Error ? error.message : undefined
  );

  const logContext: Record<string, unknown> = {
    category,
    operation: context.operation,
    ...(context.userId && { userId: context.userId }),
    ...(context.resourceId && { resourceId: context.resourceId }),
    ...(context.details && { details: context.details }),
  };

  if (error instanceof Error) {
    logger.error(
      `Error in ${context.operation}: ${error.message}`,
      error,
      logContext
    );
  } else {
    logger.error(`Error in ${context.operation}`, error, logContext);
  }

  return failure(userMessage, statusCode);
}

export function createErrorContext(
  operation: string,
  options?: {
    category?: ErrorCategory;
    userId?: string;
    resourceId?: string;
    details?: Record<string, unknown>;
  }
): ErrorContext {
  return {
    category: options?.category || ErrorCategory.INTERNAL,
    operation,
    userId: options?.userId,
    resourceId: options?.resourceId,
    details: options?.details,
  };
}
