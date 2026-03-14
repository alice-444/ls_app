"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMinimumToday = isMinimumToday;
exports.isMinimumTomorrow = isMinimumTomorrow;
exports.getMinimumDate = getMinimumDate;
exports.formatDateForInput = formatDateForInput;
function isMinimumToday(date) {
    if (!date)
        return true;
    const dateToCheck = typeof date === "string" ? new Date(date) : date;
    dateToCheck.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck >= today;
}
function isMinimumTomorrow(date) {
    if (!date)
        return true;
    const dateToCheck = typeof date === "string" ? new Date(date) : date;
    dateToCheck.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateToCheck >= tomorrow;
}
function getMinimumDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}
function formatDateForInput(date = getMinimumDate()) {
    return date.toISOString().split("T")[0];
}
