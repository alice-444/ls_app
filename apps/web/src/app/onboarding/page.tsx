"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { useOnboarding } from "./hooks/useOnboarding";
import { RoleSelectionStep } from "./components/RoleSelectionStep";
import { RoleConfirmationStep } from "./components/RoleConfirmationStep";
import { ProfFormStep } from "./components/ProfFormStep";
import { ApprenantCompleteStep } from "./components/ApprenantCompleteStep";
import type { Role, Step } from "./types";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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


  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  switch (currentStep) {
    case "select":
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
}
