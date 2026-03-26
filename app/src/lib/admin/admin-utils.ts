import { fr } from "date-fns/locale";
import { format, formatDistanceToNow } from "date-fns";
import {
  ADMIN_STATUS_LABELS,
  ADMIN_ROLE_LABELS,
  ADMIN_REPORT_REASON_LABELS,
  getAdminLabel,
} from "./admin-labels";

/**
 * Standardize status labels across the admin panel.
 * @param status - Raw status string (e.g., PENDING, ACTIVE, RESOLVED)
 */
export const getStatusLabel = (status: string): string => {
  return getAdminLabel(status, ADMIN_STATUS_LABELS);
};

/**
 * Standardize role labels.
 * @param role - Raw role string (e.g., ADMIN, MENTOR, APPRENANT)
 */
export const getRoleLabel = (role: string | null): string => {
  return getAdminLabel(role, ADMIN_ROLE_LABELS);
};

/**
 * Standardize report reason labels.
 * @param reason - Raw reason string (e.g., HARASSMENT, SPAM)
 */
export const getReportReasonLabel = (reason: string): string => {
  return getAdminLabel(reason, ADMIN_REPORT_REASON_LABELS);
};

/**
 * Common date formatters.
 */
export const adminDateFormatters = {
  full: (date: Date | string) =>
    format(new Date(date), "dd/MM/yyyy HH:mm", { locale: fr }),
  distance: (date: Date | string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr }),
  short: (date: Date | string) =>
    format(new Date(date), "dd MMM yyyy", { locale: fr }),
};
