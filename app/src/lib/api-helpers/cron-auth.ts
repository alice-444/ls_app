import { NextRequest } from "next/server";

/**
 * Checks if the request is authorized to run a cron job.
 * Checks both x-cron-token and Authorization: Bearer <secret>
 */
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET environment variable is not set");
    return false;
  }

  // Check x-cron-token header
  const token = req.headers.get("x-cron-token");
  if (token === secret) return true;

  // Check x-cron-secret header (alternative mentioned in PRP)
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret === secret) return true;

  // Check Authorization header (Vercel standard)
  const authHeader = req.headers.get("Authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  return false;
}
