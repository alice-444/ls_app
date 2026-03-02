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
import { Loader2, CheckCircle, Trash2, AlertTriangle, User, Star } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, Suspense } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

function AdminFeedbackModerationContent() {
  const searchParams = useSearchParams();
  const feedbackIdParam = searchParams.get("feedbackId");

  const { data: moderationQueue, isLoading, refetch } = trpc.workshopFeedback.getModerationQueue.useQuery();
  const dismissReportMutation = trpc.workshopFeedback.dismissReport.useMutation();
  const deleteFeedbackMutation = trpc.workshopFeedback.deleteFeedback.useMutation();
  const warnUserMutation = trpc.workshopFeedback.warnUser.useMutation();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"DELETE" | "WARN" | "DISMISS" | null>(null);

  useEffect(() => {
    if (feedbackIdParam && moderationQueue?.feedbacks) {
      const feedback = moderationQueue.feedbacks.find((f: any) => f.id === feedbackIdParam);
      if (feedback) {
        // For moderation, we don't have a "view" dialog, just confirmation actions.
        // We could maybe highlight the row or scroll to it.
        // For now, let's just keep it simple.
        setSelectedFeedback(feedback);
      }
    }
  }, [feedbackIdParam, moderationQueue]);

  const handleAction = (feedback: any, type: "DELETE" | "WARN" | "DISMISS") => {
    setSelectedFeedback(feedback);
    setActionType(type);
    setIsConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedFeedback || !actionType) return;
    
    try {
      if (actionType === "DISMISS") {
        await dismissReportMutation.mutateAsync({ feedbackId: selectedFeedback.id });
        toast.success("Signalement ignoré.");
      } else if (actionType === "DELETE") {
        await deleteFeedbackMutation.mutateAsync({ feedbackId: selectedFeedback.id });
        toast.success("Avis supprimé.");
      } else if (actionType === "WARN") {
        await warnUserMutation.mutateAsync({ feedbackId: selectedFeedback.id });
        toast.success("Utilisateur averti.");
      }
      
      refetch();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      toast.error("Une erreur est survenue.");
      console.error(error);
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const feedbacks = moderationQueue?.feedbacks || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modération des Avis</h1>
        <p className="text-muted-foreground">Gérer les avis signalés par la communauté.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atelier / Mentor</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Avis</TableHead>
              <TableHead>Raison du signalement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun avis en attente de modération.
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback: any) => (
                <TableRow key={feedback.id} className={feedback.id === feedbackIdParam ? "bg-primary/5" : ""}>
                  <TableCell>
                    <div className="font-medium">{feedback.workshopTitle || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">Mentor: {feedback.mentorName || "N/A"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{feedback.publicName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    {renderRating(feedback.rating)}
                    <p className="mt-1 text-sm italic">"{feedback.comment || "Pas de commentaire"}"</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      {feedback.reportReason || "Signalé"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(feedback, "DISMISS")}
                      title="Ignorer le signalement"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(feedback, "WARN")}
                      title="Avertir l'auteur"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(feedback, "DELETE")}
                      title="Supprimer l'avis"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "DELETE" && "Supprimer cet avis ?"}
              {actionType === "WARN" && "Avertir l'utilisateur ?"}
              {actionType === "DISMISS" && "Ignorer le signalement ?"}
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible.
              {actionType === "WARN" && " Un message sera envoyé à l'utilisateur pour lui notifier un manquement aux règles de la communauté."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Annuler</Button>
            <Button 
              variant={actionType === "DELETE" ? "destructive" : "default"} 
              onClick={confirmAction}
              className={actionType === "DISMISS" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminFeedbackModerationPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AdminFeedbackModerationContent />
    </Suspense>
  );
}
