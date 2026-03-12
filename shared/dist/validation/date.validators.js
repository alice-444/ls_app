"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMinimumTomorrow = isMinimumTomorrow;
exports.getMinimumDate = getMinimumDate;
exports.formatDateForInput = formatDateForInput;
function isMinimumTomorrow(date) {
    if (!date)
        return true;
    const dateToCheck = typeof date === "string" ? new Date(date) : date;
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
