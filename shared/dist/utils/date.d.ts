export declare const formatDate: (
  date: string | Date | null,
  options?: {
    includeWeekday?: boolean;
  },
) => string;
export declare const formatTime: (time: string | null) => string;
export declare const formatDateTime: (
  date: Date | string | null,
  time: string | null,
  options?: {
    includeWeekday?: boolean;
  },
) => string;
export declare const isValidTimeFormat: (time: string) => boolean;
export declare const calculateEndTime: (
  date: Date | string | null,
  time: string | null,
  duration: number | null,
) => Date | null;
export declare const formatTimeRange: (
  time: string | null,
  duration: number | null,
) => string;
export declare const isWorkshopEnded: (
  date: Date | string | null,
  time: string | null,
  duration: number | null,
) => boolean;
