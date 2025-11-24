"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Tag, Video } from "lucide-react";
import { formatDate, formatTime } from "@/lib/workshop-utils";

interface WorkshopDetailsCardProps {
  topic?: string | null;
  date: Date | string;
  time: string;
  duration?: number | null;
  location?: string | null;
  isVirtual: boolean;
  maxParticipants?: number | null;
}

export function WorkshopDetailsCard({
  topic,
  date,
  time,
  duration,
  location,
  isVirtual,
  maxParticipants,
}: WorkshopDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de l'atelier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topic && (
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-slate-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Thème / Topic
              </p>
              <p className="text-slate-900 dark:text-slate-100">{topic}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Date
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              {formatDate(date, { includeWeekday: true })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Heure
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              {formatTime(time)}
            </p>
          </div>
        </div>

        {duration && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Durée
              </p>
              <p className="text-slate-900 dark:text-slate-100">
                {duration} minutes
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          {isVirtual ? (
            <Video className="w-5 h-5 text-slate-500 mt-0.5" />
          ) : (
            <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {isVirtual ? "En ligne" : "Lieu"}
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              {location || "Non spécifié"}
            </p>
          </div>
        </div>

        {maxParticipants && (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-slate-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Participants max
              </p>
              <p className="text-slate-900 dark:text-slate-100">
                {maxParticipants} personnes
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
