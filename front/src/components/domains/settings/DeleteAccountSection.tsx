"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DeleteAccountSection() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: canDeleteData, isLoading: isLoadingCheck } =
    trpc.accountSettings.checkCanDeleteAccount.useQuery();
  const deleteAccountMutation = trpc.accountSettings.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success("Votre compte a été supprimé avec succès");
      // Sign out and redirect
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de la suppression du compte");
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (confirmation !== "DELETE") {
      toast.error('Veuillez taper "DELETE" pour confirmer');
      return;
    }

    setIsDeleting(true);
    deleteAccountMutation.mutate({
      confirmation: "DELETE",
      reason: reason || undefined,
    });
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="pt-6 px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Supprimer le compte</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cette action est irréversible et supprimera définitivement votre
                compte
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              disabled={isLoadingCheck || !canDeleteData?.canDelete}
              className="w-full sm:w-auto h-10 px-6"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
          {canDeleteData && !canDeleteData.canDelete && (
            <Alert className="mt-4">
              <AlertDescription>
                {canDeleteData.reason ||
                  "Vous ne pouvez pas supprimer votre compte pour le moment"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Supprimer votre compte
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront
              définitivement supprimées.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="delete-confirmation"
                className="text-sm font-medium"
              >
                Confirmation
              </Label>
              <Input
                id="delete-confirmation"
                placeholder='Tapez "DELETE" pour confirmer'
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={isDeleting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-reason" className="text-sm font-medium">
                Raison de la suppression (optionnel)
              </Label>
              <Textarea
                id="delete-reason"
                placeholder="Partagez avec nous la raison de votre départ (optionnel)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
                disabled={isDeleting}
              />
            </div>

            <Alert variant="destructive">
              <AlertDescription>
                <p className="font-medium mb-2">⚠️ Attention</p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>Votre compte sera immédiatement désactivé</li>
                  <li>Toutes vos données personnelles seront supprimées</li>
                  <li>Vous ne pourrez plus vous connecter</li>
                  <li>Cette action ne peut pas être annulée</li>
                  <li>
                    Les transactions de crédits seront conservées pour des
                    raisons comptables
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setConfirmation("");
                setReason("");
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || confirmation !== "DELETE"}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
