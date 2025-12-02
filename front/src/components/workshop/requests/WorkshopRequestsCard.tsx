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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Demandes de participation
        </CardTitle>
        <CardDescription>
          {pendingRequests.length} demande(s) en attente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingRequests.length > 0 ? (
          <div className="space-y-3">
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
          <div className="text-center py-8 text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Aucune demande de participation pour le moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
