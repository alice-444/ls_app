"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Users, User, ArrowRight } from "lucide-react";

interface WorkshopParticipantsCardProps {
  readonly workshop: {
    readonly status: string;
    readonly apprenticeId?: string | null;
    readonly apprentice?: {
      readonly user?: {
        readonly id?: string;
        readonly name?: string | null;
      } | null;
    } | null;
    readonly maxParticipants?: number | null;
  };
  readonly onViewApprenticeProfile: (userId: string) => void;
}

export function WorkshopParticipantsCard({
  workshop,
  onViewApprenticeProfile,
}: Readonly<WorkshopParticipantsCardProps>) {
  const participantCount =
    workshop.status === "PUBLISHED" && workshop.apprenticeId ? 1 : 0;

  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
          <Users className="w-5 h-5" />
          Participants inscrits
        </CardTitle>
        <CardDescription className="text-ls-muted">
          {participantCount} / {workshop.maxParticipants || "∞"} participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        {workshop.status === "PUBLISHED" &&
          workshop.apprenticeId &&
          workshop.apprentice ? (
          <div className="space-y-2">
            <button
              type="button"
              className="w-fit max-w-full cursor-pointer hover:shadow-md transition-all bg-card/80 border border-border rounded-xl px-2.5 py-2 text-left focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 hover:border-brand"
              onClick={() => {
                if (workshop.apprentice?.user?.id) {
                  onViewApprenticeProfile(workshop.apprentice.user.id);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (workshop.apprentice?.user?.id) {
                    onViewApprenticeProfile(workshop.apprentice.user.id);
                  }
                }
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-ls-heading hover:underline whitespace-nowrap">
                    {workshop.apprentice.user?.name || "Apprenti"}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ls-muted shrink-0 ml-0.5" />
              </div>
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-ls-muted">
            <Users className="w-12 h-12 mx-auto mb-3 text-ls-muted/50" />
            <p>
              {workshop.status === "DRAFT"
                ? "Les participants seront visibles une fois l&apos;atelier publié"
                : "Aucun participant inscrit pour le moment"}
            </p>
            {workshop.status === "PUBLISHED" && (
              <p className="text-sm mt-2">
                Les inscriptions seront visibles une fois l'atelier publié
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
