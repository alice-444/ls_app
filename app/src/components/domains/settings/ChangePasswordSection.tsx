"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { usePasswordForm } from "@/hooks/use-password-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROFILE_VALIDATION } from "@ls-app/shared";

export function ChangePasswordSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const changePasswordMutation =
    trpc.accountSettings.changePassword.useMutation({
      onSuccess: () => {
        toast.success("Mot de passe modifié avec succès");
        setIsDialogOpen(false);
        passwordForm.reset();
      },
      onError: (error: { message?: string }) => {
        toast.error(
          error.message || "Erreur lors de la modification du mot de passe"
        );
      },
    });

  const passwordForm = usePasswordForm({
    onSubmit: async (data) => {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword!,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
    },
    requireCurrentPassword: true,
  });

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="pt-6 px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Modifiez votre mot de passe pour sécuriser votre compte
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto h-10 px-6"
            >
              <Lock className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Modifier le mot de passe
            </DialogTitle>
            <DialogDescription>
              Entrez votre mot de passe actuel et choisissez un nouveau mot de
              passe
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={passwordForm.showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    passwordForm.setCurrentPassword(e.target.value)
                  }
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    passwordForm.setShowCurrentPassword(
                      !passwordForm.showCurrentPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {passwordForm.showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={passwordForm.showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => passwordForm.setNewPassword(e.target.value)}
                  required
                  minLength={PROFILE_VALIDATION.password.minLength}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    passwordForm.setShowNewPassword(
                      !passwordForm.showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {passwordForm.showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Minimum {PROFILE_VALIDATION.password.minLength} caractères, au
                moins un chiffre
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirmer le nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={passwordForm.showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    passwordForm.setConfirmPassword(e.target.value)
                  }
                  required
                  minLength={PROFILE_VALIDATION.password.minLength}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    passwordForm.setShowConfirmPassword(
                      !passwordForm.showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {passwordForm.showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  passwordForm.reset();
                }}
                disabled={
                  passwordForm.isSubmitting || changePasswordMutation.isPending
                }
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  passwordForm.isSubmitting || changePasswordMutation.isPending
                }
              >
                {passwordForm.isSubmitting || changePasswordMutation.isPending
                  ? "Modification..."
                  : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
