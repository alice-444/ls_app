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
import { Loader2, Eye, CheckCircle, XCircle, Ban, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function AdminUserReportsPage() {
  const { data: reports, isLoading, refetch } = trpc.userReport.getAdminReportQueue.useQuery();
  const reviewReportMutation = trpc.userReport.reviewReport.useMutation();

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"RESOLVED" | "DISMISSED">("RESOLVED");

  const handleReviewClick = (report: any) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setIsReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedReport) return;
    try {
      await reviewReportMutation.mutateAsync({
        reportId: selectedReport.id,
        status: reviewStatus,
        adminNotes: adminNotes,
      });
      toast.success("Rapport mis à jour.");
      refetch();
      setIsReviewDialogOpen(false);
      setAdminNotes("");
      setSelectedReport(null);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rapport.");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">En attente</Badge>;
      case "RESOLVED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-500">Résolu</Badge>;
      case "DISMISSED":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Signalements</h1>
        <p className="text-muted-foreground">Examiner et gérer les signalements d'utilisateurs.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Signaleur</TableHead>
              <TableHead>Signalé</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Aucun signalement en attente.
                </TableCell>
              </TableRow>
            ) : (
              reports?.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.reporter.user.name || report.reporter.user.email}</TableCell>
                  <TableCell className="font-medium">{report.reported.user.name || report.reported.user.email}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{report.details || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewClick(report)}
                      disabled={reviewReportMutation.isPending}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Examiner
                    </Button>
                    {/* Add more actions if needed, e.g., direct ban */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Examiner le signalement #{selectedReport?.id.substring(0, 8)}</DialogTitle>
            <DialogDescription>
              Détails du signalement et actions de modération.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p><strong>Signaleur:</strong> {selectedReport?.reporter?.user?.name || selectedReport?.reporter?.user?.email}</p>
              <p><strong>Signalé:</strong> {selectedReport?.reported?.user?.name || selectedReport?.reported?.user?.email}</p>
              <p><strong>Raison:</strong> {selectedReport?.reason}</p>
              <p><strong>Détails:</strong> {selectedReport?.details || "Aucun détail fourni."}</p>
              {selectedReport?.messageId && (
                <p className="flex items-center gap-1">
                  <MessageSquareText className="h-4 w-4" /> Message ID: {selectedReport.messageId} (Lien vers le message si implémenté)
                </p>
              )}
            </div>
            <Textarea
              placeholder="Notes de l'administrateur (optionnel)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setReviewStatus("DISMISSED");
                submitReview();
              }}
              disabled={reviewReportMutation.isPending}
            >
              <Ban className="h-4 w-4 mr-2" /> Rejeter
            </Button>
            <Button
              onClick={() => {
                setReviewStatus("RESOLVED");
                submitReview();
              }}
              disabled={reviewReportMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Résoudre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
