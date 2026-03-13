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
  ExternalLink, 
  FileText, 
  User, 
  Mail, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  Download,
  Info,
  MessageSquare
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SupportThread } from "@/components/domains/admin/support/support-thread";

type SupportRequestStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface SupportRequest {
  id: string;
  subject: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  email: string;
  problemType: string;
  description: string;
  userId?: string | null;
  user?: { displayName?: string; name?: string } | null;
  attachments?: { url: string; filename: string; size: number }[];
}

function AdminSupportContent() {
  const [statusFilter, setStatusFilter] = useState<SupportRequestStatus | "ALL">("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: requests, isLoading, refetch } = trpc.support.getAdminSupportQueue.useQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const updateStatusMutation = trpc.support.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      refetch();
      setIsDetailDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const handleUpdateStatus = async (requestId: string, newStatus: SupportRequestStatus) => {
    updateStatusMutation.mutate({ requestId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase text-[10px]">En attente</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">En cours</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px]">Résolu</Badge>;
      case "CLOSED":
        return <Badge variant="secondary" className="uppercase text-[10px]">Fermé</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
    }
  };

  const viewDetail = (request: SupportRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Client</h1>
          <p className="text-muted-foreground">Gérer les demandes d'assistance des utilisateurs.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtrer par statut:</span>
          <Select 
            value={statusFilter} 
            onValueChange={(v) => setStatusFilter(v as SupportRequestStatus | "ALL")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
              <SelectItem value="RESOLVED">Résolu</SelectItem>
              <SelectItem value="CLOSED">Fermé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!requests || requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                    <p>Aucune demande de support trouvée.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request: SupportRequest) => (
                <TableRow key={request.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {format(new Date(request.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[250px] truncate" title={request.subject}>
                      {request.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{request.user?.displayName || request.user?.name || "Anonyme"}</span>
                      <span className="text-xs text-muted-foreground">{request.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{request.problemType}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => viewDetail(request)}>
                        <Info className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Changer statut</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, "PENDING")}>
                            En attente
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, "IN_PROGRESS")}>
                            En cours
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, "RESOLVED")}>
                            Résolu
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, "CLOSED")}>
                            Fermé
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Détails du Ticket</DialogTitle>
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <DialogTitle className="text-xl">{selectedRequest.subject}</DialogTitle>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <DialogDescription>
                  Reçu le {format(new Date(selectedRequest.createdAt), "PPPP 'à' HH:mm", { locale: fr })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> Utilisateur
                    </div>
                    <div className="text-sm font-medium">
                      {selectedRequest.user ? (
                        <span className="flex items-center gap-1">
                          {selectedRequest.user.displayName || selectedRequest.user.name}
                          <Badge variant="outline" className="ml-2 text-[10px]">ID: {selectedRequest.userId}</Badge>
                        </span>
                      ) : "Non connecté"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email de contact
                    </p>
                    <p className="text-sm font-medium">{selectedRequest.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" /> Type de problème
                    </p>
                    <p className="text-sm font-medium">{selectedRequest.problemType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Dernière mise à jour
                    </p>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedRequest.updatedAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Fil de discussion
                  </h3>
                  <SupportThread requestId={selectedRequest.id} isAdmin={true} />
                </div>

                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Download className="h-4 w-4" /> Pièces jointes ({selectedRequest.attachments.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedRequest.attachments.map((file) => (
                        <a 
                          key={file.url}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-md border bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-xs font-medium truncate" title={file.filename}>
                                {file.filename}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <div className="flex grow gap-2">
                  <Select 
                    defaultValue={selectedRequest.status} 
                    onValueChange={(v) => handleUpdateStatus(selectedRequest.id, v as SupportRequestStatus)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Changer le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="RESOLVED">Résolu</SelectItem>
                      <SelectItem value="CLOSED">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AdminSupportContent />
    </Suspense>
  );
}
