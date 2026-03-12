import { WORKSHOP_VALIDATION } from "../validation/workshop.constants";

export type DateInput = string | Date | null;

export const formatDate = (
  date: DateInput,
  options?: { includeWeekday?: boolean },
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

export const formatDateTime = (
  date: DateInput,
  time: string | null,
  options?: { includeWeekday?: boolean },
): string => {
  if (!date || !time) return "Non défini";
  return `${formatDate(date, options)} à ${formatTime(time)}`;
};

export const isValidTimeFormat = (time: string): boolean => {
  return WORKSHOP_VALIDATION.time.regex.test(time);
};

export const calculateEndTime = (
  date: DateInput,
  time: string | null,
  duration: number | null,
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
  duration: number | null,
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

export const isWorkshopEnded = (
  date: DateInput,
  time: string | null,
  duration: number | null,
): boolean => {
  const endTime = calculateEndTime(date, time, duration);
  if (!endTime) return false;
  return endTime < new Date();
};
