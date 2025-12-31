"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient, customAuthClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Upload,
  Plus,
  X,
  Linkedin,
  Twitter,
  Youtube,
  Github,
  CheckCircle2,
  Eye,
  User,
  BookOpen,
  GraduationCap,
  Briefcase,
  Share2,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-client";
import { BackButton } from "@/components/back-button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";

// Predefined topics
const PREDEFINED_TOPICS = [
  "Mathématiques",
  "Physique",
  "Chimie",
  "Programmation",
  "Design",
  "Marketing",
  "Finance",
  "Langues",
  "Sciences",
  "Arts",
  "Médecine",
  "Droit",
  "Business",
  "Data Science",
  "Développement Web",
  "Développement Mobile",
  "IA & Machine Learning",
  "Cybersécurité",
  "DevOps",
  "Entrepreneuriat",
];

const mentorProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(40, "Le nom ne peut pas dépasser 40 caractères"),
  bio: z
    .string()
    .trim()
    .min(20, "La bio doit contenir au moins 20 caractères")
    .max(250, "La bio ne peut pas dépasser 250 caractères"),
  domain: z
    .string()
    .trim()
    .min(2, "Le domaine doit contenir au moins 2 caractères")
    .max(60, "Le domaine ne peut pas dépasser 60 caractères")
    .optional(),
  photo: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) =>
            ["image/jpeg", "image/jpg", "image/png"].includes(
              file.type.toLowerCase()
            ),
          "Le fichier doit être au format JPG ou PNG"
        )
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "La photo ne doit pas dépasser 5 Mo"
        ),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  qualifications: z
    .array(z.string().trim().min(1).max(100))
    .max(20, "Maximum 20 qualifications")
    .optional()
    .nullable(),
  experience: z
    .array(z.string().trim().min(1).max(100))
    .max(20, "Maximum 20 expériences")
    .optional()
    .nullable(),
  socialMediaLinks: z
    .object({
      linkedin: z.string().url("URL invalide").optional().or(z.literal("")),
      twitter: z.string().url("URL invalide").optional().or(z.literal("")),
      youtube: z.string().url("URL invalide").optional().or(z.literal("")),
      github: z.string().url("URL invalide").optional().or(z.literal("")),
    })
    .optional()
    .nullable(),
  areasOfExpertise: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Au moins un domaine d'expertise est requis")
    .max(10, "Maximum 10 domaines d'expertise"),
  mentorshipTopics: z
    .array(z.string().trim().min(1).max(50))
    .max(15, "Maximum 15 sujets de mentorat")
    .optional()
    .nullable(),
});

type MentorProfileFormData = z.infer<typeof mentorProfileSchema>;

type ProfileSection =
  | "informations-base"
  | "domaines-expertise"
  | "sujets-mentorat"
  | "qualifications-experience"
  | "reseaux-sociaux"
  | "publication";

const sidebarItems: Array<{
  id: ProfileSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "informations-base", label: "Informations de base", icon: User },
  { id: "domaines-expertise", label: "Domaines d'expertise", icon: BookOpen },
  { id: "sujets-mentorat", label: "Sujets de mentorat", icon: GraduationCap },
  {
    id: "qualifications-experience",
    label: "Qualifications & Expérience",
    icon: Briefcase,
  },
  { id: "reseaux-sociaux", label: "Réseaux sociaux", icon: Share2 },
  { id: "publication", label: "Publication", icon: Eye },
];

