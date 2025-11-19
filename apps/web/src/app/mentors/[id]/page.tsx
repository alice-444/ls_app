"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Linkedin,
  Twitter,
  Youtube,
  Github,
  Mail,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  Globe,
  MessageSquare,
} from "lucide-react";
import { CalendlyEmbed } from "@/components/calendly-embed";
import { API_BASE_URL } from "@/lib/api-client";
import Loader from "@/components/loader";
import { ContactMentorDialog } from "@/components/mentor/ContactMentorDialog";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { MentorFeedbacks } from "@/components/mentor/MentorFeedbacks";
import { MentorWorkshopHistory } from "@/components/mentor/MentorWorkshopHistory";

export default function MentorProfileViewPage() {
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;
  const { data: session } = authClient.useSession();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const {
    data: mentor,
    isLoading,
    error,
  } = trpc.mentor.getById.useQuery(
    { mentorId },
    {
      enabled: !!mentorId,
    }
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Profil introuvable
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Le profil du mentor que vous recherchez n'existe pas ou n'est pas
            publié.
          </p>
          <Button onClick={() => router.push("/workshop-room")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux ateliers
          </Button>
        </div>
      </div>
    );
  }

  const photoUrl = mentor.photoUrl ? `${API_BASE_URL}${mentor.photoUrl}` : null;
  const areasOfExpertise = Array.isArray(mentor.areasOfExpertise)
    ? mentor.areasOfExpertise
    : [];
  const mentorshipTopics = Array.isArray(mentor.mentorshipTopics)
    ? mentor.mentorshipTopics
    : [];
  const socialMediaLinks = mentor.socialMediaLinks || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={mentor.name || "Mentor"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-4xl font-semibold shadow-lg">
                  {mentor.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-3xl font-bold mb-2">
                {mentor.name || "Mentor"}
              </CardTitle>
              {mentor.domain && (
                <CardDescription className="text-lg">
                  {mentor.domain}
                </CardDescription>
              )}
            </div>
            {session &&
              userRole === "APPRENANT" &&
              mentor.userId !== session.user.id && (
                <div className="flex justify-center pt-2 gap-2">
                  <Button
                    onClick={() => setShowRequestDialog(true)}
                    className="gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Participer à l'atelier
                  </Button>
                  <Button
                    onClick={() => setShowContactDialog(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contacter
                  </Button>
                </div>
              )}
          </CardHeader>

          <CardContent className="space-y-6">
            {mentor.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />À propos
                </h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {mentor.bio}
                </p>
              </div>
            )}

            {areasOfExpertise.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Domaines d'expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {areasOfExpertise.map((area: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {mentorshipTopics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Sujets de mentorat
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mentorshipTopics.map((topic: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-sm px-3 py-1"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {mentor.qualifications && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Qualifications
                </h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {mentor.qualifications}
                </p>
              </div>
            )}

            {mentor.experience && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Expérience
                </h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {mentor.experience}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact
              </h3>
              <div className="space-y-2">
                {mentor.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${mentor.email}`}
                      className="hover:underline"
                    >
                      {mentor.email}
                    </a>
                  </div>
                )}
                {mentor.calendlyLink && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="h-4 w-4" />
                    <a
                      href={mentor.calendlyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Réserver une session
                    </a>
                  </div>
                )}
              </div>
            </div>

            {(socialMediaLinks.linkedin ||
              socialMediaLinks.twitter ||
              socialMediaLinks.youtube ||
              socialMediaLinks.github) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Réseaux sociaux
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socialMediaLinks.linkedin && (
                    <a
                      href={socialMediaLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {socialMediaLinks.twitter && (
                    <a
                      href={socialMediaLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  )}
                  {socialMediaLinks.youtube && (
                    <a
                      href={socialMediaLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </a>
                  )}
                  {socialMediaLinks.github && (
                    <a
                      href={socialMediaLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

            {mentor.calendlyLink && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Réserver un atelier
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <CalendlyEmbed url={mentor.calendlyLink} height="600px" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <MentorWorkshopHistory
          mentorId={mentorId}
          mentorName={mentor.name || "Mentor"}
        />

        <MentorFeedbacks mentorId={mentorId} />
      </div>

      <ContactMentorDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        mentorId={mentorId}
        mentorName={mentor.name || "Mentor"}
      />

      <RequestWorkshopParticipationDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        mentorId={mentorId}
        mentorName={mentor.name || "Mentor"}
      />
    </div>
  );
}
