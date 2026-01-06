"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { WorkshopRequestCard } from "./WorkshopRequestCard";

interface WorkshopRequest {
  id: string;
  status: string;
  title?: string | null;
  description?: string | null;
  message?: string | null;
  preferredDate?: Date | string | null;
  preferredTime?: string | null;
  createdAt: Date | string;
  apprentice?: {
    user?: {
      name: string | null;
    };
  };
  mentor?: {
    user?: {
      name: string | null;
    };
  };
}

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
}: WorkshopRequestsCardProps) {
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6] text-lg sm:text-xl">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          Demandes de participation
        </CardTitle>
        <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] text-sm sm:text-base mt-1">
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
          <div className="text-center py-6 sm:py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-[rgba(38,84,124,0.32)] dark:text-[rgba(230,230,230,0.32)]" />
            <p className="text-sm sm:text-base">Aucune demande de participation pour le moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
