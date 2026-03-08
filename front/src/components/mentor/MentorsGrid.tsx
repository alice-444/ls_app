"use client";

import { motion } from "framer-motion";
import { MentorCard } from "./MentorCard";
import type { MentorBasic } from "@/types/workshop-components";

interface MentorsGridProps {
  mentors: MentorBasic[];
  onViewProfile?: (mentorId: string) => void;
}

export function MentorsGrid({ mentors, onViewProfile }: MentorsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mentors.map((mentor, index) => (
        <motion.div
          key={mentor.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
        >
          <MentorCard
            mentor={mentor}
            onViewProfile={onViewProfile}
          />
        </motion.div>
      ))}
    </div>
  );
}
