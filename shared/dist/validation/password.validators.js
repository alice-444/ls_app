"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidator = void 0;
const profile_constants_1 = require("./profile.constants");
class PasswordValidator {
    static validate(password) {
        if (password.length < profile_constants_1.PROFILE_VALIDATION.password.minLength) {
            return {
                valid: false,
                error: profile_constants_1.PROFILE_ERROR_MESSAGES.password.minLength,
            };
        }
        if (profile_constants_1.PROFILE_VALIDATION.password.requireNumber && !/\d/.test(password)) {
            return {
                valid: false,
                error: profile_constants_1.PROFILE_ERROR_MESSAGES.password.requireNumber,
            };
        }
        return { valid: true };
    }
    static validateMatch(password, confirmPassword) {
        if (password !== confirmPassword) {
            return {
                valid: false,
                error: profile_constants_1.PROFILE_ERROR_MESSAGES.password.match,
            };
        }
        return { valid: true };
    }
    static validateComplete(password, confirmPassword) {
        const matchResult = this.validateMatch(password, confirmPassword);
        if (!matchResult.valid) {
            return matchResult;
        }
        return this.validate(password);
    }
}
exports.PasswordValidator = PasswordValidator;
