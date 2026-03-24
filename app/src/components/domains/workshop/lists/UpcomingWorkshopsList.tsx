"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Calendar, Clock, MapPin, Users, Link as LinkIcon } from "lucide-react";
import { formatDate, formatTime } from "@/lib/workshop-utils";
import { useRouter } from "next/navigation";

interface UpcomingWorkshopsListProps {
  workshops: Array<{
    id: string;
    title: string;
    date: Date | string;
    time?: string | null;
    duration?: number | null;
    location?: string | null;
    isVirtual: boolean;
    maxParticipants?: number | null;
    apprenticeId?: string | null;
  }>;
}

export function UpcomingWorkshopsList({
  workshops,
}: Readonly<UpcomingWorkshopsListProps>) {
  const router = useRouter();

  if (workshops.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Autres ateliers à venir ({workshops.length})
        </CardTitle>
        <CardDescription>Vos prochains ateliers programmés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workshops.map((workshop) => (
            <Card
              key={workshop.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/workshop/${workshop.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">
                  {workshop.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(workshop.date, { includeWeekday: true })}
                  </div>
                  {workshop.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime(workshop.time)}
                      {workshop.duration && ` • ${workshop.duration} min`}
                    </div>
                  )}
                  {workshop.isVirtual ? (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      <span>En ligne</span>
                    </div>
                  ) : (
                    workshop.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{workshop.location}</span>
                      </div>
                    )
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      Inscrits: {workshop.apprenticeId ? 1 : 0} /{" "}
                      {workshop.maxParticipants || "∞"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
