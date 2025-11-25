import { logger } from "../lib/common/logger";
import type { Result } from "../lib/common";

const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur est survenue. Veuillez réessayer.";
};

export function handleRouterResult<T>(
  result: Result<T>,
  errorContext: {
    operation: string;
    userId?: string;
    [key: string]: unknown;
  }
): T {
  if (!result.ok) {
    logger.error(`${errorContext.operation} error`, result.error, errorContext);
    throw new Error(getSafeErrorMessage(result.error));
  }
  return result.data;
}
