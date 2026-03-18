import { z } from "zod";
import { Result, failure } from "./types";

export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  input: unknown
): Result<T> => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return failure(errorMessage, 400);
  }
  return { ok: true, data: parsed.data };
};
