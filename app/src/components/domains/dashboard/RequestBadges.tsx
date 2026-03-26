"use client";

import { Badge } from "@/components/ui/badge";

interface RequestBadgesProps {
  requests: Array<{ status: string }> | null | undefined;
  showPendingBadge?: boolean;
  showAutoUpdateText?: boolean;
}

export function RequestBadges({
  requests,
  showPendingBadge = true,
  showAutoUpdateText = false,
}: Readonly<RequestBadgesProps>) {
  if (!requests || requests.length === 0) return null;

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const hasPending = pendingCount > 0;

  return (
    <>
      <Badge
        variant="secondary"
        className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      >
        {requests.length}
      </Badge>
      {showPendingBadge && hasPending && (
        <Badge
          variant="default"
          className="bg-yellow-500 text-white animate-pulse"
        >
          {pendingCount} en attente
        </Badge>
      )}
      {showAutoUpdateText && hasPending && (
        <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
          • Mise à jour automatique toutes les 15 minutes
        </span>
      )}
    </>
  );
}

