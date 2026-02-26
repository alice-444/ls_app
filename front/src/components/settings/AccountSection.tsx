"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Pencil,
  Trash2,
  LogOut,
  Mail,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";

interface AccountSectionProps {
  readonly session: ReturnType<typeof authClient.useSession>["data"];
  readonly profileData: { name?: string } | null | undefined;
  readonly privacyMode: boolean;
  readonly setPrivacyMode: (value: boolean) => void;
}

export function AccountSection({
  session,
  profileData,
  privacyMode,
  setPrivacyMode,
}: AccountSectionProps) {
  return (
    <div className="flex flex-col gap-[37.5px]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-ls-heading" />
          <h2 className="text-2xl font-semibold text-ls-heading">Compte</h2>
        </div>
        <p className="text-base text-ls-heading tracking-[-0.8px]">
          Gérez vos informations de compte et sécurité
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-ls-muted">Adresse mail</Label>
            <Input
              value={session?.user?.email || ""}
              disabled
              className="h-10 px-6 py-1.5 border-[0.75px] border-[rgba(127,127,127,0.32)] rounded-2xl text-xs text-ls-heading opacity-60"
            />
          </div>
          <EmailChangeButton />
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-ls-muted">
              Nom d&apos;utilisateur
            </Label>
            <Input
              value={profileData?.name || session?.user?.name || ""}
              disabled
              className="h-10 px-6 py-1.5 border-[0.75px] border-[rgba(127,127,127,0.32)] rounded-2xl text-xs text-ls-heading opacity-60"
            />
          </div>
          <div className="pt-6">
            <Button
              variant="outline"
              onClick={() => {
                const event = new CustomEvent("settings:change-section", {
                  detail: { section: "informations-personnelles" },
                });
                globalThis.dispatchEvent(event);
              }}
              className="h-10 px-4 py-2 border border-ls-border rounded-[32px] gap-2 shrink-0"
            >
              <span className="text-xs font-semibold text-ls-heading">
                Modifier
              </span>
              <Pencil className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-base font-semibold text-ls-heading tracking-[-0.8px]">
              Mot de passe
            </Label>
            <p className="text-sm font-medium text-ls-heading tracking-[-0.7px]">
              Dernière modification il y a 30 jours
            </p>
          </div>
          <PasswordChangeButton />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-[15px] font-semibold text-ls-heading tracking-[-0.75px]">
              Confidentialité du compte
            </Label>
            <p className="text-sm font-medium text-ls-heading tracking-[-0.7px] max-w-[505px]">
              Seules vos relations peuvent voir vos l&apos;ensemble de vos
              informations personnelles (publications, médias, relations, etc.)
            </p>
          </div>
          <Switch
            checked={privacyMode}
            onCheckedChange={setPrivacyMode}
            className="shrink-0"
          />
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-[15px] font-semibold text-ls-heading tracking-[-0.75px]">
              Supprimer le compte
            </Label>
            <p className="text-sm font-medium text-ls-heading tracking-[-0.7px]">
              Cette action est irréversible et supprimera définitivement votre
              compte
            </p>
          </div>
          <DeleteAccountButton />
        </div>

        <div className="pt-4 border-t border-ls-border">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

function EmailChangeButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const requestEmailChangeMutation =
    trpc.accountSettings.requestEmailChange.useMutation({
      onSuccess: (data: { message?: string }) => {
        toast.success(
          data.message ||
            "Un lien de vérification a été envoyé à votre nouvelle adresse email"
        );
        setIsDialogOpen(false);
        setNewEmail("");
        setCurrentPassword("");
      },
      onError: (error: { message?: string }) => {
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
    requestEmailChangeMutation.mutate({ newEmail, currentPassword });
  };

  return (
    <>
      <div className="pt-6">
        <Button
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          className="h-10 px-4 py-2 border border-ls-border rounded-[32px] gap-2 shrink-0"
        >
          <span className="text-xs font-semibold text-ls-heading">
            Modifier
          </span>
          <Pencil className="h-[18px] w-[18px]" />
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Modifier l&apos;adresse email
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

function PasswordChangeButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="h-10 px-4 py-2 border border-ls-border rounded-[32px] gap-2 shrink-0"
      >
        <span className="text-xs font-semibold text-ls-heading">Modifier</span>
        <Pencil className="h-[18px] w-[18px]" />
      </Button>
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-ls-surface rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <ChangePasswordSection />
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="mt-4 w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteAccountButton() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");

  const { data: canDeleteData, isLoading: isLoadingCheck } =
    trpc.accountSettings.checkCanDeleteAccount.useQuery();
  const deleteAccountMutation = trpc.accountSettings.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success("Votre compte a été supprimé avec succès");
      await authClient.signOut({
        fetchOptions: { onSuccess: () => router.push("/") },
      });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de la suppression du compte");
    },
  });

  const handleDelete = async () => {
    if (confirmation !== "DELETE") {
      toast.error('Veuillez taper "DELETE" pour confirmer');
      return;
    }
    deleteAccountMutation.mutate({
      confirmation: "DELETE",
      reason: reason || undefined,
    });
  };

  const handleButtonClick = () => {
    if (isLoadingCheck) return;
    if (canDeleteData?.canDelete) {
      setIsDialogOpen(true);
    } else {
      setIsInfoDialogOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleButtonClick}
        disabled={isLoadingCheck}
        className="h-10 px-4 py-2 border border-ls-border rounded-[32px] gap-2 shrink-0 text-ls-error hover:text-ls-error hover:border-ls-error disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xs font-semibold tracking-[-0.6px]">
          Supprimer
        </span>
        <Trash2 className="h-[18px] w-[18px]" />
      </Button>

      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Info className="h-5 w-5" />
              Suppression de compte impossible
            </DialogTitle>
            <DialogDescription>
              Votre compte ne peut pas être supprimé pour le moment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">
                {canDeleteData?.reason ||
                  "Vous avez des réservations d'ateliers à venir qui doivent être annulées avant de pouvoir supprimer votre compte."}
              </p>
              <p className="text-sm text-muted-foreground">
                Pour supprimer votre compte, vous devez d&apos;abord :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>
                  Annuler toutes vos réservations d&apos;ateliers à venir
                </li>
                <li>
                  Annuler tous les ateliers que vous avez créés et qui sont à
                  venir
                </li>
              </ul>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Une fois toutes vos réservations annulées, vous pourrez
                supprimer votre compte.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInfoDialogOpen(false)}
            >
              Compris
            </Button>
            <Button
              onClick={() => {
                setIsInfoDialogOpen(false);
                router.push("/my-workshops");
              }}
            >
              Voir mes ateliers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                disabled={deleteAccountMutation.isPending}
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
                disabled={deleteAccountMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setConfirmation("");
                setReason("");
              }}
              disabled={deleteAccountMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteAccountMutation.isPending || confirmation !== "DELETE"
              }
            >
              {deleteAccountMutation.isPending ? (
                "Suppression..."
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

function SignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  };

  return (
    <Button
      variant="destructive"
      onClick={handleSignOut}
      className="w-full h-12 text-base"
    >
      <LogOut className="h-5 w-5 mr-2" />
      Se déconnecter
    </Button>
  );
}
