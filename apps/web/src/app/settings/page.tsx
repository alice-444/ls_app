"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Trash2
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const handleDeleteAccount = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera définitivement toutes vos données.")) {
      // TODO: Fonctionnalité de suppression du compte
      console.log("Suppression du compte demandée");
      // Appel de l'API pour supprimer le compte
      // Redirection vers la page de connexion 
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-5xl mx-auto py-8 px-6 sm:px-8 lg:px-12">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center sm:text-left">Paramètres</h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>

        <div className="space-y-8">
          {/* Section Compte */}
          <Card className="shadow-sm">
            <CardHeader className="pb-6 px-6 sm:px-8">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Compte
              </CardTitle>
              <CardDescription className="text-sm">
                Gérez vos informations de compte et sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={session?.user?.email || ""}
                    disabled
                    className="w-full h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Nom d'utilisateur</Label>
                  <Input 
                    id="username" 
                    defaultValue={session?.user?.name || ""}
                    disabled
                    className="w-full h-10"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Dernière modification il y a 30 jours
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 px-6">
                    <Lock className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Supprimer le compte</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Cette action est irréversible et supprimera définitivement votre compte
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto h-10 px-6"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Informations personnelles */}
          <Card className="shadow-sm">
            <CardHeader className="pb-6 px-6 sm:px-8">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription className="text-sm">
                Mettez à jour vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
                  <Input id="firstName" defaultValue="John" className="w-full h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
                  <Input id="lastName" defaultValue="Doe" className="w-full h-10" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                  <Input id="phone" type="tel" className="w-full h-10" />
                </div>
              </div>
              <Button className="w-full sm:w-auto h-10 px-8">
                <Mail className="h-4 w-4 mr-2" />
                Sauvegarder les modifications
              </Button>
            </CardContent>
          </Card>

          {/* Section Utilisateurs bloqués */}
          <Card className="shadow-sm">
            <CardHeader className="pb-6 px-6 sm:px-8">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                Utilisateurs bloqués
              </CardTitle>
              <CardDescription className="text-sm">
                Gérez les utilisateurs que vous avez bloqués
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-8">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Aucun utilisateur bloqué</p>
                <p className="text-xs sm:text-sm">Les utilisateurs que vous bloquez n'apparaîtront pas ici</p>
              </div>
            </CardContent>
          </Card>

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
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <Separator />
            </CardContent>
          </Card>

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
                <Label htmlFor="feedback" className="text-sm font-medium">Votre feedback</Label>
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
                <Info className="h-5 w-5" />
                À propos de LearnSup
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
                <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 px-6">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aide
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 px-6">
                  <Globe className="h-4 w-4 mr-2" />
                  Site web
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bouton Se déconnecter */}
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
