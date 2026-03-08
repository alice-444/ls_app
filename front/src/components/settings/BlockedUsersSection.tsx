"use client";

import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Ban, User, X } from "lucide-react";

export function BlockedUsersSection() {
  const utils = trpc.useUtils();
  const { data: blockedUsers, isLoading } =
    trpc.userBlock.getBlockedUsers.useQuery();

  const unblockUserMutation = trpc.userBlock.unblockUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur débloqué avec succès");
      utils.userBlock.getBlockedUsers.invalidate();
      utils.messaging.getConversations.invalidate();
    },
    onError: (error: { message?: string }) => {
      toast.error("Erreur lors du déblocage", {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Ban className="h-8 w-8 text-ls-heading" />
          <h2 className="text-2xl font-semibold text-ls-heading">
            Utilisateurs bloqués
          </h2>
        </div>
        <p className="text-base text-ls-muted">
          Gère les utilisateurs que tu as bloqués
        </p>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Ban className="h-8 w-8 text-ls-heading" />
          <h2 className="text-2xl font-semibold text-ls-heading">
            Utilisateurs bloqués
          </h2>
        </div>
        <p className="text-base text-ls-muted">
          Gère les utilisateurs que tu as bloqués
        </p>
        <div className="text-center py-8 text-ls-muted">
          <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Aucun utilisateur bloqué</p>
          <p className="text-xs mt-2">
            Les utilisateurs que tu bloques n'apparaîtront plus dans tes
            conversations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Ban className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Utilisateurs bloqués
        </h2>
      </div>
      <p className="text-base text-ls-muted">
        Gère les utilisateurs que tu as bloqués ({blockedUsers.length})
      </p>

      <div className="space-y-3">
        {blockedUsers.map((blockedUser: { userId: string; photoUrl?: string; displayName?: string; name?: string; blockedAt: string }) => (
          <div
            key={blockedUser.userId}
            className="flex items-center justify-between p-4 border border-border/50 rounded-2xl hover:bg-brand/5 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {blockedUser.photoUrl ? (
                <img
                  src={blockedUser.photoUrl}
                  alt={blockedUser.displayName || blockedUser.name || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {blockedUser.displayName || blockedUser.name || "Utilisateur"}
                </p>
                <p className="text-xs text-ls-muted">
                  Bloqué le{" "}
                  {new Date(blockedUser.blockedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                unblockUserMutation.mutate({
                  blockedUserId: blockedUser.userId,
                });
              }}
              disabled={unblockUserMutation.isPending}
              className="ml-4 rounded-full hover:bg-brand/10 hover:border-brand"
            >
              <X className="h-4 w-4 mr-2" />
              {unblockUserMutation.isPending ? "Déblocage..." : "Débloquer"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
