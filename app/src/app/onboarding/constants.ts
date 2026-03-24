import type { Role } from "./types";

export const MENTOR_FEATURES = [
  "Créez et animez vos propres ateliers",
  "Partagez vos connaissances avec des étudiants",
  "Gérez votre planning et vos disponibilités",
  "Gagnez de la visibilité dans votre domaine",
] as const;

export const APPRENANT_FEATURES = [
  "Découvrez des mentors passionnés",
  "Rejoignez des ateliers adaptés à votre niveau",
  "Apprenez à votre rythme",
  "Construisez votre réseau d'entraide",
] as const;

export const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    description: string;
    features: readonly string[];
    color: {
      primary: string;
      secondary: string;
      bg: string;
    };
  }
> = {
  MENTOR: {
    label: "Mentor",
    description: "Je veux partager mes connaissances.",
    features: MENTOR_FEATURES,
    color: {
      primary: "indigo-600",
      secondary: "indigo-50",
      bg: "indigo-100",
    },
  },
  APPRENANT: {
    label: "Apprenant",
    description: "Je veux apprendre avec d'autres étudiants.",
    features: APPRENANT_FEATURES,
    color: {
      primary: "purple-600",
      secondary: "purple-50",
      bg: "purple-100",
    },
  },
};

export const STEP_CONFIG = {
  select: {
    number: 1,
    label: "Choix du rôle",
    key: "Select",
  },
  "confirm-features": {
    number: 2,
    label: "Confirmation",
    key: "confirm",
  },
  "prof-form": {
    number: 3,
    label: "Profil",
    key: "profile",
  },
} as const;
