import { randomUUID } from "crypto";

export const generateInternalId = (): string => {
  return randomUUID();
};
