"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, MessageSquare, Clock, XCircle, CheckCircle } from "lucide-react";
import { getReportReasonLabel, adminDateFormatters } from "@/lib/admin/admin-utils";
import { UserReport, ReportStatus } from "@ls-app/shared";

interface ReportDetailsDialogProps {
  report: UserReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  onAction: (status: ReportStatus) => void;
  isPending: boolean;
}

export function ReportDetailsDialog({
  report,
  open,
  onOpenChange,
  adminNotes,
  setAdminNotes,
  onAction,
  isPending,
}: Readonly<ReportDetailsDialogProps>) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl border-border/50 shadow-2xl">
        <DialogTitle className="sr-only">{"Détails du Signalement"}</DialogTitle>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-ls-heading">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {"Détail du Signalement"}
          </DialogTitle>
          <DialogDescription className="text-xs font-mono opacity-60">
            Signalement ID: {report.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-ls-muted tracking-wider block">Signalé par</span>
            <span className="font-bold text-ls-heading">{report.reporterName}</span>
            <span className="text-[10px] font-mono block opacity-50 truncate">{report.reporterUserId}</span>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider block">Utilisateur signalé</span>
            <span className="font-bold text-rose-900">{report.reportedName}</span>
            <span className="text-[10px] font-mono block opacity-50 truncate text-rose-700">{report.reportedUserId}</span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-ls-muted flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Raison du signalement
            </label>
            <div className="text-sm font-medium text-ls-heading bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              {getReportReasonLabel(report.reason)}
            </div>
          </div>

          {report.details && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ls-muted">Détails du rapporteur</label>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm italic text-ls-heading leading-relaxed">
                &quot;{report.details}&quot;
              </div>
            </div>
          )}

          {report.messageId && (
            <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-700">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Signalé depuis un message spécifique</span>
              <span className="ml-auto font-mono opacity-60">ID: {report.messageId}</span>
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ls-muted">Notes administratives</label>
            <Textarea
              placeholder="Ajouter des notes internes sur la résolution de ce cas..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="min-h-[100px] rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
              disabled={report.status !== "PENDING" && report.status !== "REVIEWED"}
            />
          </div>

          {report.reviewedAt && (
            <div className="flex items-center gap-2 text-[10px] text-ls-muted uppercase font-bold tracking-widest">
              <Clock className="h-3 w-3" />
              Examiné le {adminDateFormatters.full(report.reviewedAt)}
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 sm:gap-0 mt-8">
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>

          <div className="flex gap-2 ml-auto">
            {report.status === "PENDING" && (
              <Button
                variant="outline"
                onClick={() => onAction("REVIEWED")}
                disabled={isPending}
                className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50">
                Mettre en cours
              </Button>
            )}

            {(report.status === "PENDING" || report.status === "REVIEWED") && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => onAction("DISMISSED")}
                  disabled={isPending}
                  className="rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800">
                  <XCircle className="h-4 w-4 mr-2" />
                  Ignorer
                </Button>
                <Button
                  variant="default"
                  onClick={() => onAction("RESOLVED")}
                  disabled={isPending}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Résoudre
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
