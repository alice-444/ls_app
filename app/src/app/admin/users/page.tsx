"use client";

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
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Loader2,
  CheckCircle,
  XCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

function UsersContent() {
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get("status") as UserStatus | null;
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">(
    statusFromUrl && ["PENDING", "ACTIVE", "SUSPENDED"].includes(statusFromUrl)
      ? statusFromUrl
      : "PENDING"
  );
  const [cursor, setCursor] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string | null;
    email: string | null;
  } | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading, refetch } = trpc.admin.getUsers.useQuery({
    limit: 20,
    cursor: cursor ?? undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const approveMutation = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur activé");
      refetch();
    },
    onError: (err: any) => {
      toast.error("Erreur : " + err.message);
    },
  });

  const bulkApproveMutation = trpc.admin.bulkApproveUsers.useMutation({
    onSuccess: () => {
      toast.success("Utilisateurs activés en masse");
      setSelectedUserIds([]);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const rejectMutation = trpc.admin.rejectUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur suspendu");
      refetch();
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedUser(null);
    },
    onError: (err: any) => {
      toast.error("Erreur : " + err.message);
    },
  });

  const bulkRejectMutation = trpc.admin.bulkRejectUsers.useMutation({
    onSuccess: () => {
      toast.success("Utilisateurs suspendus en masse");
      setSelectedUserIds([]);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleSelectAll = () => {
    if (selectedUserIds.length === items.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(items.map((u: any) => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleApprove = (userId: string) => {
    approveMutation.mutate({ userId });
  };

  const handleReject = () => {
    if (selectedUserIds.length > 0) {
      bulkRejectMutation.mutate({
        userIds: selectedUserIds,
        reason: rejectionReason || undefined,
      });
    } else if (selectedUser) {
      rejectMutation.mutate({
        userId: selectedUser.id,
        reason: rejectionReason || undefined,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200">
            En attente
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200">
            Actif
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200">
            Suspendu
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return "—";
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "MENTOR":
        return "Mentor";
      case "APPRENANT":
        return "Apprenant";
      default:
        return role;
    }
  };

  const items = data?.items ?? [];
  const nextCursor = data?.nextCursor;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ls-heading">
            Gestion des utilisateurs
          </h1>
          <p className="text-ls-muted mt-1">
            Consulter et gérer les comptes utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-2 mr-4 px-4 py-1.5 bg-brand/5 border border-brand/20 rounded-full animate-in fade-in slide-in-from-right-2">
              <span className="text-sm font-medium text-brand">{selectedUserIds.length} sélectionnés</span>
              <div className="h-4 w-px bg-brand/20 mx-1" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
                onClick={() => bulkApproveMutation.mutate({ userIds: selectedUserIds })}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approuver
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-1" /> Rejeter
              </Button>
            </div>
          )}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as UserStatus | "ALL");
              setCursor(null);
              setSelectedUserIds([]);
            }}
          >
            <SelectTrigger className="w-[180px] rounded-full">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="ACTIVE">Actifs</SelectItem>
              <SelectItem value="SUSPENDED">Suspendus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={items.length > 0 && selectedUserIds.length === items.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-ls-heading">Utilisateur</TableHead>
              <TableHead className="text-ls-heading">Email</TableHead>
              <TableHead className="text-ls-heading">Rôle</TableHead>
              <TableHead className="text-ls-heading">Statut</TableHead>
              <TableHead className="text-ls-heading">Inscription</TableHead>
              <TableHead className="text-right text-ls-heading">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-ls-muted py-12"
                >
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              items.map((user: any) => (
                <TableRow
                  key={user.id}
                  className={cn(
                    "border-border/50 transition-colors",
                    selectedUserIds.includes(user.id) ? "bg-brand/5" : "hover:bg-brand-soft/20"
                  )}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => toggleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.photoUrl ? (
                        <Image
                          src={user.photoUrl}
                          alt={user.name ?? ""}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-brand/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-brand" />
                        </div>
                      )}
                      <span className="font-medium text-ls-heading">
                        {user.name || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-ls-muted">{user.email || "—"}</TableCell>
                  <TableCell>{getRoleLabel(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-ls-muted">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "d MMM yyyy", {
                          locale: fr,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="ctaSm"
                        title="Voir la fiche 360°"
                      >
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {statusFilter === "PENDING" && (
                        <>
                          <Button
                            variant="cta"
                            size="ctaSm"
                            onClick={() => handleApprove(user.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ctaDestructive"
                            size="ctaSm"
                            onClick={() => {
                              setSelectedUser({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                              });
                              setIsRejectDialogOpen(true);
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {(cursor || nextCursor) && (
          <div className="flex justify-between items-center p-4 border-t border-border/50 bg-card/50">
            <Button
              variant="ctaOutline"
              size="ctaSm"
              onClick={() => setCursor(null)}
              disabled={!cursor}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Début
            </Button>
            <Button
              variant="ctaOutline"
              size="ctaSm"
              onClick={() => nextCursor && setCursor(nextCursor)}
              disabled={!nextCursor}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="rounded-2xl border-border/50">
          <DialogHeader>
            <DialogTitle>Rejeter l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              {selectedUser?.name
                ? `Rejeter ${selectedUser.name} (${selectedUser.email}) ?`
                : "Rejeter cet utilisateur ?"}
              {" "}
              Vous pouvez indiquer une raison (optionnel).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Raison du rejet (optionnel)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setSelectedUser(null);
                setRejectionReason("");
              }}
            >
              Annuler
            </Button>
            <Button variant="ctaDestructive" size="cta" onClick={handleReject}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
