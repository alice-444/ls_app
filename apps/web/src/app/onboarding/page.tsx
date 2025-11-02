"use client";

import { authClient, customAuthClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Loader from "@/components/loader";

type Role = "PROF" | "APPRENANT";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "select" | "prof-flow" | "apprenant-flow"
  >("select");

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await customAuthClient.selectRole(selectedRole);

      // Proceed to the onboarding stage according to the role
      setIsSubmitting(false);
      if (selectedRole === "PROF") {
        setCurrentStep("prof-flow");
      } else {
        setCurrentStep("apprenant-flow");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la sélection du rôle"
      );
      setIsSubmitting(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement the onboarding flow for completing profile mentor or apprentice
      toast.success("Onboarding terminé avec succès !");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erreur lors de la finalisation de l'onboarding");
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    setCurrentStep("select");
    setSelectedRole(null);
    setIsSubmitting(false);
  };

  if (isSessionPending) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  // Progress indicator with steps
  const ProgressIndicator = ({ step }: { step: number }) => {
    const steps = [
      { number: 1, label: "Sélection du rôle", key: "select" },
      { number: 2, label: "Configuration", key: "config" },
    ];

    return (
      <div className="mb-8 w-full">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -z-10"
            style={{
              width: `${((step - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
          {steps.map((s, index) => (
            <div
              key={s.key}
              className="flex flex-col items-center flex-1 relative"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  s.number <= step
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white border-2 border-gray-300 text-gray-500"
                }`}
              >
                {s.number < step ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  s.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium transition-colors ${
                    s.number <= step ? "text-indigo-600" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Step 1 : Role selection
  if (currentStep === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center space-y-4">
            <ProgressIndicator step={1} />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bienvenue sur LearnSup !
            </CardTitle>
            <CardDescription className="text-lg">
              Choisissez votre rôle pour commencer votre parcours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Prof option */}
              <button
                type="button"
                onClick={() => handleRoleSelect("PROF")}
                className={`p-6 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  selectedRole === "PROF"
                    ? "border-indigo-600 bg-indigo-50 shadow-lg"
                    : "border-gray-200 hover:border-indigo-300 bg-white"
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`p-4 rounded-full ${
                      selectedRole === "PROF"
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Prof</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Partagez vos connaissances et guidez des étudiants dans leur
                    apprentissage
                  </p>
                  {selectedRole === "PROF" && (
                    <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
              </button>

              {/* Apprentice option */}
              <button
                type="button"
                onClick={() => handleRoleSelect("APPRENANT")}
                className={`p-6 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  selectedRole === "APPRENANT"
                    ? "border-purple-600 bg-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 bg-white"
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`p-4 rounded-full ${
                      selectedRole === "APPRENANT"
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Apprenant</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Apprenez de nouveaux sujets et recevez de l'aide de mentors
                    expérimentés
                  </p>
                  {selectedRole === "APPRENANT" && (
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                  )}
                </div>
              </button>
            </div>

            <Button
              onClick={handleContinue}
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

  // Step 2 : Onboarding specific to the Prof
  if (currentStep === "prof-flow") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center space-y-4">
            <ProgressIndicator step={2} />
            <div className="mx-auto p-4 bg-indigo-600 rounded-full w-fit">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Bienvenue, Prof !
            </CardTitle>
            <CardDescription className="text-lg">
              Configurez votre profil pour commencer à enseigner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-2">
                  Ce que vous pouvez faire :
                </h4>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-indigo-600" />
                    <span>Créer et animer des ateliers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-indigo-600" />
                    <span>Aider des étudiants dans leur apprentissage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-indigo-600" />
                    <span>Partager vos connaissances et expériences</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-indigo-600" />
                    <span>Gagner des crédits en enseignant</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleGoBack}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Changer de rôle
              </Button>
              <Button
                onClick={handleCompleteOnboarding}
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
                    Commencer à enseigner
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

  // Step 2 : Onboarding specific to the Apprenant
  if (currentStep === "apprenant-flow") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center space-y-4">
            <ProgressIndicator step={2} />
            <div className="mx-auto p-4 bg-purple-600 rounded-full w-fit">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Bienvenue, Apprenant !
            </CardTitle>
            <CardDescription className="text-lg">
              Commencez votre parcours d'apprentissage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Ce que vous pouvez faire :
                </h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-purple-600" />
                    <span>Suivre des ateliers avec des profs expérimentés</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-purple-600" />
                    <span>Demander de l'aide sur des sujets difficiles</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-purple-600" />
                    <span>Recevoir des recommandations personnalisées</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-purple-600" />
                    <span>Suivre votre progression d'apprentissage</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleGoBack}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Changer de rôle
              </Button>
              <Button
                onClick={handleCompleteOnboarding}
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
                    Commencer à apprendre
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

  return null;
}
