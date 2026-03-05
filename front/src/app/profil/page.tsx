"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Save,
  User,
  GraduationCap,
  Sparkles,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { BackButton } from "@/components/back-button";
import { PageContainer, PageHeader, PageCard } from "@/components/layout";
import { ProfilePhotoUpload } from "@/components/profil/ProfilePhotoUpload";
import { ProfilePreviewCard } from "@/components/profil/ProfilePreviewCard";
import { IceBreakerTagsSection } from "@/components/profil/IceBreakerTagsSection";

const MAX_LENGTH = 50;

const BLOCK_CARD =
  "rounded-2xl border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[#1a1720] p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md";

export default function ProfilPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [displayNameVal, setDisplayNameVal] = useState("");
  const [studyDomainVal, setStudyDomainVal] = useState("");
  const [studyProgramVal, setStudyProgramVal] = useState("");
  const [bioVal, setBioVal] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    },
  });

  useEffect(() => {
    if (!session && !isSessionPending) router.push("/login");
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (userRole && userRole !== "APPRENANT") router.push("/dashboard");
  }, [userRole, router]);

  useEffect(() => {
    if (identityCard?.photoUrl) setPreviewPhoto(identityCard.photoUrl);
    if (identityCard?.iceBreakerTags) setLocalTags(identityCard.iceBreakerTags);
    if (identityCard) {
      setDisplayNameVal(
        identityCard.displayName || identityCard.userName || ""
      );
      setStudyDomainVal(identityCard.studyDomain || "");
      setStudyProgramVal(identityCard.studyProgram || "");
      setBioVal(identityCard.bio || "");
    }
  }, [identityCard]);

  if (isSessionPending || isLoading) return <Loader />;
  if (!session || userRole !== "APPRENANT") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const displayName = displayNameVal.trim();
    const studyDomain = studyDomainVal.trim();
    const studyProgram = studyProgramVal.trim();
    const bio = bioVal.trim();

    const errors: Record<string, string> = {};
    if (!displayName) errors.displayName = "Le prénom est requis";
    if (!studyDomain) errors.studyDomain = "Le domaine d'étude est requis";
    if (!studyProgram) errors.studyProgram = "Le cursus est requis";
    if (bio.length > 500) errors.bio = "La bio ne peut dépasser 500 caractères";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    await saveMutation.mutateAsync({
      displayName,
      studyDomain,
      studyProgram,
      bio,
      photoUrl: previewPhoto || null,
      iceBreakerTags: localTags,
    });
  };

  const previewDisplayName =
    displayNameVal || identityCard?.displayName || identityCard?.userName || "";
  const previewStudyDomain = studyDomainVal || identityCard?.studyDomain || "";
  const previewStudyProgram =
    studyProgramVal || identityCard?.studyProgram || "";
  const previewBio = bioVal || identityCard?.bio || "";

  return (
    <PageContainer>
      <PageHeader title="Mon profil" />
      <BackButton href="/dashboard" />

      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 min-w-0 lg:col-start-1 lg:row-start-1"
        >
          <ProfilePhotoUpload
            previewPhoto={previewPhoto}
            onPhotoChange={setPreviewPhoto}
            blockCard={BLOCK_CARD}
          />

          <div className={BLOCK_CARD}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
                <User className="h-4 w-4 text-[#FF8C42]" />
              </div>
              <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
                Identité
              </h2>
            </div>
            <div className="space-y-4">
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
                  <p id="displayName-error" className="text-xs text-destructive" role="alert">
                    {fieldErrors.displayName}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="bio">Bio (optionnelle)</Label>
                  <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                    {bioVal.length}/500
                  </span>
                </div>
                <textarea
                  id="bio"
                  value={bioVal}
                  onChange={(e) =>
                    setBioVal(e.target.value.slice(0, 500))
                  }
                  placeholder="Quelques mots sur toi, tes objectifs..."
                  maxLength={500}
                  rows={4}
                  className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none ${fieldErrors.bio ? "border-destructive" : ""}`}
                  aria-invalid={!!fieldErrors.bio}
                  aria-describedby={
                    fieldErrors.bio ? "bio-error" : undefined
                  }
                />
                {fieldErrors.bio && (
                  <p id="bio-error" className="text-xs text-destructive" role="alert">
                    {fieldErrors.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={BLOCK_CARD}>
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
                  <Label htmlFor="studyDomain">Domaine d&apos;étude</Label>
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
                  <p id="studyDomain-error" className="text-xs text-destructive" role="alert">
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
                  <p id="studyProgram-error" className="text-xs text-destructive" role="alert">
                    {fieldErrors.studyProgram}
                  </p>
                )}
              </div>
            </div>
          </div>

          <IceBreakerTagsSection
            tags={localTags}
            onTagsChange={setLocalTags}
            blockCard={BLOCK_CARD}
          />

          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto bg-[#FF8C42] hover:bg-[#e67d3a] text-white min-w-[180px] h-11 font-semibold shadow-sm hover:shadow-md transition-shadow rounded-full"
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

        <ProfilePreviewCard
          previewPhoto={previewPhoto}
          displayName={previewDisplayName}
          studyDomain={previewStudyDomain}
          studyProgram={previewStudyProgram}
          bio={previewBio}
          title={titleData?.title}
          tags={localTags}
        />
      </div>

      {userRole === "APPRENANT" && (
        <section className="mt-10" aria-labelledby="devenir-mentor-title">
          <PageCard className="border-[#FF8C42]/40 bg-linear-to-r from-[#FF8C42]/5 to-[#FF8C42]/10 dark:from-[#FF8C42]/10 dark:to-[#FF8C42]/5 overflow-hidden">
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
                    d&apos;autres apprenants comme toi.
                  </p>
                </div>
              </div>
              <Button
                onClick={() =>
                  router.push("/onboarding?role=MENTOR&step=confirm-features")
                }
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
