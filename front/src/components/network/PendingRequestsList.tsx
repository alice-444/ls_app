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
    <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
          <UserCheck className="h-5 w-5" />
          Demandes en attente
        </CardTitle>
        <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
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
