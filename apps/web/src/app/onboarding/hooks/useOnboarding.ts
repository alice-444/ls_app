import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { customAuthClient } from "@/lib/auth-client";
import type { Role, Step } from "../types";
import type { ProfFormData } from "../schemas";

export function useOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedRole) return;
    setCurrentStep("confirm-features");
  }, [selectedRole]);

  const handleConfirmRole = useCallback(async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await customAuthClient.selectRole(selectedRole);
      setIsSubmitting(false);

      if (selectedRole === "PROF") {
        setCurrentStep("prof-form");
      } else {
        setCurrentStep("apprenant-flow");
        setTimeout(() => {
          router.push("/workshop-room");
        }, 1500);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la sélection du rôle"
      );
      setIsSubmitting(false);
    }
  }, [selectedRole, router]);

  const handleProfFormSubmit = useCallback(
    async (data: ProfFormData) => {
      setIsSubmitting(true);

      try {
        let photoUrl: string | null = null;

        // Upload photo if provided
        if (data.photo) {
          try {
            const uploadResult = await customAuthClient.uploadPhoto(data.photo);
            photoUrl = uploadResult.photoUrl;
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Erreur lors de l'upload de la photo"
            );
            setIsSubmitting(false);
            return;
          }
        }

        // Save profile
        await customAuthClient.saveProfProfile({
          name: data.name,
          bio: data.bio,
          domain: data.domain,
          photoUrl,
        });

        toast.success("Profil créé avec succès !");
        setIsSubmitting(false);
        setTimeout(() => {
          router.push("/workshop-editor");
        }, 1500);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la sauvegarde du profil"
        );
        setIsSubmitting(false);
      }
    },
    [router]
  );

  const handleGoBack = useCallback(() => {
    if (currentStep === "confirm-features") {
      setCurrentStep("select");
    } else if (currentStep === "prof-form") {
      setCurrentStep("confirm-features");
    } else {
      setCurrentStep("select");
      setSelectedRole(null);
    }
    setIsSubmitting(false);
  }, [currentStep]);

  return {
    currentStep,
    selectedRole,
    isSubmitting,
    handleRoleSelect,
    handleContinue,
    handleConfirmRole,
    handleProfFormSubmit,
    handleGoBack,
  };
}

