import { sanitizeString } from "../../utils/sanitize";
import { WORKSHOP_VALIDATION } from "../../../shared/validation/workshop.constants";
import { logger } from "../../common/logger";

export function isValidTimeFormat(time: string): boolean {
  return WORKSHOP_VALIDATION.time.regex.test(time);
}

export function sanitizeLocation(
  location: string | null | undefined
): string | null {
  if (!location) return null;
  return sanitizeString(location);
}

export function buildWorkshopUpdateData(input: {
  date?: Date;
  time?: string;
  duration?: number | null;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null;
  existingWorkshop?: {
    duration?: number | null;
    location?: string | null;
    isVirtual?: boolean;
    maxParticipants?: number | null;
  };
}): {
  date?: Date;
  time?: string;
  duration?: number | undefined;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null | undefined;
} {
  const updateData: any = {};

  if (input.date !== undefined) {
    updateData.date = input.date;
  }

  if (input.time !== undefined) {
    updateData.time = input.time;
  }

  if (input.duration !== undefined) {
    updateData.duration =
      input.duration ?? input.existingWorkshop?.duration ?? undefined;
  }

  if (input.location !== undefined) {
    updateData.location = sanitizeLocation(
      input.location ?? input.existingWorkshop?.location ?? null
    );
  }

  if (input.isVirtual !== undefined) {
    updateData.isVirtual =
      input.isVirtual ?? input.existingWorkshop?.isVirtual ?? false;
  }

  if (input.maxParticipants !== undefined) {
    updateData.maxParticipants =
      input.maxParticipants ??
      input.existingWorkshop?.maxParticipants ??
      undefined;
  }

  return updateData;
}

export function doTimeRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
}

export function calculateWorkshopStartTime(
  date: Date | null,
  time: string | null
): Date | null {
  if (!date || !time) {
    return null;
  }

  try {
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    return startTime;
  } catch (error) {
    if (!(error instanceof TypeError && error.message.includes("Invalid"))) {
      logger.error("Unexpected error calculating workshop start time", error, {
        date: date?.toISOString(),
        time,
      });
    }
    return null;
  }
}

export function calculateWorkshopEndTime(
  date: Date | null,
  time: string | null,
  duration: number | null
): Date | null {
  if (!date || !time || !duration) {
    return null;
  }

  try {
    const startTime = calculateWorkshopStartTime(date, time);
    if (!startTime) {
      return null;
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    return endTime;
  } catch (error) {
    if (!(error instanceof TypeError && error.message.includes("Invalid"))) {
      logger.error("Unexpected error calculating workshop end time", error, {
        date: date?.toISOString(),
        time,
        duration,
      });
    }
    return null;
  }
}

export function isWorkshopValidForConflictCheck(
  workshop: {
    id: string;
    status: string;
    date: Date | null;
    time: string | null;
    duration: number | null;
  },
  excludeWorkshopId?: string
): boolean {
  if (excludeWorkshopId && workshop.id === excludeWorkshopId) {
    return false;
  }

  if (workshop.status === "CANCELLED") {
    return false;
  }

  if (!workshop.date || !workshop.time || !workshop.duration) {
    return false;
  }

  return true;
}

export function calculateWorkshopTimeRange(workshop: {
  date: Date | null;
  time: string | null;
  duration: number | null;
}): { startTime: Date | null; endTime: Date | null } {
  const startTime = calculateWorkshopStartTime(workshop.date, workshop.time);
  const endTime = calculateWorkshopEndTime(
    workshop.date,
    workshop.time,
    workshop.duration
  );

  return { startTime, endTime };
}
