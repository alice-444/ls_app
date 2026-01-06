"use client";

import { useState } from "react";
import * as React from "react";
import { useTheme } from "next-themes";
import {
  User,
  UserCircle,
  Ban,
  Bell,
  Settings as SettingsIcon,
  MessageSquare,
  Info,
  HelpCircle,
  Pencil,
  Trash2,
  LogOut,
  Save,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";
import { BlockedUsersSection } from "./BlockedUsersSection";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";

type SettingsSection =
  | "profil"
  | "informations-personnelles"
  | "utilisateurs-bloques"
  | "notifications"
  | "parametres-systeme"
  | "feedback"
  | "a-propos"
  | "centre-aide";

const sidebarItems: Array<{
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "profil", label: "Profil", icon: User },
  {
    id: "informations-personnelles",
    label: "Informations personnelles",
    icon: UserCircle,
  },
  { id: "utilisateurs-bloques", label: "Utilisateurs bloqués", icon: Ban },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "parametres-systeme", label: "Paramètres système", icon: SettingsIcon },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "a-propos", label: "A propos de LearnSup", icon: Info },
  { id: "centre-aide", label: "Centre d'aide", icon: HelpCircle },
];

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const { data: profileData } = trpc.user.getProfile.useQuery();
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    "informations-personnelles"
  );
  const [privacyMode, setPrivacyMode] = useState(false);

  React.useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail.section as SettingsSection);
    };

    globalThis.addEventListener(
      "settings:change-section",
      handleSectionChange as EventListener
    );

    return () => {
      globalThis.removeEventListener(
        "settings:change-section",
        handleSectionChange as EventListener
      );
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Paramètres"
        subtitle="Gère tes préférences et paramètres de compte"
      />

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
          <div className="w-full lg:w-[300px] mb-6 lg:mb-0">
            <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] rounded-2xl overflow-hidden">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isFirst = index === 0;
                const isLast = index === sidebarItems.length - 1;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 h-12 px-8 py-4 transition-colors text-sm",
                      isFirst && "rounded-tl-2xl rounded-tr-2xl",
                      isLast && "rounded-bl-2xl rounded-br-2xl",
                      isActive
                        ? "bg-[#ffb647] text-white"
                        : "bg-white dark:bg-[#1a1720] text-[#26547c] dark:text-[#e6e6e6] border-t border-[#d9d9d9]",
                      !isFirst && !isActive && "border-t border-[#d9d9d9]"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] rounded-[10px] p-8">
              {activeSection === "profil" && (
                <AccountSection
                  session={session}
                  profileData={profileData}
                  privacyMode={privacyMode}
                  setPrivacyMode={setPrivacyMode}
                />
              )}
              {activeSection === "informations-personnelles" && (
                <PersonalInformationSection />
              )}
              {activeSection === "utilisateurs-bloques" && (
                <BlockedUsersSection />
              )}
              {activeSection === "notifications" && <NotificationsSection />}
              {activeSection === "parametres-systeme" && (
                <SystemSettingsSection />
              )}
              {activeSection === "feedback" && <FeedbackSection />}
              {activeSection === "a-propos" && <AboutSection />}
              {activeSection === "centre-aide" && <HelpCenterSection />}
            </div>
          </div>
        </div>
      </PageContainer>
  );
}

function AccountSection({
  session,
  profileData,
  privacyMode,
  setPrivacyMode,
}: {
  readonly session: any;
  readonly profileData: any;
  readonly privacyMode: boolean;
  readonly setPrivacyMode: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-[37.5px]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
          <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
            Compte
          </h2>
        </div>
        <p className="text-base text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.8px]">
          Gérez vos informations de compte et sécurité
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Adresse mail
            </Label>
            <Input
              value={session?.user?.email || ""}
              disabled
              className="h-10 px-6 py-1.5 border-[0.75px] border-[rgba(127,127,127,0.32)] rounded-2xl text-xs text-[#26547c] dark:text-[#e6e6e6] opacity-60"
            />
          </div>
          <EmailChangeButton />
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Nom d'utilisateur
            </Label>
            <Input
              value={profileData?.name || session?.user?.name || ""}
              disabled
              className="h-10 px-6 py-1.5 border-[0.75px] border-[rgba(127,127,127,0.32)] rounded-2xl text-xs text-[#26547c] dark:text-[#e6e6e6] opacity-60"
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
              className="h-10 px-4 py-2 border border-[#d6dae4] rounded-[32px] gap-2 shrink-0"
            >
              <span className="text-xs font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                Modifier
              </span>
              <Pencil className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-base font-semibold text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.8px]">
              Mot de passe
            </Label>
            <p className="text-sm font-medium text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.7px]">
              Dernière modification il y a 30 jours
            </p>
          </div>
          <PasswordChangeButton />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-[15px] font-semibold text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.75px]">
              Confidentialité du compte
            </Label>
            <p className="text-sm font-medium text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.7px] max-w-[505px]">
              Seules vos relations peuvent voir vos l'ensemble de vos
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
            <Label className="text-[15px] font-semibold text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.75px]">
              Supprimer le compte
            </Label>
            <p className="text-sm font-medium text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.7px]">
              Cette action est irréversible et supprimera définitivement votre
              compte
            </p>
          </div>
          <DeleteAccountButton />
        </div>

        <div className="pt-4 border-t border-[#d6dae4]">
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
      onSuccess: (data) => {
        toast.success(
          data.message ||
            "Un lien de vérification a été envoyé à votre nouvelle adresse email"
        );
        setIsDialogOpen(false);
        setNewEmail("");
        setCurrentPassword("");
      },
      onError: (error) => {
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
      <div className="pt-6">
        <Button
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          className="h-10 px-4 py-2 border border-[#d6dae4] rounded-[32px] gap-2 shrink-0"
        >
          <span className="text-xs font-semibold text-[#26547c] dark:text-[#e6e6e6]">
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
        className="h-10 px-4 py-2 border border-[#d6dae4] rounded-[32px] gap-2 shrink-0"
      >
        <span className="text-xs font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Modifier
        </span>
        <Pencil className="h-[18px] w-[18px]" />
      </Button>
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1a1720] rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
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
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    },
    onError: (error) => {
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
        className="h-10 px-4 py-2 border border-[#d6dae4] rounded-[32px] gap-2 shrink-0 text-[#f44336] hover:text-[#f44336] hover:border-[#f44336] disabled:opacity-50 disabled:cursor-not-allowed"
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
                Pour supprimer votre compte, vous devez d'abord :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Annuler toutes vos réservations d'ateliers à venir</li>
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
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
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

function NotificationsSection() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Bell className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Notifications
        </h2>
      </div>
      <p className="text-base text-[#26547c] dark:text-[#e6e6e6]">
        Gère tes préférences de notifications
      </p>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Notifications push
            </Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des notifications dans l'application
            </p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Notifications email
            </Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des notifications par email
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
      </div>
    </div>
  );
}

function SystemSettingsSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Paramètres système
        </h2>
      </div>
      <p className="text-base text-[#26547c] dark:text-[#e6e6e6]">
        Personnalisez votre expérience utilisateur
      </p>

      <div className="space-y-6">
        {mounted && (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Mode sombre</Label>
              <p className="text-sm text-muted-foreground">
                Activer le thème sombre
              </p>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => {
                setTheme(checked ? "dark" : "light");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackSection() {
  const [feedback, setFeedback] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Feedback
        </h2>
      </div>
      <p className="text-base text-[#26547c] dark:text-[#e6e6e6]">
        Aidez-nous à améliorer LearnSup
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback">Ton feedback</Label>
          <Input
            id="feedback"
            placeholder="Partagez vos suggestions ou signaler un problème..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="h-10"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <MessageSquare className="h-4 w-4 mr-2" />
          Envoyer le feedback
        </Button>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Info className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          A propos de LearnSup
        </h2>
      </div>
      <p className="text-base text-[#26547c] dark:text-[#e6e6e6]">
        Informations sur l'application
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-medium">Version</p>
          <p className="text-muted-foreground">1.0.0</p>
        </div>
        <div>
          <p className="font-medium">Dernière mise à jour</p>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          asChild
        >
          <Link href="/help">
            <HelpCircle className="h-4 w-4 mr-2" />
            Aide
          </Link>
        </Button>
      </div>
    </div>
  );
}

function PersonalInformationSection() {
  const { data: profileData, refetch: refetchProfile } =
    trpc.user.getProfile.useQuery();
  const { data: session } = authClient.useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateProfileMutation = trpc.accountSettings.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Informations personnelles mises à jour avec succès");
      setIsSaving(false);
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
      setIsSaving(false);
    },
  });

  React.useEffect(() => {
    if (profileData) {
      const fullName = profileData.name || session?.user?.name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
    }
  }, [profileData, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    updateProfileMutation.mutate({
      name: fullName || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-[37.5px] w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
          <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
            Informations personnelles
          </h2>
        </div>
        <p className="text-base text-[#26547c] dark:text-[#e6e6e6] tracking-[-0.8px] max-w-[330px]">
          Mettez à jour vos informations personnelles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Prénom
            </Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Andréa"
              className="h-10 px-6 py-1.5 border-[0.75px] border-[rgba(127,127,127,0.32)] rounded-[32px] text-xs text-[rgba(38,84,124,0.32)] dark:text-[rgba(230,230,230,0.32)] tracking-[-0.6px]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Nom
            </Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Begozi"
              className="h-10 px-6 py-1.5 border-[0.75px] border-[rgba(127,127,127,0.32)] rounded-[32px] text-xs text-[rgba(38,84,124,0.32)] dark:text-[rgba(230,230,230,0.32)] tracking-[-0.6px]"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Téléphone
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 35 36 90 91"
              className="h-10 px-6 py-1.5 border-[0.75px] border-[rgba(127,127,127,0.32)] rounded-[32px] text-xs text-[rgba(38,84,124,0.32)] dark:text-[rgba(230,230,230,0.32)] tracking-[-0.6px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 px-4 py-3 bg-[#ffb647] border-3 border-white rounded-[32px] gap-2 hover:bg-[#ffb647]/90"
          >
            <span className="text-xs font-semibold text-white tracking-[-0.6px]">
              Sauvegarder les modifications
            </span>
            <Save className="h-[18px] w-[18px] text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function HelpCenterSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Centre d'aide
        </h2>
      </div>
      <p className="text-base text-[#26547c] dark:text-[#e6e6e6]">
        Retrouvez l'ensemble des informations sur l'application
      </p>

      <div className="space-y-4">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href="/help">Accéder au centre d'aide</Link>
        </Button>
      </div>
    </div>
  );
}
