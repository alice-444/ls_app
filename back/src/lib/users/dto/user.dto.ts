/**
 * @file user.dto.ts
 * Standardized Data Transfer Objects for User-related data.
 */

export interface UserResponseDTO {
  id: string;
  userId: string;
  name: string | null;
  displayName: string | null;
  title: string | null;
  email: string | null;
  photoUrl: string | null;
  role: string | null;
}

/**
 * Mapper function to convert raw database/repository user to DTO.
 * Ensures consistent structure (solving the displayName vs name issue).
 */
export function mapUserToDTO(user: any): UserResponseDTO {
  if (!user) return null as any;
  
  return {
    id: user.id,
    userId: user.userId || user.id,
    name: user.name || null,
    displayName: user.displayName || user.name || null,
    title: user.title || null,
    email: user.email || null,
    photoUrl: user.photoUrl || null,
    role: user.role || null,
  };
}
