export declare const PHOTO_URL_PREFIX = "/api/profile/photo/";
export declare const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";
/**
 * Validates a photo URL to ensure it belongs to the specified user
 * and follows the expected format (Cloudinary or local storage).
 */
export declare const isValidPhotoUrl: (url: string, userId: string) => boolean;
/**
 * Formats a photo URL for display, ensuring it has the correct prefix if needed.
 */
export declare const formatPhotoUrl: (
  url: string | null | undefined,
) => string | null;
