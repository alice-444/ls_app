"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, BookOpen, GraduationCap } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";
import type { Role, Step } from "../types";
import { ROLE_CONFIG } from "../constants";

interface RoleConfirmationStepProps {
  selectedRole: Role;
  currentStep: Step;
  isSubmitting: boolean;
  onGoBack: () => void;
  onConfirm: () => void;
}

export function RoleConfirmationStep({
  selectedRole,
  currentStep,
  isSubmitting,
  onGoBack,
  onConfirm,
}: Readonly<RoleConfirmationStepProps>) {
  const config = ROLE_CONFIG[selectedRole];
  const features = config.features;
  const Icon = selectedRole === "MENTOR" ? BookOpen : GraduationCap;

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#26547c]/5 dark:bg-[#4A90E2]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB647]/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-2xl shadow-2xl border-gray-100 dark:border-white/10 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md relative z-10">
        <CardHeader className="text-center space-y-6">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
          <div
            className={`mx-auto p-4 rounded-full w-fit ${selectedRole === "MENTOR" ? "bg-[#26547c]" : "bg-[#FFB647]"
              }`}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-black text-[#26547c] dark:text-white">
            Tu es {config.label} !
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            Découvre ce que tu peux faire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-4 sm:px-8">
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-[#26547c]/10 dark:hover:border-white/10 transition-colors"
              >
                <CheckCircle2
                  className={`h-5 w-5 mt-0.5 shrink-0 ${selectedRole === "MENTOR" ? "text-[#26547c] dark:text-blue-400" : "text-[#FFB647]"
                    }`}
                />
                <p className="text-slate-700 dark:text-slate-200 font-medium">{feature}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onGoBack}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1 h-12 rounded-full border-gray-200 dark:border-white/10"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Changer de rôle
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`flex-1 h-12 text-lg font-bold rounded-full transition-all shadow-lg ${selectedRole === "MENTOR"
                ? "bg-[#26547c] hover:bg-[#26547c]/90 text-white"
                : "bg-[#FFB647] hover:bg-[#FFB647]/90 text-[#26547c]"
                }`}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  Confirmer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
