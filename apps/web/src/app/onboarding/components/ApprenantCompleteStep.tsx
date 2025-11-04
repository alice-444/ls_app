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

export function ApprenantCompleteStep({
  currentStep,
  selectedRole,
}: ApprenantCompleteStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
          <div className="mx-auto p-4 bg-purple-600 rounded-full w-fit">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Bienvenue dans le Workshop Room 👋
          </CardTitle>
          <CardDescription className="text-lg">
            La salle virtuelle où l'apprenant découvre et rejoint l'atelier.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

