"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Flag, ThumbsUp, ThumbsDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { renderStars } from "@/lib/rating-utils";
import { API_BASE_URL } from "@/lib/api-client";
import { ReportFeedbackDialog } from "@/components/workshop/ReportFeedbackDialog";
import { authClient } from "@/lib/auth-client";

type WorkshopReviewsProps = Readonly<{
  workshopId: string;
  creatorUserId?: string;
}>;

export function WorkshopReviews({
  workshopId,
  creatorUserId,
}: WorkshopReviewsProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );
  const { data: session } = authClient.useSession();
  const isMentorOwner = session?.user?.id === creatorUserId;

  const { data: feedbackData, isLoading } =
    trpc.workshopFeedback.getFeedbackByWorkshop.useQuery(
      { workshopId },
      {
        enabled: !!workshopId,
      }
    );

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
            <Star className="h-5 w-5" />
            Avis des participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedbackData?.feedbacks?.length) {
    return (
      <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
            <Star className="h-5 w-5" />
            Avis des participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Aucun avis pour le moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
          <Star className="h-5 w-5" />
          Avis des participants
          <span className="text-base font-normal text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            ({feedbackData?.feedbacks?.length || 0})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbackData.feedbacks.map(
            (feedback: {
              id: string;
              rating: number;
              comment: string | null;
              isAnonymous: boolean;
              createdAt: Date | string;
              apprentice: {
                id: string | null;
                name: string;
                image: string | null;
              };
            }) => {
              let avatarUrl: string | null = null;
              if (feedback.apprentice.image) {
                const img = feedback.apprentice.image;
                avatarUrl = img.startsWith("http")
                  ? img
                  : `${API_BASE_URL}${img}`;
              }
              const displayName = feedback.apprentice.name;
              const firstName = displayName.split(" ")[0];
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

              let ratingClassName: string;
              if (feedback.rating >= 4) {
                ratingClassName =
                  "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800";
              } else if (feedback.rating <= 2) {
                ratingClassName =
                  "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800";
              } else {
                ratingClassName =
                  "bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800";
              }

              let ratingIcon: ReactNode = null;
              if (feedback.rating >= 4) {
                ratingIcon = <ThumbsUp className="h-4 w-4 text-green-600" />;
              } else if (feedback.rating <= 2) {
                ratingIcon = <ThumbsDown className="h-4 w-4 text-red-600" />;
              }

              return (
                <div
                  key={feedback.id}
                  className={`p-4 rounded-lg border ${ratingClassName}`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {ratingIcon}
                        <div className="flex items-center">
                          {renderStars(feedback.rating, "md")}
                        </div>
                        <span className="text-sm font-medium">{firstName}</span>
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
      </CardContent>

      {selectedFeedbackId && (
        <ReportFeedbackDialog
          open={reportDialogOpen}
          onOpenChange={(open) => {
            setReportDialogOpen(open);
            if (!open) {
              setSelectedFeedbackId(null);
            }
          }}
          feedbackId={selectedFeedbackId}
          onSuccess={() => { }}
        />
      )}
    </Card>
  );
}
