"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Save,
  User,
  GraduationCap,
  Tag,
  Sparkles,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { customAuthClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/back-button";
import {
  PageContainer,
  PageHeader,
  PageCard,
} from "@/components/layout";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 50;
const MAX_TAGS = 5;
const TAG_SUGGESTIONS = [
  "Gamer",
  "Night Owl",
  "Football",
  "Musique",
  "Sport",
  "Lecture",
];

export default function ProfilPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [displayNameVal, setDisplayNameVal] = useState("");
  const [studyDomainVal, setStudyDomainVal] = useState("");
  const [studyProgramVal, setStudyProgramVal] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const {
    data: identityCard,
    refetch,
    isLoading,
  } = trpc.apprentice.getIdentityCard.useQuery(undefined, {
    enabled: !!session && userRole === "APPRENANT",
  });

  const { data: titleData } = trpc.user.getTitle.useQuery(undefined, {
    enabled: !!session && userRole === "APPRENANT",
  });

  const saveMutation = trpc.apprentice.saveIdentityCard.useMutation({
    onSuccess: () => {
      toast.success("Profil sauvegardé avec succès !");
      refetch();
      setFieldErrors({});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    },
  });

  const handleBecomeMentor = () => {
    router.push("/onboarding?role=MENTOR&step=confirm-features");
  };

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (userRole && userRole !== "APPRENANT") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  useEffect(() => {
    if (identityCard?.photoUrl) {
      setPreviewPhoto(identityCard.photoUrl);
    }
    if (identityCard?.iceBreakerTags) {
      setLocalTags(identityCard.iceBreakerTags);
    }
    if (identityCard) {
      setDisplayNameVal(
        identityCard.displayName || identityCard.userName || ""
      );
      setStudyDomainVal(identityCard.studyDomain || "");
      setStudyProgramVal(identityCard.studyProgram || "");
    }
  }, [identityCard]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed || localTags.length >= MAX_TAGS) return;
    if (localTags.includes(trimmed)) {
      toast.error("Ce tag existe déjà");
      return;
    }
    setLocalTags([...localTags, trimmed]);
    setTagInput("");
  }, [tagInput, localTags]);

  const addTagFromSuggestion = useCallback(
    (tag: string) => {
      if (localTags.length >= MAX_TAGS) return;
      if (localTags.includes(tag)) return;
      setLocalTags([...localTags, tag]);
    },
    [localTags]
  );

  const handlePhotoDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Le fichier doit être au format JPG ou PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 5 Mo");
        return;
      }
      setIsUploading(true);
      customAuthClient
        .uploadPhoto(file)
        .then((res) => {
          setPreviewPhoto(res.photoUrl);
          toast.success("Photo uploadée avec succès");
        })
        .catch((err) =>
          toast.error(
            err instanceof Error ? err.message : "Erreur lors de l'upload"
          )
        )
        .finally(() => setIsUploading(false));
    },
    []
  );

  const handlePhotoDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handlePhotoDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  if (isSessionPending || isLoading) {
    return <Loader />;
  }

  if (!session || userRole !== "APPRENANT") {
    return null;
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Le fichier doit être au format JPG ou PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 5 Mo");
        return;
      }

      setIsUploading(true);
      try {
        const uploadResult = await customAuthClient.uploadPhoto(file);
        setPreviewPhoto(uploadResult.photoUrl);
        toast.success("Photo uploadée avec succès");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'upload de la photo"
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const displayName = displayNameVal.trim();
    const studyDomain = studyDomainVal.trim();
    const studyProgram = studyProgramVal.trim();

    const errors: Record<string, string> = {};
    if (!displayName) errors.displayName = "Le prénom est requis";
    if (!studyDomain) errors.studyDomain = "Le domaine d'étude est requis";
    if (!studyProgram) errors.studyProgram = "Le cursus est requis";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    await saveMutation.mutateAsync({
      displayName,
      studyDomain,
      studyProgram,
      photoUrl: previewPhoto || null,
      iceBreakerTags: localTags,
    });
  };

  const removeTag = (index: number) => {
    setLocalTags(localTags.filter((_, i) => i !== index));
  };

  const previewDisplayName =
    displayNameVal ||
    identityCard?.displayName ||
    identityCard?.userName ||
    "";
  const previewStudyDomain = studyDomainVal || identityCard?.studyDomain || "";
  const previewStudyProgram = studyProgramVal || identityCard?.studyProgram || "";

  const blockCard =
    "rounded-2xl border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[#1a1720] p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md";

  return (
    <PageContainer>
      <PageHeader title="Mon profil" />
      <BackButton href="/dashboard" />

      {/* Mobile/tablette : 1 colonne, formulaire puis aperçu centré en bas. Desktop (lg) : 2 colonnes, formulaire à gauche, aperçu à droite */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-12">
        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 min-w-0 lg:col-start-1 lg:row-start-1"
        >
          {/* Bloc Photo */}
          <div className={blockCard}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
                <Upload className="h-4 w-4 text-[#FF8C42]" />
              </div>
              <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
                Photo
              </h2>
            </div>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange}
              disabled={isUploading}
              className="hidden"
            />
            <div
              role="button"
              tabIndex={0}
              onDragOver={handlePhotoDragOver}
              onDragLeave={handlePhotoDragLeave}
              onDrop={handlePhotoDrop}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  document.getElementById("photo")?.click();
                }
              }}
              className={cn(
                "flex flex-col sm:flex-row items-center justify-center gap-4 p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[120px]",
                isDragging
                  ? "border-[#FF8C42] bg-[#FF8C42]/10 scale-[0.99]"
                  : "border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] hover:border-[#FF8C42]/50 hover:bg-[#FF8C42]/5"
              )}
              onClick={() =>
                !isUploading && document.getElementById("photo")?.click()
              }
              aria-label="Choisir ou glisser une photo"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-[#FF8C42]" />
                  <span className="text-xs text-[rgba(38,84,124,0.7)] dark:text-[rgba(230,230,230,0.7)]">
                    Envoi en cours...
                  </span>
                </div>
              ) : previewPhoto ? (
                <>
                  <div className="relative shrink-0">
                    <img
                      src={previewPhoto}
                      alt="Aperçu"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-[#FF8C42]/20"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPhoto(null);
                      }}
                      className="absolute -top-0.5 -right-0.5 bg-[#FF8C42] text-white rounded-full p-1.5 hover:bg-[#e67d3a] shadow-md transition-colors"
                      aria-label="Supprimer la photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm text-[rgba(38,84,124,0.8)] dark:text-[rgba(230,230,230,0.8)]">
                    Cliquer ou glisser pour remplacer · JPG, PNG 5 Mo
                  </span>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C42]/10 ring-2 ring-[#FF8C42]/20">
                    <Upload className="h-7 w-7 text-[#FF8C42]" />
                  </div>
                  <div className="text-center sm:text-left space-y-0.5">
                    <p className="text-sm font-medium text-[#26547c] dark:text-[#e6e6e6]">
                      Dépose ta photo ici
                    </p>
                    <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                      Glisser-déposer ou cliquer · JPG, PNG 5 Mo max
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bloc Identité */}
          <div className={blockCard}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
                <User className="h-4 w-4 text-[#FF8C42]" />
              </div>
              <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
                Identité
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="displayName">Prénom</Label>
                <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  {displayNameVal.length}/{MAX_LENGTH}
                </span>
              </div>
              <Input
                id="displayName"
                value={displayNameVal}
                onChange={(e) =>
                  setDisplayNameVal(e.target.value.slice(0, MAX_LENGTH))
                }
                placeholder="Ton prénom"
                maxLength={MAX_LENGTH}
                className={fieldErrors.displayName ? "border-destructive" : ""}
                aria-invalid={!!fieldErrors.displayName}
                aria-describedby={
                  fieldErrors.displayName ? "displayName-error" : undefined
                }
              />
              {fieldErrors.displayName && (
                <p
                  id="displayName-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {fieldErrors.displayName}
                </p>
              )}
            </div>
          </div>

          {/* Bloc Parcours */}
          <div className={blockCard}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
                <GraduationCap className="h-4 w-4 text-[#FF8C42]" />
              </div>
              <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
                Parcours
              </h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="studyDomain">Domaine d'étude</Label>
                  <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                    {studyDomainVal.length}/{MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="studyDomain"
                  value={studyDomainVal}
                  onChange={(e) =>
                    setStudyDomainVal(e.target.value.slice(0, MAX_LENGTH))
                  }
                  placeholder="Web, Data, Design..."
                  maxLength={MAX_LENGTH}
                  className={fieldErrors.studyDomain ? "border-destructive" : ""}
                  aria-invalid={!!fieldErrors.studyDomain}
                  aria-describedby={
                    fieldErrors.studyDomain ? "studyDomain-error" : undefined
                  }
                />
                {fieldErrors.studyDomain && (
                  <p
                    id="studyDomain-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {fieldErrors.studyDomain}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="studyProgram">Cursus</Label>
                  <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                    {studyProgramVal.length}/{MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="studyProgram"
                  value={studyProgramVal}
                  onChange={(e) =>
                    setStudyProgramVal(e.target.value.slice(0, MAX_LENGTH))
                  }
                  placeholder="Bachelor 1ère année, BTS..."
                  maxLength={MAX_LENGTH}
                  className={fieldErrors.studyProgram ? "border-destructive" : ""}
                  aria-invalid={!!fieldErrors.studyProgram}
                  aria-describedby={
                    fieldErrors.studyProgram ? "studyProgram-error" : undefined
                  }
                />
                {fieldErrors.studyProgram && (
                  <p
                    id="studyProgram-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {fieldErrors.studyProgram}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bloc Tags */}
          <div className={blockCard}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
                <Tag className="h-4 w-4 text-[#FF8C42]" />
              </div>
              <div className="flex-1 flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
                  Tags Ice Breaker
                </h2>
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#FF8C42]/10 text-[#FF8C42] border-0"
                >
                  {localTags.length}/{MAX_TAGS}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ex: Gamer, Football..."
                maxLength={30}
                disabled={localTags.length >= MAX_TAGS}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={localTags.length >= MAX_TAGS || !tagInput.trim()}
                variant="outline"
                className="sm:shrink-0 border-[#26547c]/50 text-[#26547c] hover:bg-[#26547c]/10 hover:border-[#26547c] dark:border-[#26547c]/60 dark:text-[#e6e6e6] dark:hover:bg-[#26547c]/20"
              >
                Ajouter
              </Button>
            </div>
            {TAG_SUGGESTIONS.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {TAG_SUGGESTIONS.map((suggestion) => {
                  const added = localTags.includes(suggestion);
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addTagFromSuggestion(suggestion)}
                      disabled={added || localTags.length >= MAX_TAGS}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                        added
                          ? "bg-[#FF8C42]/20 text-[#FF8C42] cursor-default"
                          : "bg-[#FF8C42]/10 text-[#FF8C42] hover:bg-[#FF8C42]/20 disabled:opacity-50"
                      )}
                    >
                      {suggestion}
                      {added && " ✓"}
                    </button>
                  );
                })}
              </div>
            )}
            {localTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {localTags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FF8C42]/10 text-[#FF8C42] rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="rounded-full p-0.5 hover:bg-[#FF8C42]/20 focus:ring-2 focus:ring-[#FF8C42]"
                      aria-label={`Retirer ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={saveMutation.isPending || isUploading}
            className="w-full sm:w-auto bg-[#FF8C42] hover:bg-[#e67d3a] text-white min-w-[180px] h-11 font-semibold shadow-sm hover:shadow-md transition-shadow rounded-full"
            title="Enregistrer les modifications"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Sauvegardé
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </form>

        {/* Aperçu : mobile/tablette = en bas centré (flex + max-w). Desktop (lg) = strictement inchangé : block, col 2 */}
        <aside className="min-w-0 flex justify-center lg:flex-none lg:block lg:col-start-2 lg:row-start-1">
          <div className="w-full max-w-[340px] lg:max-w-full sticky top-8 overflow-hidden rounded-xl lg:rounded-2xl border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[#1a1720] shadow-md lg:shadow-lg">
            {/* Bandeau accent — visible sur desktop */}
            <div className="hidden lg:block h-1.5 w-full bg-linear-to-r from-[#FF8C42]/30 via-[#FF8C42]/50 to-[#FF8C42]/30" />
            <div className="p-3 lg:p-6 flex flex-col items-center text-center">
              <p className="text-[10px] lg:text-xs font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] uppercase tracking-wider mb-1 lg:mb-1">
                Aperçu
              </p>
              <p className="hidden lg:block text-xs text-[rgba(38,84,124,0.5)] dark:text-[rgba(230,230,230,0.5)] mb-4 lg:mb-5">
                Comme les autres te verront
              </p>
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt=""
                  className="w-12 h-12 lg:w-24 lg:h-24 rounded-full object-cover ring-2 ring-[#FF8C42]/20 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1720] mb-2 lg:mb-4 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full bg-[#e8eaef] dark:bg-white/10 flex items-center justify-center ring-2 ring-[#d6dae4] dark:ring-[rgba(214,218,228,0.32)] ring-offset-2 ring-offset-white dark:ring-offset-[#1a1720] mb-2 lg:mb-4 shrink-0">
                  <User className="h-6 w-6 lg:h-11 lg:w-11 text-[#64748b] dark:text-gray-400" />
                </div>
              )}
              <h3 className="text-xs lg:text-lg font-semibold text-[#26547c] dark:text-[#e6e6e6] wrap-break-word line-clamp-2 lg:line-clamp-none">
                {previewDisplayName || "Ton prénom"}
              </h3>
              {titleData?.title && (
                <Badge
                  variant="secondary"
                  className="mt-1 lg:mt-2 text-[10px] lg:text-xs bg-[#FF8C42]/10 text-[#FF8C42] border-0 shrink-0"
                >
                  {titleData.title}
                </Badge>
              )}
              {(previewStudyDomain || previewStudyProgram) && (
                <div className="hidden lg:block mt-3 text-sm text-[rgba(38,84,124,0.8)] dark:text-[rgba(230,230,230,0.8)] space-y-1">
                  {previewStudyDomain && (
                    <p className="flex items-center justify-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-[#FF8C42] shrink-0" />
                      {previewStudyDomain}
                    </p>
                  )}
                  {previewStudyProgram && (
                    <p className="pl-5">{previewStudyProgram}</p>
                  )}
                </div>
              )}
              {localTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 lg:gap-1.5 mt-2 lg:mt-4">
                  {localTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 lg:px-2.5 lg:py-1 bg-[#FF8C42]/10 text-[#FF8C42] rounded-full text-[10px] lg:text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Devenir Mentor — CTA */}
      {userRole === "APPRENANT" && (
        <section className="mt-10" aria-labelledby="devenir-mentor-title">
          <PageCard
            className="border-[#FF8C42]/40 bg-linear-to-r from-[#FF8C42]/5 to-[#FF8C42]/10 dark:from-[#FF8C42]/10 dark:to-[#FF8C42]/5 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 sm:gap-8 p-1">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF8C42]/15 shadow-sm">
                  <Sparkles className="h-6 w-6 text-[#FF8C42]" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2
                    id="devenir-mentor-title"
                    className="font-semibold text-lg text-[#26547c] dark:text-[#e6e6e6] leading-tight"
                  >
                    Envie de partager vos compétences ?
                  </h2>
                  <p className="text-sm text-[rgba(38,84,124,0.8)] dark:text-[rgba(230,230,230,0.8)] mt-2 leading-relaxed">
                    Devenez mentor et créez votre premier atelier pour aider
                    d'autres apprenants comme toi.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleBecomeMentor}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-md transition-shadow shrink-0 w-full sm:w-auto sm:min-w-[180px] h-11 rounded-full border-0"
              >
                Devenir Mentor
              </Button>
            </div>
          </PageCard>
        </section>
      )}
    </PageContainer>
  );
}
