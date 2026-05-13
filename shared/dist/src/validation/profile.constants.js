"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_ERROR_MESSAGES = exports.PROFILE_VALIDATION = void 0;
exports.PROFILE_VALIDATION = {
    name: {
        min: 3,
        max: 120,
    },
    bio: {
        max: 300,
    },
    photo: {
        maxSizeMB: 2,
        maxSizeBytes: 2 * 1024 * 1024,
        allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
        allowedExtensions: ["jpg", "jpeg", "png"],
    },
    password: {
        minLength: 8,
        requireNumber: true,
    },
};
exports.PROFILE_ERROR_MESSAGES = {
    name: {
        min: "Le nom doit contenir au moins 3 caractères",
        max: "Le nom ne doit pas dépasser 120 caractères",
    },
    bio: {
        max: "La bio ne doit pas dépasser 300 caractères",
    },
    photo: {
        size: "La photo ne doit pas dépasser 2 Mo",
        type: "Le fichier doit être au format JPG ou PNG",
    },
    password: {
        minLength: "Le mot de passe doit contenir au moins 8 caractères",
        requireNumber: "Le mot de passe doit contenir au moins un chiffre",
        match: "Les mots de passe ne correspondent pas",
    },
};
