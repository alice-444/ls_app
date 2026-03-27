"use client";

import { trpc } from "@/utils/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Check, X, Calendar, MapPin, Trash2, AlertTriangle, Search, ExternalLink, Tag } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { adminDateFormatters } from "@/lib/admin/admin-utils";
import { useBatchSelection } from "@/hooks/admin/use-batch-selection";
import { CreateDealDialog } from "@/components/admin/modals/CreateDealDialog";
import { AdminBulkActions } from "@/components/admin/AdminBulkActions";
import { ADMIN_COMMUNITY_CATEGORIES } from "@/lib/admin/admin-labels";
import {
  CommunityProposal,
  CommunityEvent,
  CommunityDeal,
  CommunitySpot,
  CommunityPoll,
  CommunityStatus
} from "@ls-app/shared";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";

type CommunityProposalKind = "EVENT" | "DEAL" | "SPOT" | "POLL";
type CommunityReviewAction = "APPROVE" | "REJECT";
type CommunityStatusFilter = CommunityStatus | "ALL";
type CommunityItemToDelete = { type: CommunityProposalKind; id: string };

const DEAL_CATEGORIES = Object.keys(ADMIN_COMMUNITY_CATEGORIES);

export default function AdminCommunityPage() {
  const { filters, setFilter } = useAdminFilters({
    tab: "events",
    status: "ALL",
    category: "ALL"
  });

  const { data: proposals, isLoading, refetch } = trpc.community.getPendingProposals.useQuery();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CommunityItemToDelete | null>(null);

  // Filtered lists
  const filteredEvents = useMemo(() => {
    let items = (proposals?.events || []) as CommunityEvent[];
    if (filters.status !== "ALL") items = items.filter((i) => i.status === filters.status);
    return items;
  }, [proposals?.events, filters.status]);

  const filteredDeals = useMemo(() => {
    let items = (proposals?.deals || []) as CommunityDeal[];
    if (filters.status !== "ALL") items = items.filter((i) => i.status === filters.status);
    if (filters.category !== "ALL") items = items.filter((i) => i.category === filters.category);
    return items;
  }, [proposals?.deals, filters.status, filters.category]);

  const filteredSpots = useMemo(() => {
    let items = (proposals?.spots || []) as CommunitySpot[];
    if (filters.status !== "ALL") items = items.filter((i) => i.status === filters.status);
    return items;
  }, [proposals?.spots, filters.status]);

  const filteredPolls = useMemo(() => {
    let items = (proposals?.polls || []) as CommunityPoll[];
    if (filters.status !== "ALL") items = items.filter((i) => i.status === filters.status);
    return items;
  }, [proposals?.polls, filters.status]);

  // Selections - Typed as an array of CommunityProposal (base union) to satisfy useBatchSelection
  const currentTabItems = useMemo((): CommunityProposal[] => {
    if (filters.tab === "events") return filteredEvents;
    if (filters.tab === "deals") return filteredDeals;
    if (filters.tab === "spots") return filteredSpots;
    if (filters.tab === "polls") return filteredPolls;
    return [];
  }, [filters.tab, filteredEvents, filteredDeals, filteredSpots, filteredPolls]);

  const { selectedIds, toggleSelect, toggleSelectAll, isAllSelected, resetSelection } = useBatchSelection(currentTabItems);

  // Reset selection when tab or filters change
  useEffect(() => {
    resetSelection();
  }, [filters.tab, filters.status, filters.category, resetSelection]);

  // Mutations
  const bulkReviewMutation = trpc.community.bulkReviewProposals.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour pour la sélection");
      resetSelection();
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const reviewMutation = trpc.community.reviewProposal.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = trpc.community.deleteProposal.useMutation({
    onSuccess: () => {
      toast.success("Contenu supprimé définitivement");
      refetch();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (err: any) => toast.error(err.message)
  });

  const createDealMutation = trpc.community.createDeal.useMutation({
    onSuccess: () => toast.success("Bon plan créé avec succès"),
    onError: (err: any) => toast.error(err.message),
  });

  const handleAction = (type: CommunityProposalKind, id: string, action: CommunityReviewAction) => {
    reviewMutation.mutate({ type, id, action });
  };

  const confirmDelete = (type: CommunityProposalKind, id: string) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (itemToDelete) deleteMutation.mutate(itemToDelete);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>
        <div className="flex gap-2 border-b pb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
        <AdminTableSkeleton columnCount={5} rowCount={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ls-heading">Modération Communauté</h1>
          <p className="text-ls-muted text-sm">Gérer les contenus proposés par la communauté.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-ls-muted tracking-wider">Statut</span>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilter("status", v)}
            >

              <SelectTrigger className="w-[140px] h-8 rounded-full border-ls-border bg-card text-xs">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="APPROVED">Approuvés</SelectItem>
                <SelectItem value="REJECTED">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.tab === "deals" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-ls-muted tracking-wider">Catégorie</span>
              <Select
                value={filters.category}
                onValueChange={(v) => setFilter("category", v)}
              >

                <SelectTrigger className="w-[140px] h-8 rounded-full border-ls-border bg-card text-xs">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes</SelectItem>
                  {DEAL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{ADMIN_COMMUNITY_CATEGORIES[cat] || cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Tabs value={filters.tab} onValueChange={(v) => setFilter("tab", v)} className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4 mb-6">
          <TabsTrigger value="events">Événements ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="deals">Bons Plans ({filteredDeals.length})</TabsTrigger>
          <TabsTrigger value="spots">Spots ({filteredSpots.length})</TabsTrigger>
          <TabsTrigger value="polls">Sondages ({filteredPolls.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <AdminBulkActions
            selectedCount={selectedIds.length}
            actions={[
              {
                label: "Approuver la sélection",
                icon: <Check className="h-4 w-4" />,
                onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "APPROVE" }),
                className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                disabled: bulkReviewMutation.isPending
              },
              {
                label: "Rejeter la sélection",
                icon: <X className="h-4 w-4" />,
                onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "REJECT" }),
                className: "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
                disabled: bulkReviewMutation.isPending
              }
            ]}
          />

          <Card className="border-ls-border">
            <CardHeader>
              <CardTitle className="text-ls-heading text-lg">Events Hub</CardTitle>
              <CardDescription className="text-ls-muted text-xs">Meetups et rassemblements communautaires.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-ls-heading">Événement</TableHead>
                    <TableHead className="text-ls-heading">Date & Lieu</TableHead>
                    <TableHead className="text-ls-heading">Statut</TableHead>
                    <TableHead className="text-ls-heading">Proposé par</TableHead>
                    <TableHead className="text-right text-ls-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-ls-muted"><Search className="w-8 h-8 mx-auto mb-2 opacity-20" /> Aucun événement trouvé.</TableCell></TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow
                        key={event.id}
                        className={cn(selectedIds.includes(event.id) && "bg-brand/5")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(event.id)}
                            onCheckedChange={() => toggleSelect(event.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-ls-heading">{event.title}</div>
                          <div className="text-xs text-ls-muted max-w-[300px] whitespace-pre-wrap mt-1">{event.description}</div>
                          {event.link && (
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/5 text-brand text-xs font-medium hover:bg-brand/10 transition-colors mt-2">
                              <ExternalLink className="w-3.5 h-3.5" /> Lien de l'événement
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                          <div className="flex items-center gap-1 text-xs text-ls-muted"><Calendar className="w-3 h-3 text-brand" /> {adminDateFormatters.short(event.date)}</div>
                          <div className="flex items-center gap-1 text-xs text-ls-muted mt-1"><MapPin className="w-3 h-3 text-brand" /> {event.location}</div>
                        </TableCell>
                        <TableCell><AdminStatusBadge status={event.status} /></TableCell>
                        <TableCell className="text-ls-heading text-xs">{event.proposedBy?.name || "Anonyme"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("EVENT", event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {event.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error border-ls-error/30 h-8 p-2" onClick={() => handleAction("EVENT", event.id, "REJECT")}><X className="w-4 h-4" /></Button>
                              <Button size="sm" variant="cta" className="h-8 p-2" onClick={() => handleAction("EVENT", event.id, "APPROVE")}><Check className="w-4 h-4" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <AdminBulkActions
            selectedCount={selectedIds.length}
            actions={[
              {
                label: "Approuver la sélection",
                icon: <Check className="h-4 w-4" />,
                onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "APPROVE" }),
                className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                disabled: bulkReviewMutation.isPending
              },
              {
                label: "Rejeter la sélection",
                icon: <X className="h-4 w-4" />,
                onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "REJECT" }),
                className: "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
                disabled: bulkReviewMutation.isPending
              }
            ]}
          />
          <Card className="border-ls-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-ls-heading text-lg">Bons Plans</CardTitle>
                <CardDescription className="text-ls-muted text-xs">Réductions et offres partenaires.</CardDescription>
              </div>
              <CreateDealDialog
                onCreated={refetch}
                createDealMutation={createDealMutation}
                categories={DEAL_CATEGORIES}
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-ls-heading">Bon Plan</TableHead>
                    <TableHead className="text-ls-heading">Catégorie & Code</TableHead>
                    <TableHead className="text-ls-heading">Statut</TableHead>
                    <TableHead className="text-ls-heading">Proposé par</TableHead>
                    <TableHead className="text-right text-ls-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-ls-muted"><Search className="w-8 h-8 mx-auto mb-2 opacity-20" /> Aucun bon plan trouvé.</TableCell></TableRow>
                  ) : (
                    filteredDeals.map((deal) => (
                      <TableRow
                        key={deal.id}
                        className={cn(selectedIds.includes(deal.id) && "bg-brand/5")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(deal.id)}
                            onCheckedChange={() => toggleSelect(deal.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-ls-heading">{deal.title}</div>
                          <div className="text-xs text-ls-muted max-w-[300px] whitespace-pre-wrap mt-1">{deal.description}</div>
                          <a href={deal.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/5 text-brand text-xs font-medium hover:bg-brand/10 transition-colors mt-2">
                            <ExternalLink className="w-3.5 h-3.5" /> Voir l'offre
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-ls-blue border-ls-blue/20 text-[10px] uppercase font-bold">{ADMIN_COMMUNITY_CATEGORIES[deal.category] || deal.category}</Badge>
                          {deal.promoCode && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-emerald-500" />
                              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 uppercase font-bold">{deal.promoCode}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell><AdminStatusBadge status={deal.status} /></TableCell>
                        <TableCell className="text-ls-heading text-xs">{deal.proposedBy?.name || "Anonyme"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("DEAL", deal.id)}><Trash2 className="w-4 h-4" /></Button>
                          {deal.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error border-ls-error/30 h-8 p-2" onClick={() => handleAction("DEAL", deal.id, "REJECT")}><X className="w-4 h-4" /></Button>
                              <Button size="sm" variant="cta" className="h-8 p-2" onClick={() => handleAction("DEAL", deal.id, "APPROVE")}><Check className="w-4 h-4" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spots">
          <AdminBulkActions
            selectedCount={selectedIds.length}
            actions={[
              {
                label: "Approuver la sélection",
                icon: <Check className="h-4 w-4" />,
                onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "APPROVE" }),
                className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                disabled: bulkReviewMutation.isPending
              },
              {
                label: "Rejeter la sélection",
                icon: <X className="h-4 w-4" />,
                onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "REJECT" }),
                className: "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
                disabled: bulkReviewMutation.isPending
              }
            ]}
          />
          <Card className="border-ls-border">
            <CardHeader>
              <CardTitle className="text-ls-heading text-lg">Study Spots</CardTitle>
              <CardDescription className="text-ls-muted text-xs">Lieux de travail recommandés.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-ls-heading">Lieu</TableHead>
                    <TableHead className="text-ls-heading">Tags</TableHead>
                    <TableHead className="text-ls-heading">Statut</TableHead>
                    <TableHead className="text-ls-heading">Proposé par</TableHead>
                    <TableHead className="text-right text-ls-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpots.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-ls-muted"><Search className="w-8 h-8 mx-auto mb-2 opacity-20" /> Aucun lieu trouvé.</TableCell></TableRow>
                  ) : (
                    filteredSpots.map((spot) => (
                      <TableRow
                        key={spot.id}
                        className={cn(selectedIds.includes(spot.id) && "bg-brand/5")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(spot.id)}
                            onCheckedChange={() => toggleSelect(spot.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-ls-heading">{spot.name}</div>
                          <div className="text-[10px] text-ls-muted max-w-[200px] flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5" /> {spot.address}</div>
                          <div className="text-xs text-ls-muted max-w-[300px] mt-2 italic">{spot.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {spot.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-slate-100 text-ls-muted font-normal border-0 uppercase">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell><AdminStatusBadge status={spot.status} /></TableCell>
                        <TableCell className="text-ls-heading text-xs">{spot.proposedBy?.name || "Anonyme"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("SPOT", spot.id)}><Trash2 className="w-4 h-4" /></Button>
                          {spot.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error border-ls-error/30 h-8 p-2" onClick={() => handleAction("SPOT", spot.id, "REJECT")}><X className="w-4 h-4" /></Button>
                              <Button size="sm" variant="cta" className="h-8 p-2" onClick={() => handleAction("SPOT", spot.id, "APPROVE")}><Check className="w-4 h-4" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls">
          <div className="flex items-center justify-between mb-4">
            <AdminBulkActions
              selectedCount={selectedIds.length}
              actions={[
                {
                  label: "Approuver la sélection",
                  icon: <Check className="h-4 w-4" />,
                  onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "APPROVE" }),
                  className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                  disabled: bulkReviewMutation.isPending
                },
                {
                  label: "Rejeter la sélection",
                  icon: <X className="h-4 w-4" />,
                  onClick: () => bulkReviewMutation.mutate({ type: filters.tab.toUpperCase() as any, ids: selectedIds, action: "REJECT" }),
                  className: "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
                  disabled: bulkReviewMutation.isPending
                }
              ]}
              className="mb-0"
            />
            {filteredPolls.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto rounded-full text-[10px] h-7 uppercase font-bold tracking-wider"
                onClick={toggleSelectAll}
              >
                {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
              </Button>
            )}
          </div>
          <Card className="border-ls-border">
            <CardHeader>
              <CardTitle className="text-ls-heading text-lg">Sondages</CardTitle>
              <CardDescription className="text-ls-muted text-xs">Questions pour la communauté.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPolls.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-ls-muted border border-dashed rounded-2xl"><Search className="w-8 h-8 mx-auto mb-2 opacity-20" /> Aucun sondage trouvé.</div>
                ) : (
                  filteredPolls.map((poll) => (
                    <Card key={poll.id} className={cn("border-ls-border transition-all duration-200", selectedIds.includes(poll.id) ? "bg-brand/5 border-brand/30 shadow-md" : "bg-card/50")}>
                      <CardHeader className="p-4 relative">
                        <div className="absolute top-4 right-4 z-10">
                          <Checkbox checked={selectedIds.includes(poll.id)} onCheckedChange={() => toggleSelect(poll.id)} />
                        </div>
                        <div className="flex justify-between items-start mb-2 pr-8">
                          <CardTitle className="text-sm text-ls-heading leading-tight pr-2">{poll.question}</CardTitle>
                          <AdminStatusBadge status={poll.status} />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {(poll.options as any[]).map(o => (
                            <Badge key={o.id} variant="outline" className="font-normal text-ls-muted text-[10px]">{o.label}</Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-between items-center gap-2">
                        <span className="text-[10px] text-ls-muted italic">Par {poll.proposedBy?.name || "Anonyme"}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("POLL", poll.id)}><Trash2 className="w-4 h-4" /></Button>
                          {poll.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error h-8 px-2 text-[10px]" onClick={() => handleAction("POLL", poll.id, "REJECT")}>Rejeter</Button>
                              <Button size="sm" variant="cta" className="h-8 px-2 text-[10px]" onClick={() => handleAction("POLL", poll.id, "APPROVE")}>Approuver</Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-2xl border-ls-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600"><AlertTriangle className="h-5 w-5" /> Confirmation de suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-ls-muted pt-2">Es-tu sûr de vouloir supprimer ce contenu définitivement ? Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4 mt-4">
            <AlertDialogCancel className={cn(buttonVariants({ variant: "ctaOutline" }), "mt-0")}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className={buttonVariants({ variant: "ctaDestructive" })} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
