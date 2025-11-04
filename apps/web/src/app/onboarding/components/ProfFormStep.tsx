"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, BookOpen, Upload } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";
import { profFormSchema, type ProfFormData } from "../schemas";
import type { Role, Step } from "../types";

interface ProfFormStepProps {
  currentStep: Step;
  selectedRole: Role;
  defaultName?: string;
  isSubmitting: boolean;
  onGoBack: () => void;
  onSubmit: (data: ProfFormData) => Promise<void>;
}

export function ProfFormStep({
  currentStep,
  selectedRole,
  defaultName = "",
  isSubmitting,
  onGoBack,
  onSubmit,
}: ProfFormStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
    watch,
    setValue,
  } = useForm<ProfFormData>({
    resolver: zodResolver(profFormSchema),
    defaultValues: {
      name: defaultName,
      bio: "",
      domain: "",
      photo: null,
    },
  });

  const bioLength = watch("bio")?.length || 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input id="name" {...register("name")} placeholder="Ton nom" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio courte *</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Quelques mots sur toi..."
                rows={3}
                maxLength={250}
              />
              <div className="flex justify-between items-center">
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {bioLength}/250 caractères
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domaine d'expertise *</Label>
              <Input
                id="domain"
                {...register("domain")}
                placeholder="Ex: Mathématiques, Programmation, Design..."
              />
              {errors.domain && (
                <p className="text-sm text-red-500">{errors.domain.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo de profil (optionnelle)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  {...register("photo")}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setValue("photo", file, {
                      shouldValidate: file !== null,
                    });
                  }}
                  className="hidden"
                />
                <Label
                  htmlFor="photo"
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  Choisir une photo
                </Label>
                {watch("photo") && (
                  <span className="text-sm text-gray-600">
                    {watch("photo")?.name}
                  </span>
                )}
              </div>
              {errors.photo && (
                <p className="text-sm text-red-500">{errors.photo.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Formats acceptés : JPG, PNG. Taille max : 5 Mo
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onGoBack}
                disabled={isSubmitting || isFormSubmitting}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isFormSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting || isFormSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
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
