import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/admin/admin-utils";

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  // Success / Active
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PUBLISHED: "bg-emerald-100 text-emerald-800 border-emerald-200",

  // Warning / Pending
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200",
  REVIEWED: "bg-blue-100 text-blue-800 border-blue-200",
  DRAFT: "bg-slate-100 text-slate-800 border-slate-200",

  // Danger / Suspended
  SUSPENDED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
  DELETED: "bg-slate-200 text-slate-600 border-slate-300 italic",
  CANCELLED: "bg-slate-100 text-slate-800 border-slate-200",

  // Neutral
  DISMISSED: "bg-slate-100 text-slate-800 border-slate-200",
  ALL: "bg-slate-100 text-slate-800 border-slate-200",
};

export function AdminStatusBadge({ status, className }: Readonly<AdminStatusBadgeProps>) {
  const colorClass = STATUS_COLORS[status] || "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <Badge
      variant="outline"
      className={cn("uppercase text-[10px] font-bold", colorClass, className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
