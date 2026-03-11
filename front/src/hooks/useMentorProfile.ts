"use client";

import { useEffect, useReducer, useState } from "react";
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

type ProfileLoadState = {
  isPublished: boolean;
  selectedQualifications: string[];
  selectedExperience: string[];
  selectedAreas: string[];
  selectedTopics: string[];
  selectedIceBreakers: string[];
  existingPhotoUrl: string | null;
  previewPhoto: string | null;
};

function buildFormResetData(p: Record<string, unknown>): MentorProfileFormData {
  const quals = parseStringOrArray(p.qualifications);
  const exp = parseStringOrArray(p.experience);
  return {
    name: (p.name as string) || "",
    bio: (p.bio as string) || "",
    domain: p.domain as string | undefined,
    displayName: (p.displayName as string) || "",
    photo: null,
    qualifications: quals,
    experience: exp,
    areasOfExpertise: Array.isArray(p.areasOfExpertise)
      ? p.areasOfExpertise
      : [],
    mentorshipTopics: Array.isArray(p.mentorshipTopics)
      ? p.mentorshipTopics
      : [],
    iceBreakerTags: Array.isArray(p.iceBreakerTags) ? p.iceBreakerTags : [],
    socialMediaLinks: p.socialMediaLinks
      ? {
          linkedin:
            (p.socialMediaLinks as Record<string, string>).linkedin || "",
          twitter: (p.socialMediaLinks as Record<string, string>).twitter || "",
          youtube: (p.socialMediaLinks as Record<string, string>).youtube || "",
          github: (p.socialMediaLinks as Record<string, string>).github || "",
        }
      : { linkedin: "", twitter: "", youtube: "", github: "" },
  };
}

function buildLoadPayload(data: {
  isPublished?: boolean;
  profile?: Record<string, unknown>;
}): Partial<ProfileLoadState> {
  const p = data.profile;
  return {
    isPublished: !!data.isPublished,
    selectedQualifications: p ? parseStringOrArray(p.qualifications) : [],
    selectedExperience: p ? parseStringOrArray(p.experience) : [],
    selectedAreas: Array.isArray(p?.areasOfExpertise) ? p.areasOfExpertise : [],
    selectedTopics: Array.isArray(p?.mentorshipTopics)
      ? p.mentorshipTopics
      : [],
    selectedIceBreakers: Array.isArray(p?.iceBreakerTags)
      ? p.iceBreakerTags
      : [],
    existingPhotoUrl: typeof p?.photoUrl === "string" ? p.photoUrl : null,
    previewPhoto:
      typeof p?.photoUrl === "string" ? formatPhotoUrl(p.photoUrl) : null,
  };
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
  const initialProfileState: ProfileLoadState = {
    isPublished: false,
    selectedQualifications: [],
    selectedExperience: [],
    selectedAreas: [],
    selectedTopics: [],
    selectedIceBreakers: [],
    existingPhotoUrl: null,
    previewPhoto: null,
  };
  function profileLoadReducer(
    state: ProfileLoadState,
    action: { type: "LOAD" | "UPDATE"; payload: Partial<ProfileLoadState> },
  ): ProfileLoadState {
    if (action.type === "LOAD" || action.type === "UPDATE")
      return { ...state, ...action.payload };
    return state;
  }
  const [profileState, dispatchProfile] = useReducer(
    profileLoadReducer,
    initialProfileState,
  );
  const {
    isPublished,
    selectedQualifications,
    selectedExperience,
    selectedAreas,
    selectedTopics,
    selectedIceBreakers,
    existingPhotoUrl,
    previewPhoto,
  } = profileState;

  const [customTopic, setCustomTopic] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [customQualification, setCustomQualification] = useState("");
  const [customExperience, setCustomExperience] = useState("");
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
          { method: "GET", credentials: "include" },
        );
        if (!response.ok) return;

        const data = await response.json();
        const p = data.profile;
        if (p) form.reset(buildFormResetData(p));
        dispatchProfile({ type: "LOAD", payload: buildLoadPayload(data) });
      } catch {
        // Profile not yet created
      }
    };

    if (session?.user) loadProfile();
  }, [session, form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("photo", file, { shouldValidate: true });
      dispatchProfile({
        type: "UPDATE",
        payload: { existingPhotoUrl: null },
      });
      const reader = new FileReader();
      reader.onloadend = () =>
        dispatchProfile({
          type: "UPDATE",
          payload: { previewPhoto: reader.result as string },
        });
      reader.readAsDataURL(file);
    }
  };

  const createTagManager = (
    selected: string[],
    dispatchSelected: (v: string[]) => void,
    formField: keyof MentorProfileFormData,
    setCustom: (v: string) => void,
    max?: number,
  ) => ({
    add: (value: string) => {
      if (!value || selected.includes(value)) return;
      if (max && selected.length >= max) return;
      const next = [...selected, value];
      dispatchSelected(next);
      setValue(formField, next as never);
      setCustom("");
    },
    remove: (value: string) => {
      const next = selected.filter((v) => v !== value);
      dispatchSelected(next);
      setValue(formField, next as never);
    },
  });

  const topics = createTagManager(
    selectedTopics,
    (v) => dispatchProfile({ type: "UPDATE", payload: { selectedTopics: v } }),
    "mentorshipTopics",
    setCustomTopic,
    15,
  );
  const areas = createTagManager(
    selectedAreas,
    (v) => dispatchProfile({ type: "UPDATE", payload: { selectedAreas: v } }),
    "areasOfExpertise",
    setCustomArea,
    10,
  );
  const qualifications = createTagManager(
    selectedQualifications,
    (v) =>
      dispatchProfile({
        type: "UPDATE",
        payload: { selectedQualifications: v },
      }),
    "qualifications",
    setCustomQualification,
    20,
  );
  const experience = createTagManager(
    selectedExperience,
    (v) =>
      dispatchProfile({
        type: "UPDATE",
        payload: { selectedExperience: v },
      }),
    "experience",
    setCustomExperience,
    20,
  );
  const iceBreakers = createTagManager(
    selectedIceBreakers,
    (v) =>
      dispatchProfile({
        type: "UPDATE",
        payload: { selectedIceBreakers: v },
      }),
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
      dispatchProfile({
        type: "UPDATE",
        payload: {
          existingPhotoUrl: data.profile?.photoUrl ?? null,
          previewPhoto: data.profile?.photoUrl
            ? formatPhotoUrl(data.profile.photoUrl)
            : null,
          isPublished: data.isPublished || false,
        },
      });
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
      if (photoUrl)
        dispatchProfile({
          type: "UPDATE",
          payload: { existingPhotoUrl: photoUrl },
        });
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
      dispatchProfile({ type: "UPDATE", payload: { isPublished: true } });
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
      dispatchProfile({ type: "UPDATE", payload: { isPublished: false } });
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
