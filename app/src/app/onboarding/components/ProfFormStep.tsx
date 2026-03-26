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
import { ArrowLeft, ArrowRight, Loader2, BookOpen, Upload, X } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";
import { profFormSchema } from "../schemas";
import type { ProfFormData } from "../schemas";
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
}: Readonly<ProfFormStepProps>) {
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
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#26547c]/5 dark:bg-[#4A90E2]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB647]/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-2xl shadow-2xl border-gray-100 dark:border-white/10 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md relative z-10">
        <CardHeader className="text-center space-y-6">
          <ProgressIndicator
            currentStep={currentStep}
            selectedRole={selectedRole}
          />
          <div className="mx-auto p-4 bg-[#26547c] rounded-full w-fit">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-black text-[#26547c] dark:text-white">
            Créez votre profil Mentor
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            Quelques informations pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-200 font-semibold">Nom complet *</Label>
              <Input id="name" {...register("name")} placeholder="Ton nom" className="h-12 rounded-xl" />
              {errors.name && (
                <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-700 dark:text-slate-200 font-semibold">Bio courte *</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Quelques mots sur toi..."
                rows={3}
                maxLength={250}
                className="rounded-xl resize-none"
              />
              <div className="flex justify-between items-center">
                {errors.bio && (
                  <p className="text-sm text-red-500 font-medium">{errors.bio.message}</p>
                )}
                <p className="text-xs text-slate-500 ml-auto">
                  {bioLength}/250 caractères
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="text-slate-700 dark:text-slate-200 font-semibold">Domaine d'expertise *</Label>
              <Input
                id="domain"
                {...register("domain")}
                placeholder="Ex: Mathématiques, Programmation, Design..."
                className="h-12 rounded-xl"
              />
              {errors.domain && (
                <p className="text-sm text-red-500 font-medium">{errors.domain.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="text-slate-700 dark:text-slate-200 font-semibold">Photo de profil (optionnelle)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  {...register("photo")}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setValue("photo", file, {
                      shouldValidate: true,
                    });
                  }}
                  className="hidden"
                />
                {watch("photo") ? (
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate max-w-[150px]">
                        {watch("photo") instanceof File ? (watch("photo") as File).name : "Photo sélectionnée"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setValue("photo", null, { shouldValidate: true })}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Supprimer la photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Label
                      htmlFor="photo"
                      className="text-xs text-[#26547c] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Modifier
                    </Label>
                  </div>
                ) : (
                  <Label
                    htmlFor="photo"
                    className="flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Choisir une photo
                  </Label>
                )}
              </div>
              {errors.photo && (
                <p className="text-sm text-red-500 font-medium">{errors.photo.message}</p>
              )}
              <p className="text-xs text-slate-500">
                Formats acceptés : JPG, PNG. Taille max : 5 Mo
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                onClick={onGoBack}
                disabled={isSubmitting || isFormSubmitting}
                variant="outline"
                className="flex-1 h-12 rounded-full"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isFormSubmitting}
                className="flex-1 h-12 rounded-full bg-[#26547c] hover:bg-[#26547c]/90 text-white font-bold text-lg transition-all shadow-lg"
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
