"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";
import type { Role, Step } from "../types";

interface ApprenantCompleteStepProps {
  currentStep: Step;
  selectedRole: Role;
}

import DecryptedText from "@/components/ui/DecryptedText";
import ShinyText from "@/components/ui/ShinyText";

export function ApprenantCompleteStep({
  currentStep,
  selectedRole,
}: ApprenantCompleteStepProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#26547c]/5 dark:bg-[#4A90E2]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-2xl shadow-2xl border-gray-100 dark:border-white/10 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md relative z-10 py-12">
        <CardHeader className="text-center space-y-8">
          <div className="mx-auto p-6 bg-green-50 rounded-full w-fit animate-bounce">
            <GraduationCap className="h-12 w-12 text-green-600" />
          </div>
          <div className="space-y-4">
            <CardTitle className="text-4xl font-black text-[#26547c]">
              <DecryptedText text="C'est parti !" animateOn="view" speed={50} />
            </CardTitle>
            <CardDescription className="text-xl font-medium text-gray-500 px-8 leading-relaxed">
              Votre compte apprenant est prêt. Nous vous redirigeons vers votre tableau de bord pour découvrir les meilleurs mentors.
            </CardDescription>
          </div>
          <div className="pt-4 font-bold text-[#26547c]">
            <ShinyText text="Préparation de votre espace..." speed={2} className="text-[#26547c]" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

