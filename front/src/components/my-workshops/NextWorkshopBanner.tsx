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
  Users,
  MapPin,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";
import {
  formatDate,
  formatTime,
  formatCountdown,
  type CountdownResult,
} from "@/lib/workshop-utils";
import { motion } from "framer-motion";
import type { WorkshopBase } from "@/types/workshop";

interface NextWorkshopBannerProps {
  readonly workshop: WorkshopBase & { apprenticeId?: string | null };
  readonly countdown: CountdownResult | null;
  readonly onViewDetails: (id: string) => void;
}

export function NextWorkshopBanner({
  workshop,
  countdown,
  onViewDetails,
}: NextWorkshopBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="mb-6"
    >
      <Card className="bg-linear-to-br from-[#4A90E2] to-[#26547C] text-white border-0 shadow-xl rounded-2xl overflow-hidden relative transition-shadow duration-300 hover:shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
        </div>
        <CardHeader className="relative z-10 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl mb-2 font-bold">
                <motion.div
                  className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
                Prochaine session
              </CardTitle>
              <CardDescription className="text-white/90 text-sm sm:text-base font-medium">
                {countdown && !countdown.isPast ? (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Prochaine session dans {formatCountdown(countdown)}
                  </span>
                ) : (
                  "Prochaine session"
                )}
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              onClick={() => onViewDetails(workshop.id)}
              className="bg-white hover:bg-white/90 text-ls-heading border-0 rounded-full h-10 px-4 sm:px-6 font-semibold shadow-md hover:shadow-lg transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              Voir les détails
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
      <CardContent className="relative z-10 pt-0">
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-white">
            {workshop.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {workshop.date && (
              <InfoPill icon={Calendar}>
                {formatDate(workshop.date, { includeWeekday: true })}
              </InfoPill>
            )}
            {workshop.time && (
              <InfoPill icon={Clock}>
                {formatTime(workshop.time)}
                {workshop.duration && ` • ${workshop.duration} min`}
              </InfoPill>
            )}
            {workshop.isVirtual ? (
              <InfoPill icon={LinkIcon}>Atelier en ligne</InfoPill>
            ) : (
              workshop.location && (
                <InfoPill icon={MapPin}>
                  <span className="truncate">{workshop.location}</span>
                </InfoPill>
              )
            )}
            <InfoPill icon={Users}>
              Inscrits: {workshop.apprenticeId ? 1 : 0} /{" "}
              {workshop.maxParticipants || "∞"}
            </InfoPill>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

function InfoPill({
  icon: Icon,
  children,
}: {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
      <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <span className="font-semibold text-sm sm:text-base text-white">
        {children}
      </span>
    </div>
  );
}
