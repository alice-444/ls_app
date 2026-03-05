"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Save,
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
import { ApprenticeProfileForm } from "@/components/profil/ApprenticeProfileForm";

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

  const saveMutation = trpc.apprentice.updateProfile.useMutation({
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

  const photoMutation = trpc.apprentice.saveIdentityCard.useMutation({
    onSuccess: () => {
      refetch();
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
    });

    if (previewPhoto !== identityCard?.photoUrl || JSON.stringify(localTags) !== JSON.stringify(identityCard?.iceBreakerTags)) {
      await photoMutation.mutateAsync({
        displayName,
        studyDomain,
        studyProgram,
        bio,
        photoUrl: previewPhoto || null,
        iceBreakerTags: localTags,
      });
    }
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

          <ApprenticeProfileForm
            displayNameVal={displayNameVal}
            setDisplayNameVal={setDisplayNameVal}
            bioVal={bioVal}
            setBioVal={setBioVal}
            studyDomainVal={studyDomainVal}
            setStudyDomainVal={setStudyDomainVal}
            studyProgramVal={studyProgramVal}
            setStudyProgramVal={setStudyProgramVal}
            fieldErrors={fieldErrors}
            blockCardClass={BLOCK_CARD}
          />

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
