export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
export declare class FileValidator {
    static validatePhoto(file: File): FileValidationResult;
}
