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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Textarea } from "@/components/ui/textarea";

type Role = "PROF" | "APPRENANT";

type Step = "select" | "confirm-features" | "prof-form" | "apprenant-flow";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("select");

  const [profForm, setProfForm] = useState({
    name: "",
    bio: "",
    domain: "",
    photo: null as File | null,
  });

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (session?.user?.name && currentStep === "prof-form") {
      setProfForm((prev) => ({ ...prev, name: session.user.name || "" }));
    }
  }, [session, currentStep]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    setCurrentStep("confirm-features");
  };

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      // Save the role selected
      await customAuthClient.selectRole(selectedRole);
      setIsSubmitting(false);

      if (selectedRole === "PROF") {
        // Go to the prof form
        setCurrentStep("prof-form");
      } else {
        setCurrentStep("apprenant-flow");
        setTimeout(() => {
          router.push("/workshop-room");
        }, 1500);
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

  const handleProfFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Save the prof profile via API
      // await saveProfProfile(profForm);

      toast.success("Profil créé avec succès !");
      setIsSubmitting(false);
      // Redirect to the Workshop Editor
      setTimeout(() => {
        router.push("/workshop-editor");
      }, 1500);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du profil");
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (currentStep === "confirm-features") {
      setCurrentStep("select");
    } else if (currentStep === "prof-form") {
      setCurrentStep("confirm-features");
    } else {
      setCurrentStep("select");
      setSelectedRole(null);
    }
    setIsSubmitting(false);
  };

  if (isSessionPending) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  const getMaxStep = (): number => {
    if (
      selectedRole === "PROF" &&
      (currentStep === "confirm-features" || currentStep === "prof-form")
    ) {
      return 3;
    }
    return 2;
  };

  const getCurrentStepNumber = (): number => {
    switch (currentStep) {
      case "select":
        return 1;
      case "confirm-features":
        return 2;
      case "prof-form":
        return 3;
      case "apprenant-flow":
        return 2;
      default:
        return 1;
    }
  };

  const ProgressIndicator = () => {
    const maxSteps = getMaxStep();
    const currentStepNum = getCurrentStepNumber();
    const steps = [];

    if (
      selectedRole === "PROF" &&
      (currentStep === "confirm-features" || currentStep === "prof-form")
    ) {
      steps.push(
        { number: 1, label: "Choix du rôle", key: "select" },
        { number: 2, label: "Confirmation", key: "confirm" },
        { number: 3, label: "Profil", key: "profile" }
      );
    } else if (selectedRole === "APPRENANT") {
      steps.push(
        { number: 1, label: "Choix du rôle", key: "select" },
        { number: 2, label: "Confirmation", key: "confirm" }
      );
    } else {
      steps.push(
        { number: 1, label: "Choix du rôle", key: "select" },
        { number: 2, label: "Confirmation", key: "confirm" }
      );
    }

    return (
      <div className="mb-8 w-full">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -z-10"
            style={{
              width: `${((currentStepNum - 1) / (maxSteps - 1)) * 100}%`,
            }}
          />
          {steps.map((s) => (
            <div
              key={s.key}
              className="flex flex-col items-center flex-1 relative"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  s.number <= currentStepNum
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white border-2 border-gray-300 text-gray-500"
                }`}
              >
                {s.number < currentStepNum ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  s.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium transition-colors ${
                    s.number <= currentStepNum
                      ? "text-indigo-600"
                      : "text-gray-500"
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

  // Step 1: Role selection
  if (currentStep === "select") {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center space-y-4">
              <ProgressIndicator />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Bienvenue sur LearnSup !
              </CardTitle>
              <CardDescription className="text-lg">
                Choisissez votre rôle pour commencer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("PROF")}
                  className={`p-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
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
                    <h3 className="text-xl font-semibold">Je suis Prof</h3>
                    <p className="text-sm text-gray-600 text-center italic">
                      Je veux partager mes connaissances.
                    </p>
                    {selectedRole === "PROF" && (
                      <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("APPRENANT")}
                  className={`p-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
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
                    <h3 className="text-xl font-semibold">Je suis Apprenant</h3>
                    <p className="text-sm text-gray-600 text-center italic">
                      Je veux apprendre avec d'autres étudiants.
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
      </>
    );
  }

  // Step 2: Confirmation with role features
  if (currentStep === "confirm-features") {
    const profFeatures = [
      "Créez et animez vos propres ateliers",
      "Partagez vos connaissances avec des étudiants",
      "Gérez votre planning et vos disponibilités",
      "Gagnez de la visibilité dans votre domaine",
    ];

    const apprenantFeatures = [
      "Découvrez des mentors passionnés",
      "Rejoignez des ateliers adaptés à votre niveau",
      "Apprenez à votre rythme",
      "Construisez votre réseau d'entraide",
    ];

    const features = selectedRole === "PROF" ? profFeatures : apprenantFeatures;
    const roleLabel = selectedRole === "PROF" ? "Prof" : "Apprenant";
    const isProf = selectedRole === "PROF";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center space-y-4">
            <ProgressIndicator />
            <div
              className={`mx-auto p-4 rounded-full w-fit ${
                isProf ? "bg-indigo-600" : "bg-purple-600"
              }`}
            >
              {isProf ? (
                <BookOpen className="h-8 w-8 text-white" />
              ) : (
                <GraduationCap className="h-8 w-8 text-white" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold">
              Vous êtes {roleLabel} ! 🎉
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
                      isProf ? "text-indigo-600" : "text-purple-600"
                    }`}
                  />
                  <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                </div>
              ))}
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
                onClick={handleConfirmRole}
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

  // Step 2: Prof form
  if (currentStep === "prof-form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center space-y-4">
            <ProgressIndicator />
            <div className="mx-auto p-4 bg-indigo-600 rounded-full w-fit">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Créez votre profil Prof
            </CardTitle>
            <CardDescription className="text-lg">
              Quelques informations pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={profForm.name}
                  onChange={(e) =>
                    setProfForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio courte *</Label>
                <Textarea
                  id="bio"
                  value={profForm.bio}
                  onChange={(e) =>
                    setProfForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  required
                  placeholder="Quelques mots sur vous..."
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">
                  {profForm.bio.length}/200 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domaine d'expertise *</Label>
                <Input
                  id="domain"
                  value={profForm.domain}
                  onChange={(e) =>
                    setProfForm((prev) => ({
                      ...prev,
                      domain: e.target.value,
                    }))
                  }
                  required
                  placeholder="Ex: Mathématiques, Programmation, Design..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo de profil (optionnelle)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProfForm((prev) => ({
                        ...prev,
                        photo: e.target.files?.[0] || null,
                      }))
                    }
                    className="hidden"
                  />
                  <Label
                    htmlFor="photo"
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    Choisir une photo
                  </Label>
                  {profForm.photo && (
                    <span className="text-sm text-gray-600">
                      {profForm.photo.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleGoBack}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !profForm.name ||
                    !profForm.bio ||
                    !profForm.domain
                  }
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Apprenant
  if (currentStep === "apprenant-flow") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center space-y-4">
            <ProgressIndicator />
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

  return null;
}
