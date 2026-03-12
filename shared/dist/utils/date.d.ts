export type DateInput = string | Date | null;
export declare const formatDate: (date: DateInput, options?: {
    includeWeekday?: boolean;
}) => string;
export declare const formatTime: (time: string | null) => string;
export declare const formatDateTime: (date: DateInput, time: string | null, options?: {
    includeWeekday?: boolean;
}) => string;
export declare const isValidTimeFormat: (time: string) => boolean;
export declare const calculateEndTime: (date: DateInput, time: string | null, duration: number | null) => Date | null;
export declare const formatTimeRange: (time: string | null, duration: number | null) => string;
export declare const isWorkshopEnded: (date: DateInput, time: string | null, duration: number | null) => boolean;
