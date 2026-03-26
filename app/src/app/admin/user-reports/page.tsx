"use client";

import { trpc } from "@/utils/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Eye,
  MessageSquare,
  Clock,
  Shield,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useState, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

type AdminReport = {
  id: string;
  createdAt: string;
  reporterName?: string;
  reportedName?: string;
  reporterUserId?: string;
  reportedUserId?: string;
  reason: string;
  status: string;
  details?: string | null;
  messageId?: string | null;
  adminNotes?: string | null;
  reviewedAt?: string | null;
};

function UserReportsContent() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("PENDING");
  const { data: reports, isLoading, refetch } = trpc.userReport.getAdminReportQueue.useQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const reviewMutation = trpc.userReport.reviewReport.useMutation({
    onSuccess: () => {
      toast.success("Le signalement a été mis à jour");
      refetch();
      setIsDetailDialogOpen(false);
      setAdminNotes("");
    },
    onError: (err: { message: string }) => {
      toast.error("Erreur lors de la mise à jour : " + err.message);
    }
  });

  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleOpenDetail = (report: AdminReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setIsDetailDialogOpen(true);
  };

  const handleAction = async (status: "REVIEWED" | "RESOLVED" | "DISMISSED") => {
    if (!selectedReport) return;
    reviewMutation.mutate({
      reportId: selectedReport.id,
      status,
      adminNotes
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Résolu</Badge>;
      case "DISMISSED":
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Ignoré</Badge>;
      case "REVIEWED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En cours</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "HARASSMENT": return "Harcèlement";
      case "SPAM": return "Spam";
      case "INAPPROPRIATE_CONTENT": return "Contenu inapproprié";
      case "FAKE_PROFILE": return "Faux profil";
      default: return reason;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const reportsList = reports || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signalements Utilisateurs</h1>
          <p className="text-muted-foreground">Gérer les signalements de comportements inappropriés.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtrer par statut:</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReportStatus | "ALL")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="REVIEWED">En cours</SelectItem>
              <SelectItem value="RESOLVED">Résolus</SelectItem>
              <SelectItem value="DISMISSED">Ignorés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Signalé par</TableHead>
              <TableHead>Utilisateur signalé</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-20" />
                    <p>Aucun signalement trouvé.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reportsList.map((report: AdminReport) => (
                <TableRow key={report.id}>
                  <TableCell className="text-xs">
                    {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{report.reporterName || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-rose-400" />
                      <span className="text-sm font-medium">{report.reportedName || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {getReasonLabel(report.reason)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(report)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">Détails du Signalement</DialogTitle>
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Détail du Signalement
                </DialogTitle>
                <DialogDescription>
                  Signalement ID: {selectedReport.id}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
                  <span className="text-xs text-muted-foreground block">Signalé par</span>
                  <span className="font-medium">{selectedReport.reporterName}</span>
                  <span className="text-xs block opacity-60">{selectedReport.reporterUserId}</span>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1">
                  <span className="text-xs text-rose-600 dark:text-rose-400 block">Utilisateur signalé</span>
                  <span className="font-medium text-rose-900 dark:text-rose-100">{selectedReport.reportedName}</span>
                  <span className="text-xs block opacity-60">{selectedReport.reportedUserId}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Raison: {getReasonLabel(selectedReport.reason)}
                  </label>
                </div>

                {selectedReport.details && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Détails fournis par le rapporteur:</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm italic">
                      "{selectedReport.details}"
                    </div>
                  </div>
                )}

                {selectedReport.messageId && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900/30 text-xs">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>Signalé depuis un message (ID: {selectedReport.messageId})</span>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium">Notes de l'administrateur:</label>
                  <Textarea
                    placeholder="Ajouter des notes sur l'examen de ce signalement..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="min-h-[100px]"
                    disabled={selectedReport.status !== "PENDING" && selectedReport.status !== "REVIEWED"}
                  />
                </div>

                {selectedReport.reviewedAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Examiné le {format(new Date(selectedReport.reviewedAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Fermer
                </Button>

                {selectedReport.status === "PENDING" && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction("REVIEWED")}
                    disabled={reviewMutation.isPending}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Examiner
                  </Button>
                )}

                {(selectedReport.status === "PENDING" || selectedReport.status === "REVIEWED") && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleAction("DISMISSED")}
                      disabled={reviewMutation.isPending}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Ignorer
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleAction("RESOLVED")}
                      disabled={reviewMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Résoudre
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUserReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <UserReportsContent />
    </Suspense>
  );
}
