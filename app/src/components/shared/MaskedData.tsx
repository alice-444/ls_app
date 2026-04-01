"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MaskedDataProps {
  data?: string | null;
  maskedData: string;
  targetUserId?: string;
  dataType?: "EMAIL" | "PHONE" | "ADDRESS";
  className?: string;
  readOnly?: boolean;
}

/**
 * Privacy by Design component that hides sensitive data.
 * Admins can reveal (with audit log), others just see the masked version.
 */
export function MaskedData({
  data,
  maskedData,
  targetUserId,
  dataType,
  className,
  readOnly = false
}: Readonly<MaskedDataProps>) {
  const [isRevealed, setIsRevealed] = useState(false);

  const logAccess = trpc.admin.logDataAccess.useMutation();

  const handleReveal = () => {
    if (readOnly || !targetUserId || !dataType) return;
    if (!isRevealed) {
      logAccess.mutate({ targetUserId, dataType });
    }
    setIsRevealed(!isRevealed);
  };

  if (!maskedData && !data) return <span className="text-ls-muted">—</span>;

  return (
    <div className={cn("inline-flex items-center gap-2 group", className)}>
      <span className={cn(
        "font-mono text-[11px] transition-colors",
        isRevealed ? "text-ls-heading font-medium" : "text-ls-muted italic"
      )}>
        {isRevealed ? data : maskedData}
      </span>

      {!readOnly && data && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleReveal();
          }}
          title={isRevealed ? "Masquer" : "Révéler (sera enregistré dans les logs d'audit)"}
        >
          {isRevealed ? (
            <EyeOff className="h-3 w-3 text-ls-muted" />
          ) : (
            <Eye className="h-3 w-3 text-brand" />
          )}
        </Button>
      )}
    </div>
  );
}

