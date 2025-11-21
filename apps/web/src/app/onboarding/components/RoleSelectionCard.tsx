"use client";

import { BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import type { Role } from "../types";
import { ROLE_CONFIG } from "../constants";

interface RoleSelectionCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (role: Role) => void;
}

export function RoleSelectionCard({
  role,
  isSelected,
  onSelect,
}: RoleSelectionCardProps) {
  const config = ROLE_CONFIG[role];
  const Icon = role === "MENTOR" ? BookOpen : GraduationCap;

  const borderClass = isSelected
    ? role === "MENTOR"
      ? "border-indigo-600 bg-indigo-50"
      : "border-purple-600 bg-purple-50"
    : "border-gray-200 hover:border-indigo-300 bg-white";

  const iconBgClass = isSelected
    ? role === "MENTOR"
      ? "bg-indigo-600 text-white"
      : "bg-purple-600 text-white"
    : role === "MENTOR"
    ? "bg-indigo-100 text-indigo-600"
    : "bg-purple-100 text-purple-600";

  const checkIconClass = isSelected
    ? role === "MENTOR"
      ? "text-indigo-600"
      : "text-purple-600"
    : "";

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`p-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 shadow-lg ${borderClass}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className={`p-4 rounded-full ${iconBgClass}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold">Je suis {config.label}</h3>
        <p className="text-sm text-gray-600 text-center italic">
          {config.description}
        </p>
        {isSelected && <CheckCircle2 className={`h-6 w-6 ${checkIconClass}`} />}
      </div>
    </button>
  );
}
