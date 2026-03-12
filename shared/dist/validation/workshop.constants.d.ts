export declare const WORKSHOP_VALIDATION: {
  readonly title: {
    readonly min: 5;
    readonly max: 100;
  };
  readonly description: {
    readonly max: 100;
  };
  readonly time: {
    readonly regex: RegExp;
  };
  readonly duration: {
    readonly min: 15;
    readonly max: 480;
  };
  readonly durationHours: {
    readonly min: 0;
    readonly max: 8;
  };
  readonly durationMinutes: {
    readonly min: 0;
    readonly max: 59;
  };
  readonly location: {
    readonly max: 200;
  };
  readonly maxParticipants: {
    readonly min: 1;
    readonly max: 1000;
  };
  readonly materialsNeeded: {
    readonly max: 500;
  };
  readonly topic: {
    readonly min: 2;
    readonly max: 50;
  };
  readonly creditCost: {
    readonly min: 20;
    readonly max: 100;
  };
};
export declare const WORKSHOP_ERROR_MESSAGES: {
  readonly title: {
    readonly min: "Le titre doit contenir au moins 5 caractères";
    readonly max: "Le titre ne peut pas dépasser 100 caractères";
  };
  readonly description: {
    readonly max: "La description ne peut pas dépasser 100 caractères";
    readonly minForPublish: "La description doit contenir au moins 30 caractères pour publier";
  };
  readonly date: {
    readonly required: "La date est obligatoire";
    readonly minimumTomorrow: "La date doit être au minimum demain";
  };
  readonly time: {
    readonly required: "L'heure est obligatoire";
    readonly invalidFormat: "L'heure doit être au format HH:MM";
  };
  readonly duration: {
    readonly min: "La durée doit être d'au moins 15 minutes";
    readonly max: "La durée ne peut pas dépasser 480 minutes";
    readonly integer: "La durée doit être un nombre entier";
  };
  readonly durationHours: {
    readonly min: "Les heures doivent être entre 0 et 8";
    readonly max: "Les heures ne peuvent pas dépasser 8";
  };
  readonly durationMinutes: {
    readonly min: "Les minutes doivent être entre 0 et 59";
    readonly max: "Les minutes ne peuvent pas dépasser 59";
  };
  readonly location: {
    readonly max: "Le lieu ne peut pas dépasser 200 caractères";
  };
  readonly maxParticipants: {
    readonly range: "Le nombre de participants doit être entre 1 et 1000";
    readonly min: "Le nombre minimum de participants est 1";
    readonly max: "Le nombre maximum de participants est 1000";
    readonly integer: "Le nombre de participants doit être un nombre entier";
  };
  readonly materialsNeeded: {
    readonly max: "Le matériel nécessaire ne peut pas dépasser 500 caractères";
  };
  readonly topic: {
    readonly min: "Le sujet doit contenir au moins 2 caractères";
    readonly max: "Le sujet ne peut pas dépasser 50 caractères";
  };
  readonly creditCost: {
    readonly min: "Le nombre minimum de crédits est 20";
    readonly max: "Le nombre maximum de crédits est 100";
    readonly integer: "Le nombre de crédits doit être un nombre entier";
  };
};
