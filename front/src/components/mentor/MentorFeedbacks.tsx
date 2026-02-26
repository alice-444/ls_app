"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Filter, X, ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { renderStars } from "@/lib/rating-utils";
import { API_BASE_URL } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { ReportFeedbackDialog } from "@/components/workshop/ReportFeedbackDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MentorFeedbacksProps {
  mentorId: string;
  workshops?: Array<{ id: string; title: string }>;
  mentorUserId?: string;
}

export function MentorFeedbacks({
  mentorId,
  workshops = [],
  mentorUserId,
}: MentorFeedbacksProps) {
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>("all");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );
  const { data: session } = authClient.useSession();
  const isMentorOwner = session?.user?.id === mentorUserId;

  const { data: workshopsData } = trpc.mentor.getPublicWorkshops.useQuery(
    { mentorId },
    {
      enabled: !!mentorId,
    }
  );

  const availableWorkshops = useMemo(() => {
    if (workshops.length > 0) return workshops;
    if (!workshopsData) return [];
    const allWorkshops = [
      ...(workshopsData.upcoming || []),
      ...(workshopsData.past || []),
    ];
    return allWorkshops.map((w: { id: string; title: string }) => ({ id: w.id, title: w.title }));
  }, [workshops, workshopsData]);

  const {
    data: feedbackData,
    isLoading,
    error,
  } = trpc.mentor.getFeedbacks.useQuery(
    {
      mentorId,
      workshopId: selectedWorkshopId !== "all" ? selectedWorkshopId : undefined,
    },
    {
      enabled: !!mentorId,
    }
  );

  const hasActiveFilters = selectedWorkshopId !== "all";

  const clearFilters = () => {
    setSelectedWorkshopId("all");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commentaires et notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commentaires et notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Erreur lors du chargement des commentaires.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedbackData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commentaires et notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Aucun commentaire disponible pour le moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { feedbacks, aggregate } = feedbackData;
  const hasFeedbacks = feedbacks.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Commentaires et notes
          {hasFeedbacks && (
            <span className="text-base font-normal text-muted-foreground">
              ({feedbacks.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasFeedbacks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">
                  {aggregate.averageRating.toFixed(1)}
                </span>
                <div className="flex items-center">
                  {renderStars(aggregate.averageRating, "md")}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Basé sur {aggregate.totalCount} évaluation
                {aggregate.totalCount > 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Distribution des notes</p>
              <div className="space-y-1">
                {aggregate.ratingDistribution
                  .slice()
                  .reverse()
                  .map((dist: { star: number; count: number }) => (
                    <div key={dist.star} className="flex items-center gap-2">
                      <span className="text-sm w-12">{dist.star} étoiles</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              aggregate.totalCount > 0
                                ? (dist.count / aggregate.totalCount) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm w-8 text-right">
                        {dist.count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Aucune évaluation pour le moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Les commentaires apparaîtront ici une fois que des apprenants
              auront laissé des avis.
            </p>
          </div>
        )}

        {hasFeedbacks && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtres</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
              )}
            </div>
            {availableWorkshops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Filtrer par atelier
                  </label>
                  <Select
                    value={selectedWorkshopId}
                    onValueChange={setSelectedWorkshopId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les ateliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les ateliers</SelectItem>
                      {availableWorkshops.map((workshop) => (
                        <SelectItem key={workshop.id} value={workshop.id}>
                          {workshop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun atelier disponible pour le filtrage pour le moment.
              </p>
            )}
          </div>
        )}

        {hasFeedbacks && (
          <div className="border-t pt-4">
            {feedbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun commentaire ne correspond aux filtres sélectionnés.
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map(
                  (feedback: {
                    id: string;
                    rating: number;
                    comment: string | null;
                    isAnonymous: boolean;
                    createdAt: Date | string;
                    apprentice: {
                      id: string | null;
                      name: string;
                      firstName?: string;
                      image?: string | null;
                    };
                  }) => {
                    const avatarUrl = feedback.apprentice.image
                      ? feedback.apprentice.image.startsWith("http")
                        ? feedback.apprentice.image
                        : `${API_BASE_URL}${feedback.apprentice.image}`
                      : null;
                    const displayName =
                      feedback.apprentice.firstName || feedback.apprentice.name;
                    const initials = displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    const relativeDate = formatDistanceToNow(
                      new Date(feedback.createdAt),
                      {
                        addSuffix: true,
                        locale: fr,
                      }
                    );

                    return (
                      <div
                        key={feedback.id}
                        className={`p-4 rounded-lg border ${
                          feedback.rating >= 4
                            ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                            : feedback.rating <= 2
                            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                            : "bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
                              {initials}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {feedback.rating >= 4 ? (
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                              ) : feedback.rating <= 2 ? (
                                <ThumbsDown className="h-4 w-4 text-red-600" />
                              ) : null}
                              <div className="flex items-center">
                                {renderStars(feedback.rating, "md")}
                              </div>
                              <span className="text-sm font-medium">
                                {displayName}
                              </span>
                            </div>
                            {feedback.comment && (
                              <p className="text-sm text-foreground">
                                {feedback.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {relativeDate}
                            </span>
                            {isMentorOwner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFeedbackId(feedback.id);
                                  setReportDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="Signaler cet avis"
                              >
                                <Flag className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {selectedFeedbackId && (
        <ReportFeedbackDialog
          open={reportDialogOpen}
          onOpenChange={(open: boolean) => {
            setReportDialogOpen(open);
            if (!open) {
              setSelectedFeedbackId(null);
            }
          }}
          feedbackId={selectedFeedbackId}
          onSuccess={() => {
          }}
        />
      )}
    </Card>
  );
}
