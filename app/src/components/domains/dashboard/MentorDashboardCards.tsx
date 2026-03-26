"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, History, Users, Coins, TrendingUp } from "lucide-react";
import { formatWorkshopDate } from "@/lib/dashboard-utils";
import RollingNumber from "@/components/ui/RollingNumber";
import type { WorkshopBase } from "@ls-app/shared";

export interface Connection {
  connectionId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
  otherUserPhotoUrl?: string;
  otherUserRole?: string;
}

const AVATAR_COLORS = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
] as const;

const CONNECTION_COLORS = [
  "bg-linear-to-br from-blue-400 to-blue-600",
  "bg-linear-to-br from-purple-400 to-purple-600",
  "bg-linear-to-br from-green-400 to-green-600",
  "bg-linear-to-br from-yellow-400 to-yellow-600",
] as const;

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % 4];
}

function getConnectionColor(index: number): string {
  return CONNECTION_COLORS[index % 4];
}

export function CreditsCard({
  creditsEarned,
  onViewWorkshops,
  onViewAnalytics,
}: Readonly<{
  creditsEarned: number;
  onViewWorkshops: () => void;
  onViewAnalytics: () => void;
}>) {
  return (
    <Card className="relative overflow-hidden bg-linear-to-br from-[#26547c] to-[#4A90E2] border-0 text-white rounded-2xl shadow-xl">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      </div>
      <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
        <p className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-white">
          Crédits gagnés
        </p>
        <div className="flex items-end gap-2 sm:gap-4 mb-4 sm:mb-6">
          <p className="text-2xl sm:text-[28px] lg:text-[32px] font-medium leading-none">
            <RollingNumber value={creditsEarned} />{" "}
            <span className="text-sm sm:text-base lg:text-[18px]">crédits</span>
          </p>
          <div className="relative flex items-center h-[33px] w-[33.5px]">
            <div className="absolute left-0 top-[calc(50%+4.5px)] -translate-y-1/2 w-[24px] h-[24px]">
              <Coins className="w-6 h-6 text-white/80" />
            </div>
            <div className="absolute left-[28.36%] top-[calc(50%-4.5px)] -translate-y-1/2 w-[24px] h-[24px]">
              <Coins className="w-6 h-6 text-white/60" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-full bg-white text-[#26547c] hover:bg-white/90 rounded-full h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 border-0"
            onClick={onViewWorkshops}
          >
            Voir mes ateliers
            <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px] ml-2" />
          </Button>
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-white/10 hover:text-white rounded-full h-8 sm:h-9 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
            onClick={onViewAnalytics}
          >
            Analyse des gains
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentsHelpedCard({
  studentsHelped,
  onViewWorkshops,
}: Readonly<{
  studentsHelped: number;
  onViewWorkshops: () => void;
}>) {
  if (studentsHelped <= 0) return null;

  const rows = Math.ceil(studentsHelped / 4);
  const plural = studentsHelped > 1 ? "s" : "";

  return (
    <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
          <div className="flex items-center gap-2 sm:gap-[7.5px]">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ls-heading">
              {studentsHelped} apprenant{plural} aidé{plural}
            </h3>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
            {Array.from({ length: rows }).map((_, rowIndex) => {
              const startIndex = rowIndex * 4;
              const endIndex = Math.min(startIndex + 4, studentsHelped);
              const avatarsInRow = endIndex - startIndex;

              return (
                <div
                  key={`student-row-${startIndex}-${endIndex}`}
                  className="flex items-center justify-center -space-x-2 w-full sm:w-[236px] h-[56px] sm:h-[64px]"
                >
                  {Array.from({ length: avatarsInRow }).map((_, avatarIndex) => {
                    const globalIndex = startIndex + avatarIndex;
                    return (
                      <div
                        key={`student-avatar-${globalIndex}`}
                        className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full ${getAvatarColor(globalIndex)} border-[2.4px] sm:border-[3.2px] border-white shrink-0`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
          <Button
            variant="ctaOutline"
            size="cta"
            className="w-full"
            onClick={onViewWorkshops}
          >
            Voir mes ateliers
            <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PastWorkshopsCard({
  workshops,
  onViewWorkshops,
}: Readonly<{
  workshops: WorkshopBase[];
  onViewWorkshops: () => void;
}>) {
  if (!workshops || workshops.length === 0) return null;

  const displayWorkshops = workshops.slice(0, 3);

  return (
    <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
          <div className="flex items-center gap-2 sm:gap-[7.5px]">
            <History className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ls-heading">
              Ateliers passés
            </h3>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
            {displayWorkshops.map((workshop, index) => {
              const isLast = index === displayWorkshops.length - 1;
              return (
                <div
                  key={workshop.id}
                  className={isLast ? "border-b-0 pb-0" : "border-b border-border pb-3 sm:pb-4"}
                >
                  <p className="text-sm sm:text-base font-semibold text-ls-heading mb-1 sm:mb-2">
                    {workshop.title}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-base text-ls-muted">
                    {formatWorkshopDate(workshop.date)}
                  </p>
                </div>
              );
            })}
          </div>
          <Button
            variant="ctaOutline"
            size="cta"
            className="w-full"
            onClick={onViewWorkshops}
          >
            Voir les ateliers
            <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConnectionsCard({
  connections,
  onViewConnections,
}: Readonly<{
  connections: Connection[];
  onViewConnections: () => void;
}>) {
  if (!connections || connections.length === 0) return null;

  const plural = connections.length > 1 ? "s" : "";
  const rows: Connection[][] = [];
  for (let i = 0; i < connections.length; i += 4) {
    rows.push(connections.slice(i, i + 4));
  }

  return (
    <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
          <div className="flex items-center gap-2 sm:gap-[7.5px]">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ls-heading">
              {connections.length} connexion{plural}
            </h3>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
            {rows.map((rowConnections) => (
              <div
                key={`connection-row-${rowConnections.map((c) => c.connectionId).join("-")}`}
                className="flex items-center justify-center -space-x-2 w-full sm:w-[236px] h-[56px] sm:h-[64px]"
              >
                {rowConnections.map((c, i) => (
                  <div
                    key={c.connectionId}
                    className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-[2.4px] sm:border-[3.2px] border-white shrink-0 ${getConnectionColor(i)}`}
                    style={
                      c.otherUserPhotoUrl
                        ? {
                          backgroundImage: `url(${c.otherUserPhotoUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
          <Button
            variant="ctaOutline"
            size="cta"
            className="w-full"
            onClick={onViewConnections}
          >
            Voir les connexions
            <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
