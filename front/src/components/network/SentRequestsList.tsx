"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, X, Clock } from "lucide-react";

interface Request {
  connectionId: string;
  receiverUserId: string;
  receiverName: string | null;
  receiverDisplayName: string | null;
  receiverPhotoUrl: string | null;
  createdAt: Date;
}

interface SentRequestsListProps {
  requests: Request[];
  onCancel: (connectionId: string) => void;
  isCanceling: boolean;
}

export function SentRequestsList({ requests, onCancel, isCanceling }: SentRequestsListProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes envoyées</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.connectionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={request.receiverPhotoUrl || undefined} alt={request.receiverDisplayName || "Avatar"} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{request.receiverDisplayName || request.receiverName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Envoyée le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(request.connectionId)}
              disabled={isCanceling}
              className="text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
