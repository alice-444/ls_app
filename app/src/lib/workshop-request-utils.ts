export const WORKSHOP_REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  CANCELLED: "Annulée",
};

export const WORKSHOP_REQUEST_STATUS_COLORS: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ACCEPTED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  REJECTED:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  CANCELLED:
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export const getWorkshopRequestStatusLabel = (status: string): string => {
  return WORKSHOP_REQUEST_STATUS_LABELS[status] || status;
};

export const getWorkshopRequestStatusColor = (status: string): string => {
  return WORKSHOP_REQUEST_STATUS_COLORS[status] || WORKSHOP_REQUEST_STATUS_COLORS.PENDING;
};

