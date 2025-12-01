"use client";

import { MiniProfileModal } from "@/components/apprentice/MiniProfileModal";
import { MentorProfileModal } from "@/components/mentor/MentorProfileModal";

interface ProfileModalManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userRole: "MENTOR" | "APPRENANT" | null;
}

export function ProfileModalManager({
  open,
  onOpenChange,
  userId,
  userRole,
}: ProfileModalManagerProps) {
  if (!open || !userId) {
    return null;
  }

  if (userRole === "APPRENANT") {
    return (
      <MiniProfileModal
        open={open}
        onOpenChange={onOpenChange}
        apprenticeUserId={userId}
      />
    );
  }

  if (userRole === "MENTOR") {
    return (
      <MentorProfileModal
        open={open}
        onOpenChange={onOpenChange}
        mentorId={userId}
      />
    );
  }

  return null;
}
