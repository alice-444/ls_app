import { Badge } from "@/components/ui/Badge";
import { Edit, CheckCircle, XCircle } from "lucide-react";
export {
  formatDate,
  formatTime,
  calculateEndTime,
  formatTimeRange,
  isWorkshopEnded,
  isValidTimeFormat,
} from "@ls-app/shared";

export const getStatusBadge = (status: string, size: "sm" | "md" | "lg" = "sm") => {
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  const paddingSizes = {
    sm: "px-2 py-1",
    md: "px-3 py-1.5",
    lg: "px-4 py-2",
  };

  const variants: Record<
    string,
    {
      variant: "secondary" | "default" | "outline" | "destructive";
      label: string;
      icon: (size: string) => React.ReactNode;
    }
  > = {
    DRAFT: {
      variant: "secondary",
      label: "Brouillon",
      icon: (iconSize) => <Edit className={`${iconSize} mr-1.5`} />,
    },
    PUBLISHED: {
      variant: "default",
      label: "Publié",
      icon: (iconSize) => <CheckCircle className={`${iconSize} mr-1.5`} />,
    },
    CANCELLED: {
      variant: "destructive",
      label: "Annulé",
      icon: (iconSize) => <XCircle className={`${iconSize} mr-1.5`} />,
    },
    COMPLETED: {
      variant: "outline",
      label: "Terminé",
      icon: (iconSize) => <CheckCircle className={`${iconSize} mr-1.5`} />,
    },
  };

  const config = variants[status] || variants.DRAFT;
  return (
    <Badge
      variant={config.variant}
      className={`flex items-center w-fit ${textSizes[size]} ${paddingSizes[size]}`}
    >
      {config.icon(iconSizes[size])}
      {config.label}
    </Badge>
  );
};

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const calculateCountdown = (
  date: Date | string | null,
  time: string | null
): CountdownResult | null => {
  if (!date || !time) return null;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const [timeHours, timeMinutes] = time.split(":").map(Number);
    const workshopDateTime = new Date(dateObj);
    workshopDateTime.setHours(timeHours, timeMinutes, 0, 0);

    const now = new Date();
    const diff = workshopDateTime.getTime() - now.getTime();

    if (diff < 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPast: true,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const countdownHours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const countdownMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days,
      hours: countdownHours,
      minutes: countdownMinutes,
      seconds,
      isPast: false,
    };
  } catch {
    return null;
  }
};

export const formatCountdown = (countdown: CountdownResult | null): string => {
  if (!countdown) return "Date non définie";
  if (countdown.isPast) return "Terminé";

  if (countdown.days > 0) {
    return `${countdown.days} jour${countdown.days > 1 ? "s" : ""}`;
  }
  if (countdown.hours > 0) {
    return `${countdown.hours} heure${countdown.hours > 1 ? "s" : ""}`;
  }
  if (countdown.minutes > 0) {
    return `${countdown.minutes} minute${countdown.minutes > 1 ? "s" : ""}`;
  }
  return `${countdown.seconds} seconde${countdown.seconds > 1 ? "s" : ""}`;
};
