import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const dom = new JSDOM("", {
  url: "http://localhost",
});
const window = dom.window as unknown as Window & typeof globalThis;
const purify = DOMPurify(window);

export function sanitizeString(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

export function sanitizeStrings(
  inputs: Record<string, string>
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(inputs)) {
    sanitized[key] = sanitizeString(value);
  }
  return sanitized;
}
