"use client";

import { Loader2, Plus, BookOpen, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/back-button";
import { PageHeader, PageContainer, SectionSidebar } from "@/components/layout";
import Loader from "@/components/loader";

import { PREDEFINED_TOPICS, SIDEBAR_ITEMS } from "@/components/mentor-profile/constants";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import {
  BasicInformationSection,
  TagListSection,
  SocialMediaSection,
  PublicationSection,
} from "@/components/mentor-profile";

export default function MentorProfilePage() {
  const {
    session,
    isSessionPending,
    router,
    form,
    bioLength,
    activeSection,
    setActiveSection,
    isSubmitting,
    isPublishing,
    isUnpublishing,
    isPublished,
    previewPhoto,
    existingPhotoUrl,
    handlePhotoChange,
    selectedTopics,
    customTopic,
    setCustomTopic,
    topics,
    selectedAreas,
    customArea,
    setCustomArea,
    areas,
    selectedQualifications,
    customQualification,
    setCustomQualification,
    qualifications,
    selectedExperience,
    customExperience,
    setCustomExperience,
    experience,
    onSubmit,
    handlePublish,
    handleUnpublish,
  } = useMentorProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
    watch,
  } = form;

  if (isSessionPending) return <Loader />;
  if (!session) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Mon Profil Mentor"
        subtitle="Remplis les informations pour créer ton profil"
      />

      <BackButton onClick={() => router.back()} />

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
        <SectionSidebar
          items={SIDEBAR_ITEMS}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <div className="flex-1">
          <div className="bg-ls-surface border border-ls-border rounded-[10px] p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {activeSection === "informations-base" && (
                <BasicInformationSection
                  register={register}
                  errors={errors}
                  bioLength={bioLength}
                  previewPhoto={previewPhoto}
                  existingPhotoUrl={existingPhotoUrl}
                  watch={watch}
                  handlePhotoChange={handlePhotoChange}
                />
              )}

              {activeSection === "domaines-expertise" && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-ls-heading" />
                    <h2 className="text-2xl font-semibold text-ls-heading">
                      Domaines d&apos;expertise
                    </h2>
                  </div>
                  <p className="text-base text-ls-muted">
                    Définissez vos domaines d&apos;expertise (minimum 1, maximum 10)
                  </p>
                  <TagListSection
                    items={selectedAreas}
                    customValue={customArea}
                    onCustomChange={setCustomArea}
                    onAdd={areas.add}
                    onRemove={areas.remove}
                    placeholder="Ajouter un domaine d'expertise (ex: Mathématiques, Programmation, Design...)"
                    hint="Appuyez sur Entrée pour ajouter. Au moins un domaine est requis."
                    error={errors.areasOfExpertise?.message}
                    variant="blue"
                  />
                </div>
              )}

              {activeSection === "sujets-mentorat" && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-ls-heading" />
                    <h2 className="text-2xl font-semibold text-ls-heading">
                      Sujets de mentorat
                    </h2>
                  </div>
                  <p className="text-base text-ls-muted">
                    Ajoutez les sujets sur lesquels vous souhaitez proposer du
                    mentorat
                  </p>
                  <TagListSection
                    items={selectedTopics}
                    customValue={customTopic}
                    onCustomChange={setCustomTopic}
                    onAdd={topics.add}
                    onRemove={topics.remove}
                    placeholder="Ajouter un sujet personnalisé"
                    hint="Appuyez sur Entrée pour ajouter ou sélectionnez ci-dessous."
                    error={errors.mentorshipTopics?.message}
                    variant="orange"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {PREDEFINED_TOPICS.filter(
                      (topic) => !selectedTopics.includes(topic)
                    ).map((topic) => (
                      <Button
                        key={topic}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => topics.add(topic)}
                        className="text-xs border border-ls-border bg-ls-input-bg text-ls-heading hover:bg-brand-soft hover:border-brand rounded-[32px]"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "qualifications-experience" && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-8 w-8 text-ls-heading" />
                    <h2 className="text-2xl font-semibold text-ls-heading">
                      Qualifications & Expérience
                    </h2>
                  </div>
                  <p className="text-base text-ls-muted">
                    Partagez vos qualifications et votre expérience
                    professionnelle
                  </p>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-ls-heading">
                        Qualifications (max 20)
                      </Label>
                      <TagListSection
                        items={selectedQualifications}
                        customValue={customQualification}
                        onCustomChange={setCustomQualification}
                        onAdd={qualifications.add}
                        onRemove={qualifications.remove}
                        placeholder="Ajouter une qualification (ex: Master en Informatique, Certification AWS...)"
                        hint="Appuyez sur Entrée pour ajouter. Maximum 20 qualifications."
                        error={errors.qualifications?.message}
                        variant="blue"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-ls-heading">
                        Expérience (max 20)
                      </Label>
                      <TagListSection
                        items={selectedExperience}
                        customValue={customExperience}
                        onCustomChange={setCustomExperience}
                        onAdd={experience.add}
                        onRemove={experience.remove}
                        placeholder="Ajouter une expérience (ex: Développeur Full Stack chez Google, 5 ans...)"
                        hint="Appuyez sur Entrée pour ajouter. Maximum 20 expériences."
                        error={errors.experience?.message}
                        variant="orange"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "reseaux-sociaux" && (
                <SocialMediaSection register={register} />
              )}

              {activeSection === "publication" && (
                <PublicationSection
                  isPublished={isPublished}
                  isSubmitting={isSubmitting}
                  isFormSubmitting={isFormSubmitting}
                  isPublishing={isPublishing}
                  isUnpublishing={isUnpublishing}
                  handlePublish={handlePublish}
                  handleUnpublish={handleUnpublish}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-ls-border">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isFormSubmitting ||
                    isPublishing ||
                    isUnpublishing
                  }
                  className="flex-1 bg-brand hover:bg-brand-hover text-[#161616] rounded-[32px] font-semibold"
                  size="lg"
                >
                  {isSubmitting || isFormSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder le profil"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
