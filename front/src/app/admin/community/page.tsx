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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserInfo {
  name: string;
  email: string;
}

interface ProposalEvent {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  location: string;
  proposedBy: UserInfo | null;
}

interface ProposalDeal {
  id: string;
  title: string;
  category: string;
  proposedBy: UserInfo | null;
}

interface ProposalSpot {
  id: string;
  name: string;
  address: string;
  proposedBy: UserInfo | null;
}

interface ProposalPoll {
  id: string;
  question: string;
  options: any;
  proposedBy: UserInfo | null;
}

export default function AdminCommunityPage() {
  const { data: proposals, isLoading, refetch } = trpc.community.getPendingProposals.useQuery();
  
  const reviewMutation = trpc.community.reviewProposal.useMutation({
    onSuccess: () => {
      toast.success("Action completed");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const handleAction = (type: "EVENT" | "DEAL" | "SPOT" | "POLL", id: string, action: "APPROVE" | "REJECT") => {
    reviewMutation.mutate({ type, id, action });
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Moderation</h1>
        <p className="text-muted-foreground">Manage participatory content proposed by students and mentors.</p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full max-w-[500px] grid-cols-4 mb-6">
          <TabsTrigger value="events">Events ({proposals?.events.length || 0})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({proposals?.deals.length || 0})</TabsTrigger>
          <TabsTrigger value="spots">Spots ({proposals?.spots.length || 0})</TabsTrigger>
          <TabsTrigger value="polls">Polls ({proposals?.polls.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Pending Events Hub</CardTitle>
              <CardDescription>Community events like meetups, webinars, and gatherings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date & Location</TableHead>
                    <TableHead>Proposed By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals?.events.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-50">No pending events.</TableCell></TableRow>
                  ) : (
                    (proposals?.events as ProposalEvent[]).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="font-bold">{event.title}</div>
                          <div className="text-xs text-muted-foreground max-w-[300px] truncate">{event.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs"><Calendar className="w-3 h-3" /> {format(new Date(event.date), "dd MMM yyyy HH:mm", { locale: fr })}</div>
                          <div className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3" /> {event.location}</div>
                        </TableCell>
                        <TableCell>{event.proposedBy?.name || "Unknown"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="text-ls-error" onClick={() => handleAction("EVENT", event.id, "REJECT")}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button variant="cta" size="ctaSm" onClick={() => handleAction("EVENT", event.id, "APPROVE")}>
                            <Check className="w-4 h-4" />
                          </Button>
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
          <Card>
            <CardHeader>
              <CardTitle>Pending Student Deals</CardTitle>
              <CardDescription>Discounts and good plans for students.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Proposed By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals?.deals.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-50">No pending deals.</TableCell></TableRow>
                  ) : (
                    (proposals?.deals as ProposalDeal[]).map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.title}</TableCell>
                        <TableCell><Badge variant="outline">{deal.category}</Badge></TableCell>
                        <TableCell>{deal.proposedBy?.name || "Unknown"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="text-ls-error" onClick={() => handleAction("DEAL", deal.id, "REJECT")}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-ls-blue hover:bg-ls-blue/90" onClick={() => handleAction("DEAL", deal.id, "APPROVE")}>
                            <Check className="w-4 h-4" />
                          </Button>
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
          <Card>
            <CardHeader>
              <CardTitle>Pending Study Spots</CardTitle>
              <CardDescription>New recommended places for the community.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Proposed By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals?.spots.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-50">No pending spots.</TableCell></TableRow>
                  ) : (
                    (proposals?.spots as ProposalSpot[]).map((spot) => (
                      <TableRow key={spot.id}>
                        <TableCell className="font-medium">{spot.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{spot.address}</TableCell>
                        <TableCell>{spot.proposedBy?.name || "Unknown"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="text-ls-error" onClick={() => handleAction("SPOT", spot.id, "REJECT")}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-ls-success hover:bg-ls-success/90" onClick={() => handleAction("SPOT", spot.id, "APPROVE")}>
                            <Check className="w-4 h-4" />
                          </Button>
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
          <Card>
            <CardHeader>
              <CardTitle>Pending Polls</CardTitle>
              <CardDescription>Weekly poll questions proposed by users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposals?.polls.length === 0 ? (
                  <div className="col-span-full text-center py-10 opacity-50 border rounded-lg">No pending polls.</div>
                ) : (
                  (proposals?.polls as ProposalPoll[]).map((poll) => (
                    <Card key={poll.id} className="border-ls-border">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm">{poll.question}</CardTitle>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {(poll.options as any[]).map(o => (
                            <Badge key={o.id} variant="outline" className="font-normal">{o.label}</Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-ls-error" onClick={() => handleAction("POLL", poll.id, "REJECT")}>
                          Reject
                        </Button>
                        <Button size="sm" className="bg-ls-success hover:bg-ls-success/90" onClick={() => handleAction("POLL", poll.id, "APPROVE")}>
                          Approve & Activate
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
