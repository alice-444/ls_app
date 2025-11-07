export type Role = "PROF" | "APPRENANT";

export type Step = "select" | "confirm-features" | "prof-form" | "apprenant-flow";

export type { ProfFormData } from "./schemas";

export interface OnboardingState {
  currentStep: Step;
  selectedRole: Role | null;
  isSubmitting: boolean;
}

