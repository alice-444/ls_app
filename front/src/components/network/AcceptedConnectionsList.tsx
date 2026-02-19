"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
}: AcceptedConnectionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = connections.filter((connection) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name =
      connection.otherUserDisplayName || connection.otherUserName || "";
    return name.toLowerCase().includes(query);
  });

  return (
    <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
          <Users className="h-5 w-5" />
          Mes Connexions
        </CardTitle>
        <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
          {connections.length} personne(s) dans votre réseau
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]" />
            <Input
              placeholder="Rechercher dans votre réseau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
            />
          </div>
        </div>

        {filteredConnections.length === 0 ? (
          <div className="text-center py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            {searchQuery
              ? "Aucun résultat trouvé"
              : "Vous n'avez pas encore de connexions"}
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
