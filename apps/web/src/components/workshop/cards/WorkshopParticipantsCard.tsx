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
  workshop: {
    status: string;
    apprenticeId?: string | null;
    apprentice?: {
      user?: {
        id?: string;
        name?: string | null;
      } | null;
    } | null;
    maxParticipants?: number | null;
  };
  onViewApprenticeProfile: (userId: string) => void;
}

export function WorkshopParticipantsCard({
  workshop,
  onViewApprenticeProfile,
}: WorkshopParticipantsCardProps) {
  const participantCount =
    workshop.status === "PUBLISHED" && workshop.apprenticeId ? 1 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants inscrits
        </CardTitle>
        <CardDescription>
          {participantCount} / {workshop.maxParticipants || "∞"} participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        {workshop.status === "PUBLISHED" &&
        workshop.apprenticeId &&
        workshop.apprentice ? (
          <div className="space-y-2">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (workshop.apprentice?.user?.id) {
                  onViewApprenticeProfile(workshop.apprentice.user.id);
                }
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm hover:underline">
                      {workshop.apprentice.user?.name || "Apprenti"}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
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
