export function formatDate(
  date: Date | null,
  options?: { includeWeekday?: boolean }
): string {
  if (!date) return "Non définie";
  return date.toLocaleDateString("fr-FR", {
    ...(options?.includeWeekday && { weekday: "long" }),
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(time: string | null): string {
  if (!time) return "Non définie";
  return time;
}

export function formatDateTime(
  date: Date | null,
  time: string | null,
  options?: { includeWeekday?: boolean }
): string {
  if (!date || !time) return "Non défini";
  return `${formatDate(date, options)} à ${formatTime(time)}`;
}
