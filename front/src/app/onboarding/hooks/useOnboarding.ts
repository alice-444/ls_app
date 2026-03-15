import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { customAuthClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import type { Role, Step } from "../types";
import type { ProfFormData } from "../schemas";

export function useOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>("Select");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams?.get("role") as Role | null;
    const stepParam = searchParams?.get("step") as Step | null;

    if (roleParam && (roleParam === "MENTOR" || roleParam === "APPRENANT")) {
      setSelectedRole(roleParam);
      if (
        stepParam &&
        (stepParam === "confirm-features" || stepParam === "prof-form")
      ) {
        setCurrentStep(stepParam);
      } else if (roleParam === "MENTOR") {
        setCurrentStep("confirm-features");
      }
    }
  }, [searchParams]);

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

      // Invalider les requêtes de rôle pour que RoleGate voie le changement immédiatement
      await queryClient.invalidateQueries({ queryKey: ["userRole"] });
      await queryClient.invalidateQueries({ queryKey: ["userData"] });

      setIsSubmitting(false);

      if (selectedRole === "MENTOR") {
        setCurrentStep("prof-form");
      } else {
        setCurrentStep("apprenant-flow");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la sélection du rôle",
      );
      setIsSubmitting(false);
    }
  }, [selectedRole, router, queryClient]);

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
                : "Erreur lors de l'upload de la photo",
            );
            setIsSubmitting(false);
            return;
          }
        }

        // Save profile
        await customAuthClient.saveMentorProfile({
          name: data.name,
          bio: data.bio,
          domain: data.domain,
          photoUrl,
          areasOfExpertise: [data.domain], // Use domain as first expertise area
        });

        // Invalider à nouveau après sauvegarde profil
        await queryClient.invalidateQueries({ queryKey: ["userData"] });

        toast.success("Profil créé avec succès !");
        setIsSubmitting(false);
        setTimeout(() => {
          router.push("/workshop-editor");
        }, 1500);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la sauvegarde du profil",
        );
        setIsSubmitting(false);
      }
    },
    [router, queryClient],
  );

  const handleGoBack = useCallback(() => {
    if (currentStep === "confirm-features") {
      setCurrentStep("Select");
    } else if (currentStep === "prof-form") {
      setCurrentStep("confirm-features");
    } else {
      setCurrentStep("Select");
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
