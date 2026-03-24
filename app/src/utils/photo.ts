import { API_BASE_URL } from "@/lib/api-client";

/**
 * Formats a photo URL to be used in the frontend.
 * If the URL is already absolute (Cloudinary), returns it as is.
 * If the URL is relative (local storage), prepends the API_BASE_URL.
 */
export function formatPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  
  if (photoUrl.startsWith("http")) {
    return photoUrl;
  }
  
  return `${API_BASE_URL}${photoUrl}`;
}
