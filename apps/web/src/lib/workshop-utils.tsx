import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, XCircle } from "lucide-react";
import { WORKSHOP_VALIDATION } from "@/shared/validation/workshop.constants";

export const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    { variant: any; label: string; icon: React.ReactNode }
  > = {
    DRAFT: {
      variant: "secondary",
      label: "Brouillon",
      icon: <Edit className="w-3 h-3 mr-1" />,
    },
    PUBLISHED: {
      variant: "default",
      label: "Publié",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    },
    CANCELLED: {
      variant: "destructive",
      label: "Annulé",
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
    COMPLETED: {
      variant: "outline",
      label: "Terminé",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    },
  };

  const config = variants[status] || variants.DRAFT;
  return (
    <Badge variant={config.variant} className="flex items-center w-fit">
      {config.icon}
      {config.label}
    </Badge>
  );
};

export const formatDate = (
  date: string | Date | null,
  options?: { includeWeekday?: boolean }
): string => {
  if (!date) return "Non définie";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    ...(options?.includeWeekday && { weekday: "long" }),
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatTime = (time: string | null): string => {
  if (!time) return "Non définie";
  return time;
};

export const isValidTimeFormat = (time: string): boolean => {
  return WORKSHOP_VALIDATION.time.regex.test(time);
};

export const calculateEndTime = (
  date: Date | string | null,
  time: string | null,
  duration: number | null
): Date | null => {
  if (!date || !time || !duration) return null;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(dateObj);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    return endTime;
  } catch {
    return null;
  }
};

export const formatTimeRange = (
  time: string | null,
  duration: number | null
): string => {
  if (!time) return "Non définie";

  if (!duration) return time;

  try {
    const [hours, minutes] = time.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTimeStr = `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;

    return `${time} - ${endTimeStr}`;
  } catch {
    return time;
  }
};
