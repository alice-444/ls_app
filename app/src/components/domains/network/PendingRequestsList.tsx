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
}: Readonly<PendingRequestsListProps>) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ls-heading">
          <UserCheck className="h-5 w-5 text-brand" />
          Demandes en attente
        </CardTitle>
        <CardDescription className="text-ls-muted">
          Tu as {requests.length} demande(s) de connexion en attente
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
