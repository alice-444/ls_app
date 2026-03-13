"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CreditCard, 
  BookOpen, 
  AlertTriangle, 
  History,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BackButton } from "@/components/shared/back-button";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";

export default function User360Page() {
  const params = useParams();
  const userId = params.id as string;
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditReason, setCreditReason] = useState("");
  const [creditType, setCreditType] = useState<"ADD" | "REMOVE">("ADD");

  const { data: user, isLoading, refetch } = trpc.admin.getUser360.useQuery({
    userId,
  });

  const updateCreditsMutation = trpc.admin.updateUserCredits.useMutation({
    onSuccess: () => {
      toast.success("Crédits mis à jour");
      setIsCreditDialogOpen(false);
      setCreditAmount(0);
      setCreditReason("");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleUpdateCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (creditAmount <= 0) return toast.error("Le montant doit être positif");
    if (!creditReason) return toast.error("Une raison est requise");

    updateCreditsMutation.mutate({
      userId,
      amount: creditAmount,
      reason: creditReason,
      type: creditType,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Utilisateur non trouvé</h2>
        <Button asChild variant="link" className="mt-4">
          <BackButton href="/admin/users" label="Retour à la liste" />
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge className="bg-emerald-500">Actif</Badge>;
      case "PENDING": return <Badge className="bg-amber-500">En attente</Badge>;
      case "SUSPENDED": return <Badge variant="destructive">Suspendu</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton href="/admin/users" label="Retour à la liste" />
          <div className="flex items-center gap-4 mt-4">
            {user.photoUrl ? (
              <Image src={user.photoUrl} alt="" width={64} height={64} className="rounded-full h-16 w-16 object-cover border-2 border-brand" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center border-2 border-brand">
                <User className="h-8 w-8 text-brand" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-ls-heading flex items-center gap-2">
                {user.displayName || user.name}
                {getStatusBadge(user.status)}
              </h1>
              <p className="text-ls-muted flex items-center gap-2">
                <Mail className="h-4 w-4" /> {user.email} • ID: {user.id.slice(-8)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full border-ls-border">
                <CreditCard className="h-4 w-4 mr-2" /> Ajuster Crédits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajustement manuel des crédits</DialogTitle>
                <DialogDescription>
                  Modifier le solde de {user.name}. Solde actuel: <strong>{user.creditBalance}</strong> credits.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateCredits} className="space-y-4 pt-4">
                <div className="flex gap-4 p-1 bg-muted rounded-lg">
                  <Button 
                    type="button" 
                    variant={creditType === "ADD" ? "default" : "ghost"} 
                    className="flex-1 rounded-md"
                    onClick={() => setCreditType("ADD")}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                  </Button>
                  <Button 
                    type="button" 
                    variant={creditType === "REMOVE" ? "default" : "ghost"} 
                    className="flex-1 rounded-md"
                    onClick={() => setCreditType("REMOVE")}
                  >
                    <Minus className="h-4 w-4 mr-2" /> Retirer
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Montant</Label>
                  <Input 
                    type="number" 
                    value={creditAmount} 
                    onChange={(e) => setCreditAmount(parseInt(e.target.value))} 
                    placeholder="Ex: 50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Raison de l'ajustement</Label>
                  <Textarea 
                    value={creditReason} 
                    onChange={(e) => setCreditReason(e.target.value)} 
                    placeholder="Ex: Geste commercial pour problème technique..."
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-brand text-white" disabled={updateCreditsMutation.isPending}>
                    {updateCreditsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirmer l'ajustement
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-ls-muted">Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-brand" />
              <div>
                <p className="text-xs text-ls-muted">Rôle</p>
                <p className="text-sm font-medium">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-ls-muted">Solde Crédits</p>
                <p className="text-sm font-bold text-ls-heading">{user.creditBalance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-ls-muted">Membre depuis</p>
                <p className="text-sm font-medium">{format(new Date(user.createdAt), "d MMM yyyy", { locale: fr })}</p>
              </div>
            </div>
            {user.publishedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-ls-muted">Profil Publié</p>
                  <p className="text-sm font-medium">{format(new Date(user.publishedAt), "d MMM yyyy")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 p-0">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand bg-transparent shadow-none">Général</TabsTrigger>
              <TabsTrigger value="workshops" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand bg-transparent shadow-none">Ateliers</TabsTrigger>
              <TabsTrigger value="credits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand bg-transparent shadow-none">Transactions</TabsTrigger>
              <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand bg-transparent shadow-none">Litiges</TabsTrigger>
              <TabsTrigger value="audit" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand bg-transparent shadow-none">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="py-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-brand" /> Ateliers Mentorés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{user.workshops_as_mentor.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-ls-blue" /> Ateliers Suivis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{user.workshops_as_apprentice.length}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" /> Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.notifications.slice(0, 5).map((notif: any) => (
                    <div key={notif.id} className="flex items-start gap-3 text-sm pb-3 border-b last:border-0 last:pb-0">
                      <div className="p-1 rounded bg-muted mt-0.5"><Clock className="h-3 w-3" /></div>
                      <div>
                        <p className="font-medium">{notif.title}</p>
                        <p className="text-ls-muted text-xs">{notif.message}</p>
                        <p className="text-[10px] text-ls-muted mt-1">{format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm")}</p>
                      </div>
                    </div>
                  ))}
                  {user.notifications.length === 0 && <p className="text-center text-ls-muted text-sm py-4">Aucune notification.</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workshops" className="py-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Ateliers en tant que Mentor</h3>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-ls-muted">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Titre</th>
                          <th className="px-4 py-2 text-left font-medium">Date</th>
                          <th className="px-4 py-2 text-left font-medium">Statut</th>
                          <th className="px-4 py-2 text-right font-medium">Prix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.workshops_as_mentor.map((w: any) => (
                          <tr key={w.id} className="border-t hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">{w.title}</td>
                            <td className="px-4 py-3">{w.date ? format(new Date(w.date), "dd/MM/yyyy") : "—"}</td>
                            <td className="px-4 py-3"><Badge variant="outline">{w.status}</Badge></td>
                            <td className="px-4 py-3 text-right">{w.creditCost} cr.</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="credits" className="py-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.creditTransactions.map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-medium">{t.description}</p>
                          <p className="text-[10px] text-ls-muted">{format(new Date(t.createdAt), "dd/MM/yyyy HH:mm")}</p>
                        </div>
                        <div className={cn("font-bold text-sm", t.amount > 0 ? "text-emerald-600" : "text-rose-600")}>
                          {t.amount > 0 ? "+" : ""}{t.amount} cr.
                        </div>
                      </div>
                    ))}
                    {user.creditTransactions.length === 0 && <p className="text-center text-ls-muted py-10">Aucune transaction.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="py-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" /> Signalements Reçus
                  </h3>
                  <div className="space-y-4">
                    {user.reports_received.map((r: any) => (
                      <Card key={r.id} className="border-ls-error/20">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <Badge variant="destructive">{r.status}</Badge>
                            <span className="text-xs text-ls-muted">{format(new Date(r.createdAt), "dd/MM/yyyy")}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm font-bold mt-2">{r.reason}</p>
                          <p className="text-xs text-ls-muted mt-1">{r.details}</p>
                          <p className="text-[10px] text-ls-muted mt-2 italic">Signalé par: {r.reporter.name} ({r.reporter.email})</p>
                        </CardContent>
                      </Card>
                    ))}
                    {user.reports_received.length === 0 && <p className="text-center text-ls-muted py-10 border border-dashed rounded-xl">Aucun signalement reçu.</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="py-6">
              <Card>
                <CardHeader>
                  <CardTitle>Journal d'audit (Actions Admin sur ce profil)</CardTitle>
                  <CardDescription>Traçabilité des décisions administratives.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.auditLogs.map((log: any) => (
                      <div key={log.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="bg-white">{log.action}</Badge>
                          <span className="text-[10px] text-ls-muted">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
                        </div>
                        <p className="text-xs mt-2"><strong>Par:</strong> {log.admin.name}</p>
                        {log.details && (
                          <pre className="mt-2 text-[10px] p-2 bg-slate-200 dark:bg-slate-800 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                    {user.auditLogs.length === 0 && <p className="text-center text-ls-muted py-10">Aucune action admin enregistrée.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Helper for conditional classNames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
