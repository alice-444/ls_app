/**
 * Masks an email for Privacy by Design (GDPR).
 * Example: john.doe@gmail.com -> j***e@g***.com
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return "—";

  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  const maskString = (str: string, visibleLen = 1): string => {
    if (str.length <= visibleLen * 2) return str[0] + "***";
    return str[0] + "***" + (str.at(-1) ?? "");
  };

  const [domainName, tld] = domain.split(".");

  return `${maskString(local)}@${maskString(domainName)}.${tld || "***"}`;
};
