"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskEmail = void 0;
/**
 * Masks an email for Privacy by Design (GDPR).
 * Example: john.doe@gmail.com -> j***e@g***.com
 */
const maskEmail = (email) => {
    if (!email)
        return "—";
    const [local, domain] = email.split("@");
    if (!local || !domain)
        return email;
    const maskString = (str, visibleLen = 1) => {
        if (str.length <= visibleLen * 2)
            return str[0] + "***";
        return str[0] + "***" + (str.at(-1) ?? "");
    };
    const [domainName, tld] = domain.split(".");
    return `${maskString(local)}@${maskString(domainName)}.${tld || "***"}`;
};
exports.maskEmail = maskEmail;
