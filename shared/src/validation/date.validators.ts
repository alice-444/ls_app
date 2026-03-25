export function isMinimumTomorrow(
  date: Date | string | null | undefined,
): boolean {
  if (!date) return true;

  const dateToCheck = typeof date === "string" ? new Date(date) : date;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return dateToCheck >= tomorrow;
}

export function getMinimumDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export function formatDateForInput(date: Date = getMinimumDate()): string {
  return date.toISOString().split("T")[0];
}
