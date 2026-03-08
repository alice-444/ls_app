"use client";

import { BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import type { Role } from "../types";
import { ROLE_CONFIG } from "../constants";

interface RoleSelectionCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (role: Role) => void;
}

import Magnet from "@/components/ui/Magnet";

export function RoleSelectionCard({
  role,
  isSelected,
  onSelect,
}: RoleSelectionCardProps) {
  const config = ROLE_CONFIG[role];
  const Icon = role === "MENTOR" ? BookOpen : GraduationCap;

  const borderClass = isSelected
    ? role === "MENTOR"
      ? "border-ls-blue bg-ls-blue/5 shadow-ls-blue/10"
      : "border-ls-orange bg-ls-orange/5 shadow-ls-orange/10"
    : "border-ls-border hover:border-ls-blue/50 bg-white/50";

  const iconBgClass = isSelected
    ? role === "MENTOR"
      ? "bg-ls-blue text-white"
      : "bg-ls-orange text-white"
    : role === "MENTOR"
    ? "bg-ls-blue/10 text-ls-blue"
    : "bg-ls-orange/10 text-ls-orange";

  const checkIconClass = isSelected
    ? role === "MENTOR"
      ? "text-ls-blue"
      : "text-ls-orange"
    : "";

  return (
    <Magnet strength={30} className="h-full">
      <button
        type="button"
        onClick={() => onSelect(role)}
        className={`w-full h-full p-8 rounded-2xl border-2 transition-all duration-300 shadow-xl backdrop-blur-sm flex flex-col items-center space-y-6 ${borderClass}`}
      >
        <div className={`p-5 rounded-3xl transition-transform duration-500 ${isSelected ? 'scale-110 rotate-3' : ''} ${iconBgClass}`}>
          <Icon className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-ls-heading">Je suis {config.label}</h3>
          <p className="text-sm text-ls-text-light font-medium leading-relaxed">
            {config.description}
          </p>
        </div>
        <div className="mt-auto pt-4">
          {isSelected ? (
            <CheckCircle2 className={`h-8 w-8 animate-in zoom-in-50 duration-300 ${checkIconClass}`} />
          ) : (
            <div className="h-8 w-8 rounded-full border-2 border-ls-border" />
          )}
        </div>
      </button>
    </Magnet>
  );
}
