"use client";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Settings,
  MessageSquare,
  Info,
  LogOut,
  Mail,
  Globe,
  Lock,
  Users,
  HelpCircle,
  Trash2,
  Ban,
  X,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
} from "lucide-react";
import { authClient, customAuthClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { UpdateProfileSection } from "@/components/settings/UpdateProfileSection";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";
import { ChangeEmailSection } from "@/components/settings/ChangeEmailSection";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

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
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-5xl mx-auto py-8 px-6 sm:px-8 lg:px-12">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center sm:text-left">
            Paramètres
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>

        <div className="space-y-8">
          <UpdateProfileSection />

          <Card className="shadow-sm">
            <CardHeader className="pb-6 px-6 sm:px-8">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Lock className="h-5 w-5" />
                Sécurité du compte
              </CardTitle>
              <CardDescription className="text-sm">
                Gérez la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
              <ChangePasswordSection />

              <Separator />

              <ChangeEmailSection />
            </CardContent>
          </Card>

          <CreditTransactionHistorySection />

          <BlockedUsersSection />

          {/* Section Paramètres système */}
          <Card className="shadow-sm">
            <CardHeader className="pb-6 px-6 sm:px-8">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Settings className="h-5 w-5" />
                Paramètres système
              </CardTitle>
              <CardDescription className="text-sm">
                Personnalisez votre expérience utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Recevoir des notifications par email
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Mode sombre</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Activer le thème sombre
                  </p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          <DeleteAccountSection />

          {/* Section Feedback */}
          <Card className="shadow-sm">
            <CardHeader className="pb-6 px-6 sm:px-8">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="h-5 w-5" />
                Feedback
              </CardTitle>
              <CardDescription className="text-sm">
                Aidez-nous à améliorer LearnSup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Votre feedback
                </Label>
                <Input
                  id="feedback"
                  placeholder="Partagez vos suggestions ou signaler un problème..."
                  className="w-full h-10"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto h-10 px-8">
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer le feedback
              </Button>
            </CardContent>
          </Card>

          {/* Section À propos */}
          <Card className="shadow-sm">
            <CardHeader className="pb-6 px-6 sm:px-8">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Info className="h-5 w-5" />À propos de LearnSup
              </CardTitle>
              <CardDescription className="text-sm">
                Informations sur l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-medium">Version</p>
                  <p className="text-muted-foreground">1.0.0</p>
                </div>
                <div>
                  <p className="font-medium">Dernière mise à jour</p>
                  <p className="text-muted-foreground">29 août 2024</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-10 px-6"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-10 px-6"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Site web
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 shadow-sm">
            <CardContent className="pt-8 px-6 sm:px-8 pb-8">
              <Button
                variant="destructive"
                className="w-full h-12 text-base"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BlockedUsersSection() {
  const utils = trpc.useUtils();
  const { data: blockedUsers, isLoading } =
    trpc.userBlock.getBlockedUsers.useQuery();

  const unblockUserMutation = trpc.userBlock.unblockUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur débloqué avec succès");
      utils.userBlock.getBlockedUsers.invalidate();
      utils.messaging.getConversations.invalidate();
    },
    onError: (error) => {
      toast.error("Erreur lors du déblocage", {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-6 px-6 sm:px-8">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Ban className="h-5 w-5" />
            Utilisateurs bloqués
          </CardTitle>
          <CardDescription className="text-sm">
            Gérez les utilisateurs que vous avez bloqués
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm sm:text-base">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-6 px-6 sm:px-8">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Ban className="h-5 w-5" />
            Utilisateurs bloqués
          </CardTitle>
          <CardDescription className="text-sm">
            Gérez les utilisateurs que vous avez bloqués
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8">
          <div className="text-center py-8 text-muted-foreground">
            <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Aucun utilisateur bloqué</p>
            <p className="text-xs sm:text-sm mt-2">
              Les utilisateurs que vous bloquez n'apparaîtront plus dans vos
              conversations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-6 px-6 sm:px-8">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Ban className="h-5 w-5" />
          Utilisateurs bloqués
        </CardTitle>
        <CardDescription className="text-sm">
          Gérez les utilisateurs que vous avez bloqués ({blockedUsers.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-3">
          {blockedUsers.map((blockedUser) => (
            <div
              key={blockedUser.userId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                    {blockedUser.displayName ||
                      blockedUser.name ||
                      "Utilisateur"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bloqué le{" "}
                    {new Date(blockedUser.blockedAt).toLocaleDateString(
                      "fr-FR"
                    )}
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
                className="ml-4"
              >
                <X className="h-4 w-4 mr-2" />
                {unblockUserMutation.isPending ? "Déblocage..." : "Débloquer"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreditTransactionHistorySection() {
  const router = useRouter();
  const { data: transactionHistory, isLoading } =
    trpc.credits.getTransactionHistory.useQuery({
      limit: 50,
      offset: 0,
    });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-6 px-6 sm:px-8">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <History className="h-5 w-5" />
            Historique des crédits
          </CardTitle>
          <CardDescription className="text-sm">
            Consultez votre historique de transactions de crédits
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm sm:text-base">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (
    !transactionHistory ||
    !transactionHistory.transactions ||
    transactionHistory.transactions.length === 0
  ) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-6 px-6 sm:px-8">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <History className="h-5 w-5" />
            Historique des crédits
          </CardTitle>
          <CardDescription className="text-sm">
            Consultez votre historique de transactions de crédits
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8">
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">
              Aucune transaction pour le moment
            </p>
            <p className="text-xs sm:text-sm mt-2 mb-4">
              Vos transactions de crédits apparaîtront ici
            </p>
            <Button size="sm" onClick={() => router.push("/buy-credits")}>
              <Coins className="w-4 h-4 mr-2" />
              Acheter des crédits
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-6 px-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <History className="h-5 w-5" />
              Historique des crédits
            </CardTitle>
            <CardDescription className="text-sm">
              Consultez votre historique de transactions de crédits (
              {transactionHistory.total} transaction
              {transactionHistory.total > 1 ? "s" : ""})
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/buy-credits")}
            className="ml-4"
          >
            <Coins className="w-4 h-4 mr-2" />
            Acheter des crédits
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-3">
          {transactionHistory.transactions.map((transaction) => {
            const isPositive =
              transaction.type === "TOP_UP" || transaction.type === "REFUND";
            const isNegative = transaction.type === "USAGE";
            const amount = isPositive
              ? `+${transaction.amount}`
              : `-${transaction.amount}`;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isPositive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpCircle className="h-5 w-5" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p
                    className={`font-semibold text-sm ${
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {amount} Credits
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
