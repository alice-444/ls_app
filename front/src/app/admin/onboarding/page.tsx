"use client";

import Image from "next/image";
import { trpc } from "@/utils/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Loader2, CheckCircle, XCircle, User } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";

export default function AdminOnboardingPage() {
  const { data: onboardingUsers, isLoading, refetch } = trpc.admin.getOnboardingQueue.useQuery();
  const approveUserMutation = trpc.admin.approveUser.useMutation();
  const rejectUserMutation = trpc.admin.rejectUser.useMutation();

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (appUserId: string) => {
    try {
      await approveUserMutation.mutateAsync({ appUserId });
      toast.success("Utilisateur approuvé.");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de l'approbation.");
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!selectedUserId) return;
    try {
      await rejectUserMutation.mutateAsync({
        appUserId: selectedUserId,
        reason: rejectionReason,
      });
      toast.success("Utilisateur rejeté.");
      refetch();
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedUserId(null);
    } catch (error) {
      toast.error("Erreur lors du rejet.");
      console.error(error);
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
        <h1 className="text-3xl font-bold tracking-tight">Validation des utilisateurs</h1>
        <p className="text-muted-foreground">Gérer les profils en attente d'activation.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom d'utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle demandé</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {onboardingUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun utilisateur en attente de validation.
                </TableCell>
              </TableRow>
            ) : (
              onboardingUsers?.map((appUser: any) => (
                <TableRow key={appUser.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {appUser.user.image ? (
                      <Image
                        src={appUser.user.image}
                        alt={appUser.user.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                    )}
                    {appUser.user.name || "N/A"}
                  </TableCell>
                  <TableCell>{appUser.user.email}</TableCell>
                  <TableCell>{appUser.role || "Non spécifié"}</TableCell>
                  <TableCell>{new Date(appUser.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(appUser.id)}
                      disabled={approveUserMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approuver
                    </Button>
                    <Button
                      variant="ctaDestructive"
                      size="ctaSm"
                      onClick={() => {
                        setSelectedUserId(appUser.id);
                        setIsRejectDialogOpen(true);
                      }}
                      disabled={rejectUserMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Rejeter
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter l'utilisateur</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment rejeter ce profil ? Veuillez fournir une raison si nécessaire.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Raison du rejet (optionnel)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Annuler</Button>
            <Button variant="ctaDestructive" size="cta" onClick={handleReject}>Rejeter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
