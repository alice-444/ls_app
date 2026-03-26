"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";
import { RoleSelectionCard } from "./RoleSelectionCard";
import type { Role, Step } from "../types";

interface RoleSelectionStepProps {
  currentStep: Step;
  selectedRole: Role | null;
  isSubmitting: boolean;
  onRoleSelect: (role: Role) => void;
  onContinue: () => void;
}

import DecryptedText from "@/components/ui/DecryptedText";
import ShinyText from "@/components/ui/ShinyText";

export function RoleSelectionStep({
  currentStep,
  selectedRole,
  isSubmitting,
  onRoleSelect,
  onContinue,
}: Readonly<RoleSelectionStepProps>) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations - consistent with LearnSup */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#26547c]/5 dark:bg-[#4A90E2]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB647]/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-2xl shadow-2xl border-gray-100 dark:border-white/10 bg-white dark:bg-[#111827] relative z-10">
        <CardHeader className="text-center space-y-6">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
          <CardTitle className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            <DecryptedText
              text="Bienvenue sur LearnSup !"
              animateOn="view"
              revealDirection="center"
              speed={40}
            />
          </CardTitle>
          <CardDescription className="text-xl font-medium text-slate-500 dark:text-slate-400">
            Choisissez votre rôle pour commencer l'aventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <RoleSelectionCard
              role="MENTOR"
              isSelected={selectedRole === "MENTOR"}
              onSelect={onRoleSelect}
            />
            <RoleSelectionCard
              role="APPRENANT"
              isSelected={selectedRole === "APPRENANT"}
              onSelect={onRoleSelect}
            />
          </div>

          <Button
            onClick={onContinue}
            disabled={!selectedRole || isSubmitting}
            className="w-full h-14 text-lg font-bold rounded-full bg-[#FFB647] hover:bg-[#FFB647]/90 text-[#26547c] transition-all shadow-lg shadow-[#FFB647]/20"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <ShinyText text="Continuer l'aventure" speed={3} className="text-[#26547c]" />
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

