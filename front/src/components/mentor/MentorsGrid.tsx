"use client";

import { MentorCard } from "./MentorCard";
import type { MentorBasic } from "@/types/workshop-components";

interface MentorsGridProps {
  mentors: MentorBasic[];
  onViewProfile?: (mentorId: string) => void;
}

export function MentorsGrid({ mentors, onViewProfile }: MentorsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.id}
          mentor={mentor}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
}
