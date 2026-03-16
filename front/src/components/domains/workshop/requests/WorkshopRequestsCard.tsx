"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { BookOpen } from "lucide-react";
import { WorkshopRequestCard } from "./WorkshopRequestCard";
import type { WorkshopRequest } from "@ls-app/shared";

interface WorkshopRequestsCardProps {
  requests: WorkshopRequest[];
  onAccept: (request: WorkshopRequest) => void;
  onReject: (requestId: string) => void;
  isRejecting: boolean;
}

export function WorkshopRequestsCard({
  requests,
  onAccept,
  onReject,
  isRejecting,
}: Readonly<WorkshopRequestsCardProps>) {
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-ls-heading text-lg sm:text-xl">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          Demandes de participation
        </CardTitle>
        <CardDescription className="text-ls-muted text-sm sm:text-base mt-1">
          {pendingRequests.length} demande(s) en attente
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {pendingRequests.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {pendingRequests.map((request) => (
              <WorkshopRequestCard
                key={request.id}
                request={request}
                onAccept={onAccept}
                onReject={onReject}
                isRejecting={isRejecting}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-ls-muted">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-ls-muted/50" />
            <p className="text-sm sm:text-base">Aucune demande de participation pour le moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
