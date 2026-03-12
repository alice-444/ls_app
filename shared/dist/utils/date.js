"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorkshopEnded = exports.formatTimeRange = exports.calculateEndTime = exports.isValidTimeFormat = exports.formatDateTime = exports.formatTime = exports.formatDate = void 0;
const workshop_constants_1 = require("../validation/workshop.constants");
const formatDate = (date, options) => {
    if (!date)
        return "Non définie";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        ...(options?.includeWeekday && { weekday: "long" }),
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};
exports.formatDate = formatDate;
const formatTime = (time) => {
    if (!time)
        return "Non définie";
    return time;
};
exports.formatTime = formatTime;
const formatDateTime = (date, time, options) => {
    if (!date || !time)
        return "Non défini";
    return `${(0, exports.formatDate)(date, options)} à ${(0, exports.formatTime)(time)}`;
};
exports.formatDateTime = formatDateTime;
const isValidTimeFormat = (time) => {
    return workshop_constants_1.WORKSHOP_VALIDATION.time.regex.test(time);
};
exports.isValidTimeFormat = isValidTimeFormat;
const calculateEndTime = (date, time, duration) => {
    if (!date || !time || !duration)
        return null;
    try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        const [hours, minutes] = time.split(":").map(Number);
        const startTime = new Date(dateObj);
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);
        return endTime;
    }
    catch {
        return null;
    }
};
exports.calculateEndTime = calculateEndTime;
const formatTimeRange = (time, duration) => {
    if (!time)
        return "Non définie";
    if (!duration)
        return time;
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
    }
    catch {
        return time;
    }
};
exports.formatTimeRange = formatTimeRange;
const isWorkshopEnded = (date, time, duration) => {
    const endTime = (0, exports.calculateEndTime)(date, time, duration);
    if (!endTime)
        return false;
    return endTime < new Date();
};
exports.isWorkshopEnded = isWorkshopEnded;
