import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const dom = new JSDOM("", {
  url: "http://localhost",
});
const window = dom.window as unknown as Window & typeof globalThis;
const purify = DOMPurify(window);

export interface SanitizeOptions {
  maxLength?: number;
  trim?: boolean;
}

export function sanitizeString(
  input: string | null | undefined,
  options: SanitizeOptions = {}
): string {
  if (input === null || input === undefined) {
    throw new Error("Input cannot be null or undefined");
  }

  const { maxLength, trim = true } = options;

  let processed = trim ? input.trim() : input;

  const sanitized = purify.sanitize(processed, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  if (maxLength !== undefined && sanitized.length > maxLength) {
    throw new Error(
      `Sanitized string exceeds maximum length of ${maxLength} characters (got ${sanitized.length})`
    );
  }

  return sanitized;
}

export function sanitizeStringWithTruncate(
  input: string | null | undefined,
  maxLength: number,
  trim: boolean = true
): string {
  if (input === null || input === undefined) {
    return "";
  }

  let processed = trim ? input.trim() : input;
  const sanitized = purify.sanitize(processed, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export function sanitizeStrings(
  inputs: Record<string, string | null | undefined>,
  options: SanitizeOptions = {}
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(inputs)) {
    if (value !== null && value !== undefined) {
      sanitized[key] = sanitizeString(value, options);
    }
  }
  return sanitized;
}
