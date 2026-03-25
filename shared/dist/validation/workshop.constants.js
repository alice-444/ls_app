"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKSHOP_ERROR_MESSAGES = exports.WORKSHOP_VALIDATION = void 0;
exports.WORKSHOP_VALIDATION = {
    title: {
        min: 5,
        max: 100, // On prend le max du back car plus restrictif
    },
    description: {
        max: 100,
    },
    time: {
        regex: /^([01]\d|2[0-3]):([0-5]\d)$/, // On prend le format strict (09:30)
    },
    duration: {
        min: 15,
        max: 480, // 8 heures
    },
    durationHours: {
        min: 0,
        max: 8,
    },
    durationMinutes: {
        min: 0,
        max: 59,
    },
    location: {
        max: 200,
    },
    maxParticipants: {
        min: 1,
        max: 1000,
    },
    materialsNeeded: {
        max: 500,
    },
    topic: {
        min: 2,
        max: 50,
    },
    creditCost: {
        min: 20,
        max: 100,
    },
};
exports.WORKSHOP_ERROR_MESSAGES = {
    title: {
        min: `Le titre doit contenir au moins ${exports.WORKSHOP_VALIDATION.title.min} caractères`,
        max: `Le titre ne peut pas dépasser ${exports.WORKSHOP_VALIDATION.title.max} caractères`,
    },
    description: {
        max: `La description ne peut pas dépasser ${exports.WORKSHOP_VALIDATION.description.max} caractères`,
        minForPublish: "La description doit contenir au moins 30 caractères pour publier",
    },
    date: {
        required: "La date est obligatoire",
        minimumTomorrow: "La date doit être au minimum demain",
    },
    time: {
        required: "L'heure est obligatoire",
        invalidFormat: "L'heure doit être au format HH:MM",
    },
    duration: {
        min: `La durée doit être d'au moins ${exports.WORKSHOP_VALIDATION.duration.min} minutes`,
        max: `La durée ne peut pas dépasser ${exports.WORKSHOP_VALIDATION.duration.max} minutes`,
        integer: "La durée doit être un nombre entier",
    },
    durationHours: {
        min: `Les heures doivent être entre ${exports.WORKSHOP_VALIDATION.durationHours.min} et ${exports.WORKSHOP_VALIDATION.durationHours.max}`,
        max: `Les heures ne peuvent pas dépasser ${exports.WORKSHOP_VALIDATION.durationHours.max}`,
    },
    durationMinutes: {
        min: `Les minutes doivent être entre ${exports.WORKSHOP_VALIDATION.durationMinutes.min} et ${exports.WORKSHOP_VALIDATION.durationMinutes.max}`,
        max: `Les minutes ne peuvent pas dépasser ${exports.WORKSHOP_VALIDATION.durationMinutes.max}`,
    },
    location: {
        max: `Le lieu ne peut pas dépasser ${exports.WORKSHOP_VALIDATION.location.max} caractères`,
    },
    maxParticipants: {
        range: `Le nombre de participants doit être entre ${exports.WORKSHOP_VALIDATION.maxParticipants.min} et ${exports.WORKSHOP_VALIDATION.maxParticipants.max}`,
        min: `Le nombre minimum de participants est ${exports.WORKSHOP_VALIDATION.maxParticipants.min}`,
        max: `Le nombre maximum de participants est ${exports.WORKSHOP_VALIDATION.maxParticipants.max}`,
        integer: "Le nombre de participants doit être un nombre entier",
    },
    materialsNeeded: {
        max: `Le matériel nécessaire ne peut pas dépasser ${exports.WORKSHOP_VALIDATION.materialsNeeded.max} caractères`,
    },
    topic: {
        min: `Le sujet doit contenir au moins ${exports.WORKSHOP_VALIDATION.topic.min} caractères`,
        max: `Le sujet ne peut pas dépasser ${exports.WORKSHOP_VALIDATION.topic.max} caractères`,
    },
    creditCost: {
        min: `Le nombre minimum de crédits est ${exports.WORKSHOP_VALIDATION.creditCost.min}`,
        max: `Le nombre maximum de crédits est ${exports.WORKSHOP_VALIDATION.creditCost.max}`,
        integer: "Le nombre de crédits doit être un nombre entier",
    },
};
