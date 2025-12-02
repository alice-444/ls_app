"use client";

import { CheckCircle2 } from "lucide-react";
import type { Role, Step } from "../types";
import { STEP_CONFIG } from "../constants";

interface ProgressIndicatorProps {
  currentStep: Step;
  selectedRole: Role | null;
}

export function ProgressIndicator({
  currentStep,
  selectedRole,
}: ProgressIndicatorProps) {
  const maxSteps = getMaxSteps(selectedRole, currentStep);
  const currentStepNum = getCurrentStepNumber(currentStep);
  const steps = buildSteps(selectedRole, currentStep);

  const progressPercentage = ((currentStepNum - 1) / (maxSteps - 1)) * 100;

  return (
    <div className="mb-8 w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -z-10"
          style={{ width: `${progressPercentage}%` }}
        />
        {steps.map((step) => (
          <div
            key={step.key}
            className="flex flex-col items-center flex-1 relative"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step.number <= currentStepNum
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white border-2 border-gray-300 text-gray-500"
              }`}
            >
              {step.number < currentStepNum ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                step.number
              )}
            </div>
            <div className="mt-2 text-center">
              <p
                className={`text-xs font-medium transition-colors ${
                  step.number <= currentStepNum
                    ? "text-indigo-600"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getMaxSteps(selectedRole: Role | null, currentStep: Step): number {
  if (
    selectedRole === "MENTOR" &&
    (currentStep === "confirm-features" || currentStep === "prof-form")
  ) {
    return 3;
  }
  return 2;
}

function getCurrentStepNumber(currentStep: Step): number {
  switch (currentStep) {
    case "select":
      return 1;
    case "confirm-features":
      return 2;
    case "prof-form":
      return 3;
    case "apprenant-flow":
      return 2;
    default:
      return 1;
  }
}

function buildSteps(selectedRole: Role | null, currentStep: Step) {
  if (
    selectedRole === "MENTOR" &&
    (currentStep === "confirm-features" || currentStep === "prof-form")
  ) {
    return [
      STEP_CONFIG.select,
      STEP_CONFIG["confirm-features"],
      STEP_CONFIG["prof-form"],
    ];
  }

  return [STEP_CONFIG.select, STEP_CONFIG["confirm-features"]];
}

