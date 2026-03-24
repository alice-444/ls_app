"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, Users } from "lucide-react";
import { ConnectionItem } from "./ConnectionItem";
import { useState } from "react";

interface Connection {
  connectionId: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserDisplayName: string | null;
  otherUserPhotoUrl: string | null;
  otherUserRole?: "MENTOR" | "APPRENANT" | "ADMIN" | null;
  otherUserAppId?: string;
  updatedAt: Date | string;
}

interface AcceptedConnectionsListProps {
  connections: Connection[];
  onViewProfile: (connection: Connection) => void;
  onRemove: (otherUserId: string) => void;
  onMessage?: (otherUserId: string) => void;
  isRemoving: boolean;
}

export function AcceptedConnectionsList({
  connections,
  onViewProfile,
  onRemove,
  onMessage,
  isRemoving,
}: Readonly<AcceptedConnectionsListProps>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = connections.filter((connection) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name =
      connection.otherUserDisplayName || connection.otherUserName || "";
    return name.toLowerCase().includes(query);
  });

  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ls-heading">
          <Users className="h-5 w-5 text-brand" />
          Mes connexions
        </CardTitle>
        <CardDescription className="text-ls-muted">
          {connections.length} personne(s) dans ton réseau
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ls-muted" />
            <Input
              placeholder="Rechercher dans ton réseau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-border bg-card/80 text-ls-heading rounded-full"
            />
          </div>
        </div>

        {filteredConnections.length === 0 ? (
          <div className="text-center py-8 text-ls-muted">
            {searchQuery
              ? "Aucun résultat trouvé"
              : "Tu n'as pas encore de connexions"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConnections.map((connection) => (
              <ConnectionItem
                key={connection.connectionId}
                connection={connection}
                onViewProfile={() => onViewProfile(connection)}
                onRemove={() => onRemove(connection.otherUserId)}
                onMessage={onMessage}
                isRemoving={isRemoving}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
