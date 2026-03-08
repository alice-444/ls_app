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
    <div className="min-h-screen flex items-center justify-center bg-ls-bg p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ls-blue/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-2xl shadow-2xl border-ls-border/50 bg-white/80 backdrop-blur-sm relative z-10 py-12">
        <CardHeader className="text-center space-y-8">
          <div className="mx-auto p-6 bg-ls-success/10 rounded-full w-fit animate-bounce">
            <GraduationCap className="h-12 w-12 text-ls-success" />
          </div>
          <div className="space-y-4">
            <CardTitle className="text-4xl font-black text-ls-heading">
              <DecryptedText text="C'est parti !" animateOn="view" speed={50} />
            </CardTitle>
            <CardDescription className="text-xl font-medium text-ls-text-light px-8 leading-relaxed">
              Votre compte apprenant est prêt. Nous vous redirigeons vers votre tableau de bord pour découvrir les meilleurs mentors.
            </CardDescription>
          </div>
          <div className="pt-4 font-bold text-ls-blue">
            <ShinyText text="Préparation de votre espace..." speed={2} />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

