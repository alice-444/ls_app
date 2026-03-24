"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-server-client";
import { Button } from "@/components/ui/Button";
import {
  Save,
  Loader2,
  CheckCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { BackButton } from "@/components/shared/BackButton";
import { PageContainer } from "@/components/shared/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { ProfilePhotoUpload } from "@/components/domains/profil/ProfilePhotoUpload";
import { ProfilePreviewCard } from "@/components/domains/profil/ProfilePreviewCard";
import { IceBreakerTagsSection } from "@/components/domains/profil/IceBreakerTagsSection";
import { ApprenticeProfileForm } from "@/components/domains/profil/ApprenticeProfileForm";

const BLOCK_CARD =
  "rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md p-5 sm:p-6 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-brand/5";

function getSaveButtonContent(
  isPending: boolean,
  savedSuccess: boolean
): ReactNode {
  if (isPending) {
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Sauvegarde...
      </>
    );
  }
  if (savedSuccess) {
    return (
      <>
        <CheckCircle className="mr-2 h-4 w-4" />
        Sauvegardé
      </>
    );
  }
  return (
    <>
      <Save className="mr-2 h-4 w-4" />
      Sauvegarder
    </>
  );
}

export default function ProfilPage() {
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

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
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

  const router = useRouter();
  useEffect(() => {
    if (isSessionPending || isLoadingRole) return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (userRole === "MENTOR") {
      router.push("/mentor-profile");
      return;
    }
    if (userRole && userRole !== "APPRENANT") {
      router.push("/dashboard");
      return;
    }
  }, [session, userRole, isSessionPending, isLoadingRole, router]);

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

  if (isSessionPending || isLoadingRole || isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement du profil...</p>
          </div>
        </div>
      </PageContainer>
    );
  }
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
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <BackButton href="/dashboard" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] text-white shadow-lg shadow-[#FF8C42]/25">
              <User className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <ShinyText text="Mon profil" />
          </h1>
          <p className="text-base sm:text-lg text-ls-muted mt-2">
            Personnalise ton identité et ton parcours
          </p>
        </motion.div>
      </div>

      <motion.div
        className="w-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
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
            variant="cta"
            size="cta"
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto min-w-[180px]"
          >
            {getSaveButtonContent(saveMutation.isPending, savedSuccess)}
          </Button>
        </form>

        <ProfilePreviewCard
          previewPhoto={previewPhoto}
          displayName={previewDisplayName}
          studyDomain={previewStudyDomain}
          studyProgram={previewStudyProgram}
          bio={previewBio}
          title={titleData?.title}
          tags={[]} // Apprenants use iceBreakers instead of topic tags
          iceBreakers={localTags}
        />
      </motion.div>
    </PageContainer>
  );
}
