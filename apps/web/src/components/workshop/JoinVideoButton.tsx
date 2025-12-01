"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

interface JoinVideoButtonProps {
  workshop: {
    id: string;
    date: Date | string | null;
    time: string | null;
    isVirtual: boolean;
    dailyRoomId: string | null;
  };
}

export function JoinVideoButton({ workshop }: JoinVideoButtonProps) {
  const [timeUntilAvailable, setTimeUntilAvailable] = useState<number | null>(
    null
  );
  const [isAvailable, setIsAvailable] = useState(false);

  const logLinkClickMutation = trpc.workshop.logVideoLinkClick.useMutation();

  useEffect(() => {
    if (!workshop.date || !workshop.time || !workshop.isVirtual) {
      return;
    }

    const calculateAvailability = () => {
      if (!workshop.date || !workshop.time) return;

      const workshopDate =
        typeof workshop.date === "string"
          ? new Date(workshop.date)
          : new Date(workshop.date);
      const [hours, minutes] = workshop.time.split(":").map(Number);
      workshopDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const threeHoursInMs = 3 * 60 * 60 * 1000;
      const timeUntilStart = workshopDate.getTime() - now.getTime();
      const timeUntilAvailable = timeUntilStart - threeHoursInMs;

      if (timeUntilAvailable <= 0) {
        setIsAvailable(true);
        setTimeUntilAvailable(null);
      } else {
        setIsAvailable(false);
        setTimeUntilAvailable(timeUntilAvailable);
      }
    };

    calculateAvailability();
    const interval = setInterval(calculateAvailability, 1000);

    return () => clearInterval(interval);
  }, [workshop.date, workshop.time, workshop.isVirtual]);

  if (!workshop.isVirtual) {
    return null;
  }

  const hasLink = !!workshop.dailyRoomId && isAvailable;

  const handleJoin = () => {
    logLinkClickMutation.mutate(
      { workshopId: workshop.id },
      {
        onError: (error) => {
          console.error("Failed to log video link click:", error);
        },
      }
    );

    window.open(
      `/workshop/${workshop.id}/join-video`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (!hasLink) {
    const workshopDate =
      typeof workshop.date === "string"
        ? new Date(workshop.date)
        : new Date(workshop.date!);
    const [hours, minutes] = workshop.time!.split(":").map(Number);
    workshopDate.setHours(hours, minutes, 0, 0);
    const linkAvailableAt = new Date(
      workshopDate.getTime() - 3 * 60 * 60 * 1000
    );

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Button disabled variant="secondary" className="w-full">
              <Video className="mr-2 h-4 w-4" />
              Rejoindre la visioconférence
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Lien disponible{" "}
                {timeUntilAvailable !== null && timeUntilAvailable > 0
                  ? `dans ${formatDistanceToNow(linkAvailableAt, {
                      addSuffix: true,
                      locale: fr,
                    })}`
                  : `le ${linkAvailableAt.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Button onClick={handleJoin} className="w-full" size="lg">
          <Video className="mr-2 h-4 w-4" />
          Rejoindre la visioconférence
        </Button>
      </CardContent>
    </Card>
  );
}
