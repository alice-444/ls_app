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
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Filter,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getRoleLabel, adminDateFormatters } from "@/lib/admin/admin-utils";
import { useBatchSelection } from "@/hooks/admin/use-batch-selection";
import { AdminBulkActions } from "@/components/admin/AdminBulkActions";
import { RejectUserDialog } from "@/components/admin/modals/RejectUserDialog";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { maskEmail } from "@ls-app/shared";
import { MaskedData } from "@/components/admin/MaskedData";

type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED";


function UsersContent() {
  const { filters, setFilter } = useAdminFilters({
    status: "ALL",
    role: "ALL",
  });

  // Local state for search to avoid PII (names/emails) in URL history/logs
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search to avoid excessive tRPC calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string | null;
    email: string | null;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading, refetch } = trpc.admin.getUsers.useQuery({
    limit: 20,
    cursor: cursor ?? undefined,
    status: filters.status === "ALL" ? undefined : filters.status as UserStatus,
    role: filters.role === "ALL" ? undefined : filters.role,
    searchTerm: debouncedSearch || undefined,
  }, {
    placeholderData: (previousData: any) => previousData,
  });

  const items = data?.items ?? [];
  const nextCursor = data?.nextCursor;

  // Use the abstracted hook for selection
  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    resetSelection
  } = useBatchSelection(items);

  // Reset pagination when filters change
  useEffect(() => {
    setCursor(null);
    resetSelection();
  }, [filters.status, filters.role, debouncedSearch, resetSelection]);

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
      resetSelection();
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
      resetSelection();
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleApprove = (userId: string) => {
    approveMutation.mutate({ userId });
  };

  const handleReject = () => {
    if (selectedIds.length > 0) {
      bulkRejectMutation.mutate({
        userIds: selectedIds,
        reason: rejectionReason || undefined,
      });
    } else if (selectedUser) {
      rejectMutation.mutate({
        userId: selectedUser.id,
        reason: rejectionReason || undefined,
      });
    }
  };

  if (isLoading) {
    return <AdminTableSkeleton columnCount={5} rowCount={8} />;
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ls-muted" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-full bg-card/50"
            />
          </div>

          <Select
            value={filters.role}
            onValueChange={(v) => setFilter("role", v)}
          >
            <SelectTrigger className="w-[140px] rounded-full bg-card/50">
              <Filter className="h-4 w-4 mr-2 text-ls-muted" />
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les rôles</SelectItem>
              <SelectItem value="MENTOR">Mentor</SelectItem>
              <SelectItem value="APPRENANT">Apprenant</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(v) => setFilter("status", v)}
          >
            <SelectTrigger className="w-[160px] rounded-full bg-card/50">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="ACTIVE">Actifs</SelectItem>
              <SelectItem value="SUSPENDED">Suspendus</SelectItem>
              <SelectItem value="DELETED">Supprimés (Purge 30j)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AdminBulkActions
        selectedCount={selectedIds.length}
        actions={[
          {
            label: "Approuver",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => bulkApproveMutation.mutate({ userIds: selectedIds }),
            className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
            disabled: bulkApproveMutation.isPending
          },
          {
            label: "Rejeter",
            icon: <XCircle className="h-4 w-4" />,
            onClick: () => setIsRejectDialogOpen(true),
            className: "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
            disabled: bulkRejectMutation.isPending
          }
        ]}
      />

      <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-ls-heading">Utilisateur</TableHead>
              <TableHead className="text-ls-heading">Rôle / Crédits</TableHead>
              <TableHead className="text-ls-heading">Statut</TableHead>
              <TableHead className="text-ls-heading">Dernière activité</TableHead>
              <TableHead className="text-right text-ls-heading">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
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
                    selectedIds.includes(user.id) ? "bg-brand/5" : "hover:bg-brand-soft/20"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onCheckedChange={() => toggleSelect(user.id)}
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
                      <div className="flex flex-col">
                        <span className="font-medium text-ls-heading leading-none">
                          {user.name || "—"}
                        </span>
                        <div className="mt-1 flex items-center gap-1">
                          <MaskedData
                            data={user.email}
                            maskedData={maskEmail(user.email)}
                            targetUserId={user.id}
                            dataType="EMAIL"
                          />
                          {user.emailVerified && <CheckCircle className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ls-muted">
                        {getRoleLabel(user.role)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3 w-3 text-amber-500" />
                        <span className="font-bold text-ls-heading">{user.creditBalance}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><AdminStatusBadge status={user.status} /></TableCell>
                  <TableCell className="text-xs text-ls-muted">
                    {user.lastSeen
                      ? adminDateFormatters.distance(user.lastSeen)
                      : "Jamais connecté"}
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

                      {filters.status === "PENDING" && (
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

      <RejectUserDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        selectedUser={selectedUser}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onReject={handleReject}
        isBulk={selectedIds.length > 0}
        selectedCount={selectedIds.length}
      />
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
