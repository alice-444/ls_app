"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatDate, formatTime, formatCountdown } from "@/lib/workshop-utils";
import { useRouter } from "next/navigation";
import type { WorkshopBase } from "@/types/workshop";

interface NextWorkshopCardProps {
  workshop: WorkshopBase & { apprenticeId?: string | null };
  countdown: ReturnType<
    typeof import("@/lib/workshop-utils").calculateCountdown
  >;
  onCreateWorkshop: () => void;
}

export function NextWorkshopCard({
  workshop,
  countdown,
  onCreateWorkshop,
}: NextWorkshopCardProps) {
  const router = useRouter();

  return (
    <Card className="mb-6 bg-linear-to-br from-[#4A90E2] to-[#26547C] text-white border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white text-2xl mb-2">
              <Calendar className="w-6 h-6" />
              Prochaine session
            </CardTitle>
            <CardDescription className="text-blue-100 text-base">
              {countdown && !countdown.isPast
                ? `Prochaine session dans ${formatCountdown(countdown)}`
                : "Prochaine session"}
            </CardDescription>
          </div>
          <Button
            variant="secondary"
            onClick={() => router.push(`/workshop/${workshop.id}`)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Voir les détails
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="font-bold text-2xl mb-4">{workshop.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {workshop.date && (
              <div className="flex items-center gap-2 text-blue-100">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  {formatDate(workshop.date, { includeWeekday: true })}
                </span>
              </div>
            )}
            {workshop.time && (
              <div className="flex items-center gap-2 text-blue-100">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {formatTime(workshop.time)}
                  {workshop.duration && ` • ${workshop.duration} min`}
                </span>
              </div>
            )}
            {workshop.isVirtual ? (
              <div className="flex items-center gap-2 text-blue-100">
                <LinkIcon className="w-5 h-5" />
                <span className="font-medium">Atelier en ligne</span>
              </div>
            ) : (
              workshop.location && (
                <div className="flex items-center gap-2 text-blue-100">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{workshop.location}</span>
                </div>
              )
            )}
            <div className="flex items-center gap-2 text-blue-100">
              <Users className="w-5 h-5" />
              <span className="font-medium">
                Inscrits: {workshop.apprenticeId ? 1 : 0} /{" "}
                {workshop.maxParticipants || "∞"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyNextWorkshopCard({
  onCreateWorkshop,
}: {
  onCreateWorkshop: () => void;
}) {
  return (
    <Card className="mb-6 border-2 border-dashed">
      <CardContent className="pt-12 pb-12 text-center">
        <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
          Aucun atelier programmé
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Créez votre premier atelier pour commencer à partager vos
          connaissances
        </p>
        <Button onClick={onCreateWorkshop} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Créer un atelier
        </Button>
      </CardContent>
    </Card>
  );
}
