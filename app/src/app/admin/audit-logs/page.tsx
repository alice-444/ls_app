"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface AuditLog {
  id: string;
  createdAt: string;
  action: string;
  adminName: string;
  adminId: string;
  targetId: string;
  details: unknown;
}

function LogDetailsModal({ log }: Readonly<{ log: AuditLog }>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du Log</DialogTitle>
          </DialogHeader>
          <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
            <code className="text-white">{JSON.stringify(log.details, null, 2)}</code>
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = trpc.admin.getAuditLogs.useQuery({
    limit: perPage,
    offset: page * perPage,
    searchTerm,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / perPage);

  let tableBodyContent: ReactNode;
  if (isLoading) {
    tableBodyContent = (
      <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow>
    );
  } else if (logs.length === 0) {
    tableBodyContent = (
      <TableRow><TableCell colSpan={5} className="text-center">Aucun log trouvé.</TableCell></TableRow>
    );
  } else {
    tableBodyContent = logs.map((log: AuditLog) => (
      <TableRow key={log.id}>
        <TableCell>
          {format(new Date(log.createdAt), "d MMM yyyy, HH:mm", { locale: fr })}
        </TableCell>
        <TableCell>
          <Badge variant={log.action.startsWith('delete') ? 'destructive' : 'secondary'}>
            {log.action}
          </Badge>
        </TableCell>
        <TableCell>{log.adminName} ({log.adminId})</TableCell>
        <TableCell>
          <span className="font-mono text-xs">{log.targetId}</span>
        </TableCell>
        <TableCell className="text-right">
          <LogDetailsModal log={log} />
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs d'Audit</h1>
        <p className="text-muted-foreground">
          Suivi de toutes les actions administratives.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Rechercher par action, admin, ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Rechercher</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Cible</TableHead>
              <TableHead className="text-right">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableBodyContent}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Total de {total} logs.
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Précédent
          </Button>
          <span>
            Page {page + 1} sur {pageCount}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
