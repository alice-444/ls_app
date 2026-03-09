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
      ? "border-[#26547c] bg-[#26547c]/5 shadow-[#26547c]/10 dark:border-blue-400 dark:bg-blue-400/10"
      : "border-[#FFB647] bg-[#FFB647]/5 shadow-[#FFB647]/10 dark:border-orange-400 dark:bg-orange-400/10"
    : "border-gray-200 dark:border-white/10 hover:border-[#26547c]/50 dark:hover:border-blue-400/50 bg-white/50 dark:bg-white/5";

  const iconBgClass = isSelected
    ? role === "MENTOR"
      ? "bg-[#26547c] text-white"
      : "bg-[#FFB647] text-white"
    : role === "MENTOR"
    ? "bg-[#26547c]/10 text-[#26547c] dark:bg-blue-400/20 dark:text-blue-300"
    : "bg-[#FFB647]/10 text-[#FFB647] dark:bg-orange-400/20 dark:text-orange-300";

  const checkIconClass = isSelected
    ? role === "MENTOR"
      ? "text-[#26547c] dark:text-blue-400"
      : "text-[#FFB647] dark:text-orange-400"
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
          <h3 className="text-2xl font-black text-[#26547c] dark:text-white">Je suis {config.label}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
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
