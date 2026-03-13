"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { authClient, customAuthClient } from "@/lib/auth-client";
import Loader from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Linkedin,
  Youtube,
  X,
  Github,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
  Coffee,
} from "lucide-react";
import { toast } from "sonner";
import { getMentorProfile, getUserRole } from "@/lib/api-client";
import { formatPhotoUrl } from "@/utils/photo";
import { WorkshopCalendar } from "@/components/domains/workshop/calendar/WorkshopCalendar";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import type { WorkshopDetailed } from "@ls-app/shared";

interface MentorProfile {
  name: string | null;
  displayName: string | null;
  bio: string | null;
  domain: string | null;
  photoUrl: string | null;
  qualifications: string | null;
  experience: string | null;
  socialMediaLinks: Record<string, string> | null;
  areasOfExpertise: string[] | null;
  mentorshipTopics: string[] | null;
  iceBreakerTags: string[] | null;
}

export default function MyProfilePage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const { data: myWorkshops } = trpc.workshop.getMyWorkshops.useQuery(
    undefined,
    {
      enabled: !!session && userRole === "MENTOR",
    }
  ) as { data: WorkshopDetailed[] | undefined };

  if (!isSessionPending && !session) redirect("/login");

  const loadProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const data = await getMentorProfile();
      setIsPublished(data.isPublished || false);
      if (data.profile) {
        setProfile(data.profile as unknown as MentorProfile);
      }
    } catch (error) {
      console.error("Could not load profile:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session, loadProfile]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await customAuthClient.publishProfile();
      toast.success(
        "Profil publié avec succès ! Il est maintenant visible dans le répertoire des mentors."
      );
      setIsPublished(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la publication du profil"
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
        "Profil dépublié avec succès. Il n'est plus visible dans le répertoire des mentors."
      );

      await loadProfile();
    } catch (error) {
      console.error("Error unpublishing profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la dépublication du profil"
      );
    } finally {
      setIsUnpublishing(false);
    }
  };

  if (isSessionPending || isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  if (!session) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Profil non trouvé</CardTitle>
            <CardDescription>
              Vous n'avez pas encore créé de profil mentor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/mentor-profile")}>
              Créer mon profil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const photoUrl = formatPhotoUrl(profile.photoUrl);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#26547c]">Mon Profil Mentor</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/mentor-profile")}
              className="rounded-[32px] border-[#d6dae4]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            {isPublished ? (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnpublish();
                }}
                disabled={isUnpublishing}
                className="bg-orange-50 hover:bg-orange-100 border-orange-200 rounded-[32px] text-orange-700"
              >
                {isUnpublishing ? (
                  "Dépublication..."
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Dépublier
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-[32px]"
              >
                {isPublishing ? (
                  "Publication..."
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Publier
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isPublished && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Votre profil est publié et visible dans le répertoire des mentors
            </span>
          </div>
        )}

        <Card className="shadow-xl rounded-2xl border-[#d6dae4] overflow-hidden">
          <CardContent className="p-0">
            <div className="h-2 w-full bg-linear-to-r from-indigo-500 to-purple-500" />
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {photoUrl ? (
                  <div className="shrink-0">
                    <Image
                      src={photoUrl}
                      alt={profile.name || "Photo de profil"}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-indigo-50 flex items-center justify-center border-4 border-white shadow-sm">
                    <Coffee className="h-12 w-12 text-indigo-300" />
                  </div>
                )}

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#26547c]">
                      {profile.displayName || profile.name}
                    </h2>
                    {profile.domain && (
                      <p className="text-lg text-[#26547c]/80 font-medium">
                        {profile.domain}
                      </p>
                    )}
                  </div>

                  {profile.iceBreakerTags && profile.iceBreakerTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.iceBreakerTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {profile.bio && (
                    <div>
                      <h3 className="text-sm font-bold text-[#26547c] uppercase tracking-wider mb-1">
                        À propos
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {profile.areasOfExpertise &&
                profile.areasOfExpertise.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[#d6dae4]/50">
                    <h3 className="font-bold text-[#26547c] mb-3">Domaines d'expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.areasOfExpertise.map((area) => (
                        <span
                          key={area}
                          className="px-3 py-1 bg-indigo-100/50 text-indigo-800 rounded-full text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {profile.mentorshipTopics &&
                profile.mentorshipTopics.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#d6dae4]/50">
                    <h3 className="font-bold text-[#26547c] mb-3">Sujets de mentorat</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.mentorshipTopics.map((topic) => (
                        <span
                          key={topic}
                          className="px-3 py-1 bg-purple-100/50 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {profile.qualifications && (
                <div className="mt-6 pt-6 border-t border-[#d6dae4]/50">
                  <h3 className="font-bold text-[#26547c] mb-2">Qualifications</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {profile.qualifications}
                  </p>
                </div>
              )}

              {profile.experience && (
                <div className="mt-6 pt-6 border-t border-[#d6dae4]/50">
                  <h3 className="font-bold text-[#26547c] mb-2">Expérience</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {profile.experience}
                  </p>
                </div>
              )}

              {userRole === "MENTOR" && myWorkshops && myWorkshops.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#d6dae4]/50">
                  <h3 className="font-bold text-[#26547c] mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    Calendrier de mes ateliers
                  </h3>
                  <div className="border border-[#d6dae4] rounded-xl overflow-hidden shadow-inner">
                    <WorkshopCalendar
                      workshops={myWorkshops}
                      height="600px"
                      userRole="MENTOR"
                      onSelectEvent={(workshop) => {
                        router.push(`/workshop/${workshop.id}`);
                      }}
                    />
                  </div>
                </div>
              )}

              {profile.socialMediaLinks &&
                Object.values(profile.socialMediaLinks).some(Boolean) && (
                  <div className="mt-8 pt-6 border-t border-[#d6dae4]/50">
                    <h3 className="font-bold text-[#26547c] mb-4">Réseaux sociaux</h3>
                    <div className="flex flex-wrap gap-4">
                      {profile.socialMediaLinks.linkedin && (
                        <a
                          href={profile.socialMediaLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium border border-blue-100"
                        >
                          <Linkedin className="h-5 w-5" />
                          LinkedIn
                        </a>
                      )}
                      {profile.socialMediaLinks.twitter && (
                        <a
                          href={profile.socialMediaLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-xl hover:bg-sky-100 transition-colors font-medium border border-sky-100"
                        >
                          <X className="h-5 w-5" />
                          X
                        </a>
                      )}
                      {profile.socialMediaLinks.github && (
                        <a
                          href={profile.socialMediaLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium border border-gray-200"
                        >
                          <Github className="h-5 w-5" />
                          GitHub
                        </a>
                      )}
                      {profile.socialMediaLinks.youtube && (
                        <a
                          href={profile.socialMediaLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-100"
                        >
                          <Youtube className="h-5 w-5" />
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
