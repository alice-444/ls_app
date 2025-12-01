import { useState } from "react";
import { toast } from "sonner";
import { PasswordValidator } from "@/shared/validation/password.validators";

interface UsePasswordFormOptions {
  onSubmit: (data: {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  requireCurrentPassword?: boolean;
}

export function usePasswordForm({
  onSubmit,
  requireCurrentPassword = false,
}: UsePasswordFormOptions) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const matchResult = PasswordValidator.validateMatch(
      newPassword,
      confirmPassword
    );
    if (!matchResult.valid) {
      toast.error(matchResult.error);
      return;
    }

    const passwordResult = PasswordValidator.validate(newPassword);
    if (!passwordResult.valid) {
      toast.error(passwordResult.error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...(requireCurrentPassword && { currentPassword }),
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    setShowCurrentPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    isSubmitting,
    handleSubmit,
    reset,
  };
}
