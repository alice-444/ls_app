"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-client";
import { BackButton } from "@/components/shared/BackButton";
import { PageContainer } from "@/components/shared/layout";
import ShinyText from "@/components/ui/ShinyText";

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
    newFiles: File[],
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
          `${file.name} : Type de fichier non autorisé. Types acceptés : JPG, PNG, PDF, TXT, DOC, DOCX`,
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
        result.message || "Votre demande a été envoyée avec succès !",
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

  const fieldClass = cn(
    "rounded-xl border-border bg-background text-foreground",
  );

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BackButton href="/help" label="Retour à l'aide" />
      </motion.div>

      <motion.div
        className="mb-6 sm:mb-8 mt-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Contacter le support" />
        </h1>
        <p className="mt-2 max-w-3xl text-base text-ls-muted sm:text-lg">
          Comment pouvons-nous t&apos;aider aujourd&apos;hui ?
        </p>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-border/50 bg-card/95 p-5 shadow-xl backdrop-blur-md sm:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand/25 bg-linear-to-br from-brand/10 via-card/80 to-transparent p-6 shadow-sm backdrop-blur-sm dark:from-brand/5">
                <h2 className="mb-3 text-xl font-bold text-ls-heading">
                  Décris ton problème
                </h2>
                <p className="text-sm leading-relaxed text-ls-muted">
                  Décris le problème que tu rencontres avec autant de détails
                  que possible. Cela nous aidera à comprendre ce qui se passe et
                  à te fournir la meilleure solution.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-ls-heading">
                  Ton adresse e-mail <span className="text-brand">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  {...register("email")}
                  className={cn(
                    fieldClass,
                    errors.email && "border-destructive",
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="font-semibold text-ls-heading">
                  Objet <span className="text-brand">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="Résumé de ton problème"
                  maxLength={200}
                  {...register("subject")}
                  className={cn(
                    fieldClass,
                    errors.subject && "border-destructive",
                  )}
                />
                <div className="flex items-center justify-between">
                  {errors.subject && (
                    <p className="text-sm text-destructive">
                      {errors.subject.message}
                    </p>
                  )}
                  <p className="ml-auto text-xs text-ls-muted">
                    {watch("subject")?.length || 0}/200
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="font-semibold text-ls-heading"
                >
                  Description <span className="text-brand">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décris ton problème en détail..."
                  rows={6}
                  maxLength={5000}
                  {...register("description")}
                  className={cn(
                    fieldClass,
                    "resize-none",
                    errors.description && "border-destructive",
                  )}
                />
                <div className="flex items-center justify-between">
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                  <p className="ml-auto text-xs text-ls-muted">
                    {watch("description")?.length || 0}/5000
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="problemType"
                  className="font-semibold text-ls-heading"
                >
                  Type de problème <span className="text-brand">*</span>
                </Label>
                <Select
                  value={problemType}
                  onValueChange={(value) => setValue("problemType", value)}
                >
                  <SelectTrigger
                    id="problemType"
                    className={cn(
                      fieldClass,
                      errors.problemType && "border-destructive",
                    )}
                  >
                    <SelectValue placeholder="Sélectionne une option..." />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    {problemTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-foreground"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.problemType && (
                  <p className="text-sm text-destructive">
                    {errors.problemType.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="attachments"
              className="font-semibold text-ls-heading"
            >
              Pièces jointes{" "}
              <span className="text-xs font-normal text-ls-muted">
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
                "w-full cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
                isDragging
                  ? "border-brand bg-brand/5"
                  : "border-border hover:border-brand/50",
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15">
                  <Upload className="h-8 w-8 text-brand" />
                </div>
                <div>
                  <span className="mb-1 block text-base font-semibold text-ls-heading">
                    Ajoute des fichiers ou fais-les glisser ici
                  </span>
                  <span className="text-xs text-ls-muted">
                    JPG, PNG, PDF, TXT, DOC, DOCX
                  </span>
                </div>
              </span>
            </button>
            {fileErrors.length > 0 && (
              <div className="space-y-1">
                {fileErrors.map((error) => (
                  <p key={error} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            )}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-ls-muted">
                  {files.length}/{MAX_TOTAL_FILES} fichier(s) sélectionné(s)
                </p>
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-sm"
                  >
                    <span className="flex-1 truncate text-ls-heading">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="ml-2 h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
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
              className="bg-brand px-12 py-6 text-base font-bold text-white shadow-lg hover:bg-brand/90 hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la demande"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </PageContainer>
  );
}
