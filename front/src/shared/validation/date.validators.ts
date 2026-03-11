export function isMinimumTomorrow(date: Date | string | null | undefined): boolean {
  if (!date) return true;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate >= tomorrow;
}

export function getMinimumDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}
