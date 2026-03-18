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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Check, X, Calendar, MapPin, Trash2, AlertTriangle, Search, ExternalLink, Tag, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface UserInfo {
  name: string;
  email: string;
}

type CommunityStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ProposalEvent {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  location: string;
  link?: string | null;
  status: string;
  proposedBy: UserInfo | null;
}

interface ProposalDeal {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  promoCode?: string | null;
  status: string;
  proposedBy: UserInfo | null;
}

interface ProposalSpot {
  id: string;
  name: string;
  description: string;
  address: string;
  tags: string[];
  status: string;
  proposedBy: UserInfo | null;
}

interface ProposalPoll {
  id: string;
  question: string;
  options: any;
  status: string;
  proposedBy: UserInfo | null;
}

const DEAL_CATEGORIES = ["FOOD", "SOFTWARE", "LEISURE", "SERVICES"];

function BulkActionBar({ 
  selectedCount, 
  onApprove, 
  onReject, 
  isPending 
}: { 
  selectedCount: number, 
  onApprove: () => void, 
  onReject: () => void,
  isPending: boolean
}) {
  if (selectedCount === 0) return null;
  return (
    <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-brand/5 border border-brand/20 rounded-xl animate-in fade-in slide-in-from-top-2">
      <span className="text-sm font-medium text-brand">{selectedCount} sélectionnés</span>
      <div className="h-4 w-px bg-brand/20 mx-2" />
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
        onClick={onApprove}
        disabled={isPending}
      >
        <Check className="h-4 w-4 mr-1" /> Approuver la sélection
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
        onClick={onReject}
        disabled={isPending}
      >
        <X className="h-4 w-4 mr-1" /> Rejeter la sélection
      </Button>
    </div>
  );
}

