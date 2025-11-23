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

export function RoleSelectionStep({
  currentStep,
  selectedRole,
  isSubmitting,
  onRoleSelect,
  onContinue,
}: RoleSelectionStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Bienvenue sur LearnSup !
          </CardTitle>
          <CardDescription className="text-lg">
            Choisissez votre rôle pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
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
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

