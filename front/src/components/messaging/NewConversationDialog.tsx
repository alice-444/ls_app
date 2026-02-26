"use client";

import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Avatar from "@radix-ui/react-avatar";

interface Connection {
  otherUserId: string;
  otherUserDisplayName?: string;
  otherUserName?: string;
  otherUserPhotoUrl?: string;
  otherUserRole?: string;
  connectionId: string;
}

interface NewConversationDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly connections: Connection[];
  readonly existingConversationUserIds: Set<string>;
  readonly onStartConversation: (otherUserId: string) => void;
  readonly isPending: boolean;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  connections,
  existingConversationUserIds,
  onStartConversation,
  isPending,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = connections.filter((connection) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name =
      connection.otherUserDisplayName || connection.otherUserName || "";
    return name.toLowerCase().includes(query);
  });

  const availableConnections = filteredConnections.filter(
    (connection) => !existingConversationUserIds.has(connection.otherUserId)
  );

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl"
        onClose={() => handleOpenChange(false)}
      >
        <DialogHeader>
          <DialogTitle>Démarrer une nouvelle conversation</DialogTitle>
          <DialogDescription>
            Sélectionnez une personne de votre réseau pour commencer à discuter
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans votre réseau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {availableConnections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "Aucun résultat trouvé"
                  : "Toutes vos connexions ont déjà une conversation active"}
              </div>
            ) : (
              availableConnections.map((connection) => (
                <ConnectionRow
                  key={connection.connectionId}
                  connection={connection}
                  onStartConversation={onStartConversation}
                  isPending={isPending}
                />
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConnectionRow({
  connection,
  onStartConversation,
  isPending,
}: {
  readonly connection: Connection;
  readonly onStartConversation: (otherUserId: string) => void;
  readonly isPending: boolean;
}) {
  const displayName =
    connection.otherUserDisplayName ||
    connection.otherUserName ||
    "Utilisateur";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  let roleName: string | null = connection.otherUserRole ?? null;
  if (connection.otherUserRole === "MENTOR") roleName = "Mentor";
  else if (connection.otherUserRole === "APPRENANT") roleName = "Apprenti";

  return (
    <button
      type="button"
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer w-full text-left"
      onClick={() => onStartConversation(connection.otherUserId)}
    >
      <div className="flex items-center gap-3">
        {connection.otherUserPhotoUrl ? (
          <img
            src={connection.otherUserPhotoUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <Avatar.Root className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <Avatar.Fallback className="h-full w-full flex items-center justify-center text-sm font-medium">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
        )}
        <div>
          <p className="font-medium">{displayName}</p>
          {connection.otherUserRole && (
            <p className="text-sm text-muted-foreground">{roleName}</p>
          )}
        </div>
      </div>
      <Button size="sm" variant="outline" disabled={isPending}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>
    </button>
  );
}
