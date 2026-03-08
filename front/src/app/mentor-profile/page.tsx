"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/back-button";
import { PageContainer, SectionSidebar } from "@/components/layout";
import Loader from "@/components/loader";
import ShinyText from "@/components/ui/ShinyText";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";

import { PREDEFINED_TOPICS, SIDEBAR_ITEMS } from "@/components/mentor-profile/constants";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import {
  BasicInformationSection,
  TagListSection,
  SocialMediaSection,
  PublicationSection,
} from "@/components/mentor-profile";
import { ProfilePreviewCard } from "@/components/profil/ProfilePreviewCard";

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
    selectedIceBreakers,
    customIceBreaker,
    setCustomIceBreaker,
    iceBreakers,
    titleData,
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <PageContainer>
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <BackButton onClick={() => router.back()} />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <ShinyText text="Mon Profil Mentor" />
          </h1>
          <p className="text-base sm:text-lg text-ls-muted mt-2">
            Remplis les informations pour créer ton profil
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <SectionSidebar
          items={SIDEBAR_ITEMS}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <Card className="border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-ls-heading">
                    {SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.label}
                  </CardTitle>
                  <CardDescription className="text-ls-muted">
                    {activeSection === "informations-base" && "Les informations essentielles de ton profil"}
                    {activeSection === "domaines-expertise" && "Définis tes domaines d'expertise (min 1, max 10)"}
                    {activeSection === "sujets-mentorat" && "Ajoute les sujets sur lesquels tu proposes du mentorat"}
                    {activeSection === "qualifications-experience" && "Partage tes qualifications et ton expérience"}
                    {activeSection === "reseaux-sociaux" && "Ajoute tes liens vers tes réseaux sociaux"}
                    {activeSection === "publication" && "Gère la visibilité de ton profil dans le répertoire"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresence mode="wait">
                  {activeSection === "informations-base" && (
                    <motion.div
                      key="informations-base"
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                    >
                    <BasicInformationSection
                      register={register}
                      errors={errors}
                      bioLength={bioLength}
                      previewPhoto={previewPhoto}
                      existingPhotoUrl={existingPhotoUrl}
                      watch={watch}
                      handlePhotoChange={handlePhotoChange}
                      iceBreakers={iceBreakers}
                      selectedIceBreakers={selectedIceBreakers}
                      customIceBreaker={customIceBreaker}
                      setCustomIceBreaker={setCustomIceBreaker}
                    />
                    </motion.div>
                  )}

                  {activeSection === "domaines-expertise" && (
                    <motion.div
                      key="domaines-expertise"
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-6"
                    >
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
                    </motion.div>
                  )}

                  {activeSection === "sujets-mentorat" && (
                    <motion.div
                      key="sujets-mentorat"
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-6"
                    >
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
                            className="text-xs border border-ls-border bg-ls-input-bg text-ls-heading hover:bg-brand-soft hover:border-brand rounded-full"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "qualifications-experience" && (
                    <motion.div
                      key="qualifications-experience"
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-6"
                    >

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
                    </motion.div>
                  )}

                  {activeSection === "reseaux-sociaux" && (
                    <motion.div
                      key="reseaux-sociaux"
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                    >
                    <SocialMediaSection register={register} />
                    </motion.div>
                  )}

                  {activeSection === "publication" && (
                    <motion.div
                      key="publication"
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                    >
                    <PublicationSection
                      isPublished={isPublished}
                      isSubmitting={isSubmitting}
                      isFormSubmitting={isFormSubmitting}
                      isPublishing={isPublishing}
                      isUnpublishing={isUnpublishing}
                      handlePublish={handlePublish}
                      handleUnpublish={handleUnpublish}
                    />
                    </motion.div>
                  )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-ls-border">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        isFormSubmitting ||
                        isPublishing ||
                        isUnpublishing
                      }
                      className="flex-1 bg-brand hover:bg-brand-hover text-[#161616] rounded-full font-semibold"
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
                </CardContent>
              </Card>
            </div>

            <div className="hidden xl:block">
              <ProfilePreviewCard
                previewPhoto={previewPhoto}
                displayName={watch("displayName") || watch("name") || "Mentor"}
                studyDomain={selectedAreas[0] || ""}
                studyProgram={watch("domain") || ""}
                bio={watch("bio") || ""}
                title={titleData?.title}
                tags={selectedTopics.slice(0, 5)}
                iceBreakers={selectedIceBreakers}
              />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
