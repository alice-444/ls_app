/**
 * Masks an email for Privacy by Design (GDPR).
 * Example: john.doe@gmail.com -> j***e@g***.com
 */
export declare const maskEmail: (email: string | null | undefined) => string;
