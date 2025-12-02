"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { PendingRequestItem } from "./PendingRequestItem";

interface PendingRequest {
  connectionId: string;
  requesterUserId: string;
  requesterName: string | null;
  requesterDisplayName: string | null;
  requesterPhotoUrl: string | null;
  requesterRole?: "MENTOR" | "APPRENANT" | "ADMIN" | null;
  requesterAppId?: string;
  createdAt: Date | string;
}

interface PendingRequestsListProps {
  requests: PendingRequest[];
  onViewProfile: (request: PendingRequest) => void;
  onAccept: (connectionId: string) => void;
  onReject: (connectionId: string) => void;
  isProcessing: boolean;
}

export function PendingRequestsList({
  requests,
  onViewProfile,
  onAccept,
  onReject,
  isProcessing,
}: PendingRequestsListProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Demandes en attente
        </CardTitle>
        <CardDescription>
          Vous avez {requests.length} demande(s) de connexion en attente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <PendingRequestItem
              key={request.connectionId}
              request={request}
              onViewProfile={() => onViewProfile(request)}
              onAccept={() => onAccept(request.connectionId)}
              onReject={() => onReject(request.connectionId)}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
