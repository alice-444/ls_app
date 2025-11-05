"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { customAuthClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Plus,
  X,
  Globe,
  Linkedin,
  Twitter,
  Youtube,
  Github,
  Calendar,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { CalendlyEmbed } from "@/components/calendly-embed";

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
    .string()
    .trim()
    .max(500, "Les qualifications ne peuvent pas dépasser 500 caractères")
    .optional()
    .nullable(),
  experience: z
    .string()
    .trim()
    .max(700, "L'expérience ne peut pas dépasser 700 caractères")
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
  calendlyLink: z
    .string()
    .url("Lien Calendly invalide")
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === "") return true;
      const calendlyRegex =
        /^https:\/\/(www\.)?calendly\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?(\?.*)?$/;
      return calendlyRegex.test(val);
    }, "Le lien doit être un lien Calendly valide (format: https://calendly.com/votre-nom)")
    .or(z.literal("")),
});

type MentorProfileFormData = z.infer<typeof mentorProfileSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
    watch,
    setValue,
    getValues,
  } = useForm<MentorProfileFormData>({
    resolver: zodResolver(mentorProfileSchema),
      defaultValues: {
      name: "",
      bio: "",
      domain: undefined,
      photo: null,
      qualifications: null,
      experience: null,
      socialMediaLinks: {
        linkedin: "",
        twitter: "",
        youtube: "",
        github: "",
      },
      areasOfExpertise: [],
      mentorshipTopics: [],
      calendlyLink: "",
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
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
          }/api/profile/role/prof`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.isPublished) {
            setIsPublished(true);
          }
          
          if (data.profile) {
            const profile = data.profile;
            
            setValue("name", profile.name || "");
            setValue("bio", profile.bio || "");
            setValue("qualifications", profile.qualifications || null);
            setValue("experience", profile.experience || null);
            setValue("calendlyLink", profile.calendlyLink || "");
            
            if (profile.areasOfExpertise && Array.isArray(profile.areasOfExpertise)) {
              setSelectedAreas(profile.areasOfExpertise);
              setValue("areasOfExpertise", profile.areasOfExpertise);
            }
            
            if (profile.mentorshipTopics && Array.isArray(profile.mentorshipTopics)) {
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
              const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
              setPreviewPhoto(`${baseURL}${profile.photoUrl}`);
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

      // Clean up social media links (remove empty strings)
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
        qualifications: data.qualifications || null,
        experience: data.experience || null,
        socialMediaLinks: socialLinks as Record<string, string> | null,
        areasOfExpertise: data.areasOfExpertise,
        mentorshipTopics: data.mentorshipTopics || null,
        calendlyLink: data.calendlyLink || null,
      };
      
      await customAuthClient.saveProfProfile(profileData);

      toast.success("Profil sauvegardé avec succès !");
      
      if (photoUrl) {
        setExistingPhotoUrl(photoUrl);
      }
      
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
        }/api/profile/role/prof`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.profile && data.profile.photoUrl) {
          setExistingPhotoUrl(data.profile.photoUrl);
          const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
          setPreviewPhoto(`${baseURL}${data.profile.photoUrl}`);
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
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
        }/api/profile/role/prof`,
        {
          method: "GET",
          credentials: "include",
        }
      );
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold">
              Créer ton profil Mentor
            </CardTitle>
            <CardDescription className="text-lg">
              Remplis les informations pour créer ton profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Informations obligatoires
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ton nom"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio courte *</Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Quelques mots sur toi et ton expertise..."
                    rows={3}
                    maxLength={250}
                  />
                  <div className="flex justify-between items-center">
                    {errors.bio && (
                      <p className="text-sm text-red-500">
                        {errors.bio.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {bioLength}/250 caractères
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo de profil *</Label>
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
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Choisir une photo
                    </Label>
                    {previewPhoto && (
                      <div className="relative">
                        <img
                          src={previewPhoto}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      </div>
                    )}
                    {watch("photo") && !previewPhoto && (
                      <span className="text-sm text-gray-600">
                        {watch("photo")?.name}
                      </span>
                    )}
                  </div>
                  {errors.photo && (
                    <p className="text-sm text-red-500">
                      {errors.photo.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Formats acceptés : JPG, PNG. Taille max : 5 Mo
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800">
                  Informations optionnelles
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    {...register("qualifications")}
                    placeholder="Diplômes, certifications, etc."
                    rows={3}
                    maxLength={500}
                  />
                  {errors.qualifications && (
                    <p className="text-sm text-red-500">
                      {errors.qualifications.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Expérience</Label>
                  <Textarea
                    id="experience"
                    {...register("experience")}
                    placeholder="Décrivez votre expérience professionnelle..."
                    rows={4}
                    maxLength={1000}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500">
                      {errors.experience.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Domaines d'expertise * (max 10)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => removeArea(area)}
                          className="hover:text-indigo-600"
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
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && customArea.trim()) {
                        e.preventDefault();
                        addArea(customArea.trim());
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Appuyez sur Entrée pour ajouter. Au moins un domaine est requis.
                  </p>
                  {errors.areasOfExpertise && (
                    <p className="text-sm text-red-500">
                      {errors.areasOfExpertise.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Sujets</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTopics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeTopic(topic)}
                          className="hover:text-purple-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Ajouter un sujet personnalisé"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && customTopic.trim()) {
                          e.preventDefault();
                          addTopic(customTopic.trim());
                        }
                      }}
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
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {errors.mentorshipTopics && (
                    <p className="text-sm text-red-500">
                      {errors.mentorshipTopics.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calendlyLink">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Lien Calendly
                  </Label>
                  <Input
                    id="calendlyLink"
                    {...register("calendlyLink")}
                    placeholder="https://calendly.com/votre-nom"
                    type="url"
                  />
                  {errors.calendlyLink && (
                    <p className="text-sm text-red-500">
                      {errors.calendlyLink.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Ajoutez votre lien Calendly pour permettre aux apprenants de
                    réserver des sessions
                  </p>
                  {watch("calendlyLink") && watch("calendlyLink")?.trim() && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm font-medium mb-2">
                        Aperçu du calendrier :
                      </p>
                      <CalendlyEmbed
                        url={watch("calendlyLink") || ""}
                        height="400px"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Liens vers vos réseaux sociaux</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="linkedin"
                        className="flex items-center gap-2"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        {...register("socialMediaLinks.linkedin")}
                        placeholder="https://linkedin.com/in/votre-profil"
                        type="url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="twitter"
                        className="flex items-center gap-2"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        {...register("socialMediaLinks.twitter")}
                        placeholder="https://twitter.com/votre-profil"
                        type="url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="github"
                        className="flex items-center gap-2"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        {...register("socialMediaLinks.github")}
                        placeholder="https://github.com/votre-profil"
                        type="url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="youtube"
                        className="flex items-center gap-2"
                      >
                        <Youtube className="h-4 w-4" />
                        YouTube
                      </Label>
                      <Input
                        id="youtube"
                        {...register("socialMediaLinks.youtube")}
                        placeholder="https://youtube.com/@votre-chaine"
                        type="url"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isPublished && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Votre profil est publié et visible dans le répertoire des
                      profs
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isFormSubmitting ||
                    isPublishing ||
                    isUnpublishing
                  }
                  className="flex-1"
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
                {isPublished ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Unpublish button clicked", { isUnpublishing, isSubmitting, isFormSubmitting });
                      handleUnpublish();
                    }}
                    disabled={isUnpublishing}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    {isUnpublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Dépublication...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Dépublier le profil
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || isSubmitting || isFormSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
