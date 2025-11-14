import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, XCircle } from "lucide-react";

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
