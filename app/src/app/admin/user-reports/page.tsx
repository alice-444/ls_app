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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Eye,
  Clock,
  Shield,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useState, Suspense, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getReportReasonLabel, adminDateFormatters } from "@/lib/admin/admin-utils";
import { useBatchSelection } from "@/hooks/admin/use-batch-selection";
import { ReportDetailsDialog } from "@/components/admin/modals/ReportDetailsDialog";
import { AdminBulkActions } from "@/components/admin/AdminBulkActions";
import { UserReport, ReportStatus } from "@ls-app/shared";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";

function UserReportsContent() {
  const { filters, setFilter } = useAdminFilters({
    status: "PENDING"
  });

  const { data: reports, isLoading, refetch } = trpc.userReport.getAdminReportQueue.useQuery({
    status: filters.status === "ALL" ? undefined : filters.status as ReportStatus,
  });

  const reportsList = reports || [];
  const { selectedIds, toggleSelect, toggleSelectAll, isAllSelected, resetSelection } = useBatchSelection(reportsList);

  // Reset selection when status filter changes
  useEffect(() => {
    resetSelection();
  }, [filters.status, resetSelection]);

  const reviewMutation = trpc.userReport.reviewReport.useMutation({
    onSuccess: () => {
      toast.success("Le signalement a été mis à jour");
      refetch();
      setIsDetailDialogOpen(false);
      setAdminNotes("");
    },
    onError: (err: { message: string }) => toast.error(err.message)
  });

  const bulkReviewMutation = trpc.userReport.bulkReviewReports.useMutation({
    onSuccess: () => {
      toast.success("Signalements mis à jour en masse");
      resetSelection();
      refetch();
    },
    onError: (err: { message: string }) => toast.error(err.message)
  });

  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleOpenDetail = (report: UserReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setIsDetailDialogOpen(true);
  };

  const handleAction = (status: ReportStatus) => {
    if (!selectedReport) return;
    reviewMutation.mutate({ reportId: selectedReport.id, status, adminNotes });
  };

  const handleBulkAction = (status: ReportStatus) => {
    bulkReviewMutation.mutate({ reportIds: selectedIds, status });
  };

  if (isLoading) {
    return <AdminTableSkeleton columnCount={6} rowCount={8} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ls-heading">Signalements Utilisateurs</h1>
          <p className="text-ls-muted text-sm">Gérer les signalements de comportements inappropriés.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ls-muted">Filtrer par statut:</span>
          <Select
            value={filters.status}
            onValueChange={(v) => setFilter("status", v)}
          >
            <SelectTrigger className="w-[180px] h-9 rounded-full bg-card">
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

      <AdminBulkActions
        selectedCount={selectedIds.length}
        actions={[
          {
            label: "En cours",
            icon: <Clock className="h-4 w-4" />,
            onClick: () => handleBulkAction("REVIEWED"),
            className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
            disabled: bulkReviewMutation.isPending
          },
          {
            label: "Résoudre",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => handleBulkAction("RESOLVED"),
            className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
            disabled: bulkReviewMutation.isPending
          },
          {
            label: "Ignorer",
            icon: <XCircle className="h-4 w-4" />,
            onClick: () => handleBulkAction("DISMISSED"),
            className: "text-slate-600 hover:text-slate-700 hover:bg-slate-50",
            disabled: bulkReviewMutation.isPending
          }
        ]}
      />

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[40px] px-4">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-ls-heading">Date</TableHead>
              <TableHead className="text-ls-heading">Signalé par</TableHead>
              <TableHead className="text-ls-heading">Utilisateur signalé</TableHead>
              <TableHead className="text-ls-heading">Raison</TableHead>
              <TableHead className="text-ls-heading">Statut</TableHead>
              <TableHead className="text-right px-6 text-ls-heading">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-ls-muted py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-20" />
                    <p>Aucun signalement trouvé.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reportsList.map((report: UserReport) => (
                <TableRow
                  key={report.id}
                  className={cn(
                    "transition-colors",
                    selectedIds.includes(report.id) ? "bg-brand/5 hover:bg-brand/10" : "hover:bg-slate-50"
                  )}
                >
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedIds.includes(report.id)}
                      onCheckedChange={() => toggleSelect(report.id)}
                    />
                  </TableCell>
                  <TableCell className="text-[11px] font-mono text-ls-muted">
                    {adminDateFormatters.full(report.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="text-xs font-medium text-ls-heading">{report.reporterName || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-rose-50 flex items-center justify-center">
                        <Shield className="h-3.5 w-3.5 text-rose-400" />
                      </div>
                      <span className="text-xs font-bold text-rose-900">{report.reportedName || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider bg-slate-100 text-ls-muted border-0">
                      {getReportReasonLabel(report.reason)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 hover:text-brand hover:bg-brand/10 transition-colors"
                      onClick={() => handleOpenDetail(report)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReportDetailsDialog
        report={selectedReport}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        onAction={handleAction}
        isPending={reviewMutation.isPending}
      />
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
