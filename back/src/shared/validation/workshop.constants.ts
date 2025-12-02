export const WORKSHOP_VALIDATION = {
  title: {
    min: 5,
    max: 100,
  },
  description: {
    max: 100,
  },
  time: {
    regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  duration: {
    min: 15,
    max: 480,
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
} as const;

export const WORKSHOP_ERROR_MESSAGES = {
  title: {
    min: `Le titre doit contenir au moins ${WORKSHOP_VALIDATION.title.min} caractères`,
    max: `Le titre ne peut pas dépasser ${WORKSHOP_VALIDATION.title.max} caractères`,
  },
  description: {
    max: `La description ne peut pas dépasser ${WORKSHOP_VALIDATION.description.max} caractères`,
    minForPublish:
      "La description doit contenir au moins 30 caractères pour publier",
  },
  date: {
    minimumTomorrow:
      "La date doit être au minimum demain (pas aujourd'hui ni dans le passé)",
  },
  time: {
    invalidFormat: "Format de l'heure invalide (HH:MM)",
  },
  duration: {
    min: `La durée minimum est de ${WORKSHOP_VALIDATION.duration.min} minutes`,
    max: `La durée maximum est de ${
      WORKSHOP_VALIDATION.duration.max / 60
    } heures (${WORKSHOP_VALIDATION.duration.max} minutes)`,
    integer: "La durée doit être un nombre entier",
  },
  durationHours: {
    min: "Les heures doivent être entre 0 et 8",
    max: "Les heures doivent être entre 0 et 8",
  },
  durationMinutes: {
    min: "Les minutes doivent être entre 0 et 59",
    max: "Les minutes doivent être entre 0 et 59",
  },
  location: {
    max: `L'emplacement ne peut pas dépasser ${WORKSHOP_VALIDATION.location.max} caractères`,
  },
  maxParticipants: {
    min: `Le nombre minimum de participants est ${WORKSHOP_VALIDATION.maxParticipants.min}`,
    max: `Le nombre maximum de participants est ${WORKSHOP_VALIDATION.maxParticipants.max}`,
    integer: "Le nombre de participants doit être un nombre entier",
    range: `Le nombre de participants doit être entre ${WORKSHOP_VALIDATION.maxParticipants.min} et ${WORKSHOP_VALIDATION.maxParticipants.max}`,
  },
  materialsNeeded: {
    max: `Les matériaux nécessaires ne peuvent pas dépasser ${WORKSHOP_VALIDATION.materialsNeeded.max} caractères`,
  },
  topic: {
    min: `Le sujet doit contenir au moins ${WORKSHOP_VALIDATION.topic.min} caractères`,
    max: `Le sujet ne peut pas dépasser ${WORKSHOP_VALIDATION.topic.max} caractères`,
  },
} as const;
