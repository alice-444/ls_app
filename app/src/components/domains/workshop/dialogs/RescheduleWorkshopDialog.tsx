import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDate, formatTime, isValidTimeFormat } from "@/lib/workshop-utils";
import {
  getMinimumDate,
  formatDateForInput,
} from "@ls-app/shared";

interface RescheduleWorkshopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    date: Date;
    time: string;
    duration?: number | null;
    location?: string | null;
  }) => void;
  isLoading: boolean;
  workshopTitle: string;
  oldDate: Date | null;
  oldTime: string | null;
  oldDuration: number | null;
  oldLocation: string | null;
  isVirtual: boolean;
}

export function RescheduleWorkshopDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  workshopTitle,
  oldDate,
  oldTime,
  oldDuration,
  oldLocation,
  isVirtual,
}: Readonly<RescheduleWorkshopDialogProps>) {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && oldDate && oldTime) {
      const dateObj = typeof oldDate === "string" ? new Date(oldDate) : oldDate;
      setDate(formatDateForInput(dateObj));
      setTime(oldTime);
      setDuration(oldDuration?.toString() || "60");
      setLocation(oldLocation || "");
    }
  }, [open, oldDate, oldTime, oldDuration, oldLocation]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (date) {
      const selectedDate = new Date(date);
      const tomorrow = getMinimumDate();
      if (selectedDate < tomorrow) {
        newErrors.date = "La date doit être au minimum demain";
      }
    } else {
      newErrors.date = "La date est requise";
    }

    if (!time) {
      newErrors.time = "L'heure est requise";
    } else if (!isValidTimeFormat(time)) {
      newErrors.time = "Format d'heure invalide (HH:MM requis)";
    }

    if (duration) {
      const durationNum = Number.parseInt(duration, 10);
      if (Number.isNaN(durationNum) || durationNum < 15 || durationNum > 480) {
        newErrors.duration = "La durée doit être entre 15 et 480 minutes";
      }
    }

    if (!isVirtual && !location.trim()) {
      newErrors.location = "Le lieu est requis pour un atelier en présentiel";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    const dateObj = new Date(date);
    const durationNum = duration ? Number.parseInt(duration, 10) : null;

    onConfirm({
      date: dateObj,
      time,
      duration: durationNum,
      location: isVirtual ? null : location.trim() || null,
    });
  };

  const formatOldDateTime = (): string => {
    if (!oldDate || !oldTime) return "Non défini";
    const dateObj = typeof oldDate === "string" ? new Date(oldDate) : oldDate;
    return `${formatDate(dateObj, { includeWeekday: true })} à ${formatTime(
      oldTime
    )}`;
  };

  const formatNewDateTime = (): string => {
    if (!date || !time) return "Non défini";
    const dateObj = new Date(date);
    return `${formatDate(dateObj, { includeWeekday: true })} à ${formatTime(
      time
    )}`;
  };

  const hasChanges = (): boolean => {
    if (!oldDate || !oldTime) return true;
    const oldDateObj =
      typeof oldDate === "string" ? new Date(oldDate) : oldDate;

    return (
      oldDateObj.toISOString().split("T")[0] !== date ||
      oldTime !== time ||
      (oldDuration?.toString() || "60") !== duration ||
      (oldLocation || "") !== location
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reprogrammer l'atelier
          </DialogTitle>
          <DialogDescription>
            Modifiez la date, l'heure ou le lieu de l'atelier{" "}
            <span className="font-semibold text-foreground">
              "{workshopTitle}"
            </span>
            {". Les participants seront notifiés automatiquement."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-3 text-sm">
              Résumé des changements
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ancien horaire:</span>
                <span className="font-medium">{formatOldDateTime()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nouvel horaire:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {date && time ? formatNewDateTime() : "À définir"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Nouvelle date *
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: "" }));
              }}
              min={formatDateForInput(getMinimumDate())}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Nouvelle heure *
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setErrors((prev) => ({ ...prev, time: "" }));
              }}
              className={errors.time ? "border-red-500" : ""}
            />
            {errors.time && (
              <p className="text-sm text-red-500">{errors.time}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée (en minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              step="15"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setErrors((prev) => ({ ...prev, duration: "" }));
              }}
              placeholder="60"
              className={errors.duration ? "border-red-500" : ""}
            />
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Durée entre 15 et 480 minutes
            </p>
          </div>

          {!isVirtual && (
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Nouveau lieu *
              </Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setErrors((prev) => ({ ...prev, location: "" }));
                }}
                placeholder="Adresse ou lieu de l'atelier"
                maxLength={200}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          )}

          {isVirtual && (
            <div className="text-sm text-muted-foreground italic">
              Cet atelier est virtuel, aucun lieu n'est requis.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || !hasChanges()}>
            {isLoading ? "Reprogrammation..." : "Confirmer la reprogrammation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
