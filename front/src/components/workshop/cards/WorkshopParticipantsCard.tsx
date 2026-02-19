"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
          <Users className="w-5 h-5" />
          Participants inscrits
        </CardTitle>
        <CardDescription className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
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
              className="w-fit max-w-full cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-[rgba(255,255,255,0.08)] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-lg px-2.5 py-2 text-left focus:outline-none focus:ring-2 focus:ring-[#ffb647] focus:ring-offset-2"
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
                  <p className="font-medium text-sm text-[#26547c] dark:text-[#e6e6e6] hover:underline whitespace-nowrap">
                    {workshop.apprentice.user?.name || "Apprenti"}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] shrink-0 ml-0.5" />
              </div>
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            <Users className="w-12 h-12 mx-auto mb-3 text-[rgba(38,84,124,0.32)] dark:text-[rgba(230,230,230,0.32)]" />
            <p>
              {workshop.status === "DRAFT"
                ? "Les participants seront visibles une fois l'atelier publié"
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
