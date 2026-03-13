export function isMinimumToday(
  date: Date | string | null | undefined,
): boolean {
  if (!date) return true;

  const dateToCheck = typeof date === "string" ? new Date(date) : date;
  dateToCheck.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dateToCheck >= today;
}

export function isMinimumTomorrow(
  date: Date | string | null | undefined,
): boolean {
  if (!date) return true;

  const dateToCheck = typeof date === "string" ? new Date(date) : date;
  dateToCheck.setHours(0, 0, 0, 0);

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
