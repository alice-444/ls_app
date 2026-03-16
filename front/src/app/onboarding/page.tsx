"use client";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/shared/Loader";
import { useOnboarding } from "./hooks/useOnboarding";
import { RoleSelectionStep } from "./components/RoleSelectionStep";
import { RoleConfirmationStep } from "./components/RoleConfirmationStep";
import { ProfFormStep } from "./components/ProfFormStep";
import { ApprenantCompleteStep } from "./components/ApprenantCompleteStep";

import { Progress } from "@/components/ui/Progress";
import { ModeToggle } from "@/components/shared/ModeToggle";

function OnboardingContent() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const {
    currentStep,
    selectedRole,
    isSubmitting,
    handleRoleSelect,
    handleContinue,
    handleConfirmRole,
    handleProfFormSubmit,
    handleGoBack,
  } = useOnboarding();

  // Calcul du pourcentage de progression
  const stepProgress = {
    "Select": 25,
    "confirm-features": 50,
    "prof-form": 75,
    "apprenant-flow": 100
  };
  const progress = stepProgress[currentStep] || 0;

  if (isSessionPending) return <Loader />;
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0510] transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="w-full max-w-2xl mx-auto pt-8 px-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Étape {Object.keys(stepProgress).indexOf(currentStep) + 1} sur 4
          </span>
          <span className="text-xs font-semibold text-primary">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {(() => {
          switch (currentStep) {
            case "Select":
              return (
                <RoleSelectionStep
                  currentStep={currentStep}
                  selectedRole={selectedRole}
                  isSubmitting={isSubmitting}
                  onRoleSelect={handleRoleSelect}
                  onContinue={handleContinue}
                />
              );

            case "confirm-features":
              if (!selectedRole) return null;
              return (
                <RoleConfirmationStep
                  selectedRole={selectedRole}
                  currentStep={currentStep}
                  isSubmitting={isSubmitting}
                  onGoBack={handleGoBack}
                  onConfirm={handleConfirmRole}
                />
              );

            case "prof-form":
              if (!selectedRole) return null;
              return (
                <ProfFormStep
                  currentStep={currentStep}
                  selectedRole={selectedRole}
                  defaultName={session?.user?.name || ""}
                  isSubmitting={isSubmitting}
                  onGoBack={handleGoBack}
                  onSubmit={handleProfFormSubmit}
                />
              );

            case "apprenant-flow":
              if (!selectedRole) return null;
              return (
                <ApprenantCompleteStep
                  currentStep={currentStep}
                  selectedRole={selectedRole}
                />
              );

            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<Loader />}>
      <OnboardingContent />
    </Suspense>
  );
}
