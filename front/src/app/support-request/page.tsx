"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-client";
import { BackButton } from "@/components/back-button";

const supportRequestSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  subject: z
    .string()
    .min(1, "L'objet est requis")
    .max(200, "L'objet ne peut pas dépasser 200 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(5000, "La description ne peut pas dépasser 5000 caractères"),
  problemType: z.string().min(1, "Le type de problème est requis"),
  attachments: z.array(z.instanceof(File)).optional(),
});

type SupportRequestFormData = z.infer<typeof supportRequestSchema>;

const problemTypes = [
  "Problème technique",
  "Question sur le compte",
  "Problème de facturation",
  "Suggestion d'amélioration",
  "Signalement de bug",
  "Autre",
];

export default function SupportRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SupportRequestFormData>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      email: "",
      subject: "",
      description: "",
      problemType: "",
    },
  });

  const problemType = watch("problemType");

  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_TOTAL_FILES = 5;
  const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  const validateFiles = (
    newFiles: File[]
  ): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    if (files.length + newFiles.length > MAX_TOTAL_FILES) {
      errors.push(`Maximum ${MAX_TOTAL_FILES} fichiers autorisés`);
      return { valid, errors };
    }

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} : Taille maximale de 10 MB dépassée`);
        continue;
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        errors.push(
          `${file.name} : Type de fichier non autorisé. Types acceptés : JPG, PNG, PDF, TXT, DOC, DOCX`
        );
        continue;
      }

      valid.push(file);
    }

    return { valid, errors };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const { valid, errors } = validateFiles(selectedFiles);

    if (errors.length > 0) {
      setFileErrors(errors);
      toast.error(errors.join(", "));
      return;
    }

    setFileErrors([]);
    setFiles((prev) => {
      const newFiles = [...prev, ...valid];
      setValue("attachments", newFiles);
      return newFiles;
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const { valid, errors } = validateFiles(droppedFiles);

    if (errors.length > 0) {
      setFileErrors(errors);
      toast.error(errors.join(", "));
      return;
    }

    setFileErrors([]);
    setFiles((prev) => {
      const newFiles = [...prev, ...valid];
      setValue("attachments", newFiles);
      return newFiles;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setValue("attachments", newFiles);
  };

  const onSubmit = async (data: SupportRequestFormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("subject", data.subject);
      formData.append("description", data.description);
      formData.append("problemType", data.problemType);

      if (files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/support-request`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi de la demande");
      }

      toast.success(
        result.message || "Votre demande a été envoyée avec succès !"
      );
      router.push("/help");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de la demande. Veuillez réessayer.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <BackButton href="/help" label="Retour à l'aide" />

      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Contacter le support
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          Comment pouvons-nous t'aider aujourd'hui ?
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-[#FF8C42]/10 dark:bg-[#FF8C42]/5 border border-[#FF8C42]/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-3">
                  Décris ton problème
                </h2>
                <p className="text-[rgba(38,84,124,0.8)] dark:text-[rgba(230,230,230,0.8)] text-sm leading-relaxed">
                  Décris le problème que tu rencontres avec autant de détails
                  que possible. Cela nous aidera à comprendre ce qui se passe et
                  à te fournir la meilleure solution.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[#26547c] dark:text-[#e6e6e6] font-semibold"
                >
                  Ton adresse e-mail <span className="text-[#FF8C42]">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  {...register("email")}
                  className={cn(
                    "border-[#d6dae4] dark:border-[#d6dae4] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-xl",
                    errors.email && "border-red-500 dark:border-red-400"
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-[#26547c] dark:text-[#e6e6e6] font-semibold"
                >
                  Objet <span className="text-[#FF8C42]">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="Résumé de ton problème"
                  maxLength={200}
                  {...register("subject")}
                  className={cn(
                    "border-[#d6dae4] dark:border-[#d6dae4] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-xl",
                    errors.subject && "border-red-500 dark:border-red-400"
                  )}
                />
                <div className="flex justify-between items-center">
                  {errors.subject && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.subject.message}
                    </p>
                  )}
                  <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] ml-auto">
                    {watch("subject")?.length || 0}/200
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-[#26547c] dark:text-[#e6e6e6] font-semibold"
                >
                  Description <span className="text-[#FF8C42]">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décris ton problème en détail..."
                  rows={6}
                  maxLength={5000}
                  {...register("description")}
                  className={cn(
                    "border-[#d6dae4] dark:border-[#d6dae4] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-xl resize-none",
                    errors.description && "border-red-500 dark:border-red-400"
                  )}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.description.message}
                    </p>
                  )}
                  <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] ml-auto">
                    {watch("description")?.length || 0}/5000
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="problemType"
                  className="text-[#26547c] dark:text-[#e6e6e6] font-semibold"
                >
                  Type de problème <span className="text-[#FF8C42]">*</span>
                </Label>
                <Select
                  value={problemType}
                  onValueChange={(value) => setValue("problemType", value)}
                >
                  <SelectTrigger
                    id="problemType"
                    className={cn(
                      "border-[#d6dae4] dark:border-[#d6dae4] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-xl",
                      errors.problemType && "border-red-500 dark:border-red-400"
                    )}
                  >
                    <SelectValue placeholder="Sélectionne une option..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1a1720] border-[#d6dae4]">
                    {problemTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-[#26547c] dark:text-[#e6e6e6]"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.problemType && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.problemType.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="attachments"
              className="text-[#26547c] dark:text-[#e6e6e6] font-semibold"
            >
              Pièces jointes{" "}
              <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] font-normal">
                (max {MAX_TOTAL_FILES} fichiers, 10 MB chacun)
              </span>
            </Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              aria-label="Zone de dépôt de fichiers. Glissez-déposez des fichiers ou cliquez pour les sélectionner."
              className={cn(
                "w-full border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 bg-transparent cursor-pointer",
                isDragging
                  ? "border-[#FF8C42] bg-[#FF8C42]/5"
                  : "border-[#d6dae4] dark:border-[#d6dae4] hover:border-[#FF8C42]/50"
              )}
            >
              <input
                ref={fileInputRef}
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx"
              />
              <span className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#FF8C42]/10 dark:bg-[#FF8C42]/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#FF8C42]" />
                </div>
                <div>
                  <span className="text-[#26547c] dark:text-[#e6e6e6] text-base font-semibold block mb-1">
                    Ajoute des fichiers ou fais-les glisser ici
                  </span>
                  <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                    JPG, PNG, PDF, TXT, DOC, DOCX
                  </span>
                </div>
              </span>
            </button>
            {fileErrors.length > 0 && (
              <div className="space-y-1">
                {fileErrors.map((error) => (
                  <p
                    key={error}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                ))}
              </div>
            )}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  {files.length}/{MAX_TOTAL_FILES} fichier(s) sélectionné(s)
                </p>
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between p-3 bg-[rgba(214,218,228,0.16)] dark:bg-[rgba(255,255,255,0.08)] border border-[#d6dae4] dark:border-[#d6dae4] rounded-xl text-sm"
                  >
                    <span className="truncate flex-1 text-[#26547c] dark:text-[#e6e6e6]">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="ml-2 h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white font-bold px-12 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la demande"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
