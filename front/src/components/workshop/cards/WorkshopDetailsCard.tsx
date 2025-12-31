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
    <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
      <CardHeader>
        <CardTitle className="text-[#26547c] dark:text-[#e6e6e6]">Détails de l'atelier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topic && (
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-[#26547c] dark:text-[#e6e6e6] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                Thème / Topic
              </p>
              <p className="text-[#161616] dark:text-[#e6e6e6]">{topic}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#26547c] dark:text-[#e6e6e6] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Date
            </p>
            <p className="text-[#161616] dark:text-[#e6e6e6]">
              {formatDate(date, { includeWeekday: true })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#26547c] dark:text-[#e6e6e6] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              Heure
            </p>
            <p className="text-[#161616] dark:text-[#e6e6e6]">
              {formatTime(time)}
            </p>
          </div>
        </div>

        {duration && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#26547c] dark:text-[#e6e6e6] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                Durée
              </p>
              <p className="text-[#161616] dark:text-[#e6e6e6]">
                {duration} minutes
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          {isVirtual ? (
            <Video className="w-5 h-5 text-[#26547c] dark:text-[#e6e6e6] mt-0.5" />
          ) : (
            <MapPin className="w-5 h-5 text-[#26547c] dark:text-[#e6e6e6] mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              {isVirtual ? "En ligne" : "Lieu"}
            </p>
            <p className="text-[#161616] dark:text-[#e6e6e6]">
              {location || "Non spécifié"}
            </p>
          </div>
        </div>

        {maxParticipants && (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-[#26547c] dark:text-[#e6e6e6] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                Participants max
              </p>
              <p className="text-[#161616] dark:text-[#e6e6e6]">
                {maxParticipants} personnes
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
