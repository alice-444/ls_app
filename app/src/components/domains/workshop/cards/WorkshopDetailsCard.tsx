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
}: Readonly<WorkshopDetailsCardProps>) {
  return (
    <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-ls-heading">Détails de l&apos;atelier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topic && (
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-brand mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ls-muted">
                Thème / Topic
              </p>
              <p className="text-ls-text">{topic}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-brand mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ls-muted">
              Date
            </p>
            <p className="text-ls-text">
              {formatDate(date, { includeWeekday: true })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-brand mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ls-muted">
              Heure
            </p>
            <p className="text-ls-text">
              {formatTime(time)}
            </p>
          </div>
        </div>

        {duration && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-brand mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ls-muted">
                Durée
              </p>
              <p className="text-ls-text">
                {duration} minutes
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          {isVirtual ? (
            <Video className="w-5 h-5 text-brand mt-0.5" />
          ) : (
            <MapPin className="w-5 h-5 text-brand mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-ls-muted">
              {isVirtual ? "En ligne" : "Lieu"}
            </p>
            <p className="text-ls-text">
              {location || "Non spécifié"}
            </p>
          </div>
        </div>

        {maxParticipants && (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-brand mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ls-muted">
                Participants max
              </p>
              <p className="text-ls-text">
                {maxParticipants} personnes
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
