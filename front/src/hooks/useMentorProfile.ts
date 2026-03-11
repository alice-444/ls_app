"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient, customAuthClient } from "@/lib/auth-client";
import { API_BASE_URL } from "@/lib/api-client";
import { formatPhotoUrl } from "@/utils/photo";
import { toast } from "sonner";
import {
  mentorProfileSchema,
  type MentorProfileFormData,
} from "@/components/mentor-profile/schema";
import type { ProfileSection } from "@/components/mentor-profile/constants";

function parseStringOrArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

import { trpc } from "@/utils/trpc";

export function useMentorProfile() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const { data: titleData } = trpc.user.getTitle.useQuery(undefined, {
    enabled: !!session,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [customArea, setCustomArea] = useState("");
  const [selectedQualifications, setSelectedQualifications] = useState<
    string[]
  >([]);
  const [customQualification, setCustomQualification] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [customExperience, setCustomExperience] = useState("");
  const [selectedIceBreakers, setSelectedIceBreakers] = useState<string[]>([]);
  const [customIceBreaker, setCustomIceBreaker] = useState("");

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("informations-base");

  const form = useForm<MentorProfileFormData>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      domain: undefined,
      photo: null,
      qualifications: [],
      experience: [],
      socialMediaLinks: { linkedin: "", twitter: "", youtube: "", github: "" },
      areasOfExpertise: [],
      mentorshipTopics: [],
      displayName: "",
      iceBreakerTags: [],
    },
  });

  const { setValue, watch } = form;
  const bioLength = watch("bio")?.length || 0;

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
          `${API_BASE_URL}/api/profile/role/mentor`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) return;

        const data = await response.json();
        if (data.isPublished) setIsPublished(true);

        if (data.profile) {
          const p = data.profile;
          setValue("name", p.name || "");
          setValue("bio", p.bio || "");
          setValue("displayName", p.displayName || "");

          const quals = parseStringOrArray(p.qualifications);
          setSelectedQualifications(quals);
          setValue("qualifications", quals);

          const exp = parseStringOrArray(p.experience);
          setSelectedExperience(exp);
          setValue("experience", exp);

          if (Array.isArray(p.areasOfExpertise)) {
            setSelectedAreas(p.areasOfExpertise);
            setValue("areasOfExpertise", p.areasOfExpertise);
          }

          if (Array.isArray(p.mentorshipTopics)) {
            setSelectedTopics(p.mentorshipTopics);
            setValue("mentorshipTopics", p.mentorshipTopics);
          }

          if (Array.isArray(p.iceBreakerTags)) {
            setSelectedIceBreakers(p.iceBreakerTags);
            setValue("iceBreakerTags", p.iceBreakerTags);
          }

          if (p.socialMediaLinks) {
            setValue("socialMediaLinks", {
              linkedin: p.socialMediaLinks.linkedin || "",
              twitter: p.socialMediaLinks.twitter || "",
              youtube: p.socialMediaLinks.youtube || "",
              github: p.socialMediaLinks.github || "",
            });
          }

          if (p.photoUrl) {
            setExistingPhotoUrl(p.photoUrl);
            setPreviewPhoto(formatPhotoUrl(p.photoUrl));
          }
        }
      } catch {
        // Profile not yet created
      }
    };

    if (session?.user) loadProfile();
  }, [session, setValue]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("photo", file, { shouldValidate: true });
      setExistingPhotoUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const createTagManager = (
    selected: string[],
    setSelected: (v: string[]) => void,
    formField: keyof MentorProfileFormData,
    setCustom: (v: string) => void,
    max?: number,
  ) => ({
    add: (value: string) => {
      if (!value || selected.includes(value)) return;
      if (max && selected.length >= max) return;
      const next = [...selected, value];
      setSelected(next);
      setValue(formField, next as never);
      setCustom("");
    },
    remove: (value: string) => {
      const next = selected.filter((v) => v !== value);
      setSelected(next);
      setValue(formField, next as never);
    },
  });

  const topics = createTagManager(
    selectedTopics,
    setSelectedTopics,
    "mentorshipTopics",
    setCustomTopic,
    15,
  );
  const areas = createTagManager(
    selectedAreas,
    setSelectedAreas,
    "areasOfExpertise",
    setCustomArea,
    10,
  );
  const qualifications = createTagManager(
    selectedQualifications,
    setSelectedQualifications,
    "qualifications",
    setCustomQualification,
    20,
  );
  const experience = createTagManager(
    selectedExperience,
    setSelectedExperience,
    "experience",
    setCustomExperience,
    20,
  );
  const iceBreakers = createTagManager(
    selectedIceBreakers,
    setSelectedIceBreakers,
    "iceBreakerTags",
    setCustomIceBreaker,
    5,
  );

  const reloadProfileStatus = async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile/role/mentor`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      if (data.profile?.photoUrl) {
        setExistingPhotoUrl(data.profile.photoUrl);
        setPreviewPhoto(formatPhotoUrl(data.profile.photoUrl));
      }
      setIsPublished(data.isPublished || false);
    }
  };

  const processPhoto = async (
    photo: File | null | undefined,
  ): Promise<string | null> => {
    if (!photo) return existingPhotoUrl;
    try {
      const { photoUrl } = await customAuthClient.uploadPhoto(photo);
      return photoUrl;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload de la photo",
      );
    }
  };

  const processSocialLinks = (
    links: MentorProfileFormData["socialMediaLinks"],
  ) => {
    if (!links) return null;
    const filtered = Object.fromEntries(
      Object.entries(links).filter(([, value]) => value?.trim()),
    );
    return Object.keys(filtered).length > 0
      ? (filtered as Record<string, string>)
      : null;
  };

  const onSubmit = async (data: MentorProfileFormData) => {
    setIsSubmitting(true);
    try {
      if (!data.areasOfExpertise?.length) {
        toast.error("Au moins un domaine d'expertise est requis");
        return;
      }

      const photoUrl = await processPhoto(data.photo);
      const socialLinks = processSocialLinks(data.socialMediaLinks);

      await customAuthClient.saveMentorProfile({
        name: data.name,
        bio: data.bio,
        domain: data.areasOfExpertise[0] || "",
        photoUrl: photoUrl || undefined,
        qualifications: data.qualifications?.length
          ? data.qualifications.join(", ")
          : null,
        experience: data.experience?.length ? data.experience.join(", ") : null,
        socialMediaLinks: socialLinks,
        areasOfExpertise: data.areasOfExpertise,
        mentorshipTopics: data.mentorshipTopics || null,
        displayName: data.displayName || null,
        iceBreakerTags: data.iceBreakerTags || null,
      });

      toast.success("Profil sauvegardé avec succès !");
      if (photoUrl) setExistingPhotoUrl(photoUrl);
      await reloadProfileStatus();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la sauvegarde du profil",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await customAuthClient.publishProfile();
      toast.success(
        "Profil publié avec succès ! Il est maintenant visible dans le répertoire des mentors.",
      );
      setIsPublished(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la publication du profil",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      await customAuthClient.unpublishProfile();
      toast.success(
        "Profil dépublié avec succès. Il n'est plus visible dans le répertoire des mentors.",
      );
      setIsPublished(false);
      await reloadProfileStatus();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la dépublication du profil",
      );
    } finally {
      setIsUnpublishing(false);
    }
  };

  return {
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
  };
}
