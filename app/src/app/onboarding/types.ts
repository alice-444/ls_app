export type Role = "MENTOR" | "APPRENANT";

export type Step =
  | "Select"
  | "confirm-features"
  | "prof-form"
  | "apprenant-flow";

export type { ProfFormData } from "./schemas";

export interface OnboardingState {
  currentStep: Step;
  selectedRole: Role | null;
  isSubmitting: boolean;
}