export default function MentorProfilePage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedQualifications, setSelectedQualifications] = useState<
    string[]
  >([]);
  const [customQualification, setCustomQualification] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [customExperience, setCustomExperience] = useState("");
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("informations-base");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
    watch,
    setValue,
  } = useForm<MentorProfileFormData>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      domain: undefined,
      photo: null,
      qualifications: [],
      experience: [],
      socialMediaLinks: {
        linkedin: "",
        twitter: "",
        youtube: "",
        github: "",
      },
      areasOfExpertise: [],
      mentorshipTopics: [],
    },
  });

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setValue("name", session.user.name);
    }
  }, [session, setValue]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/role/prof`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isPublished) {
            setIsPublished(true);
          }

          if (data.profile) {
            const profile = data.profile;

            setValue("name", profile.name || "");
            setValue("bio", profile.bio || "");

            if (
              profile.qualifications &&
              Array.isArray(profile.qualifications)
            ) {
              setSelectedQualifications(profile.qualifications);
              setValue("qualifications", profile.qualifications);
            } else if (
              profile.qualifications &&
              typeof profile.qualifications === "string"
            ) {
              const quals = profile.qualifications
                .split(",")
                .map((q: string) => q.trim())
                .filter(Boolean);
              setSelectedQualifications(quals);
              setValue("qualifications", quals);
            }

            if (profile.experience && Array.isArray(profile.experience)) {
              setSelectedExperience(profile.experience);
              setValue("experience", profile.experience);
            } else if (
              profile.experience &&
              typeof profile.experience === "string"
            ) {
              const exp = profile.experience
                .split(",")
                .map((e: string) => e.trim())
                .filter(Boolean);
              setSelectedExperience(exp);
              setValue("experience", exp);
            }

            if (
              profile.areasOfExpertise &&
              Array.isArray(profile.areasOfExpertise)
            ) {
              setSelectedAreas(profile.areasOfExpertise);
              setValue("areasOfExpertise", profile.areasOfExpertise);
            }

            if (
              profile.mentorshipTopics &&
              Array.isArray(profile.mentorshipTopics)
            ) {
              setSelectedTopics(profile.mentorshipTopics);
              setValue("mentorshipTopics", profile.mentorshipTopics);
            }

            if (profile.socialMediaLinks) {
              setValue("socialMediaLinks", {
                linkedin: profile.socialMediaLinks.linkedin || "",
                twitter: profile.socialMediaLinks.twitter || "",
                youtube: profile.socialMediaLinks.youtube || "",
                github: profile.socialMediaLinks.github || "",
              });
            }

            if (profile.photoUrl) {
              setExistingPhotoUrl(profile.photoUrl);
              setPreviewPhoto(`${API_BASE_URL}${profile.photoUrl}`);
            }
          }
        }
      } catch (error) {
        console.debug("Could not load profile:", error);
      }
    };

    if (session?.user) {
      loadProfile();
    }
  }, [session, setValue]);

  const bioLength = watch("bio")?.length || 0;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("photo", file, { shouldValidate: true });
      setExistingPhotoUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTopic = (topic: string) => {
    if (topic && !selectedTopics.includes(topic)) {
      const newTopics = [...selectedTopics, topic];
      setSelectedTopics(newTopics);
      setValue("mentorshipTopics", newTopics);
      setCustomTopic("");
    }
  };

  const removeTopic = (topic: string) => {
    const newTopics = selectedTopics.filter((t) => t !== topic);
    setSelectedTopics(newTopics);
    setValue("mentorshipTopics", newTopics);
  };

  const addArea = (area: string) => {
    if (area && !selectedAreas.includes(area) && selectedAreas.length < 10) {
      const newAreas = [...selectedAreas, area];
      setSelectedAreas(newAreas);
      setValue("areasOfExpertise", newAreas);
    }
  };

  const removeArea = (area: string) => {
    const newAreas = selectedAreas.filter((a) => a !== area);
    setSelectedAreas(newAreas);
    setValue("areasOfExpertise", newAreas);
  };

  const addQualification = (qualification: string) => {
    if (
      qualification &&
      !selectedQualifications.includes(qualification) &&
      selectedQualifications.length < 20
    ) {
      const newQualifications = [...selectedQualifications, qualification];
      setSelectedQualifications(newQualifications);
      setValue("qualifications", newQualifications);
      setCustomQualification("");
    }
  };

  const removeQualification = (qualification: string) => {
    const newQualifications = selectedQualifications.filter(
      (q) => q !== qualification
    );
    setSelectedQualifications(newQualifications);
    setValue("qualifications", newQualifications);
  };

  const addExperience = (experience: string) => {
    if (
      experience &&
      !selectedExperience.includes(experience) &&
      selectedExperience.length < 20
    ) {
      const newExperience = [...selectedExperience, experience];
      setSelectedExperience(newExperience);
      setValue("experience", newExperience);
      setCustomExperience("");
    }
  };

  const removeExperience = (experience: string) => {
    const newExperience = selectedExperience.filter((e) => e !== experience);
    setSelectedExperience(newExperience);
    setValue("experience", newExperience);
  };

  const onSubmit = async (data: MentorProfileFormData) => {
    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;

      if (data.photo) {
        try {
          const uploadResult = await customAuthClient.uploadPhoto(data.photo);
          photoUrl = uploadResult.photoUrl;
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Erreur lors de l'upload de la photo"
          );
          setIsSubmitting(false);
          return;
        }
      } else if (existingPhotoUrl) {
        photoUrl = existingPhotoUrl;
      }

      const socialLinks =
        data.socialMediaLinks &&
        Object.keys(data.socialMediaLinks).some(
          (key) =>
            data.socialMediaLinks?.[key as keyof typeof data.socialMediaLinks]
        )
          ? Object.fromEntries(
              Object.entries(data.socialMediaLinks).filter(
                ([_, value]) => value && value.trim() !== ""
              )
            )
          : null;

      if (!data.areasOfExpertise || data.areasOfExpertise.length === 0) {
        toast.error("Au moins un domaine d'expertise est requis");
        setIsSubmitting(false);
        return;
      }

      const profileData = {
        name: data.name,
        bio: data.bio,
        domain: data.areasOfExpertise[0] || "",
        photoUrl: photoUrl || undefined,
        qualifications:
          data.qualifications && data.qualifications.length > 0
            ? data.qualifications.join(", ")
            : null,
        experience:
          data.experience && data.experience.length > 0
            ? data.experience.join(", ")
            : null,
        socialMediaLinks: socialLinks as Record<string, string> | null,
        areasOfExpertise: data.areasOfExpertise,
        mentorshipTopics: data.mentorshipTopics || null,
      };

      await customAuthClient.saveProfProfile(profileData);

      toast.success("Profil sauvegardé avec succès !");

      if (photoUrl) {
        setExistingPhotoUrl(photoUrl);
      }

      const response = await fetch(`${API_BASE_URL}/api/profile/role/prof`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile?.photoUrl) {
          setExistingPhotoUrl(data.profile.photoUrl);
          setPreviewPhoto(`${API_BASE_URL}${data.profile.photoUrl}`);
        }
        setIsPublished(data.isPublished || false);
      }

      setIsSubmitting(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la sauvegarde du profil"
      );
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      await customAuthClient.publishProfile();
      toast.success(
        "Profil publié avec succès ! Il est maintenant visible dans le répertoire des mentors."
      );
      setIsPublished(true);
      setIsPublishing(false);
      setTimeout(() => {
        router.push("/mentors");
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la publication du profil"
      );
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsUnpublishing(true);

    try {
      const result = await customAuthClient.unpublishProfile();
      console.log("Unpublish result:", result);

      toast.success(
        "Profil dépublié avec succès. Il n'est plus visible dans le répertoire des mentors."
      );
      setIsPublished(false);
      const response = await fetch(`${API_BASE_URL}/api/profile/role/prof`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setIsPublished(data.isPublished || false);
      } else {
        console.error("Failed to reload profile status:", response.status);
      }
      setIsUnpublishing(false);
    } catch (error) {
      console.error("Error unpublishing profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la dépublication du profil"
      );
      setIsUnpublishing(false);
    }
  };

  if (isSessionPending) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Mon Profil Mentor"
        subtitle="Remplis les informations pour créer ton profil"
      />

      <BackButton onClick={() => router.back()} />

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
        <div className="w-full lg:w-[300px] mb-6 lg:mb-0">
          <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-2xl overflow-hidden">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isFirst = index === 0;
              const isLast = index === sidebarItems.length - 1;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2 h-12 px-8 py-4 transition-colors text-sm",
                    isFirst && "rounded-tl-2xl rounded-tr-2xl",
                    isLast && "rounded-bl-2xl rounded-br-2xl",
                    isActive
                      ? "bg-[#ffb647] text-white"
                      : "bg-white dark:bg-[#1a1720] text-[#26547c] dark:text-[#e6e6e6] border-t border-[#d9d9d9]",
                    !isFirst && !isActive && "border-t border-[#d9d9d9]"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[10px] p-8">
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
                <AreasOfExpertiseSection
                  selectedAreas={selectedAreas}
                  customArea={customArea}
                  setCustomArea={setCustomArea}
                  addArea={addArea}
                  removeArea={removeArea}
                  errors={errors}
                />
              )}

              {activeSection === "sujets-mentorat" && (
                <MentorshipTopicsSection
                  selectedTopics={selectedTopics}
                  customTopic={customTopic}
                  setCustomTopic={setCustomTopic}
                  addTopic={addTopic}
                  removeTopic={removeTopic}
                  errors={errors}
                />
              )}

              {activeSection === "qualifications-experience" && (
                <QualificationsExperienceSection
                  selectedQualifications={selectedQualifications}
                  customQualification={customQualification}
                  setCustomQualification={setCustomQualification}
                  addQualification={addQualification}
                  removeQualification={removeQualification}
                  selectedExperience={selectedExperience}
                  customExperience={customExperience}
                  setCustomExperience={setCustomExperience}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                  errors={errors}
                />
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

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isFormSubmitting ||
                    isPublishing ||
                    isUnpublishing
                  }
                  className="flex-1 bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold"
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

function BasicInformationSection({
  register,
  errors,
  bioLength,
  previewPhoto,
  existingPhotoUrl,
  watch,
  handlePhotoChange,
}: {
  readonly register: any;
  readonly errors: any;
  readonly bioLength: number;
  readonly previewPhoto: string | null;
  readonly existingPhotoUrl: string | null;
  readonly watch: any;
  readonly handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <User className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Informations de base
        </h2>
      </div>
      <p className="text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
        Les informations essentielles de votre profil
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[#26547c] dark:text-[#e6e6e6]">
            Nom complet *
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ton nom"
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
          />
          {errors.name && (
            <p className="text-sm text-[#f44336] dark:text-[#f44336]">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-[#26547c] dark:text-[#e6e6e6]">
            Bio courte *
          </Label>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Quelques mots sur toi et ton expertise..."
            rows={3}
            maxLength={250}
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[16px]"
          />
          <div className="flex justify-between items-center">
            {errors.bio && (
              <p className="text-sm text-[#f44336] dark:text-[#f44336]">
                {errors.bio.message}
              </p>
            )}
            <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] ml-auto">
              {bioLength}/250 caractères
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo" className="text-[#26547c] dark:text-[#e6e6e6]">
            Photo de profil *
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Label
              htmlFor="photo"
              className="flex items-center gap-2 px-4 py-2 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px] cursor-pointer hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] transition-colors"
            >
              <Upload className="h-4 w-4" />
              Choisir une photo
            </Label>
            {previewPhoto && (
              <div className="relative">
                <img
                  src={previewPhoto}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]"
                />
              </div>
            )}
            {watch("photo") && !previewPhoto && (
              <span className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                {watch("photo")?.name}
              </span>
            )}
          </div>
          {errors.photo && (
            <p className="text-sm text-[#f44336] dark:text-[#f44336]">
              {errors.photo.message}
            </p>
          )}
          <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Formats acceptés : JPG, PNG. Taille max : 5 Mo
          </p>
        </div>
      </div>
    </div>
  );
}

function AreasOfExpertiseSection({
  selectedAreas,
  customArea,
  setCustomArea,
  addArea,
  removeArea,
  errors,
}: {
  readonly selectedAreas: string[];
  readonly customArea: string;
  readonly setCustomArea: (value: string) => void;
  readonly addArea: (area: string) => void;
  readonly removeArea: (area: string) => void;
  readonly errors: any;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Domaines d'expertise
        </h2>
      </div>
      <p className="text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
        Définissez vos domaines d'expertise (minimum 1, maximum 10)
      </p>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {selectedAreas.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(38,84,124,0.1)] dark:bg-[rgba(74,144,226,0.2)] text-[#26547c] dark:text-[#4A90E2] rounded-full text-sm font-medium"
            >
              {area}
              <button
                type="button"
                onClick={() => removeArea(area)}
                className="hover:text-[#4A90E2] dark:hover:text-[#4A90E2] transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Ajouter un domaine d'expertise (ex: Mathématiques, Programmation, Design...)"
          value={customArea}
          onChange={(e) => setCustomArea(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customArea.trim()) {
              e.preventDefault();
              addArea(customArea.trim());
            }
          }}
          className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
        />
        <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
          Appuyez sur Entrée pour ajouter. Au moins un domaine est requis.
        </p>
        {errors.areasOfExpertise && (
          <p className="text-sm text-[#f44336] dark:text-[#f44336]">
            {errors.areasOfExpertise.message}
          </p>
        )}
      </div>
    </div>
  );
}

function MentorshipTopicsSection({
  selectedTopics,
  customTopic,
  setCustomTopic,
  addTopic,
  removeTopic,
  errors,
}: {
  readonly selectedTopics: string[];
  readonly customTopic: string;
  readonly setCustomTopic: (value: string) => void;
  readonly addTopic: (topic: string) => void;
  readonly removeTopic: (topic: string) => void;
  readonly errors: any;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Sujets de mentorat
        </h2>
      </div>
      <p className="text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
        Ajoutez les sujets sur lesquels vous souhaitez proposer du mentorat
      </p>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {selectedTopics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(255,182,71,0.15)] dark:bg-[rgba(255,182,71,0.25)] text-[#ffb647] dark:text-[#ffb647] rounded-full text-sm font-medium"
            >
              {topic}
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="hover:text-[#ff9f1a] dark:hover:text-[#ff9f1a] transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Ajouter un sujet personnalisé"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customTopic.trim()) {
              e.preventDefault();
              addTopic(customTopic.trim());
            }
          }}
          className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
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
              onClick={() => addTopic(topic)}
              className="text-xs border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px]"
            >
              <Plus className="h-3 w-3 mr-1" />
              {topic}
            </Button>
          ))}
        </div>
        {errors.mentorshipTopics && (
          <p className="text-sm text-[#f44336] dark:text-[#f44336]">
            {errors.mentorshipTopics.message}
          </p>
        )}
      </div>
    </div>
  );
}

function QualificationsExperienceSection({
  selectedQualifications,
  customQualification,
  setCustomQualification,
  addQualification,
  removeQualification,
  selectedExperience,
  customExperience,
  setCustomExperience,
  addExperience,
  removeExperience,
  errors,
}: {
  readonly selectedQualifications: string[];
  readonly customQualification: string;
  readonly setCustomQualification: (value: string) => void;
  readonly addQualification: (qualification: string) => void;
  readonly removeQualification: (qualification: string) => void;
  readonly selectedExperience: string[];
  readonly customExperience: string;
  readonly setCustomExperience: (value: string) => void;
  readonly addExperience: (experience: string) => void;
  readonly removeExperience: (experience: string) => void;
  readonly errors: any;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Qualifications & Expérience
        </h2>
      </div>
      <p className="text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
        Partagez vos qualifications et votre expérience professionnelle
      </p>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-[#26547c] dark:text-[#e6e6e6]">
            Qualifications (max 20)
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedQualifications.map((qualification) => (
              <span
                key={qualification}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(38,84,124,0.1)] dark:bg-[rgba(74,144,226,0.2)] text-[#26547c] dark:text-[#4A90E2] rounded-full text-sm font-medium"
              >
                {qualification}
                <button
                  type="button"
                  onClick={() => removeQualification(qualification)}
                  className="hover:text-[#4A90E2] dark:hover:text-[#4A90E2] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            placeholder="Ajouter une qualification (ex: Master en Informatique, Certification AWS...)"
            value={customQualification}
            onChange={(e) => setCustomQualification(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customQualification.trim()) {
                e.preventDefault();
                addQualification(customQualification.trim());
              }
            }}
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
          />
          <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Appuyez sur Entrée pour ajouter. Maximum 20 qualifications.
          </p>
          {errors.qualifications && (
            <p className="text-sm text-[#f44336] dark:text-[#f44336]">
              {errors.qualifications.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label className="text-[#26547c] dark:text-[#e6e6e6]">
            Expérience (max 20)
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedExperience.map((experience) => (
              <span
                key={experience}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(255,182,71,0.15)] dark:bg-[rgba(255,182,71,0.25)] text-[#ffb647] dark:text-[#ffb647] rounded-full text-sm font-medium"
              >
                {experience}
                <button
                  type="button"
                  onClick={() => removeExperience(experience)}
                  className="hover:text-[#ff9f1a] dark:hover:text-[#ff9f1a] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            placeholder="Ajouter une expérience (ex: Développeur Full Stack chez Google, 5 ans...)"
            value={customExperience}
            onChange={(e) => setCustomExperience(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customExperience.trim()) {
                e.preventDefault();
                addExperience(customExperience.trim());
              }
            }}
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
          />
          <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
            Appuyez sur Entrée pour ajouter. Maximum 20 expériences.
          </p>
          {errors.experience && (
            <p className="text-sm text-[#f44336] dark:text-[#f44336]">
              {errors.experience.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialMediaSection({ register }: { readonly register: any }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Share2 className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Réseaux sociaux
        </h2>
      </div>
      <p className="text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
        Ajoutez vos liens vers vos réseaux sociaux
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="linkedin"
            className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Label>
          <Input
            id="linkedin"
            {...register("socialMediaLinks.linkedin")}
            placeholder="https://linkedin.com/in/votre-profil"
            type="url"
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="twitter"
            className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Label>
          <Input
            id="twitter"
            {...register("socialMediaLinks.twitter")}
            placeholder="https://twitter.com/votre-profil"
            type="url"
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="github"
            className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]"
          >
            <Github className="h-4 w-4" />
            GitHub
          </Label>
          <Input
            id="github"
            {...register("socialMediaLinks.github")}
            placeholder="https://github.com/votre-profil"
            type="url"
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="youtube"
            className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]"
          >
            <Youtube className="h-4 w-4" />
            YouTube
          </Label>
          <Input
            id="youtube"
            {...register("socialMediaLinks.youtube")}
            placeholder="https://youtube.com/@votre-chaine"
            type="url"
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] rounded-[32px]"
          />
        </div>
      </div>
    </div>
  );
}

function PublicationSection({
  isPublished,
  isSubmitting,
  isFormSubmitting,
  isPublishing,
  isUnpublishing,
  handlePublish,
  handleUnpublish,
}: {
  readonly isPublished: boolean;
  readonly isSubmitting: boolean;
  readonly isFormSubmitting: boolean;
  readonly isPublishing: boolean;
  readonly isUnpublishing: boolean;
  readonly handlePublish: () => void;
  readonly handleUnpublish: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Eye className="h-8 w-8 text-[#26547c] dark:text-[#e6e6e6]" />
        <h2 className="text-2xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
          Publication
        </h2>
      </div>
      <p className="text-base text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
        Gérez la visibilité de votre profil dans le répertoire des mentors
      </p>

      {isPublished && (
        <div className="flex items-center gap-2 p-3 bg-[rgba(52,177,98,0.1)] dark:bg-[rgba(52,177,98,0.15)] border border-[#34b162] dark:border-[#34b162] rounded-[16px]">
          <CheckCircle2 className="h-5 w-5 text-[#34b162] dark:text-[#34b162]" />
          <span className="text-sm font-medium text-[#34b162] dark:text-[#34b162]">
            Votre profil est publié et visible dans le répertoire des mentors
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {isPublished ? (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUnpublish();
            }}
            disabled={isUnpublishing}
            className="flex-1 bg-[#ffb647] hover:bg-[#ff9f1a] dark:bg-[#ffb647] dark:hover:bg-[#ff9f1a] text-[#161616] dark:text-[#161616] rounded-[32px] font-semibold"
            size="lg"
          >
            {isUnpublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Dépublication...
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Dépublier le profil
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || isSubmitting || isFormSubmitting}
            className="flex-1 bg-[#34b162] hover:bg-[#2a9d52] dark:bg-[#34b162] dark:hover:bg-[#2a9d52] text-white dark:text-white rounded-[32px] font-semibold"
            size="lg"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publier le profil
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
