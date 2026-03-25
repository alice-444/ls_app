export const PHOTO_URL_PREFIX = "/api/profile/photo/";
export const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";

/**
 * Validates a photo URL to ensure it belongs to the specified user
 * and follows the expected format (Cloudinary or local storage).
 */
export const isValidPhotoUrl = (url: string, userId: string): boolean => {
  // 1. Allow Cloudinary URLs (we trust Cloudinary's secure_url returned by our server)
  if (url.startsWith(CLOUDINARY_PREFIX)) {
    return true;
  }

  // 2. Check local photo URL format
  if (!url.startsWith(PHOTO_URL_PREFIX)) {
    return false;
  }

  const fileName = url.replace(PHOTO_URL_PREFIX, "");
  if (!fileName) return false;

  // Sanitize and check format (userId-uuid.ext or userId-timestamp.ext)
  const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png)$/i, "");

  // Pattern to extract userId and suffix (uuid or timestamp)
  // Since userId can contain dashes (like in cuids or uuids), we split by the LAST dash
  const lastDashIndex = nameWithoutExt.lastIndexOf("-");
  if (lastDashIndex === -1) return false;

  const fileUserId = nameWithoutExt.substring(0, lastDashIndex);
  const suffix = nameWithoutExt.substring(lastDashIndex + 1);

  // Validate suffix is either a UUID or a timestamp (numeric)
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      suffix,
    );
  const isTimestamp = /^\d+$/.test(suffix);

  if (!isUuid && !isTimestamp) return false;

  // Ensure it belongs to the user
  return fileUserId === userId;
};

/**
 * Formats a photo URL for display, ensuring it has the correct prefix if needed.
 */
export const formatPhotoUrl = (
  url: string | null | undefined,
): string | null => {
  if (!url) return null;
  if (
    url.startsWith("http") ||
    url.startsWith("/") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${PHOTO_URL_PREFIX}${url}`;
};
