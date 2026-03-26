"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox, Search, ArrowRight, Check, X } from "lucide-react";
import { formatWorkshopDate } from "@/lib/dashboard-utils";
import { StatusBadge } from "./StatusBadge";

export interface WorkshopRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  preferredDate: string | Date | null;
  preferredTime?: string | null;
  apprenticeName?: string;
}

export function MentorDashboardRequests({
  requests,
  onShowAllRequests,
  onAccept,
  onReject,
}: Readonly<{
  requests: WorkshopRequest[];
  onShowAllRequests: () => void;
  onAccept: (request: WorkshopRequest) => void;
  onReject: (request: WorkshopRequest) => void;
}>) {
  const hasRequests = requests && requests.length > 0;
  const displayRequests = hasRequests ? requests.slice(0, 3) : [];
  const hasMore = hasRequests && requests.length > 3;

  return (
    <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
            <div className="flex items-center gap-2 sm:gap-[7.5px]">
              <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ls-heading">
                Demande(s) reçue(s)
              </h3>
            </div>
            <p className="text-sm sm:text-base text-ls-muted tracking-[-0.8px]">
              Les demandes d&apos;ateliers que tu as reçues
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 border border-border rounded-full h-9 sm:h-10 px-3 sm:px-4 py-2 flex items-center gap-2 bg-card/80">
              <span className="text-sm sm:text-base font-semibold text-ls-muted">
                Rechercher...
              </span>
              <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-ls-muted" />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            {hasRequests ? (
              <>
                {displayRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card/80 border border-border/50 rounded-2xl min-h-[126px] px-3 sm:px-4 lg:px-5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex flex-col gap-2 sm:gap-[8px] justify-center flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-ls-heading truncate">
                        {request.title}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-ls-text line-clamp-2">
                        {request.description ||
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit"}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-ls-muted">
                        {formatWorkshopDate(request.preferredDate)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {request.status === "PENDING" ? (
                        <>
                          <Button
                            variant="ctaSuccess"
                            size="ctaSm"
                            onClick={() => onAccept(request)}
                          >
                            <Check className="h-4 w-4" />
                            Accepter
                          </Button>
                          <Button
                            variant="ctaDestructive"
                            size="ctaSm"
                            onClick={() => onReject(request)}
                          >
                            <X className="h-4 w-4" />
                            Refuser
                          </Button>
                        </>
                      ) : (
                        <StatusBadge status={request.status} />
                      )}
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <Button
                    variant="outline"
                    className="w-full border border-border rounded-full h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-ls-heading flex items-center justify-center gap-2 bg-card/80 hover:bg-brand-soft hover:border-brand"
                    onClick={onShowAllRequests}
                  >
                    <span className="truncate">
                      Voir toutes les demandes ({requests.length})
                    </span>
                    <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-ls-muted">
                <p>Aucune demande reçue pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
