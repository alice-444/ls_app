"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatWorkshopDate } from "@/lib/dashboard-utils";
import { StatusBadge } from "./StatusBadge";
import { MessageSquare } from "lucide-react";

interface WorkshopRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  preferredDate: string | Date | null;
  rejectionReason?: string | null;
}

interface AllWorkshopRequestsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly requests: WorkshopRequest[] | undefined;
}

export function AllWorkshopRequestsDialog({
  open,
  onOpenChange,
  requests,
}: AllWorkshopRequestsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-ls-heading">
            Demandes reçues ({requests?.length || 0})
          </DialogTitle>
          <DialogDescription>
            Liste complète des demandes d'ateliers que tu as reçues
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-[16px] mt-4">
          {requests && requests.length > 0 ? (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-card/80 border border-border/50 rounded-2xl min-h-[126px] px-5 py-2 flex items-center justify-between"
              >
                <div className="flex flex-col gap-[8px] justify-center">
                  <p className="text-base font-bold text-ls-heading">
                    {request.title}
                  </p>
                  <p className="text-base text-ls-text">
                    {request.description ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit"}
                  </p>
                  <p className="text-base text-ls-muted">
                    {formatWorkshopDate(request.preferredDate)}
                  </p>
                  {request.status === "REJECTED" && request.rejectionReason && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <MessageSquare className="h-3 w-3" />
                      Motif: {request.rejectionReason}
                    </p>
                  )}
                </div>
                {(request.status === "ACCEPTED" ||
                  request.status === "PENDING" ||
                  request.status === "REJECTED") && (
                  <StatusBadge status={request.status} />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-ls-muted">
              <p>Aucune demande reçue pour le moment</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
