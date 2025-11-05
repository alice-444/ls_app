"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
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
  Twitter,
  Youtube,
  Github,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { customAuthClient } from "@/lib/auth-client";
import { CalendlyEmbed } from "@/components/calendly-embed";

interface MentorProfile {
  name: string | null;
  bio: string | null;
  domain: string | null;
  photoUrl: string | null;
  qualifications: string | null;
  experience: string | null;
  socialMediaLinks: Record<string, string> | null;
  areasOfExpertise: string[] | null;
  mentorshipTopics: string[] | null;
  calendlyLink: string | null;
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

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
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
          setIsPublished(data.isPublished || false);
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (error) {
        console.error("Could not load profile:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      loadProfile();
    }
  }, [session]);

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
        if (data.profile) {
          setProfile(data.profile);
        }
      } else {
        console.error("Failed to reload profile:", response.status);
      }
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
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
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

  const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  const photoUrl = profile.photoUrl ? `${baseURL}${profile.photoUrl}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mon Profil Mentor</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/mentor-profile")}
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
                  console.log("Unpublish button clicked in my-profile");
                  handleUnpublish();
                }}
                disabled={isUnpublishing}
                className="bg-orange-50 hover:bg-orange-100 border-orange-200"
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
                className="bg-green-600 hover:bg-green-700"
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

        {/* Publication Status */}
        {isPublished && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Votre profil est publié et visible dans le répertoire des mentors
            </span>
          </div>
        )}

        <Card className="shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {photoUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={photoUrl}
                    alt={profile.name || "Photo de profil"}
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                  />
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  {profile.domain && (
                    <p className="text-lg text-gray-600">{profile.domain}</p>
                  )}
                </div>

                {profile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">À propos</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {profile.areasOfExpertise &&
              profile.areasOfExpertise.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Domaines d'expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.areasOfExpertise.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {profile.mentorshipTopics &&
              profile.mentorshipTopics.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Sujets de mentorat</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.mentorshipTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {profile.qualifications && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Qualifications</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {profile.qualifications}
                </p>
              </div>
            )}

            {profile.experience && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Expérience</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {profile.experience}
                </p>
              </div>
            )}

            {profile.calendlyLink && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Réserver une session
                </h3>
                <CalendlyEmbed url={profile.calendlyLink} height="600px" />
              </div>
            )}

            {profile.socialMediaLinks &&
              Object.keys(profile.socialMediaLinks).length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Réseaux sociaux</h3>
                  <div className="flex flex-wrap gap-4">
                    {profile.socialMediaLinks.linkedin && (
                      <a
                        href={profile.socialMediaLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
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
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-600"
                      >
                        <Twitter className="h-5 w-5" />
                        Twitter
                      </a>
                    )}
                    {profile.socialMediaLinks.github && (
                      <a
                        href={profile.socialMediaLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
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
                        className="flex items-center gap-2 text-red-600 hover:text-red-800"
                      >
                        <Youtube className="h-5 w-5" />
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
