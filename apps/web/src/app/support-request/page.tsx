"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
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
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-client";

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

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_TOTAL_FILES = 5;
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

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

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link href="/help" className="text-primary hover:underline">
            CENTRE D&apos;AIDE
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">REMARQUES</span>
        </nav>
        <h1 className="text-3xl font-bold mb-2">
          Comment peut-on t&apos;aider ?
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Décris ton problème</h2>
            <p className="text-muted-foreground text-sm">
              Décris le problème que tu rencontres avec autant de détails que
              possible. Cela nous aidera à comprendre ce qui se passe.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Ton adresse e-mail <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                {...register("email")}
                className={cn(errors.email && "border-destructive")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Objet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Résumé de ton problème"
                maxLength={200}
                {...register("subject")}
                className={cn(errors.subject && "border-destructive")}
              />
              <div className="flex justify-between items-center">
                {errors.subject && (
                  <p className="text-sm text-destructive">
                    {errors.subject.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {watch("subject")?.length || 0}/200
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Décris ton problème en détail..."
                rows={5}
                maxLength={5000}
                {...register("description")}
                className={cn(errors.description && "border-destructive")}
              />
              <div className="flex justify-between items-center">
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {watch("description")?.length || 0}/5000
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemType">
                Type de problème <span className="text-destructive">*</span>
              </Label>
              <Select
                value={problemType}
                onValueChange={(value) => setValue("problemType", value)}
              >
                <SelectTrigger
                  id="problemType"
                  className={cn(errors.problemType && "border-destructive")}
                >
                  <SelectValue placeholder="SÉLECTIONNE UNE OPTION..." />
                </SelectTrigger>
                <SelectContent>
                  {problemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
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

            <div className="space-y-2">
              <Label htmlFor="attachments">
                Pièces jointes{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (max {MAX_TOTAL_FILES} fichiers, 10 MB chacun)
                </span>
              </Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "border-2 border-dashed rounded-md p-6 text-center transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                )}
              >
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx"
                />
                <label
                  htmlFor="attachments"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6 text-primary" />
                  <span className="text-primary text-sm font-medium">
                    Ajoute des fichiers ou fais-les glisser ici
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG, PDF, TXT, DOC, DOCX
                  </span>
                </label>
              </div>
              {fileErrors.length > 0 && (
                <div className="space-y-1">
                  {fileErrors.map((error, index) => (
                    <p key={index} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {files.length}/{MAX_TOTAL_FILES} fichier(s) sélectionné(s)
                </p>
              )}
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="ml-2 h-6 px-2"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="uppercase"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
