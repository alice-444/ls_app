"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Users } from "lucide-react";
import { formatDate, formatTimeRange } from "@/lib/workshop-utils";

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  date: Date | string | null;
  time: string | null;
  duration: number | null;
  topic?: string | null;
  maxParticipants?: number | null;
  apprenticeId?: string | null;
  creator?: {
    id?: string;
    user?: { name: string | null };
  };
}

interface AvailableWorkshopsGridProps {
  readonly workshops: Workshop[] | undefined;
  readonly onJoinWorkshop: (workshop: Workshop) => void;
}

export function AvailableWorkshopsGrid({
  workshops,
  onJoinWorkshop,
}: AvailableWorkshopsGridProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Ateliers à la une
        </h2>
        <Button
          variant="ghost"
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          onClick={() => router.push("/workshop-room")}
        >
          Tout voir <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {workshops && workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              onDetails={() => router.push(`/workshop/${workshop.id}`)}
              onJoin={() => onJoinWorkshop(workshop)}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Aucun atelier disponible
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Tous les ateliers ouverts sont déjà complets ou vous y êtes déjà
              inscrit.
            </p>
            <Button onClick={() => router.push("/workshop-room")}>
              Voir tous les ateliers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WorkshopCard({
  workshop,
  onDetails,
  onJoin,
}: {
  readonly workshop: Workshop;
  readonly onDetails: () => void;
  readonly onJoin: () => void;
}) {
  return (
    <Card className="group overflow-hidden border hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="h-2 bg-linear-to-r from-blue-500 to-cyan-500"></div>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          {workshop.topic && (
            <Badge
              variant="secondary"
              className="mb-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border-0"
            >
              {workshop.topic}
            </Badge>
          )}
          {workshop.maxParticipants && (
            <Badge
              variant="outline"
              className="text-xs border-slate-200 text-slate-500"
            >
              <Users className="w-3 h-3 mr-1" />
              {workshop.apprenticeId ? 1 : 0}/{workshop.maxParticipants}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
          {workshop.title}
        </CardTitle>
        {workshop.creator?.user?.name && (
          <CardDescription className="flex items-center gap-1.5 mt-1">
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
              {workshop.creator.user.name.charAt(0)}
            </div>
            {workshop.creator.user.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {workshop.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {workshop.description}
          </p>
        )}
        <div className="space-y-2 text-sm">
          {workshop.date && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 opacity-70 text-indigo-500" />
              {formatDate(workshop.date)}
            </div>
          )}
          {workshop.time && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 opacity-70 text-indigo-500" />
              {formatTimeRange(workshop.time, workshop.duration)}
            </div>
          )}
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
          onClick={onDetails}
        >
          Détails
        </Button>
        <Button
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          onClick={onJoin}
        >
          Rejoindre
        </Button>
      </div>
    </Card>
  );
}
