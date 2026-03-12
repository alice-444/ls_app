"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidator = void 0;
const profile_constants_1 = require("./profile.constants");
class FileValidator {
    static validatePhoto(file) {
        if (file.size > profile_constants_1.PROFILE_VALIDATION.photo.maxSizeBytes) {
            return {
                valid: false,
                error: profile_constants_1.PROFILE_ERROR_MESSAGES.photo.size,
            };
        }
        if (!profile_constants_1.PROFILE_VALIDATION.photo.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: profile_constants_1.PROFILE_ERROR_MESSAGES.photo.type,
            };
        }
        return { valid: true };
    }
}
exports.FileValidator = FileValidator;
