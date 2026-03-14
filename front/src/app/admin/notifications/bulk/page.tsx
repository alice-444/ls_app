"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import {
  Send,
  Filter,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/shared/BackButton";

export default function AdminBulkNotificationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    actionUrl: "",
    criteria: {
      role: undefined as "MENTOR" | "APPRENANT" | "ADMIN" | undefined,
      status: undefined as "PENDING" | "ACTIVE" | "SUSPENDED" | undefined,
      isPublished: undefined as boolean | undefined,
      hasPublishedWorkshop: undefined as boolean | undefined,
    }
  });

  const bulkNotifyMutation = trpc.admin.sendBulkNotification.useMutation({
    onSuccess: (data: { count: number }) => {
      toast.success(`${data.count} notifications envoyées avec succès`);
      router.push("/admin/notifications");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Veuillez remplir le titre et le message");
      return;
    }

    setIsSubmitting(true);
    bulkNotifyMutation.mutate({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      actionUrl: formData.actionUrl || undefined,
      criteria: formData.criteria
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <BackButton href="/admin/notifications" label="Retour aux notifications" />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Moteur de Segmentation</h1>
          <p className="text-muted-foreground">Envoyez des notifications ciblées à vos utilisateurs.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Segmentation
                </CardTitle>
                <CardDescription>Ciblez vos utilisateurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    onValueChange={(v) => setFormData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria, role: v === "ALL" ? undefined : v as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les rôles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les rôles</SelectItem>
                      <SelectItem value="MENTOR">Mentors</SelectItem>
                      <SelectItem value="APPRENANT">Apprenants</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Statut compte</Label>
                  <Select
                    onValueChange={(v) => setFormData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria, status: v === "ALL" ? undefined : v as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les statuts</SelectItem>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="is-published">Profil publié</Label>
                  <Switch
                    id="is-published"
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria, isPublished: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="has-workshop">Atelier publié</Label>
                  <Switch
                    id="has-workshop"
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria, hasPublishedWorkshop: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 flex gap-3 text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs">
                Attention : l'envoi de notifications groupées est immédiat et ne peut pas être annulé.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Message
                </CardTitle>
                <CardDescription>Détails de la notification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Nouvelle fonctionnalité disponible !"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Contenu du message</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre annonce ici..."
                    className="min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de notification</Label>
                    <Select
                      defaultValue="SYSTEM"
                      onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SYSTEM">Système</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="ANNOUNCEMENT">Annonce</SelectItem>
                        <SelectItem value="REMINDER">Rappel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">Lien d'action (Optionnel)</Label>
                    <Input
                      id="url"
                      placeholder="Ex: /workshops"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 p-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting || bulkNotifyMutation.isPending}>
                  {isSubmitting ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer aux utilisateurs
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Aperçu
              </h3>
              <Card className="border-l-4 border-l-primary bg-primary/5 opacity-80">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-full bg-background border">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-sm">{formData.title || "Titre de la notification"}</h3>
                      <span className="text-xs text-muted-foreground">maintenant</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.message || "Le contenu de votre message apparaîtra ici."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
