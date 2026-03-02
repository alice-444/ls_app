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
import { Loader2, Eye, CheckCircle, Clock, Info, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSupportPage() {
  const { data: supportRequests, isLoading, refetch } = trpc.support.getAdminSupportQueue.useQuery();
  const updateStatusMutation = trpc.support.updateStatus.useMutation();

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: any) => {
    try {
      await updateStatusMutation.mutateAsync({
        requestId,
        status: newStatus,
      });
      toast.success("Statut mis à jour.");
      refetch();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut.");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">En attente</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 hover:bg-blue-500 text-white">En cours</Badge>;
      case "RESOLVED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">Résolu</Badge>;
      case "CLOSED":
        return <Badge variant="outline">Fermé</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demandes de Support</h1>
          <p className="text-muted-foreground">Suivre et répondre aux demandes d'assistance des utilisateurs.</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sujet</TableHead>
              <TableHead>Utilisateur / Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supportRequests?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucune demande de support.
                </TableCell>
              </TableRow>
            ) : (
              supportRequests?.map((request: any) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{request.subject}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.problemType}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Détails de la demande #{selectedRequest?.id.substring(0, 8)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                <div>
                  <p className="text-muted-foreground">Utilisateur / Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type de problème</p>
                  <p className="font-medium">{selectedRequest.problemType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date de création</p>
                  <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Statut actuel</p>
                  <Select 
                    value={selectedRequest.status} 
                    onValueChange={(value) => handleUpdateStatus(selectedRequest.id, value)}
                  >
                    <SelectTrigger className="w-[150px] h-8">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="RESOLVED">Résolu</SelectItem>
                      <SelectItem value="CLOSED">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-lg">{selectedRequest.subject}</p>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border whitespace-pre-wrap text-sm italic">
                  "{selectedRequest.description}"
                </div>
              </div>

              {selectedRequest.attachments && (selectedRequest.attachments as any[]).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pièces jointes:</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedRequest.attachments as any[]).map((file: any, i: number) => (
                      <Button key={i} variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Info className="h-3 w-3 mr-2" />
                          {file.filename}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Fermer</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleUpdateStatus(selectedRequest.id, "RESOLVED")}
              disabled={selectedRequest?.status === "RESOLVED"}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Marquer comme résolu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
