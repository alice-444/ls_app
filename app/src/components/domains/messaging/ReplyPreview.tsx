"use client";

import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type DateString = Date | string;

interface ReplyMessage {
  messageId: string;
  content: string;
  workshopReference?: {
    workshopTitle: string;
    workshopDate: DateString | null;
  } | null;
}

interface ReplyPreviewProps {
  readonly message: ReplyMessage;
  readonly onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  return (
    <div className="mb-2 p-2 bg-muted/50 rounded-2xl flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ls-muted mb-1">
          Répondre à :
        </p>
        {message.workshopReference ? (
          <div className="flex items-center gap-2 text-sm text-ls-heading">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-ls-muted" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {message.workshopReference.workshopTitle || "Atelier"}
              </p>
              {message.workshopReference.workshopDate && (
                <p className="text-xs text-ls-muted">
                  {format(
                    new Date(message.workshopReference.workshopDate),
                    "d MMM yyyy",
                    { locale: fr }
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm truncate text-ls-heading">
            {message.content}
          </p>
        )}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0 rounded-full"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
