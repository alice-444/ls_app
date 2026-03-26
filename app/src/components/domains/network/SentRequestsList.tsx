"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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

export function SentRequestsList({ requests, onCancel, isCanceling }: Readonly<SentRequestsListProps>) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ls-heading">
          <Clock className="h-5 w-5 text-brand" />
          Demandes envoyées
        </CardTitle>
        <CardDescription className="text-ls-muted">
          Tes demandes en cours d&apos;envoi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.connectionId} className="flex items-center justify-between p-4 rounded-2xl bg-card/80 border border-border/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={request.receiverPhotoUrl || undefined} alt={request.receiverDisplayName || "Avatar"} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-ls-heading">{request.receiverDisplayName || request.receiverName}</p>
                <p className="text-xs text-ls-muted flex items-center gap-1">
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
              className="text-destructive rounded-full"
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