export default function AdminCommunityPage() {
  const { data: proposals, isLoading, refetch } = trpc.community.getPendingProposals.useQuery();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "EVENT" | "DEAL" | "SPOT" | "POLL", id: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<CommunityStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<string>("events");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const bulkReviewMutation = trpc.community.bulkReviewProposals.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour pour la sélection");
      setSelectedIds([]);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleSelectAll = (items: any[]) => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Creation dialog states
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isSpotDialogOpen, setIsSpotDialogOpen] = useState(false);

  // New deal form state
  const [newDeal, setNewDeal] = useState({
    title: "",
    description: "",
    category: "FOOD",
    link: "",
    promoCode: "",
  });

  const createDealMutation = trpc.community.createDeal.useMutation({
    onSuccess: () => {
      toast.success("Bon plan créé avec succès");
      setIsDealDialogOpen(false);
      setNewDeal({ title: "", description: "", category: "FOOD", link: "", promoCode: "" });
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    createDealMutation.mutate(newDeal);
  };

  const reviewMutation = trpc.community.reviewProposal.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const deleteMutation = trpc.community.deleteProposal.useMutation({
    onSuccess: () => {
      toast.success("Contenu supprimé définitivement");
      refetch();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const handleAction = (type: "EVENT" | "DEAL" | "SPOT" | "POLL", id: string, action: "APPROVE" | "REJECT") => {
    reviewMutation.mutate({ type, id, action });
  };

  const confirmDelete = (type: "EVENT" | "DEAL" | "SPOT" | "POLL", id: string) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const filteredEvents = useMemo(() => {
    let items = (proposals?.events || []) as ProposalEvent[];
    if (statusFilter !== "ALL") items = items.filter((i: ProposalEvent) => i.status === statusFilter);
    return items;
  }, [proposals?.events, statusFilter]);

  const filteredDeals = useMemo(() => {
    let items = (proposals?.deals || []) as ProposalDeal[];
    if (statusFilter !== "ALL") items = items.filter((i: ProposalDeal) => i.status === statusFilter);
    if (categoryFilter !== "ALL") items = items.filter((i: ProposalDeal) => i.category === categoryFilter);
    return items;
  }, [proposals?.deals, statusFilter, categoryFilter]);

  const filteredSpots = useMemo(() => {
    let items = (proposals?.spots || []) as ProposalSpot[];
    if (statusFilter !== "ALL") items = items.filter((i: ProposalSpot) => i.status === statusFilter);
    // Categorizing spots by tags is more complex, keeping simple status filter for now
    return items;
  }, [proposals?.spots, statusFilter]);

  const filteredPolls = useMemo(() => {
    let items = (proposals?.polls || []) as ProposalPoll[];
    if (statusFilter !== "ALL") items = items.filter((i: ProposalPoll) => i.status === statusFilter);
    return items;
  }, [proposals?.polls, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase text-[10px]">En attente</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px]">Approuvé</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 uppercase text-[10px]">Rejeté</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
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
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-ls-muted tracking-wider">Statut</span>
            <Select 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as CommunityStatus | "ALL")}
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

          {/* Category Filter (Conditional) */}
          {activeTab === "deals" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-ls-muted tracking-wider">Catégorie</span>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[140px] h-8 rounded-full border-ls-border bg-card text-xs">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes</SelectItem>
                  {DEAL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedIds([]); }} className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4 mb-6">
          <TabsTrigger value="events">Événements ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="deals">Bons Plans ({filteredDeals.length})</TabsTrigger>
          <TabsTrigger value="spots">Spots ({filteredSpots.length})</TabsTrigger>
          <TabsTrigger value="polls">Sondages ({filteredPolls.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <BulkActionBar 
            selectedCount={selectedIds.length} 
            onApprove={() => bulkReviewMutation.mutate({ type: "EVENT", ids: selectedIds, action: "APPROVE" })}
            onReject={() => bulkReviewMutation.mutate({ type: "EVENT", ids: selectedIds, action: "REJECT" })}
            isPending={bulkReviewMutation.isPending}
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
                        checked={filteredEvents.length > 0 && selectedIds.length === filteredEvents.length}
                        onCheckedChange={() => toggleSelectAll(filteredEvents)}
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
                    (filteredEvents as ProposalEvent[]).map((event) => (
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
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/5 text-brand text-xs font-medium hover:bg-brand/10 transition-colors mt-2"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> 
                              Lien de l'événement
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                          <div className="flex items-center gap-1 text-xs text-ls-muted"><Calendar className="w-3 h-3 text-brand" /> {format(new Date(event.date), "dd MMM yyyy", { locale: fr })}</div>
                          <div className="flex items-center gap-1 text-xs text-ls-muted mt-1"><MapPin className="w-3 h-3 text-brand" /> {event.location}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-ls-heading text-xs">{event.proposedBy?.name || "Anonyme"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("EVENT", event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {event.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error border-ls-error/30 h-8 p-2" onClick={() => handleAction("EVENT", event.id, "REJECT")}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="cta" className="h-8 p-2" onClick={() => handleAction("EVENT", event.id, "APPROVE")}>
                                <Check className="w-4 h-4" />
                              </Button>
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
          <BulkActionBar 
            selectedCount={selectedIds.length} 
            onApprove={() => bulkReviewMutation.mutate({ type: "DEAL", ids: selectedIds, action: "APPROVE" })}
            onReject={() => bulkReviewMutation.mutate({ type: "DEAL", ids: selectedIds, action: "REJECT" })}
            isPending={bulkReviewMutation.isPending}
          />
          <Card className="border-ls-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-ls-heading text-lg">Bons Plans</CardTitle>
                <CardDescription className="text-ls-muted text-xs">Réductions et offres partenaires.</CardDescription>
              </div>
              <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-brand hover:bg-brand/90 text-white rounded-full">
                    <Plus className="w-4 h-4 mr-1" /> Ajouter un Bon Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Nouveau Bon Plan</DialogTitle>
                    <DialogDescription>Créez un bon plan directement. Il sera automatiquement approuvé.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateDeal} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="deal-title">Titre</Label>
                      <Input id="deal-title" value={newDeal.title} onChange={(e) => setNewDeal({...newDeal, title: e.target.value})} placeholder="Ex: -20% sur les outils dev" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deal-desc">Description</Label>
                      <Textarea id="deal-desc" value={newDeal.description} onChange={(e) => setNewDeal({...newDeal, description: e.target.value})} placeholder="Détails de l'offre..." required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select value={newDeal.category} onValueChange={(v) => setNewDeal({...newDeal, category: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEAL_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deal-code">Code Promo (Optionnel)</Label>
                        <Input id="deal-code" value={newDeal.promoCode} onChange={(e) => setNewDeal({...newDeal, promoCode: e.target.value})} placeholder="CODE20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deal-link">Lien de l'offre</Label>
                      <Input id="deal-link" value={newDeal.link} onChange={(e) => setNewDeal({...newDeal, link: e.target.value})} placeholder="https://..." type="url" required />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsDealDialogOpen(false)}>Annuler</Button>
                      <Button type="submit" className="bg-brand text-white" disabled={createDealMutation.isPending}>
                        {createDealMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Créer le Bon Plan
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={filteredDeals.length > 0 && selectedIds.length === filteredDeals.length}
                        onCheckedChange={() => toggleSelectAll(filteredDeals)}
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
                    (filteredDeals as ProposalDeal[]).map((deal) => (
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
                          <a 
                            href={deal.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/5 text-brand text-xs font-medium hover:bg-brand/10 transition-colors mt-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> 
                            Voir l'offre
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-ls-blue border-ls-blue/20 text-[10px] uppercase font-bold">{deal.category}</Badge>
                          {deal.promoCode && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-emerald-500" />
                              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 uppercase font-bold">
                                {deal.promoCode}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(deal.status)}</TableCell>
                        <TableCell className="text-ls-heading text-xs">{deal.proposedBy?.name || "Anonyme"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("DEAL", deal.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {deal.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error border-ls-error/30 h-8 p-2" onClick={() => handleAction("DEAL", deal.id, "REJECT")}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="cta" className="h-8 p-2" onClick={() => handleAction("DEAL", deal.id, "APPROVE")}>
                                <Check className="w-4 h-4" />
                              </Button>
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
          <BulkActionBar 
            selectedCount={selectedIds.length} 
            onApprove={() => bulkReviewMutation.mutate({ type: "SPOT", ids: selectedIds, action: "APPROVE" })}
            onReject={() => bulkReviewMutation.mutate({ type: "SPOT", ids: selectedIds, action: "REJECT" })}
            isPending={bulkReviewMutation.isPending}
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
                        checked={filteredSpots.length > 0 && selectedIds.length === filteredSpots.length}
                        onCheckedChange={() => toggleSelectAll(filteredSpots)}
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
                    (filteredSpots as ProposalSpot[]).map((spot) => (
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
                            {spot.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-slate-100 text-ls-muted font-normal border-0 uppercase">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(spot.status)}</TableCell>
                        <TableCell className="text-ls-heading text-xs">{spot.proposedBy?.name || "Anonyme"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("SPOT", spot.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {spot.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error border-ls-error/30 h-8 p-2" onClick={() => handleAction("SPOT", spot.id, "REJECT")}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="cta" className="h-8 p-2" onClick={() => handleAction("SPOT", spot.id, "APPROVE")}>
                                <Check className="w-4 h-4" />
                              </Button>
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
                  (filteredPolls as ProposalPoll[]).map((poll) => (
                    <Card key={poll.id} className="border-ls-border bg-card/50">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-sm text-ls-heading leading-tight pr-4">{poll.question}</CardTitle>
                          {getStatusBadge(poll.status)}
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
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 p-2" onClick={() => confirmDelete("POLL", poll.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {poll.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="text-ls-error h-8 px-2 text-[10px]" onClick={() => handleAction("POLL", poll.id, "REJECT")}>
                                Rejeter
                              </Button>
                              <Button size="sm" variant="cta" className="h-8 px-2 text-[10px]" onClick={() => handleAction("POLL", poll.id, "APPROVE")}>
                                Approuver
                              </Button>
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

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-2xl border-ls-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ls-muted pt-2">
              Es-tu sûr de vouloir supprimer ce contenu définitivement ? Cette action est irréversible et retirera le contenu de la plateforme pour tous les utilisateurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4 mt-4">
            <AlertDialogCancel className={cn(buttonVariants({ variant: "ctaOutline" }), "mt-0")}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete}
              className={buttonVariants({ variant: "ctaDestructive" })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
