"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";
import type { Role, Step } from "../types";
import { ROLE_CONFIG } from "../constants";
import { BookOpen, GraduationCap } from "lucide-react";

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
}: RoleConfirmationStepProps) {
  const config = ROLE_CONFIG[selectedRole];
  const features = config.features;
  const Icon = selectedRole === "MENTOR" ? BookOpen : GraduationCap;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
          <div
            className={`mx-auto p-4 rounded-full w-fit ${
              selectedRole === "MENTOR" ? "bg-indigo-600" : "bg-purple-600"
            }`}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Vous êtes {config.label} ! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            Découvrez ce que vous pouvez faire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                  <CheckCircle2
                    className={`h-5 w-5 mt-0.5 shrink-0 ${
                      selectedRole === "MENTOR" ? "text-indigo-600" : "text-purple-600"
                    }`}
                  />
                <p className="text-gray-700 dark:text-gray-300">{feature}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onGoBack}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Changer de rôle
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1"
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

