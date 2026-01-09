export const WORKSHOP_VALIDATION = {
  title: {
    min: 5,
    max: 200,
  },
  description: {
    max: 100,
  },
  time: {
    regex: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  duration: {
    min: 15,
    max: 480, // 8 hours
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
} as const;

export const WORKSHOP_ERROR_MESSAGES = {
  title: {
    min: `Le titre doit contenir au moins ${WORKSHOP_VALIDATION.title.min} caractères`,
    max: `Le titre ne peut pas dépasser ${WORKSHOP_VALIDATION.title.max} caractères`,
  },
  description: {
    max: `La description ne peut pas dépasser ${WORKSHOP_VALIDATION.description.max} caractères`,
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
    min: `La durée doit être d'au moins ${WORKSHOP_VALIDATION.duration.min} minutes`,
    max: `La durée ne peut pas dépasser ${WORKSHOP_VALIDATION.duration.max} minutes`,
  },
  durationHours: {
    min: `Les heures doivent être entre ${WORKSHOP_VALIDATION.durationHours.min} et ${WORKSHOP_VALIDATION.durationHours.max}`,
    max: `Les heures ne peuvent pas dépasser ${WORKSHOP_VALIDATION.durationHours.max}`,
  },
  durationMinutes: {
    min: `Les minutes doivent être entre ${WORKSHOP_VALIDATION.durationMinutes.min} et ${WORKSHOP_VALIDATION.durationMinutes.max}`,
    max: `Les minutes ne peuvent pas dépasser ${WORKSHOP_VALIDATION.durationMinutes.max}`,
  },
  location: {
    max: `Le lieu ne peut pas dépasser ${WORKSHOP_VALIDATION.location.max} caractères`,
  },
  maxParticipants: {
    range: `Le nombre de participants doit être entre ${WORKSHOP_VALIDATION.maxParticipants.min} et ${WORKSHOP_VALIDATION.maxParticipants.max}`,
  },
  materialsNeeded: {
    max: `Le matériel nécessaire ne peut pas dépasser ${WORKSHOP_VALIDATION.materialsNeeded.max} caractères`,
  },
  topic: {
    min: `Le sujet doit contenir au moins ${WORKSHOP_VALIDATION.topic.min} caractères`,
    max: `Le sujet ne peut pas dépasser ${WORKSHOP_VALIDATION.topic.max} caractères`,
  },
} as const;
