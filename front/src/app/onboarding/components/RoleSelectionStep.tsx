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
}: RoleSelectionStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ls-bg p-4 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ls-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ls-orange/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-2xl shadow-2xl border-ls-border/50 bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-6">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
          <CardTitle className="text-4xl font-black tracking-tight text-ls-heading">
            <DecryptedText 
              text="Bienvenue sur LearnSup !" 
              animateOn="view"
              revealDirection="center"
              speed={40}
            />
          </CardTitle>
          <CardDescription className="text-xl font-medium text-ls-text-light">
            Choisissez votre rôle pour commencer l'aventure
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
            className="w-full h-14 text-lg font-bold rounded-2xl bg-ls-blue hover:bg-ls-blue/90 transition-all shadow-lg hover:shadow-ls-blue/20"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <ShinyText text="Continuer l'aventure" speed={3} />
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

