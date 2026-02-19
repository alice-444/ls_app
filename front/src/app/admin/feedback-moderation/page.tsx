"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { renderStars } from "@/lib/rating-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function FeedbackModerationPage() {
  const router = useRouter();
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [actionType, setActionType] = useState<
    "dismiss" | "delete" | "warn" | null
  >(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  const utils = trpc.useUtils();
  const { data, isLoading, refetch } =
    trpc.workshopFeedback.getModerationQueue.useQuery(
      {
        limit,
        offset: page * limit,
      },
      {
        enabled: true,
      }
    );

  const dismissMutation = trpc.workshopFeedback.dismissReport.useMutation({
    onSuccess: () => {
      toast.success("Signalement rejeté. L'avis reste actif.");
      setSelectedFeedback(null);
      setActionType(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const deleteMutation = trpc.workshopFeedback.deleteFeedback.useMutation({
    onSuccess: () => {
      toast.success("Avis supprimé avec succès");
      setSelectedFeedback(null);
      setActionType(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const warnMutation = trpc.workshopFeedback.warnUser.useMutation({
    onSuccess: () => {
      toast.success("Email d'avertissement envoyé à l'utilisateur");
      setSelectedFeedback(null);
      setActionType(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const handleAction = () => {
    if (!selectedFeedback) return;

    if (actionType === "dismiss") {
      dismissMutation.mutate({ feedbackId: selectedFeedback.id });
    } else if (actionType === "delete") {
      deleteMutation.mutate({ feedbackId: selectedFeedback.id });
    } else if (actionType === "warn") {
      warnMutation.mutate({ feedbackId: selectedFeedback.id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const feedbacks = data?.feedbacks || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Modération des avis
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les avis signalés par les mentors
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium">Aucun avis en attente</p>
              <p className="text-muted-foreground mt-2">
                Tous les avis signalés ont été traités.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <Badge variant="secondary">
                {total} avis en attente de modération
              </Badge>
            </div>

            <div className="space-y-4">
              {feedbacks.map((feedback: any) => (
                <Card key={feedback.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              {renderStars(feedback.rating, "md")}
                            </div>
                            <Badge variant="destructive">En modération</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(feedback.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>

                        {feedback.comment && (
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                            <p className="text-sm">{feedback.comment}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Mentor</p>
                            <p className="font-medium">{feedback.mentorName}</p>
                          </div>
                          {feedback.workshopTitle && (
                            <div>
                              <p className="text-muted-foreground">Atelier</p>
                              <p className="font-medium">
                                {feedback.workshopTitle}
                              </p>
                            </div>
                          )}
                        </div>

                        {feedback.reportReason && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-sm font-medium mb-1">
                              Raison du signalement :
                            </p>
                            <p className="text-sm">{feedback.reportReason}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 border-l pl-6">
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Identité de l'auteur
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                Nom public :
                              </p>
                              <p className="font-medium">
                                {feedback.publicName}
                              </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded p-2">
                              <p className="text-muted-foreground text-xs mb-1">
                                Nom réel (Admin uniquement) :
                              </p>
                              <p className="font-bold text-blue-700 dark:text-blue-300">
                                {feedback.realName || "Non disponible"}
                              </p>
                            </div>
                            {feedback.realEmail && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Email :
                                </p>
                                <p className="font-medium text-sm">
                                  {feedback.realEmail}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setActionType("dismiss");
                            }}
                            disabled={
                              dismissMutation.isPending ||
                              deleteMutation.isPending ||
                              warnMutation.isPending
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Rejeter le signalement
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setActionType("delete");
                            }}
                            disabled={
                              dismissMutation.isPending ||
                              deleteMutation.isPending ||
                              warnMutation.isPending
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Supprimer l'avis
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setActionType("warn");
                            }}
                            disabled={
                              dismissMutation.isPending ||
                              deleteMutation.isPending ||
                              warnMutation.isPending
                            }
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Avertir l'utilisateur
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-4">
                  Page {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}

        <AlertDialog
          open={actionType !== null && selectedFeedback !== null}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setActionType(null);
              setSelectedFeedback(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "dismiss" && "Rejeter le signalement"}
                {actionType === "delete" && "Supprimer l'avis"}
                {actionType === "warn" && "Avertir l'utilisateur"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === "dismiss" &&
                  "Le signalement sera rejeté et l'avis restera actif. L'anonymat sera préservé."}
                {actionType === "delete" &&
                  "L'avis sera définitivement supprimé du profil du mentor. Cette action est irréversible."}
                {actionType === "warn" &&
                  "Un email d'avertissement formel sera envoyé à l'auteur de l'avis."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAction}
                className={
                  actionType === "delete" ? "bg-red-600 hover:bg-red-700" : ""
                }
                disabled={
                  dismissMutation.isPending ||
                  deleteMutation.isPending ||
                  warnMutation.isPending
                }
              >
                {dismissMutation.isPending ||
                deleteMutation.isPending ||
                warnMutation.isPending
                  ? "Traitement..."
                  : "Confirmer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
