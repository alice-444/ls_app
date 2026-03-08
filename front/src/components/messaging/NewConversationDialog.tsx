"use client";

import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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
  readonly userRole?: string | null;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  connections,
  existingConversationUserIds,
  onStartConversation,
  isPending,
  userRole,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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
      <DialogContent className="max-w-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-ls-heading">Démarrer une nouvelle conversation</DialogTitle>
          <DialogDescription className="text-ls-muted">
            Choisis une personne de ton réseau pour commencer à discuter
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ls-muted" />
            <Input
              placeholder="Rechercher dans ton réseau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-border"
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {availableConnections.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <div className="text-ls-muted">
                  {searchQuery
                    ? "Aucun résultat trouvé"
                    : connections.length === 0
                    ? "Tu n'as pas encore de connections acceptées"
                    : "Toutes tes connexions ont déjà une conversation active"}
                </div>
                {!searchQuery && (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      router.push(userRole === "MENTOR" ? "/network" : "/mentors");
                    }}
                    className="bg-brand hover:bg-brand-hover text-ls-heading rounded-full"
                  >
                    {userRole === "MENTOR" ? "Voir mon réseau" : "Trouver un mentor"}
                  </Button>
                )}
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
      className="flex items-center justify-between p-3 border border-border rounded-2xl hover:bg-brand/10 transition-colors cursor-pointer w-full text-left"
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
          <p className="font-medium text-ls-heading">{displayName}</p>
          {connection.otherUserRole && (
            <p className="text-sm text-ls-muted">{roleName}</p>
          )}
        </div>
      </div>
      <Button size="sm" variant="outline" disabled={isPending} className="rounded-full border-brand text-brand hover:bg-brand/10">
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>
    </button>
  );
}
