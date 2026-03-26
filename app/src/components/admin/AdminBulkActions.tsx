import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BulkAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: "default" | "ghost" | "destructive" | "outline" | "secondary" | "cta" | "ctaOutline";
  className?: string;
  disabled?: boolean;
}

interface AdminBulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  isVisible?: boolean;
  className?: string;
}

/**
 * A standardized bar for bulk actions in admin tables.
 */
export function AdminBulkActions({
  selectedCount,
  actions,
  isVisible = true,
  className,
}: Readonly<AdminBulkActionsProps>) {
  if (!isVisible || selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 mb-4 px-4 py-2 bg-brand/5 border border-brand/20 rounded-xl animate-in fade-in slide-in-from-top-2",
        className
      )}
    >
      <span className="text-sm font-medium text-brand">
        {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
      </span>
      <div className="h-4 w-px bg-brand/20 mx-2" />
      <div className="flex items-center gap-1">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant || "ghost"}
            size="sm"
            className={cn("h-8 px-2 text-xs", action.className)}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
            <span className="ml-1.5">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
