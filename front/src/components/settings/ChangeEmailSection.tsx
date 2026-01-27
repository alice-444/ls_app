"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function ChangeEmailSection() {
  const { data: session } = authClient.useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const requestEmailChangeMutation =
    trpc.accountSettings.requestEmailChange.useMutation({
      onSuccess: (data: any) => {
        toast.success(
          data.message ||
            "Un lien de vérification a été envoyé à votre nouvelle adresse email"
        );
        setIsDialogOpen(false);
        setNewEmail("");
        setCurrentPassword("");
      },
      onError: (error: any) => {
        toast.error(
          error.message || "Erreur lors de la demande de changement d'email"
        );
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !currentPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    requestEmailChangeMutation.mutate({
      newEmail,
      currentPassword,
    });
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="pt-6 px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {session?.user?.email || "Non défini"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto h-10 px-6"
            >
              <Mail className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Modifier l'adresse email
            </DialogTitle>
            <DialogDescription>
              Entrez votre nouveau email et votre mot de passe actuel
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Nouvelle adresse email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouveau@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-current-password">
                Mot de passe actuel
              </Label>
              <div className="relative">
                <Input
                  id="email-current-password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Un lien de validation sera envoyé à votre nouvelle adresse
                email. Le changement ne prendra effet qu'après avoir cliqué sur
                ce lien.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewEmail("");
                  setCurrentPassword("");
                }}
                disabled={requestEmailChangeMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={requestEmailChangeMutation.isPending}
              >
                {requestEmailChangeMutation.isPending
                  ? "Envoi..."
                  : "Envoyer le lien"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
